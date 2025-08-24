#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TodoAppStack } from '../lib/todo-app-stack';

const app = new cdk.App();

// シンプルな設定
const appName = 'nextjs-todo-app';

new TodoAppStack(app, 'TodoAppStack', {
  appName,
  deploymentEnvironment: 'development',
  containerPort: 3000,
  desiredCount: 1,
  cpu: 256,
  memory: 512,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  },
  description: `${appName} - Sample application - ECS Fargate deployment`,
  tags: {
    Application: appName,
    ManagedBy: 'CDK'
  }
});
