# デプロイメントログ

このディレクトリには、CDKデプロイメントスクリプトの実行ログが保存されます。

## ログファイル命名規則

```
deployment-YYYYMMDD-HHMMSS.log
```

例: `deployment-20250824-123128.log`

## ログ内容

各ログファイルには以下の情報が記録されます：

### 1. デプロイメント開始情報

- 実行日時
- 実行環境（development/staging/production）
- 実行ユーザー
- AWS認証情報

### 2. Dockerビルド・プッシュログ

- イメージビルド進捗
- ECRログイン状況
- イメージプッシュ結果
- エラー情報（該当する場合）

### 3. CDKデプロイメントログ

- スタック合成結果
- リソース作成・更新進捗
- デプロイメント完了状況
- 出力値（ALB URL等）

### 4. エラー情報

- エラー発生時刻
- エラーメッセージ
- スタックトレース
- 推奨される解決方法

## ログの確認方法

### 最新のログを確認

```bash
# 最新のログファイルを表示
ls -la logs/ | tail -1

# 最新のログ内容を表示
tail -f logs/deployment-*.log | tail -1
```

### 特定の日付のログを確認

```bash
# 特定の日付のログを検索
ls logs/deployment-20250824-*.log

# 特定のログファイルを表示
cat logs/deployment-20250824-123128.log
```

### エラーログのみを抽出

```bash
# エラー行のみを表示
grep -i "error\|failed\|exception" logs/deployment-*.log

# 特定のログファイルからエラーを抽出
grep -i "error\|failed\|exception" logs/deployment-20250824-123128.log
```

## ログローテーション

### 自動クリーンアップ

古いログファイルは手動で削除してください：

```bash
# 7日以上古いログファイルを削除
find logs/ -name "deployment-*.log" -mtime +7 -delete

# 特定の日付より古いログを削除
find logs/ -name "deployment-*.log" -not -newermt "2025-01-01" -delete
```

### ログサイズ管理

```bash
# ログディレクトリのサイズ確認
du -sh logs/

# 大きなログファイルを確認
ls -lah logs/ | sort -k5 -hr
```

## トラブルシューティング用ログ分析

### よくあるエラーパターン

#### 1. Docker関連エラー

```bash
# Dockerエラーを検索
grep -A 5 -B 5 "docker\|Docker" logs/deployment-*.log
```

#### 2. AWS認証エラー

```bash
# 認証関連エラーを検索
grep -A 5 -B 5 "credentials\|authentication\|unauthorized" logs/deployment-*.log
```

#### 3. CDKデプロイエラー

```bash
# CDK関連エラーを検索
grep -A 10 -B 5 "cdk deploy\|CloudFormation" logs/deployment-*.log
```

#### 4. ECSサービスエラー

```bash
# ECS関連エラーを検索
grep -A 5 -B 5 "ECS\|Fargate\|Task" logs/deployment-*.log
```

### ログ分析スクリプト例

```bash
#!/bin/bash
# analyze-logs.sh - ログ分析用スクリプト

LOG_DIR="logs"
LATEST_LOG=$(ls -t $LOG_DIR/deployment-*.log | head -1)

echo "=== 最新のデプロイメントログ分析 ==="
echo "ログファイル: $LATEST_LOG"
echo

echo "=== エラー情報 ==="
grep -i "error\|failed\|exception" "$LATEST_LOG" || echo "エラーは見つかりませんでした"
echo

echo "=== 警告情報 ==="
grep -i "warning\|warn" "$LATEST_LOG" || echo "警告は見つかりませんでした"
echo

echo "=== デプロイメント結果 ==="
grep -i "deployment\|deploy.*complete\|stack.*complete" "$LATEST_LOG" || echo "デプロイメント結果が見つかりませんでした"
```

## ログ設定

### ログレベル設定

デプロイメントスクリプトでは以下のログレベルを使用：

- **INFO**: 一般的な実行情報
- **WARN**: 警告メッセージ
- **ERROR**: エラーメッセージ
- **DEBUG**: デバッグ情報（詳細モード時のみ）

### 詳細ログの有効化

```bash
# 詳細ログでデプロイメント実行
DEBUG=true npm run deploy:full:dev

# または環境変数で設定
export DEBUG=true
npm run deploy:full:dev
```

## セキュリティ考慮事項

### 機密情報の除外

ログファイルには以下の機密情報は記録されません：

- AWS Access Key / Secret Key
- パスワード
- APIキー
- その他の認証情報

### ログファイルの権限

```bash
# ログファイルの権限確認
ls -la logs/

# 適切な権限設定（必要に応じて）
chmod 600 logs/deployment-*.log
```

## バックアップとアーカイブ

### 重要なログのバックアップ

```bash
# 本番デプロイメントログのバックアップ
cp logs/deployment-*-prod-*.log backup/

# 圧縮してアーカイブ
tar -czf logs-archive-$(date +%Y%m%d).tar.gz logs/deployment-*.log
```

### ログの外部保存

```bash
# S3にログをアップロード（オプション）
aws s3 cp logs/ s3://your-log-bucket/deployment-logs/ --recursive --exclude "*" --include "deployment-*.log"
```

## 参考情報

- デプロイメントスクリプト: `scripts/deploy.sh`, `scripts/full-deploy.sh`
- エラーハンドリング: `scripts/error-handler.sh`
- ログ設定: 各スクリプト内の`LOG_FILE`変数
