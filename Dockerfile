# ベースイメージ
FROM node:20-alpine

# ヘルスチェック用のcurlをインストール
RUN apk add --no-cache curl

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係をコピーしてインストール
COPY package.json package-lock.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# ポートを公開
EXPOSE 3000

# ヘルスチェック設定
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# アプリケーションを起動
CMD ["npm", "start"]
