# Next.js Todo アプリケーション - ワークショップ

AWS ECS Fargate にデプロイする Next.js Todo アプリケーションです。

## 前提条件

- Node.js 18 以上
- AWS CLI（設定済み）
- Docker
- AWS CDK

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. cdk.json の編集

`cdk.json` ファイルの `context` セクションを編集してしてください：

```json
{
  "context": {
    // ... 既存の設定 ...
    "name": "your-name", // あなたの名前に変更（英数字とハイフンのみ）
    "useSharedVpc": "false" // VPC設定（下記参照）
  }
}
```

### 3. デプロイ

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
