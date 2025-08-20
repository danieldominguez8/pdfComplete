# Contributing to PDF Complete

Thank you for your interest in contributing to PDF Complete! This guide will help you get started with development and submitting contributions.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pdfComplete.git
   cd pdfComplete
   ```

3. Install dependencies:
   ```bash
   cd webapp
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` in your browser

### Development Workflow

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards below

3. Test your changes:
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

4. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request on GitHub

## Coding Standards

### TypeScript

- Use strict TypeScript with proper type annotations
- Avoid `any` types - use proper type definitions
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names

**Good:**
```typescript
interface UserForm {
  name: string;
  age: number;
  email: string;
}

function validateUserForm(form: UserForm): boolean {
  return form.name.length > 0 && form.age > 0;
}
```

**Avoid:**
```typescript
function validate(data: any): any {
  return data.name && data.age;
}
```

### React Components

- Use functional components with hooks
- Prefer named exports over default exports for components
- Use TypeScript for all props and state
- Follow the single responsibility principle

**Component Structure:**
```typescript
interface ComponentProps {
  title: string;
  onAction: (value: string) => void;
}

export function MyComponent({ title, onAction }: ComponentProps) {
  const [state, setState] = useState<string>('');
  
  // Component logic here
  
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

### Styling

- Use Tailwind CSS classes for styling
- Follow the existing design system patterns
- Prefer utility classes over custom CSS
- Use semantic HTML elements

### State Management

- Use Zustand stores for global state
- Keep local state in components when appropriate
- Follow existing store patterns
- Document complex state logic

### Testing

- Write tests for new functionality
- Use Vitest and React Testing Library
- Test user interactions, not implementation details
- Aim for good test coverage of critical paths

**Test Example:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useFormStore } from './useFormStore';

describe('useFormStore', () => {
  beforeEach(() => {
    useFormStore.getState().reset();
  });

  it('should update field values correctly', () => {
    const { updateFieldValue } = useFormStore.getState();
    
    updateFieldValue('name', 'John Doe');
    
    expect(useFormStore.getState().fieldValues.name).toBe('John Doe');
  });
});
```

## Code Quality Tools

### ESLint

Run the linter to check for code quality issues:
```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint -- --fix
```

### Prettier

Format your code:
```bash
npm run format
```

### TypeScript

Check for type errors:
```bash
npm run typecheck
```

## Project Structure

When adding new files, follow the existing structure:

```
webapp/src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── stores/             # Zustand stores
├── api/                # API client code
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── ...
```

### Adding New Components

1. Create components in the appropriate directory
2. Use TypeScript for all props and state
3. Include tests if the component has complex logic
4. Update exports in relevant index files

### Adding New API Endpoints

1. Add type definitions to `src/types/api.ts`
2. Implement client functions in `src/api/api.ts`
3. Add tests for the API functions
4. Update API documentation

### Adding New Utilities

1. Create utilities in `src/lib/`
2. Include comprehensive tests
3. Use proper TypeScript types
4. Document complex logic

## Pull Request Guidelines

### Before Submitting

- [ ] All tests pass (`npm run test`)
- [ ] Code lints without errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Code is formatted (`npm run format`)
- [ ] You've added tests for new functionality
- [ ] Documentation is updated if needed

### PR Title and Description

Use descriptive titles and include:

- **What** you changed
- **Why** you made the change
- **How** to test the change

**Example:**
```
Add PDF field validation to prevent empty submissions

- Validates required fields before form submission
- Shows error messages for invalid fields
- Prevents API calls with incomplete data

To test: Try submitting a form with empty required fields
```

### Review Process

1. Automated checks must pass (linting, tests, type checking)
2. Code review by maintainers
3. Address feedback and update PR
4. Merge when approved

## Issues and Bug Reports

### Reporting Bugs

When reporting bugs, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment details
- Console errors (if any)

### Feature Requests

For new features, provide:

- Use case description
- Proposed solution
- Alternative approaches considered
- Mockups or wireframes (if applicable)

## Development Tips

### VS Code Setup

Recommended VS Code extensions:

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag

### Debugging

- Use browser dev tools for frontend debugging
- Use `console.log` sparingly - prefer debugger statements
- Check network tab for API issues
- Use React DevTools for component debugging

### Performance

- Monitor bundle size when adding dependencies
- Use lazy loading for large components
- Optimize API calls and caching
- Follow React performance best practices

## Questions?

If you have questions:

1. Check existing issues and documentation
2. Ask in GitHub Discussions
3. Open an issue with the "question" label

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow GitHub's community guidelines

Thank you for contributing to PDF Complete! 🎉