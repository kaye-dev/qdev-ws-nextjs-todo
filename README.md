# QDev-Kiro-WS-NextJS-Todo

これは[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)でブートストラップされた[Next.js](https://nextjs.org)プロジェクトです。
ワークショップのサンプルアプリケーションになりますので、ビジネス利用は避けてください。

## はじめに

まず、開発サーバーを起動してください：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

ブラウザで<http://localhost:3000を開いて結果を確認してください。>

app/page.tsxを編集してページの編集を開始できます。ファイルを編集すると、ページが自動的に更新されます。

このプロジェクトは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使用して、Vercelの新しいフォントファミリーである[Geist](https://vercel.com/font)を自動的に最適化し読み込みます。

## Deploy on AWS

本アプリケーションは ECS Fargate にアプリケーションをデプロイします。
アプリケーションの構成としては、CloudFront > ALB > ECS Fargate > DynamoDB を想定しています。
