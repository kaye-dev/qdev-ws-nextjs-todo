# 技術スタック

## コアフレームワーク

- **Next.js 15.5.6** - App Router を使用した React フレームワーク
- **React 19.1.0** - UI ライブラリ
- **TypeScript 5** - 型安全な開発

## スタイリング

- **Tailwind CSS 4** - ユーティリティファーストの CSS フレームワーク
- **PostCSS** - CSS 処理

## AWS サービス

- **AWS SDK v3** - クラウドサービス統合
  - `@aws-sdk/client-dynamodb` - DynamoDB クライアント
  - `@aws-sdk/lib-dynamodb` - 簡易操作用のドキュメントクライアント
- **DynamoDB** - Todo ストレージ用の NoSQL データベース
- **ECS Fargate** - コンテナオーケストレーション
- **Application Load Balancer** - トラフィック分散
- **ECR** - コンテナレジストリ

## Infrastructure as Code

- **AWS CDK 2.170.0** - TypeScript でのインフラ定義
- **Constructs 10.0.0** - CDK ビルディングブロック

## テスト

- **Jest 30.0.5** - テストフレームワーク
- **Testing Library** - React コンポーネントテスト
  - `@testing-library/react` 16.3.0
  - `@testing-library/jest-dom` 6.6.4
  - `@testing-library/user-event` 14.6.1
- **ts-jest** - Jest の TypeScript サポート

## 開発ツール

- **ESLint 9** - Next.js 設定によるコードリンティング
- **Turbopack** - 開発用の高速バンドラー

## よく使うコマンド

### 開発
```bash
npm run dev              # Turbopack で開発サーバーを起動
npm run build            # 本番用ビルドを作成
npm start                # 本番サーバーを起動
npm run lint             # ESLint を実行
```

### テスト
```bash
npm test                 # テストを一度実行
npm run test:watch       # ウォッチモードでテストを実行
npm run test:coverage    # カバレッジレポートを生成
```

### AWS CDK デプロイ
```bash
npm run cdk:bootstrap    # CDK のブートストラップ（初回のみ）
npm run deploy           # AWS にアプリケーションをデプロイ
npm run cdk:synth        # CloudFormation テンプレートを合成
npm run cdk:watch        # 変更を監視してデプロイ
npm run cdk:destroy      # インフラを削除
```

### CDK コマンド直接実行
```bash
npm run cdk -- <command> # 任意の CDK コマンドを実行
```

## ビルド設定

- **Output**: コンテナ化のための Standalone モード
- **Base Path**: 開発環境では `/proxy/3000`
- **Asset Prefix**: `/proxy/3000`
- **Region**: ap-northeast-1（東京）
- **Container Port**: 3000

## TypeScript 設定

- **Target**: ES2017
- **Module**: バンドラー解決による ESNext
- **Strict Mode**: 有効
- **Path Aliases**: `@/*` は `./src/*` にマップ
- **JSX**: Preserve（Next.js が処理）
