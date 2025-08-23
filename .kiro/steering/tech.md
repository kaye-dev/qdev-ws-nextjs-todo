# Technology Stack

## Framework & Runtime

- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript 5** - Type-safe JavaScript with strict mode enabled
- **Node.js** - Runtime environment

## Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Dark/Light mode** - Built-in theme switching
- **Responsive design** - Mobile-first approach

## Testing

- **Jest 30** - Testing framework
- **Testing Library** - React component testing utilities
- **jsdom** - DOM environment for tests
- **Coverage reporting** - Built-in coverage collection

## Development Tools

- **ESLint 9** - Code linting with Next.js config
- **Turbopack** - Fast bundler for development
- **TypeScript strict mode** - Enhanced type checking

## Common Commands

### Development

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
```

### Testing

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Code Quality

```bash
npm run lint         # Run ESLint
```

## Path Aliases

- `@/*` maps to `./src/*` for clean imports

## Build Configuration

- Incremental TypeScript compilation enabled
- ES2017 target for broad browser support
- Module bundler resolution for modern imports
