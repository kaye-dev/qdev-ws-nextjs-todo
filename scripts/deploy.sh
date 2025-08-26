#!/bin/bash

# シンプルなデプロイメントスクリプト
# CDK変更がない場合はECSサービスを最新ECRイメージに更新

set -e  # エラー時に即座に終了

# 設定
APP_NAME="nextjs-todo-app"
ECR_REPOSITORY_NAME="nextjs-todo-app"
REGION="ap-northeast-1"
IMAGE_TAG="latest"
STACK_NAME="TodoAppStack"

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

# 7. CDK差分チェック
echo "CDK変更を確認中..."
CDK_DIFF_OUTPUT=$(npm run cdk -- diff $STACK_NAME 2>&1 || true)

# CDK変更があるかチェック
HAS_CDK_CHANGES=false
if echo "$CDK_DIFF_OUTPUT" | grep -q "Resources\|Parameters\|Outputs" && \
   ! echo "$CDK_DIFF_OUTPUT" | grep -q "There were no differences"; then
    HAS_CDK_CHANGES=true
fi

# 8. CDKデプロイまたはECSサービス更新
if [ "$HAS_CDK_CHANGES" = true ]; then
    echo "🔄 CDK変更が検出されました。CDKデプロイを実行します..."
    npm run cdk:deploy -- --require-approval never
else
    echo "📋 CDK変更が検出されませんでした"
    
    # スタックが存在するかチェック
    if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION >/dev/null 2>&1; then
        echo "🚀 ECSサービスを最新ECRイメージに更新します..."
        
        # CloudFormationからECSクラスターとサービス名を取得
        CLUSTER_NAME=$(aws cloudformation describe-stacks \
            --stack-name $STACK_NAME \
            --region $REGION \
            --query "Stacks[0].Outputs[?OutputKey=='EcsClusterName'].OutputValue" \
            --output text)
        
        SERVICE_NAME=$(aws cloudformation describe-stacks \
            --stack-name $STACK_NAME \
            --region $REGION \
            --query "Stacks[0].Outputs[?OutputKey=='EcsServiceName'].OutputValue" \
            --output text)
        
        if [ -n "$CLUSTER_NAME" ] && [ -n "$SERVICE_NAME" ]; then
            echo "ECSクラスター: $CLUSTER_NAME"
            echo "ECSサービス: $SERVICE_NAME"
            
            # ECSサービスを強制更新
            aws ecs update-service \
                --cluster $CLUSTER_NAME \
                --service $SERVICE_NAME \
                --force-new-deployment \
                --region $REGION >/dev/null
            
            echo "✅ ECSサービスの更新が開始されました"
        else
            echo "❌ ECSクラスター名またはサービス名を取得できませんでした"
            exit 1
        fi
    else
        echo "⚠️  スタックが存在しません。初回デプロイを実行します..."
        npm run cdk:deploy -- --require-approval never
    fi
fi

# 9. 結果表示
echo "=== デプロイメント完了 ==="

# ALB DNS名を取得して表示
ALB_DNS=""
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION >/dev/null 2>&1; then
    ALB_DNS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query "Stacks[0].Outputs[?OutputKey=='ApplicationLoadBalancerDnsName'].OutputValue" \
        --output text 2>/dev/null || echo "")
fi

if [ -n "$ALB_DNS" ] && [ "$ALB_DNS" != "None" ]; then
    echo "🌐 アプリケーションURL: http://$ALB_DNS"
    echo "⏱️  アプリケーションが起動するまで数分かかる場合があります"
else
    echo "⚠️  ALBのDNS名を取得できませんでした。AWSコンソールで確認してください。"
fi

echo "🎉 デプロイメントプロセスが正常に完了しました！"
