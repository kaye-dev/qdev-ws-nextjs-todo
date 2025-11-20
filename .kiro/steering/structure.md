# プロジェクト構造

## ルートディレクトリ

```
/
├── src/                    # アプリケーションソースコード
├── cdk/                    # AWS CDK インフラコード
├── public/                 # 静的アセット
├── .kiro/                  # Kiro 設定とステアリング
├── .next/                  # Next.js ビルド出力（生成）
├── node_modules/           # 依存関係（生成）
└── cdk.out/                # CDK 合成出力（生成）
```

## ソースディレクトリ（`src/`）

### App Router（`src/app/`）
API ルートとページを含む Next.js 15 App Router 構造

```
src/app/
├── api/                    # API ルートハンドラー
│   ├── health/            # ヘルスチェックエンドポイント
│   │   └── route.ts       # GET /api/health
│   └── todos/             # Todo CRUD エンドポイント
│       ├── route.ts       # GET /api/todos, POST /api/todos
│       └── [id]/          # 単一 Todo の動的ルート
│           └── route.ts   # PATCH /api/todos/[id], DELETE /api/todos/[id]
├── page.tsx               # ホームページ（メインエントリー）
├── layout.tsx             # メタデータを含むルートレイアウト
├── globals.css            # グローバルスタイルと Tailwind インポート
└── favicon.ico            # サイトアイコン
```

### コンポーネント（`src/components/`）
単一責任の原則に従った React コンポーネント

```
src/components/
├── TodoApp.tsx            # メインコンテナ、状態管理、API 呼び出し
├── TodoForm.tsx           # Todo 追加用の入力フォーム
├── TodoList.tsx           # 空状態処理を含むリストコンテナ
├── TodoItem.tsx           # アクション付きの個別 Todo アイテム
└── EmptyState.tsx         # Todo が存在しない場合の空状態 UI
```

**コンポーネント階層:**
- `TodoApp`（コンテナ） → 状態と API を管理
  - `TodoForm` → 新規 Todo 作成を処理
  - `TodoList` → Todo コレクションをレンダリング
    - `TodoItem` → トグル/削除機能付きの個別 Todo
    - `EmptyState` → リストが空の場合に表示

### 型定義（`src/types/`）
TypeScript の型定義とインターフェース

```
src/types/
├── index.ts               # すべての型を再エクスポート
└── todo.ts                # Todo 関連の型と定数
```

### ユーティリティ（`src/utils/`）
共有ユーティリティ関数とサービス

```
src/utils/
├── index.ts               # ユーティリティを再エクスポート
├── dynamodb.ts            # DynamoDB クライアント設定
├── todoService.ts         # DynamoDB CRUD 操作
├── uuid.ts                # UUID 生成
├── validation.ts          # 入力バリデーションロジック
└── storage.ts             # ストレージユーティリティ（必要に応じて）
```

### フック（`src/hooks/`）
カスタム React フック（現在は最小限）

```
src/hooks/
└── index.ts               # フックのエクスポート
```

## CDK インフラ（`cdk/`）

TypeScript での AWS CDK Infrastructure as Code

```
cdk/
├── bin/                   # CDK アプリエントリーポイント
├── lib/                   # スタック定義
│   └── todo-app-stack.ts  # メイン ECS Fargate スタック
├── tsconfig.json          # CDK 専用 TypeScript 設定
└── README.md              # CDK ドキュメント
```

## 設定ファイル

- `package.json` - 依存関係とスクリプト
- `tsconfig.json` - Next.js 用 TypeScript 設定
- `next.config.ts` - Next.js 設定
- `eslint.config.mjs` - ESLint ルール
- `jest.config.js` - Jest テスト設定
- `jest.setup.js` - Jest セットアップとマッチャー
- `postcss.config.mjs` - PostCSS 設定
- `tailwind.config.ts` - Tailwind CSS 設定（存在する場合）
- `cdk.json` - CDK 設定とコンテキスト
- `cdk.context.json` - CDK コンテキスト値
- `Dockerfile` - コンテナイメージ定義
- `.dockerignore` - Docker ビルド除外設定
- `deploy.sh` - デプロイスクリプト

## 命名規則

### ファイル
- **コンポーネント**: PascalCase（例: `TodoApp.tsx`）
- **ユーティリティ**: camelCase（例: `todoService.ts`）
- **型定義**: camelCase（例: `todo.ts`）
- **API ルート**: lowercase（例: `route.ts`）

### コード
- **インターフェース**: PascalCase（例: `Todo`, `TodoFormProps`）
- **関数**: camelCase（例: `handleAddTodo`, `saveTodoToDynamoDB`）
- **定数**: UPPER_SNAKE_CASE（例: `TABLE_NAME`, `TODO_CONSTANTS`）
- **React コンポーネント**: PascalCase でデフォルトエクスポート

## インポートパターン

- `src/` からのインポートにはパスエイリアス `@/*` を使用
- 同じディレクトリレベル内では相対インポート
- インポートのグループ化: 外部 → 内部 → 型
- API ルートは Next.js の `NextRequest`/`NextResponse` を使用

## アーキテクチャパターン

- **クライアントコンポーネント**: `"use client"` ディレクティブでマーク
- **サーバーコンポーネント**: ページとレイアウトのデフォルト
- **API ルート**: 適切な HTTP メソッドを使用した RESTful 設計
- **状態管理**: コンテナコンポーネントで React useState を使用
- **データフロー**: 単方向（props は下へ、コールバックは上へ）
- **エラーハンドリング**: console.error とユーザーフィードバックを含む try-catch
- **アクセシビリティ**: ARIA ラベル、セマンティック HTML、キーボードナビゲーション
