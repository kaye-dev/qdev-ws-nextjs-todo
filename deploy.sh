#!/bin/bash

# シンプルなデプロイメントスクリプト
# サンプルアプリケーション用の簡単なデプロイメント

set -e  # エラー時に即座に終了

# 設定
APP_NAME="nextjs-todo-app"
ECR_REPOSITORY_NAME="nextjs-todo-app"
REGION="us-east-1"
IMAGE_TAG="latest"

echo "=== Next.js Todo App デプロイメント開始 ==="

# 1. Dockerイメージビルド
echo "Dockerイメージをビルド中..."
docker build --platform linux/amd64 -t $APP_NAME:$IMAGE_TAG .

# 2. CDK構文チェック
echo "CDK構文チェック中..."
npm run cdk:synth

# 3. AWSアカウントIDを取得
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
REPOSITORY_URI="$ECR_URI/$ECR_REPOSITORY_NAME"

# 4. ECRリポジトリ作成（存在しない場合）
echo "ECRリポジトリを確認中..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $REGION

# 5. ECRログイン
echo "ECRにログイン中..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI

# 6. イメージタグ付けとプッシュ
echo "イメージをプッシュ中..."
docker tag $APP_NAME:$IMAGE_TAG $REPOSITORY_URI:$IMAGE_TAG
docker push $REPOSITORY_URI:$IMAGE_TAG

# 7. CDKデプロイ
echo "CDKデプロイ中..."
npm run cdk:deploy -- --require-approval never

# 8. 結果表示
echo "=== デプロイメント完了 ==="
ALB_DNS=$(aws elbv2 describe-load-balancers --region $REGION --query "LoadBalancers[?contains(LoadBalancerName, '$APP_NAME')].DNSName" --output text 2>/dev/null || echo "")

if [ -n "$ALB_DNS" ]; then
    echo "アプリケーションURL: http://$ALB_DNS"
    echo "アプリケーションが起動するまで数分かかる場合があります"
else
    echo "ALBのDNS名を取得できませんでした。AWSコンソールで確認してください。"
fi
