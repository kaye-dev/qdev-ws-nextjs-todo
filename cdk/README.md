# Todo App CDK デプロイメント

このディレクトリには、Next.js TodoアプリケーションをAWS ECS FargateにデプロイするためのCDKコードが含まれています。

## アーキテクチャ概要

```
Internet → ALB → ECS Fargate Service → ECR Repository
           ↓
    CloudWatch Logs
```

### デプロイされるAWSリソース

- **VPC**: パブリックサブネット2つ（Multi-AZ構成）
- **ECR Repository**: Dockerイメージ保存用プライベートリポジトリ
- **ECS Fargate Cluster**: コンテナオーケストレーション
- **ECS Service**: アプリケーション実行サービス
- **Application Load Balancer**: トラフィック分散
- **Security Groups**: ネットワークアクセス制御
- **IAM Roles**: 最小権限アクセス制御
- **CloudWatch Logs**: アプリケーションログ

## 前提条件

### 必要なツール

- **Node.js 18以上**
- **AWS CLI v2** (設定済み)
- **AWS CDK CLI v2.170.0以上** (`npm install -g aws-cdk`)
- **Docker** (イメージビルド用)

### AWS権限

以下のAWSサービスへのアクセス権限が必要です：

- ECR (Elastic Container Registry)
- ECS (Elastic Container Service)
- EC2 (VPC, Security Groups, Load Balancer)
- IAM (Roles, Policies)
- CloudFormation (Stack management)
- CloudWatch (Logs)

## セットアップ

### 1. 依存関係のインストール

```bash
# プロジェクトルートから実行
npm install
```

### 2. CDK Bootstrap（初回のみ）

```bash
# プロジェクトルートから実行
npm run cdk:bootstrap

# または直接実行
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### 3. 設定確認

```bash
# AWS認証情報確認
aws sts get-caller-identity

# CDK設定確認
cdk doctor
```

## 使用方法

### CDKスタックの合成（構文チェック）

```bash
# プロジェクトルートから実行
npm run cdk:synth

# または直接実行
cd cdk && cdk synth
```

### デプロイ

```bash
# プロジェクトルートから実行
npm run cdk:deploy

# または直接実行
cd cdk && cdk deploy
```

### スタック情報確認

```bash
# デプロイされたスタック一覧
cdk list

# スタックの詳細情報
cdk diff

# 出力値確認
aws cloudformation describe-stacks --stack-name TodoAppStack --query 'Stacks[0].Outputs'
```

### 削除

```bash
# プロジェクトルートから実行
npm run cdk:destroy

# または直接実行
cd cdk && cdk destroy
```

### テスト実行

```bash
# プロジェクトルートから実行
npm run cdk:test

# ウォッチモード
npm run cdk:test:watch

# または直接実行
cd cdk && jest
```

## プロジェクト構造

```
cdk/
├── bin/
│   └── todo-app.ts          # CDKアプリケーションエントリーポイント
├── lib/
│   └── todo-app-stack.ts    # メインスタック定義
│       ├── VPC設定
│       ├── ECRリポジトリ
│       ├── ECSクラスター・サービス
│       ├── ALB設定
│       └── IAMロール
├── test/
│   └── todo-app.test.ts     # ユニットテスト
├── jest.config.js           # Jest設定
├── tsconfig.json           # TypeScript設定
└── README.md               # このファイル
```

## 設定

### CDKコンテキスト設定

`cdk.json`で以下の値を設定できます：

```json
{
  "context": {
    "app-name": "nextjs-todo-app",
    "environment": "development"
  }
}
```

### 環境別設定

#### 開発環境 (development)

- ECS Task: CPU 256, Memory 512MB
- Desired Count: 1
- Auto Scaling: 無効

#### ステージング環境 (staging)

- ECS Task: CPU 512, Memory 1024MB
- Desired Count: 1
- Auto Scaling: 無効

#### 本番環境 (production)

- ECS Task: CPU 512, Memory 1024MB
- Desired Count: 2
- Auto Scaling: 有効（将来拡張）

## デプロイされるリソース詳細

### VPC構成

```typescript
// パブリックサブネット2つ（Multi-AZ）
const vpc = new ec2.Vpc(this, 'TodoAppVpc', {
  maxAzs: 2,
  subnetConfiguration: [
    {
      cidrMask: 24,
      name: 'Public',
      subnetType: ec2.SubnetType.PUBLIC,
    }
  ]
});
```

### セキュリティグループ

- **ALB Security Group**: HTTP (80) インバウンド許可
- **ECS Security Group**: ALBからのポート3000アクセス許可

### ECS設定

```typescript
// Fargateタスク定義
const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
  memoryLimitMiB: 512,
  cpu: 256,
});

