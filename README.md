# QDev-Kiro-WS-NextJS-Todo

Amazon Q Developer と Kiro ワークショップ用の Next.js サンプルアプリケーションです。
シンプルな Todo アプリケーションを AWS ECS Fargate にデプロイする方法を学習できます。

> **注意**: このアプリケーションはワークショップ用のサンプルです。本番環境での利用は避けてください。

## 目次

- [ローカル開発](#ローカル開発)
- [AWS デプロイメント](#awsデプロイメント)
- [プロジェクト構成](#プロジェクト構成)

## ローカル開発

### DynamoDB Local を使用した開発

ローカル環境で DynamoDB を使用して開発：

```bash
npm install
npm run dynamodb:start    # DynamoDB Localを起動
npm run dynamodb:setup    # テーブル作成
npm run dev               # 開発サーバー起動
```

DynamoDB Local を停止：

```bash
npm run dynamodb:stop
```

> **注意**: ローカル開発時は DynamoDB Local（Docker コンテナ）を使用し、AWS デプロイ時は実際の AWS DynamoDB を使用します。データは環境ごとに分離されています。

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

#### 1. 依存関係のインストール

```bash
npm install
```

#### 2. CDK Bootstrap（初回のみ）

```bash
npm run cdk:bootstrap
```

#### 3. デプロイ実行

```bash
npm run deploy
```

または、シンプルなデプロイスクリプトを使用：

```bash
./scripts/simple-deploy.sh
```

### 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# CDK関連
npm run cdk:synth      # 構文チェック
npm run cdk:deploy     # デプロイ
npm run cdk:destroy    # リソース削除

# Docker関連
npm run docker:build   # イメージビルド

# 完全デプロイ
npm run deploy         # ビルド + プッシュ + デプロイ

# DynamoDB Local関連
npm run dynamodb:start # DynamoDB Localを起動
npm run dynamodb:stop  # DynamoDB Localを停止
npm run dynamodb:setup # ローカルテーブル作成
```

### クリーンアップ

デプロイしたリソースを削除する場合：

```bash
npm run cdk:destroy
```

## プロジェクト構成

### ディレクトリ構造

```
├── src/                    # アプリケーションソースコード
│   ├── app/               # Next.js App Router
│   ├── components/        # Reactコンポーネント
│   ├── hooks/            # カスタムフック
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ関数
├── cdk/                   # CDKインフラストラクチャコード
│   ├── lib/              # CDKスタック定義
│   ├── bin/              # CDKアプリエントリーポイント
│   └── test/             # CDKテスト
├── scripts/              # デプロイメントスクリプト
├── public/               # 静的ファイル
└── logs/                 # デプロイメントログ
```

### 技術スタック

#### フロントエンド

- **Next.js 15.4.6**: App Router を使用した React フレームワーク
- **React 19.1.0**: UI ライブラリ
- **TypeScript 5**: 型安全な JavaScript
- **Tailwind CSS 4**: ユーティリティファースト CSS フレームワーク

#### インフラストラクチャ

- **AWS CDK 2.170.0**: Infrastructure as Code
- **AWS ECS Fargate**: コンテナオーケストレーション
- **AWS ECR**: コンテナレジストリ
- **AWS ALB**: ロードバランサー
- **AWS DynamoDB**: NoSQL データベース
- **Docker**: コンテナ化

#### 開発・テスト

- **Jest 30**: テストフレームワーク
- **ESLint 9**: コードリンティング
- **Turbopack**: 高速バンドラー（開発時）

---

## Learn More

Next.js について詳しく学ぶには、以下のリソースをご覧ください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.js の機能と API について学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル

[Next.js GitHub repository](https://github.com/vercel/next.js)もチェックしてみてください - フィードバックや貢献を歓迎します！
