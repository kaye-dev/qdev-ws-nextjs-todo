# 開発規約

## 言語設定

- 対話は日本語で行う
- コメントは日本語で記述
- git コミットメッセージは日本語

## コーディングスタイル

- インデント: スペース2つ
- 行の長さ: 120文字以内
- 命名規則:
  - コンポーネント: PascalCase (TodoApp.tsx)
  - ユーティリティ: camelCase (todoService.ts)
  - 定数: UPPER_SNAKE_CASE (TABLE_NAME)
- 関数は単一責任の原則に従う
- 不要なコードやコメントアウトは削除
- 使用していない変数・関数は削除

## TypeScript

- `any` 型は避ける
- インターフェースは `src/types/` に集約
- props は明示的に型定義
- 共通型は `src/types/index.ts` でエクスポート

## Next.js

- 'use client' は必要な場合のみファイル先頭に配置
- Server Components がデフォルト
- API Routes は `src/app/api/` 配下に配置
- 環境別設定は `process.env.NODE_ENV` で分岐
  - 開発: `/proxy/3000/api/*`
  - 本番: `/api/*`

## コンポーネント設計

- 1ファイル1コンポーネント
- props は明示的にインターフェースで定義
- ビジネスロジックはカスタムフック (`src/hooks/`) に分離
- 再利用可能なコンポーネントは `src/components/` に配置

## AWS CDK

- スタック名は `cdk.json` の `name` を使用
- リソース名: `${name}-${resourceType}`
- デプロイ前に `npm run cdk:synth` で確認
- 環境変数は `process.env` で明示的に取得

## DynamoDB

- クライアント初期化は `src/utils/dynamodb.ts` を使用
- テーブル名は環境変数から取得
- エラーハンドリングを適切に実装

## ワークショップ制約

- `cdk.json` の `name` は一意に設定（例: taro-yamada）
- 英数字とハイフンのみ使用可能
- VPC は共有 VPC を推奨
- デプロイ前に `npm run build` でビルド確認
- スタック削除時は完全削除まで待機

## 品質チェック

- ファイル保存時に ESLint でチェック
- `npm run build` でビルドエラーがないことを確認
- CDK 実装後は `npm run cdk:synth` で出力確認

## タスク完了後

日本語のワンライナー git commit メッセージを提案
