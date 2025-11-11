# architecture.md

## 目的

プロジェクトのアーキテクチャと技術スタックを明確にし、開発者が全体像を素早く理解できるようにする

## 技術スタック

### フロントエンド

- **Next.js 15** (App Router)
  - React Server Components を活用
  - ファイルベースルーティング
  - API Routes による BFF パターン
- **React 19**
  - 最新の Hooks API
  - Client/Server Components の使い分け
- **TypeScript 5**
  - 厳格な型チェック
  - インターフェース駆動開発
- **Tailwind CSS 4**
  - ユーティリティファーストの CSS フレームワーク
  - レスポンシブデザイン対応

### バックエンド

- **Next.js API Routes**
  - RESTful API エンドポイント
  - サーバーレス関数として動作
- **AWS DynamoDB**
  - NoSQL データベース
  - スキーマレス設計
  - 高速な読み書き性能

### インフラストラクチャ

- **AWS CDK (TypeScript)**
  - インフラストラクチャをコードで管理
  - 型安全な構成
  - CloudFormation テンプレート生成
- **ECS Fargate**
  - サーバーレスコンテナ実行環境
  - オートスケーリング対応
- **Application Load Balancer**
  - HTTP/HTTPS トラフィックの分散
  - ヘルスチェック機能
- **DynamoDB**
  - マネージド NoSQL データベース
  - オンデマンド課金

### 開発ツール

- **ESLint**
  - コード品質チェック
  - Next.js 推奨設定
- **Jest**
  - ユニットテスト
  - React Testing Library 統合
- **npm scripts**
  - ビルド・デプロイの自動化

## プロジェクト構造

```text
project-root/
├── .amazonq/              # Amazon Q Developer Rules
│   └── rules/
│       ├── cording.md
│       ├── context-management.md
│       ├── language.md
│       ├── workshop.md
│       └── architecture.md
│
├── src/                   # アプリケーションソースコード
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API Routes (バックエンド)
│   │   │   ├── health/
│   │   │   └── todos/
│   │   ├── page.tsx     # トップページ
│   │   ├── layout.tsx   # ルートレイアウト
│   │   └── globals.css  # グローバルスタイル
│   │
│   ├── components/       # React コンポーネント
│   │   ├── TodoApp.tsx
│   │   ├── TodoForm.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoList.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── types/           # TypeScript 型定義
│   │   ├── index.ts
│   │   └── todo.ts
│   │
│   ├── hooks/           # カスタムフック
│   │   └── index.ts
│   │
│   └── utils/           # ユーティリティ関数
│       ├── dynamodb.ts    # DynamoDB クライアント
│       ├── storage.ts     # ストレージ操作
│       ├── todoService.ts # Todo ビジネスロジック
│       ├── uuid.ts        # UUID 生成
│       └── validation.ts  # バリデーション
│
├── cdk/                  # AWS CDK インフラコード
│   ├── bin/
│   │   └── todo-app.ts   # CDK アプリエントリーポイント
│   └── lib/
│       └── todo-app-stack.ts  # CDK スタック定義
│
├── public/              # 静的ファイル
│   └── *.svg           # アイコン・画像
│
├── cdk.json            # CDK 設定
├── package.json        # npm 設定
├── tsconfig.json       # TypeScript 設定
├── next.config.ts      # Next.js 設定
├── eslint.config.mjs   # ESLint 設定
└── README.md          # プロジェクト説明
```

## アーキテクチャ図

### システム全体図

```text
[ユーザー]
    ↓
[ブラウザ]
    ↓ HTTPS
[Application Load Balancer]
    ↓
[ECS Fargate (Next.js Container)]
    ↓
[Next.js App Router]
    ├─ [Server Components] → ページレンダリング
    └─ [API Routes] → バックエンド処理
           ↓
    [DynamoDB]
```

## データフロー

### Todo の作成フロー

1. **クライアント**

   - ユーザーが Todo を入力
   - TodoForm コンポーネントで検証

2. **API 呼び出し**

   - `POST /api/todos`
   - JSON ペイロード送信

3. **API Routes (サーバー)**

   - リクエスト検証（validation.ts）
   - UUID 生成（uuid.ts）
   - DynamoDB に保存（todoService.ts）

4. **レスポンス**
   - 作成された Todo を返却
   - クライアントで状態更新

### Todo の取得フロー

1. **初期レンダリング**

   - Server Component でデータ取得
   - SSR によるページ生成

