# QDev-Kiro-WS-NextJS-Todo

Amazon Q Developer ワークショップ用で利用する Next.js サンプルアプリケーションです。
シンプルな Todo アプリケーションを AWS ECS Fargate にデプロイする方法を学習できます。

> **注意**: このアプリケーションはワークショップ用のサンプルです。本番環境での利用は避けてください。

## ローカル開発

### 初めてアプリを起動するとき

1.`cdk deploy` するために `cdk bootstrap` コマンドを実行

```bash
npm run cdk:bootstrap
```

2.DynamoDB のリソースを利用するためにアプリケーションをデプロイ

```bash
npm run deploy
```

### アプリケーション起動

ローカル環境で DynamoDB を使用して開発：

```bash
npm run dev
```

ブラウザで <http://localhost:3000> を開いてアプリケーションを確認してください。

## AWS デプロイメント

本アプリケーションは AWS CDK を使用して ECS Fargate にデプロイされます。

### 前提条件

- **Node.js** (v18 以上)
- **AWS CLI** (v2 推奨)
- **AWS CDK CLI** (v2.170.0 以上)
- **Docker**
- **AWS 認証設定**

### デプロイ手順

```bash
npm run deploy
```

または、デプロイスクリプトを実行：

```bash
./deploy.sh
```

### クリーンアップ

デプロイしたリソースを削除する場合：

```bash
npm run cdk:destroy
```

## プロジェクト構成

### ディレクトリ構造

```bash
├── src/                  # アプリケーションソースコード
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ関数
├── cdk/                  # CDKインフラストラクチャコード
│   ├── lib/              # CDKスタック定義
│   └── bin/              # CDKアプリエントリーポイント
└── public/               # デプロイメントログ
```

### 技術スタック

#### フロントエンド

- **Next.js 15.4.6**: App Router を使用した React フレームワーク
- **React 19.1.0**: UI ライブラリ
- **TypeScript 5**: 型安全な JavaScript
- **Tailwind CSS 4**: ユーティリティファースト CSS フレームワーク

#### インフラストラクチャ

- **AWS CDK**: IaC
- **AWS ECS Fargate**: コンテナオーケストレーション
- **AWS ECR**: コンテナレジストリ
- **AWS ALB**: ロードバランサー
- **AWS DynamoDB**: NoSQL データベース
- **Docker**: コンテナ化

---

## Learn More

Next.js について詳しく学ぶには、以下のリソースをご覧ください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.js の機能と API について学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル
