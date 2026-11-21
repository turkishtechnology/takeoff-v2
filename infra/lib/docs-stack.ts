import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import type { DocsConfig } from './config.ts';

const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';

/**
 * Docusaurus writes every route as `<route>/index.html` and links to it without the
 * trailing slash. S3 has no directory index, so map both `/x` and `/x/` to `/x/index.html`.
 * Paths whose last segment has a dot are files and pass through. Exported for the test.
 */
export const REWRITE_FUNCTION_CODE = `
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    request.uri = uri + '/index.html';
  }
  return request;
}`;

export interface DocsStackProps extends cdk.StackProps {
  config: DocsConfig;
}

export class DocsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DocsStackProps) {
    super(scope, id, props);
    const { config } = props;

    // The build is reproducible from git, so no versioning. RETAIN (the default) still
    // keeps the bucket if the stack is deleted by mistake.
    const bucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });

    const rewrite = new cloudfront.Function(this, 'IndexRewrite', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      comment: 'Serve /x and /x/ from /x/index.html',
      code: cloudfront.FunctionCode.fromInline(REWRITE_FUNCTION_CODE),
    });

    // No CSP: the site loads Algolia, Google Fonts and runs live code examples, and a
    // wrong policy breaks pages silently. The rest mirrors the old nginx config.
    const headers = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      comment: 'Takeoff docs security headers',
      securityHeadersBehavior: {
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN, override: true },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(365),
          includeSubdomains: false,
          override: true,
        },
      },
    });

    // Without s3:ListBucket, OAC turns a missing key into 403. Both become the site's
    // own 404 page with a real 404 status (the old nginx answered unknown paths with
    // 200 + index.html, which let the Algolia crawler index junk URLs).
    const notFound = (httpStatus: number): cloudfront.ErrorResponse => ({
      httpStatus,
      responseHttpStatus: 404,
      responsePagePath: '/404.html',
      ttl: cdk.Duration.minutes(1),
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'Takeoff docs',
      ...(config.domain
        ? {
            domainNames: [config.domain.name],
            certificate: acm.Certificate.fromCertificateArn(this, 'Certificate', config.domain.certificateArn),
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          }
        : {}),
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // Honours the Cache-Control that scripts/publish-site.sh puts on each object.
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: headers,
        compress: true,
        functionAssociations: [{ function: rewrite, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST }],
      },
      errorResponses: [notFound(403), notFound(404)],
    });

    // Exactly what scripts/publish-site.sh needs, nothing else.
    const deployPolicy = new iam.ManagedPolicy(this, 'DeployPolicy', {
      description: 'Upload the docs build and invalidate the CloudFront cache',
      statements: [
        new iam.PolicyStatement({ actions: ['s3:ListBucket'], resources: [bucket.bucketArn] }),
        new iam.PolicyStatement({
          actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
          resources: [bucket.arnForObjects('*')],
        }),
        new iam.PolicyStatement({
          actions: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'],
          resources: [distribution.distributionArn],
        }),
      ],
    });

    const { oidcProvider, repository, branch } = config.github;
    if (oidcProvider === 'none') {
      // Fallback for accounts that cannot have an OIDC provider. The access key is created
      // by hand in the console (a key made here would end up in CloudFormation's state).
      const user = new iam.User(this, 'DeployUser', { managedPolicies: [deployPolicy] });
      new cdk.CfnOutput(this, 'DeployUserName', { value: user.userName });
    } else {
      const providerArn =
        oidcProvider === 'create'
          ? new iam.OidcProviderNative(this, 'GitHubOidc', {
              url: `https://${GITHUB_OIDC_HOST}`,
              clientIds: ['sts.amazonaws.com'],
            }).oidcProviderArn
          : oidcProvider;

      const role = new iam.Role(this, 'DeployRole', {
        description: `GitHub Actions deploy of the docs site (${repository}@${branch})`,
        assumedBy: new iam.WebIdentityPrincipal(providerArn, {
          StringEquals: {
            [`${GITHUB_OIDC_HOST}:aud`]: 'sts.amazonaws.com',
            [`${GITHUB_OIDC_HOST}:sub`]: `repo:${repository}:ref:refs/heads/${branch}`,
          },
        }),
        managedPolicies: [deployPolicy],
        maxSessionDuration: cdk.Duration.hours(1),
      });
      new cdk.CfnOutput(this, 'DeployRoleArn', { value: role.roleArn });
    }

    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${config.domain?.name ?? distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: distribution.distributionDomainName,
      description: 'CNAME target for the custom domain',
    });
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
  }
}