2. **クライアントサイド更新**
   - `GET /api/todos`
   - DynamoDB から全件取得
   - クライアント側で表示

## コンポーネント設計

### 責務の分離

#### Presentational Components（見た目）

- `TodoItem.tsx` - 単一の Todo 表示
- `TodoList.tsx` - Todo リストの表示
- `EmptyState.tsx` - 空状態の表示

#### Container Components（ロジック）

- `TodoApp.tsx` - 状態管理と API 通信

#### Form Components（入力）

- `TodoForm.tsx` - Todo 入力フォーム

### データの流れ

```text
TodoApp (状態管理)
    ↓ props
TodoForm (入力) + TodoList (表示)
    ↓ props
TodoItem (個別表示)
```

## API エンドポイント設計

### GET /api/health

- **用途**: ヘルスチェック
- **レスポンス**: `{ status: "ok" }`

### GET /api/todos

- **用途**: 全 Todo 取得
- **レスポンス**:

  ```json
  {
    "todos": [
      {
        "id": "uuid",
        "title": "string",
        "completed": boolean,
        "createdAt": "ISO8601"
      }
    ]
  }
  ```

### POST /api/todos

- **用途**: Todo 作成
- **リクエスト**:

  ```json
  {
    "title": "string"
  }
  ```

- **レスポンス**: 作成された Todo オブジェクト

### PUT /api/todos/[id]

- **用途**: Todo 更新
- **リクエスト**:

  ```json
  {
    "completed": boolean
  }
  ```

- **レスポンス**: 更新された Todo オブジェクト

### DELETE /api/todos/[id]

- **用途**: Todo 削除
- **レスポンス**: `{ success: true }`

## データベース設計

### DynamoDB テーブル: `${name}-todos`

#### プライマリキー

- **パーティションキー**: `id` (String) - UUID

#### 属性

- `id`: String - Todo の一意識別子
- `title`: String - Todo のタイトル
- `completed`: Boolean - 完了状態
- `createdAt`: String - 作成日時 (ISO8601)

#### インデックス

- なし（単純な全件取得のみ）

## デプロイフロー

### 開発環境

```bash
npm run dev        # ローカル開発サーバー起動
npm run build      # プロダクションビルド
npm run start      # プロダクションサーバー起動
```

### AWS へのデプロイ

```bash
npm run cdk:bootstrap  # 初回のみ: CDK 初期化
npm run cdk:synth      # CloudFormation テンプレート生成
npm run deploy         # デプロイ実行
```

### デプロイされるリソース

1. **VPC** (オプション: 共有 VPC 利用可)
2. **ECS Cluster**
3. **ECS Service (Fargate)**
4. **Application Load Balancer**
5. **DynamoDB Table**
6. **IAM Roles**
7. **Security Groups**

## セキュリティ考慮事項

### 通信

- HTTPS のみ（ALB で終端）
- CORS 設定（必要に応じて）

### 認証・認可

- 現在は未実装（ワークショップ用）
- 本番環境では認証機構の追加を推奨

### データベース

- IAM ロールベースのアクセス制御
- VPC 内通信のみ

## パフォーマンス最適化

### フロントエンドのパフォーマンス最適化

- Server Components による SSR
- 静的アセットの最適化
- Tailwind CSS の Purge 設定

### バックエンドのパフォーマンス最適化

- DynamoDB のオンデマンドキャパシティ
- ECS Fargate のオートスケーリング

### キャッシング

- 現在は未実装
- 本番環境では CloudFront の追加を推奨

## 拡張性

### 機能追加の指針

1. **認証機能**

   - Amazon Cognito 統合
   - ユーザーごとの Todo 管理

2. **リアルタイム更新**

   - WebSocket 統合
   - DynamoDB Streams + Lambda

3. **検索・フィルター**

   - DynamoDB の GSI 活用
   - ElasticSearch 統合

4. **通知機能**
   - Amazon SNS
   - Email/SMS 通知

## トラブルシューティング

### よくある問題

1. **ビルドエラー**

   - TypeScript 型エラー → 型定義確認
   - ESLint エラー → 自動修正実行

2. **デプロイエラー**

   - スタック名重複 → name 変更
   - VPC 制限 → 共有 VPC 利用

3. **実行時エラー**
   - DynamoDB アクセス → IAM 権限確認
   - API エラー → CloudWatch Logs 確認

## 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [ECS Fargate Documentation](https://docs.aws.amazon.com/ecs/)
