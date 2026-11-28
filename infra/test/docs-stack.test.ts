import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import type { DocsConfig } from '../lib/config.ts';
import { DocsStack, REWRITE_FUNCTION_CODE } from '../lib/docs-stack.ts';

type Handler = (event: { request: { uri: string } }) => { uri: string };
const handler = new Function(`${REWRITE_FUNCTION_CODE}; return handler;`)() as Handler;
const rewrite = (uri: string) => handler({ request: { uri } }).uri;

describe('index rewrite (CloudFront Function)', () => {
  it('serves routes from their index.html', () => {
    assert.equal(rewrite('/'), '/index.html');
    assert.equal(rewrite('/docs/components/button'), '/docs/components/button/index.html');
    assert.equal(rewrite('/docs/components/button/'), '/docs/components/button/index.html');
  });

  it('leaves files alone', () => {
    for (const uri of ['/404.html', '/llms.txt', '/docs/components.md', '/assets/js/main.1a2b.js', '/sitemap.xml']) {
      assert.equal(rewrite(uri), uri);
    }
  });

  it('treats a dot in a folder name as part of a route', () => {
    assert.equal(rewrite('/v1.2/docs'), '/v1.2/docs/index.html');
  });
});

const baseConfig: DocsConfig = {
  stackName: 'TestDocs',
  region: 'eu-north-1',
  projectTag: 'takeoff-docs',
  github: { repository: 'turkishtechnology/takeoff-v2', branch: 'main', oidcProvider: 'create' },
};

const synth = (config: DocsConfig) => Template.fromStack(new DocsStack(new cdk.App(), 'TestDocs', { config, env: { region: config.region } }));

describe('DocsStack', () => {
  it('keeps the bucket private and maps missing keys to a real 404', () => {
    const template = synth(baseConfig);
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        CustomErrorResponses: [
          { ErrorCode: 403, ResponseCode: 404, ResponsePagePath: '/404.html' },
          { ErrorCode: 404, ResponseCode: 404, ResponsePagePath: '/404.html' },
        ],
      },
    });
    template.resourceCountIs('AWS::Lambda::Function', 0);
  });

  it('lets only the configured branch assume the deploy role', () => {
    const template = synth(baseConfig);
    template.resourceCountIs('AWS::IAM::OIDCProvider', 1);
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          Match.objectLike({
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                'token.actions.githubusercontent.com:sub': 'repo:turkishtechnology/takeoff-v2:ref:refs/heads/main',
              },
            },
          }),
        ],
      },
    });
  });

  it('reuses an existing OIDC provider when given its ARN', () => {
    const arn = 'arn:aws:iam::111111111111:oidc-provider/token.actions.githubusercontent.com';
    const template = synth({ ...baseConfig, github: { ...baseConfig.github, oidcProvider: arn } });
    template.resourceCountIs('AWS::IAM::OIDCProvider', 0);
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: { Statement: [Match.objectLike({ Principal: { Federated: arn } })] },
    });
  });

  it('falls back to an IAM user without OIDC', () => {
    const template = synth({ ...baseConfig, github: { ...baseConfig.github, oidcProvider: 'none' } });
    template.resourceCountIs('AWS::IAM::OIDCProvider', 0);
    template.resourceCountIs('AWS::IAM::Role', 0);
    template.resourceCountIs('AWS::IAM::User', 1);
    template.resourceCountIs('AWS::IAM::AccessKey', 0);
  });

  it('serves the custom domain with its certificate', () => {
    const certificateArn = 'arn:aws:acm:us-east-1:111111111111:certificate/abc';
    const template = synth({ ...baseConfig, domain: { name: 'v2.takeoffui.com', certificateArn } });
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Aliases: ['v2.takeoffui.com'],
        ViewerCertificate: Match.objectLike({ AcmCertificateArn: certificateArn }),
      },
    });
  });
});
