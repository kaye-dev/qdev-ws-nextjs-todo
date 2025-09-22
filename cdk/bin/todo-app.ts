#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TodoAppStack } from "../lib/todo-app-stack";

const app = new cdk.App();

// コンテキストから設定値を取得
const appName = app.node.tryGetContext("app-name") || "nextjs-todo-app";
const environment = app.node.tryGetContext("environment") || "development";
const name = app.node.tryGetContext("name");

// name が指定されていない場合はエラー
if (!name) {
  throw new Error(
    `name が設定されていません。以下のいずれかの方法で設定してください:
    1. cdk.json の context セクションで "name": "your-name" を設定
    2. コマンドラインで --context name=your-name を指定`
  );
}

// スタック名を動的に生成
const stackName = `TodoAppStack-${name}`;

new TodoAppStack(app, stackName, {
  appName,
  deploymentEnvironment: environment,
  participantName: name,
  containerPort: 3000,
  desiredCount: 1,
  cpu: 256,
  memory: 512,
  description: `${appName} - Sample application for ${name} - ECS Fargate deployment`,
  tags: {
    Application: appName,
    ManagedBy: "CDK",
    Participant: name,
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
