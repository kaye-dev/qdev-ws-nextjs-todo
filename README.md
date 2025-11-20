# Next.js Todo アプリケーション - ワークショップ

AWS ECS Fargate にデプロイする Next.js Todo アプリケーションです。

## 前提条件

- Node.js 18 以上
- AWS CLI（設定済み）
- Docker
- AWS CDK
- Kiro CLI（推奨）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Kiro CLI でのエージェント利用（推奨）

このプロジェクトには開発フェーズに応じたカスタムエージェントが設定されています。

#### 推奨開発フロー

```
1. フロントエンド開発 (frontend)
   ↓
2. インフラ実装 (cdk)
   ↓
3. コードレビュー (review)
   ↓
4. デプロイ
   ↓
5. コスト確認 (cost) ※オプション
```

---

#### 1. フロントエンド開発

```bash
kiro-cli chat --agent frontend
```

**用途:** UI/機能開発、コンポーネント実装

**機能:**
- Next.js 15 + React 19 + TypeScript に最適化
- コンポーネント設計とベストプラクティス提案
- Next.js DevTools MCP による実行時診断
- フロントエンド開発支援 MCP

**使用例:**
```bash
# 新機能追加
> "Todo に優先度フィールドを追加したい"

# バグ修正
> "完了済みタスクが削除できない問題を調査して"

# UI改善
> "空状態のデザインを改善したい"
```

---

#### 2. インフラストラクチャ実装

```bash
kiro-cli chat --agent cdk
```

**用途:** AWS CDK によるインフラコード開発

**機能:**
- AWS CDK によるインフラコード開発に最適化
- CDK Nag によるセキュリティチェック
- AWS Well-Architected Framework に準拠
- ECS Fargate + DynamoDB 構成に特化
- コスト意識を持った実装提案

**使用例:**
```bash
# インフラ構築
> "DynamoDB テーブルにバックアップを設定したい"

# セキュリティ強化
> "IAM ロールの権限を最小化して"

# スケーリング設定
> "ECS タスクのオートスケーリングを追加したい"
```

---

#### 3. コードレビュー

```bash
kiro-cli chat --agent review
```

**用途:** デプロイ前の品質チェック

**機能:**
- コード品質とベストプラクティスチェック
- TypeScript 型安全性の検証
- セキュリティとパフォーマンスの分析
- アクセシビリティ準拠確認
- プロジェクト規約への適合性チェック

**使用例:**
```bash
# ファイル単位のレビュー
> "src/components/TodoApp.tsx をレビューして"

# 全体レビュー
> "src/components/ 配下のコンポーネントをレビューして"

# 特定観点のチェック
> "セキュリティ観点でコードをチェックして"
```

---

#### 4. コスト見積もり（オプション）

```bash
kiro-cli chat --agent cost
```

**用途:** 本番デプロイ時のコスト試算

**機能:**
- AWS 利用料の月額見積もり
- サービス別コスト内訳（ECS Fargate, ALB, DynamoDB, ECR, CloudWatch）
- トラフィック別シナリオ分析（Low/Medium/High）
- 代替アーキテクチャとのコスト比較
- コスト最適化提案
- AWS Pricing Calculator へのリンク提供

**使用例:**
```bash
# 基本的な見積もり
> "このアプリを AWS にデプロイした場合の月額コストを見積もって"

# トラフィック別見積もり
> "1日1万リクエストの場合のコストは？"

# 代替案の比較
> "Lambda + API Gateway 構成とコストを比較して"

# コスト最適化
> "月額コストを削減する方法を教えて"
```

---

**共通リソース:**

すべてのエージェントは以下のプロジェクトドキュメントを参照します：
- `.kiro/steering/structure.md` - プロジェクト構造
- `.kiro/steering/tech.md` - 技術スタック
- `.kiro/steering/product.md` - プロダクト概要
- `.kiro/steering/conventions.md` - 開発規約

### 3. デプロイ

**初回のみ**

```bash
npm run cdk:bootstrap
```

```bash
npm run deploy
```

## 削除

```bash
npm run cdk:destroy
```

## 重要な注意事項

- `name` は必須です。他の参加者と重複しないようにしてください
- 英数字とハイフンのみ使用可能（例: `taro-yamada`, `participant1`）
- VPC の数に制限があるため、ワークショップでは共有 VPC の使用を推奨

## トラブルシューティング

### name エラー

```bash
Error: name が設定されていません
```

→ `cdk.json` の `name` を設定してください

### リソース名の重複エラー

```bash
Resource already exists in stack
```

既存のスタックがある場合は、まず削除してください：

```bash
# 既存スタックの確認
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# 既存スタックの削除（例: TodoAppStack）
aws cloudformation delete-stack --stack-name TodoAppStack

# 削除完了まで待機
aws cloudformation wait stack-delete-complete --stack-name TodoAppStack
```

その後、新しい名前で再デプロイ：

```bash
npm run deploy
```
