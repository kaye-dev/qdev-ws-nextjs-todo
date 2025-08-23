# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page component
│   └── globals.css        # Global styles and CSS variables
├── components/            # Reusable React components
│   ├── TodoApp.tsx        # Main application container
│   ├── TodoForm.tsx       # Task input form
│   ├── TodoList.tsx       # Task list container
│   ├── TodoItem.tsx       # Individual task component
│   ├── EmptyState.tsx     # Empty state display
│   └── __tests__/         # Component tests
├── types/                 # TypeScript type definitions
│   ├── index.ts           # Re-exports
│   └── todo.ts            # Todo-related types and interfaces
└── utils/                 # Utility functions
    ├── index.ts           # Re-exports
    ├── storage.ts         # localStorage operations
    ├── uuid.ts            # UUID generation
    ├── validation.ts      # Input validation
    └── __tests__/         # Utility tests
```

## Architecture Patterns

### Component Hierarchy

- **TodoApp** - Root container managing state and business logic
- **TodoForm** - Handles task creation with validation
- **TodoList** - Renders task collection with empty states
- **TodoItem** - Individual task with toggle/delete actions
- **EmptyState** - User-friendly empty list display

### State Management

- React useState for local component state
- Props drilling for data flow (no external state library)
- localStorage for persistence via utility functions

### Data Flow

1. User interactions trigger handlers in TodoApp
2. State updates flow down via props
3. Side effects (storage) handled in useEffect hooks
4. Validation occurs before state mutations

## File Naming Conventions

- **Components**: PascalCase (e.g., `TodoApp.tsx`)
- **Utilities**: camelCase (e.g., `storage.ts`)
- **Types**: camelCase files, PascalCase interfaces
- **Tests**: `ComponentName.test.tsx` in `__tests__` folders

## Import Patterns

- Use `@/` alias for src imports
- Group imports: external libraries, internal modules, types
- Default exports for components, named exports for utilities
- Re-export from index files for clean imports

## Testing Structure

- Co-located `__tests__` folders
- One test file per component/utility
- Comprehensive coverage for business logic
- Integration tests for component interactions
