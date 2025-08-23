# 技術スタック

## フレームワーク & ランタイム

- **Next.js 15.4.6** - App Routerを使用したReactフレームワーク
- **React 19.1.0** - UIライブラリ
- **TypeScript 5** - 型安全なJavaScript
- **Node.js** - ランタイム環境

## スタイリング & UI

- **Tailwind CSS 4** - ユーティリティファーストCSSフレームワーク
- **PostCSS** - CSS処理
- **Geist Font** - `next/font`経由でのVercelの最適化フォントファミリー

## テスト

- **Jest 30** - テストフレームワーク
- **@testing-library/react** - Reactコンポーネントテストユーティリティ
- **@testing-library/jest-dom** - カスタムJestマッチャー
- **@testing-library/user-event** - ユーザーインタラクションシミュレーション
- **jsdom** - テスト用DOM環境

## 開発ツール

- **ESLint 9** - Next.js設定でのコードリンティング
- **TypeScript** - 静的型チェック
- **Turbopack** - 開発用高速バンドラー

## 共通コマンド

### 開発

```bash
npm run dev          # Turbopackで開発サーバー起動
npm run build        # 本番用ビルド
npm start           # 本番サーバー起動
npm run lint        # ESLint実行
```

### テスト

```bash
npm test            # テスト一回実行
npm run test:watch  # ウォッチモードでテスト実行
npm run test:coverage # カバレッジレポート付きテスト実行
```

### パッケージ管理

```bash
npm install         # 依存関係インストール
npm ci             # ロックファイルからクリーンインストール
```

## 設定ファイル

- `next.config.ts` - Next.js設定
- `tsconfig.json` - パスマッピング付きTypeScript設定（`@/*` → `./src/*`）
- `jest.config.js` - Jestテスト設定
- `jest.setup.js` - モック付きテスト環境セットアップ
- `eslint.config.mjs` - ESLint設定
- `postcss.config.mjs` - PostCSS設定
