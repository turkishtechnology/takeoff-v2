#!/usr/bin/env bash
# Upload a docs build to the site bucket and invalidate CloudFront.
# Used by .github/workflows/deploy-docs.yml and for a manual deploy from a laptop:
#
#   DOCS_BUCKET=... DOCS_DISTRIBUTION_ID=... bash infra/scripts/publish-site.sh [build dir]
#
# Needs AWS credentials allowed by the stack's DeployPolicy.
set -euo pipefail

: "${DOCS_BUCKET:?DOCS_BUCKET is not set (stack output BucketName)}"
: "${DOCS_DISTRIBUTION_ID:?DOCS_DISTRIBUTION_ID is not set (stack output DistributionId)}"
BUILD_DIR="${1:-apps/docs/build}"

for file in index.html 404.html; do
  [ -f "$BUILD_DIR/$file" ] || { echo "✖ $BUILD_DIR/$file missing: build the docs first (pnpm --filter docs build)" >&2; exit 1; }
done

# 1. Content-hashed bundles first, so no page uploaded in step 2 points at a file that is
#    not there yet. Old bundles are kept on purpose: a tab opened before the deploy still
#    lazy-loads them.
aws s3 sync "$BUILD_DIR/assets" "s3://$DOCS_BUCKET/assets" \
  --cache-control 'public, max-age=31536000, immutable' \
  --only-show-errors

# 2. Everything else (pages, sitemap, llms.txt, img/). Browsers revalidate every time; the
#    edge keeps a copy until the invalidation below. --delete drops removed pages; the
#    exclude keeps it away from the bundles above.
aws s3 sync "$BUILD_DIR" "s3://$DOCS_BUCKET" \
  --exclude 'assets/*' \
  --delete \
  --cache-control 'public, max-age=0, s-maxage=31536000, must-revalidate' \
  --only-show-errors

# 3. Hashed bundles never change, but a full invalidation costs the same as a narrower one.
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DOCS_DISTRIBUTION_ID" \
  --paths '/*' \
  --query 'Invalidation.Id' --output text)
echo "Uploaded $BUILD_DIR to s3://$DOCS_BUCKET, invalidation $INVALIDATION_ID started."
