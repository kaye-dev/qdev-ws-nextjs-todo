# QDev-Kiro-WS-NextJS-Todo

Amazon Q DeveloperとKiroワークショップ用のNext.jsサンプルアプリケーションです。
シンプルなTodoアプリケーションをAWS ECS Fargateにデプロイする方法を学習できます。

> **注意**: このアプリケーションはワークショップ用のサンプルです。本番環境での利用は避けてください。

## 目次

- [ローカル開発](#ローカル開発)
- [AWSデプロイメント](#awsデプロイメント)
- [プロジェクト構成](#プロジェクト構成)

## ローカル開発

開発サーバーを起動：

```bash
npm install
npm run dev
```

ブラウザで <http://localhost:3000> を開いてアプリケーションを確認してください。

## AWSデプロイメント

本アプリケーションはAWS CDKを使用してECS Fargateにデプロイされます。

### 前提条件

- **Node.js** (v18以上)
- **AWS CLI** (v2推奨)
- **AWS CDK CLI** (v2.170.0以上)
- **Docker**
- **AWS認証設定**

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

- **Next.js 15.4.6**: App Routerを使用したReactフレームワーク
- **React 19.1.0**: UIライブラリ
- **TypeScript 5**: 型安全なJavaScript
- **Tailwind CSS 4**: ユーティリティファーストCSSフレームワーク

#### インフラストラクチャ

- **AWS CDK 2.170.0**: Infrastructure as Code
- **AWS ECS Fargate**: コンテナオーケストレーション
- **AWS ECR**: コンテナレジストリ
- **AWS ALB**: ロードバランサー
- **Docker**: コンテナ化

#### 開発・テスト

- **Jest 30**: テストフレームワーク
- **ESLint 9**: コードリンティング
- **Turbopack**: 高速バンドラー（開発時）

---

## Learn More

Next.jsについて詳しく学ぶには、以下のリソースをご覧ください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能とAPIについて学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアル

[Next.js GitHub repository](https://github.com/vercel/next.js)もチェックしてみてください - フィードバックや貢献を歓迎します！
