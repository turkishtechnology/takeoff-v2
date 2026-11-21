import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface DocsConfig {
  /** CloudFormation stack name, e.g. `TakeoffDocs`. */
  stackName: string;
  /** Region of the stack (bucket, IAM). CloudFront itself is global. */
  region: string;
  /** Value of the `Project` tag put on every resource (cost allocation, console filters). */
  projectTag: string;
  /**
   * Own host name instead of `*.cloudfront.net`. The certificate must be an issued ACM
   * certificate in us-east-1 (CloudFront's region) covering `name`. DNS stays where it is:
   * point a CNAME for `name` at the distribution's cloudfront.net name.
   */
  domain?: { name: string; certificateArn: string };
  github: {
    /** `owner/repo` allowed to deploy. */
    repository: string;
    /** Only workflow runs on this branch may assume the deploy role. */
    branch: string;
    /**
     * GitHub Actions OIDC provider of the account (one per account):
     * - `"create"`: this stack creates it (no other stack in the account has one)
     * - an ARN: reuse the account's existing provider
     * - `"none"`: no OIDC; the stack creates an IAM user instead and the workflow uses its
     *   access key (only for accounts whose SCP forbids OIDC providers)
     */
    oidcProvider: 'create' | 'none' | string;
  };
}

const configFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'config.json');

export const loadConfig = (): DocsConfig => {
  if (!fs.existsSync(configFile)) {
    throw new Error('infra/config.json not found. Copy infra/config.example.json to infra/config.json and fill it in.');
  }
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8')) as DocsConfig;

  for (const key of ['stackName', 'region', 'projectTag'] as const) {
    if (!config[key]) throw new Error(`config.json: ${key} is required`);
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(config.github?.repository ?? '')) {
    throw new Error('config.json: github.repository must be "owner/repo"');
  }
  if (!config.github.branch) throw new Error('config.json: github.branch is required');
  const { oidcProvider } = config.github;
  if (oidcProvider !== 'create' && oidcProvider !== 'none' && !oidcProvider?.startsWith('arn:aws:iam::')) {
    throw new Error('config.json: github.oidcProvider must be "create", "none" or an OIDC provider ARN');
  }
  if (config.domain) {
    if (!config.domain.name || !config.domain.certificateArn) {
      throw new Error('config.json: domain needs both name and certificateArn');
    }
    if (!config.domain.certificateArn.startsWith('arn:aws:acm:us-east-1:')) {
      throw new Error('config.json: domain.certificateArn must be an ACM certificate in us-east-1');
    }
  }
  return config;
};
