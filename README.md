# QDev-Kiro-WS-NextJS-Todo

Amazon Q Developer と Kiro ワークショップ用の Next.js サンプルアプリケーションです。
シンプルな Todo アプリケーションを AWS ECS Fargate にデプロイする方法を学習できます。

> **注意**: このアプリケーションはワークショップ用のサンプルです。本番環境での利用は避けてください。

## 推奨開発ワークフロー

### 初回セットアップ

```bash
npm run deploy
```

### CDK Watch 開発

1. CDK の変更を追跡

   ```bash
   npm run cdk:watch
   ```

2. アプリケーションを起動

   ```bash
   npm run watch:dev
   ```

## 技術スタック

- **Next.js 15.4.6** + **React 19.1.0** + **TypeScript 5**
- **AWS CDK 2.170.0** + **ECS Fargate** + **DynamoDB** + **SNS**
- **Tailwind CSS 4** + **Jest 30** + **ESLint 9**

---

## Learn More

Next.js について詳しく学ぶには、以下のリソースをご覧ください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.js の機能と API について学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブな Next.js チュートリアル

[Next.js GitHub repository](https://github.com/vercel/next.js)もチェックしてみてください - フィードバックや貢献を歓迎します！
