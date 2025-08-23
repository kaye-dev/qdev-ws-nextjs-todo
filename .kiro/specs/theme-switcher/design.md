# Design Document

## Overview

テーマ切り替え機能は、ユーザーが手動でダークモードとライトモードを切り替えられる機能です。現在のアプリは既にTailwind CSSの`dark:`クラスとCSS変数を使用したテーマ対応が実装されており、`prefers-color-scheme`による自動切り替えも動作しています。この設計では、既存のテーマシステムを活用しながら、ユーザーが明示的にテーマを選択できる機能を追加します。

## Architecture

### Component Architecture

```
App Layout (layout.tsx)
├── TodoApp (main content)
└── ThemeToggle (fixed position component)
    ├── ThemeProvider (context provider)
    └── ThemeButton (toggle button)
```

### State Management

- **Theme Context**: React Contextを使用してアプリ全体のテーマ状態を管理
- **Local Storage**: ユーザーの選択したテーマを永続化
- **HTML Class**: `html`要素の`class`属性を動的に変更してテーマを適用

### Theme States

1. **'light'** - ライトモード
2. **'dark'** - ダークモード  
3. **'system'** - システム設定に従う（初期状態）

## Components and Interfaces

### 1. ThemeProvider Component

**責任**: アプリ全体のテーマ状態管理とコンテキスト提供

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark'; // 実際に適用されているテーマ
}
```

**機能**:

- テーマ状態の管理
- localStorage からの初期値読み込み
- システムテーマの検出
- HTML要素へのクラス適用

### 2. ThemeToggle Component

**責任**: 画面右下に固定されたテーマ切り替えボタンの表示

**Props**: なし（Context経由でテーマ状態を取得）

**機能**:

- 現在のテーマに応じたアイコン表示
- クリック時のテーマ切り替え
- アクセシビリティ対応
- ホバー・フォーカス効果

### 3. useTheme Hook

**責任**: テーマ関連の状態とアクションへの簡単なアクセス

```typescript
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## Data Models

### Theme Configuration

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}
```

### Storage Schema

```typescript
// localStorage key: 'theme-preference'
type StoredTheme = 'light' | 'dark' | 'system';
```

## Error Handling

### localStorage Errors

- **読み込みエラー**: システムテーマにフォールバック
- **書き込みエラー**: コンソールに警告を出力、機能は継続

### Context Errors

- **Provider外での使用**: 開発時にエラーを投げる
- **初期化失敗**: システムテーマにフォールバック

### System Theme Detection Errors

- **matchMedia未対応**: ライトテーマにフォールバック
- **イベントリスナー失敗**: 静的な検出のみ実行

## Testing Strategy

### Unit Tests

1. **ThemeProvider**
   - 初期テーマの設定
   - テーマ変更の動作
   - localStorage との同期
   - システムテーマの検出

2. **ThemeToggle**
   - アイコンの表示切り替え
   - クリックイベントの処理
   - アクセシビリティ属性
   - キーボード操作

3. **useTheme Hook**
   - Context値の取得
   - エラーハンドリング

### Integration Tests

1. **Theme Application**
   - HTML要素へのクラス適用
   - CSS変数の更新
   - 既存コンポーネントとの連携

2. **Persistence**
   - ページリロード時の状態復元
   - localStorage との同期

### Accessibility Tests

1. **Keyboard Navigation**
   - Tab順序の確認
   - Enter/Space キーでの操作

2. **Screen Reader**
   - ARIA属性の適切な設定
   - 状態変更の通知

## Implementation Details

### CSS Integration

既存のTailwind CSS `dark:` クラスシステムを活用:

```css
/* globals.css - 既存の実装を拡張 */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

:root.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}

/* prefers-color-scheme は system テーマ時のみ適用 */
:root.system {
  @media (prefers-color-scheme: dark) {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Theme Detection Logic

```typescript
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme === 'system') return getSystemTheme();
  return theme;
};
```

### Fixed Positioning Strategy

```css
.theme-toggle {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
  
  /* Mobile optimization */
  @media (max-width: 640px) {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}
```

### Animation and Transitions

- **Theme Transition**: 0.3秒のスムーズな色変更
- **Button Hover**: スケール変化とシャドウ効果
- **Icon Transition**: フェードイン・アウト効果
- **Reduced Motion**: `prefers-reduced-motion` 対応

### Performance Considerations

1. **Lazy Loading**: ThemeToggle コンポーネントの遅延読み込み
2. **Memoization**: Context値の不要な再計算を防止
3. **Event Listener**: システムテーマ変更の効率的な検出
4. **CSS Optimization**: 既存のTailwindクラスを最大限活用

### Browser Compatibility

- **Modern Browsers**: Full support (Chrome 76+, Firefox 67+, Safari 12.1+)
- **Legacy Support**: Graceful degradation (ライトテーマ固定)
- **SSR Compatibility**: サーバーサイドレンダリング対応