// コンテナ定義
taskDefinition.addContainer('NextjsContainer', {
  image: ecs.ContainerImage.fromEcrRepository(repository),
  portMappings: [{ containerPort: 3000 }],
  logging: ecs.LogDrivers.awsLogs({
    streamPrefix: 'nextjs-todo-app',
  }),
});
```

## トラブルシューティング

### よくある問題

#### 1. Bootstrap未実行エラー

```
Error: This stack uses assets, so the toolkit stack must be deployed
```

**解決方法:**

```bash
npm run cdk:bootstrap
```

#### 2. 権限不足エラー

```
Error: User is not authorized to perform: iam:CreateRole
```

**解決方法:**

- AWS管理者に必要な権限を依頼
- または適切なIAMポリシーをアタッチ

#### 3. リソース制限エラー

```
Error: Cannot exceed quota for PoliciesPerRole
```

**解決方法:**

- 不要なIAMロールを削除
- AWS Service Quotasで制限値を確認

### デバッグ用コマンド

```bash
# CloudFormationスタック状態確認
aws cloudformation describe-stacks --stack-name TodoAppStack

# ECSサービス状態確認
aws ecs describe-services --cluster nextjs-todo-cluster --services nextjs-todo-service

# CloudWatch Logs確認
aws logs tail /ecs/nextjs-todo-app --follow
```

### ログ確認

```bash
# ECSタスクログ
aws logs describe-log-groups --log-group-name-prefix "/ecs/nextjs-todo"

# 特定のログストリーム
aws logs get-log-events --log-group-name "/ecs/nextjs-todo-app" --log-stream-name "STREAM_NAME"
```

## セキュリティ考慮事項

### ネットワークセキュリティ

- パブリックサブネット使用（ワークショップ用シンプル構成）
- セキュリティグループによる最小限のポート開放
- ALB経由でのトラフィック制御

### IAM権限

```typescript
// ECSタスク実行ロール（最小権限）
const executionRole = new iam.Role(this, 'ExecutionRole', {
  assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
  ],
});
```

### コンテナセキュリティ

- 非rootユーザーでの実行
- 最小限のベースイメージ使用
- 環境変数による設定管理

## パフォーマンス最適化

### ECS設定

- 適切なCPU/メモリ配分
- ヘルスチェック間隔調整
- デプロイメント設定最適化

### ALB設定

- ヘルスチェックパス: `/`
- ヘルスチェック間隔: 30秒
- 異常閾値: 2回連続失敗

## モニタリング

### CloudWatch Metrics

- ECS Service CPU/Memory使用率
- ALB Request Count/Response Time
- Target Health Status

### ログ管理

- アプリケーションログ: `/ecs/nextjs-todo-app`
- ログ保持期間: 14日間
- ログレベル: INFO以上

## 拡張可能性

### 将来の拡張項目

- **Auto Scaling**: CPU使用率ベースのスケーリング
- **HTTPS対応**: ACM証明書とRoute53連携
- **Database**: RDS PostgreSQL追加
- **Cache**: ElastiCache Redis追加
- **Monitoring**: X-Ray分散トレーシング
- **CI/CD**: CodePipeline統合

### カスタマイズ方法

```typescript
// 環境変数での設定変更
const environment = process.env.ENVIRONMENT || 'development';
const config = {
  development: { cpu: 256, memory: 512, desiredCount: 1 },
  production: { cpu: 512, memory: 1024, desiredCount: 2 }
}[environment];
```

## 参考資料

- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/)
- [AWS ECS Developer Guide](https://docs.aws.amazon.com/ecs/)
- [AWS Fargate User Guide](https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html)
- [Application Load Balancer User Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
