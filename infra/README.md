# Docs hosting on AWS

The docs site (`apps/docs`) is a static Docusaurus build served from a private
S3 bucket through CloudFront. This folder is the CDK app that creates it. The
site content is not deployed by CDK: `.github/workflows/deploy-docs.yml` builds
the docs on every push to `main` and uploads them with
`scripts/publish-site.sh`.

```
browser ──HTTPS──> CloudFront ──OAC──> S3 (private)
                    ├─ viewer-request function: /x and /x/ → /x/index.html
                    ├─ 403/404 from S3 → /404.html with status 404
                    └─ security headers (HSTS, nosniff, SAMEORIGIN, referrer policy)

GitHub Actions (push to main) ──OIDC──> DeployRole ──> s3 sync + invalidation
```

The stack holds no secrets and no Lambda functions. Every resource carries the
tag `Project=<projectTag>` so it can be told apart from other projects in the
same account (activate the tag under Billing → Cost allocation tags to split the
bill).

## One-time setup

You need AWS CLI credentials with admin rights on the target account
(`aws sts get-caller-identity` must work).

1. **Config**: `cp infra/config.example.json infra/config.json` and fill it in.
   `config.json` is git-ignored because it holds the account's certificate ARN.
   Leave `domain` out on the first deploy if the certificate is not issued yet;
   the site then runs on its `*.cloudfront.net` name.
2. **Certificate** (for the custom domain): AWS Console → Certificate Manager,
   region **us-east-1** (CloudFront only reads certificates from there) →
   Request a public certificate for the domain name, DNS validation. Add the
   CNAME it shows at the DNS provider, wait for _Issued_, and put the ARN in
   `domain.certificateArn`.
3. **GitHub OIDC provider**: an account has at most one provider for
   `token.actions.githubusercontent.com`. Use `"oidcProvider": "create"` if the
   account has none, or its ARN if another stack already made it. `"none"` is
   the fallback for an account whose service control policy forbids OIDC
   providers: the stack then creates an IAM user with the same rights, and you
   create its access key by hand in the console.
4. **CDK bootstrap** (once per account and region; skip if `CDKToolkit` already
   exists in CloudFormation):
   ```bash
   pnpm --filter infra cdk bootstrap aws://<ACCOUNT_ID>/<region>
   ```
5. **Deploy the stack**:
   ```bash
   pnpm --filter infra diff     # review
   pnpm --filter infra deploy   # writes infra/cdk-outputs.json
   ```
6. **DNS**: at the DNS provider, add a CNAME from the domain name to the
   `CloudFrontDomain` output.
7. **GitHub**: in the repository settings, Actions variables (all from the
   outputs): `AWS_REGION`, `DOCS_BUCKET`, `DOCS_DISTRIBUTION_ID`,
   `DOCS_SITE_URL` (`SiteUrl`), and `DOCS_DEPLOY_ROLE_ARN`. Actions secret:
   `ALGOLIA_SEARCH_API_KEY` (the search-only key). With `oidcProvider: "none"`,
   skip `DOCS_DEPLOY_ROLE_ARN` and set the `AWS_ACCESS_KEY_ID` /
   `AWS_SECRET_ACCESS_KEY` secrets from the user's access key.
8. **First upload**: run the _Deploy docs_ workflow on `main` (Actions → Deploy
   docs → Run workflow), or from a laptop:
   ```bash
   pnpm turbo build --filter=@turkish-technology/spar
   DOCS_SITE_URL=<SiteUrl> ALGOLIA_SEARCH_API_KEY=<key> pnpm --filter docs build
   DOCS_BUCKET=<BucketName> DOCS_DISTRIBUTION_ID=<DistributionId> bash infra/scripts/publish-site.sh
   ```
9. **Algolia**: point the crawler at the new host (start URL, sitemap, and the
   domain verification that `apps/docs/static/robots.txt` carries) and recrawl.

## Caching

`publish-site.sh` sets the cache headers per object:

| Objects                          | Cache-Control                                           |
| -------------------------------- | ------------------------------------------------------- |
| `assets/**` (content-hashed)     | `public, max-age=31536000, immutable`                   |
| everything else (pages, sitemap) | `public, max-age=0, s-maxage=31536000, must-revalidate` |

Browsers revalidate pages on every visit; CloudFront keeps them until the
invalidation that each deploy ends with. Old hashed bundles are never deleted,
so a tab opened before a deploy keeps working.

## Changing the stack

Edit `lib/docs-stack.ts`, then `pnpm --filter infra test`, `diff` and `deploy`.
Deleting the stack keeps the bucket (empty it and delete it by hand if that is
the intent).
