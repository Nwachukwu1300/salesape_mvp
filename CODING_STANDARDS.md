# Coding Standards

This document outlines the coding standards and best practices for the SalesApe MVP project.

## Code Formatting

- **Prettier** configuration is in `.prettierrc` - run `npm run lint` to format code
- **EditorConfig** settings are in `.editorconfig` for IDE compatibility
- All source files must use:
  - 2 spaces for indentation
  - Unix line endings (LF)
  - Trailing newline at end of files

## TypeScript/JavaScript

### Imports Organization

```typescript
// 1. External dependencies
import { useState } from "react";
import { Loader } from "lucide-react";

// 2. Internal components/utilities
import { Button } from "./components/Button";
import { useCustomHook } from "./hooks/useCustomHook";

// 3. Types
import type { CustomType } from "./types";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePageTitle`)
- **Functions**: camelCase (e.g., `fetchUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (e.g., `UserData`)

### React Best Practices

- Use functional components with hooks
- Lazy load non-critical routes with `lazy()` and `Suspense`
- Extract loading fallbacks into reusable components
- Keep components small and focused
- Use proper JSDoc comments for reusable components

Example:
```typescript
/**
 * Loading fallback component for lazy-loaded routes
 */
const LoadingFallback = () => (
  <div className="p-6 flex items-center justify-center">
    <Loader className="w-8 h-8 animate-spin" />
  </div>
);
```

## File Organization

```
src/
├── components/         # Reusable UI components
├── contexts/          # React Context providers
├── hooks/             # Custom React hooks
├── layouts/           # Layout components
├── lib/               # Utility libraries
├── screens/           # Page/screen components
├── services/          # API/service functions
├── templates/         # Content templates
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── App.tsx            # Root component
```

## Comments and Documentation

- Use JSDoc for public functions and components
- Keep comments concise and relevant
- Update comments when code changes
- Remove commented-out code - use git history instead

## Error Handling

- Always handle errors gracefully
- Use Error Boundary for React components
- Provide meaningful error messages to users
- Log errors for debugging (production-safe)

## Testing

- Write unit tests for utilities and services
- Write integration tests for critical flows
- Aim for >80% code coverage
- Test error cases, not just happy paths

## Dependencies

- Minimize external dependencies
- Keep dependencies up to date
- Document why a dependency is needed
- Review dependency sizes (use `npm ls` for audits)

## Performance

- Lazy load non-critical components
- Memoize expensive computations
- Use React DevTools Profiler to identify bottlenecks
- Avoid unnecessary re-renders
- Optimize images and assets

## Code Review Checklist

- [ ] Code follows formatting standards
- [ ] Types are properly defined
- [ ] No console.logs in production code
- [ ] Error handling is in place
- [ ] Components are reusable/composable
- [ ] Comments are clear and helpful
- [ ] No unused imports or variables
- [ ] Tests are passing (if applicable)

## Git Commit Messages

Use conventional commits:
```
feat: add new feature
fix: fix a bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add/update tests
chore: dependency updates
```

Example: `feat: add lazy loading to dashboard routes`

## Backend Standards

For Node.js/Express backend:
- Use TypeScript with strict mode
- Organize routes, middleware, and services separately
- Handle errors with try-catch and error middleware
- Validate input on API routes
- Use environment variables for configuration
- Document API endpoints with comments
