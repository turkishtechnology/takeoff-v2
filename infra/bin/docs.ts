#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { loadConfig } from '../lib/config.ts';
import { DocsStack } from '../lib/docs-stack.ts';

const app = new cdk.App();
const config = loadConfig();

new DocsStack(app, config.stackName, {
  config,
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region },
  description: 'Takeoff docs site: S3 + CloudFront, deployed from GitHub Actions',
});

// One tag on everything the stack creates, so this project's resources and costs can be
// told apart from other projects in the same account.
cdk.Tags.of(app).add('Project', config.projectTag);
