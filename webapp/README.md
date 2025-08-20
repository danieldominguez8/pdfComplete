# PDF Complete - Frontend

This is the frontend React application for PDF Complete, a web-based PDF form filling tool.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Vitest** for testing
- **ESLint + Prettier** for code quality

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (with --max-warnings=0)
- `npm run typecheck` - Run TypeScript compiler without emitting files
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests with Vitest

## Architecture

### State Management

The app uses Zustand for state management with two main stores:

- **useFormStore**: Manages PDF selection, form fields, and form data
- **useUiStore**: Manages UI state like filters and display options

### API Integration

The frontend communicates with a backend API through a typed API client (`src/api/api.ts`) that handles:
- PDF listing and selection
- Form field schema retrieval
- Field combination and deduplication
- PDF form filling

### Key Features

- **Multi-PDF Selection**: Users can select multiple PDF forms
- **Field Deduplication**: Automatically merges similar fields across PDFs
- **Smart Caching**: Caches combined field results to avoid redundant API calls
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Dark/light mode toggle

## Component Structure

```
src/
├── components/
│   ├── LibraryList.tsx     # PDF selection interface
│   └── ui/                 # Reusable UI components
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
├── stores/
│   ├── useFormStore.ts     # Main application state
│   └── useUiStore.ts       # UI state
├── api/
│   └── api.ts              # API client
├── types/
│   └── api.ts              # TypeScript type definitions
├── lib/
│   └── dedupeFields.ts     # Field deduplication logic
└── App.tsx                 # Main app component
```

## Styling

The app uses Tailwind CSS with a custom design system defined in `tailwind.config.cjs`. The design system includes:

- CSS custom properties for theming
- Dark/light mode support
- Consistent spacing and typography
- Accessible color contrasts

## Testing

Tests are written using Vitest and located alongside source files:

- `src/stores/useFormStore.test.ts` - Store logic tests
- `src/lib/dedupeFields.test.ts` - Field deduplication tests

Run tests with:
```bash
npm run test
```

## API Environment Configuration

The frontend can be configured to use different API backends:

- **Development**: Defaults to `/api` (expecting a local backend)
- **Production**: Set `VITE_API_BASE` environment variable

Example:
```bash
VITE_API_BASE=https://api.example.com npm run build
```

## ESLint Configuration

The project uses TypeScript ESLint with strict rules. For production applications, consider enabling type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      // Or for stricter rules:
      ...tseslint.configs.strictTypeChecked,
      // Optionally add stylistic rules:
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## Additional React Plugins

You can enhance the ESLint configuration with React-specific rules:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
  },
])
```

## Contributing

1. Follow the existing code style
2. Run `npm run lint` and `npm run typecheck` before committing
3. Add tests for new functionality
4. Update this README if adding new features or changing the architecture

## Browser Support

The app targets modern browsers as defined in `package.json`:

- **Production**: `>0.2%, not dead, not op_mini all`
- **Development**: Latest Chrome, Firefox, and Safari

## Build Output

The production build creates optimized assets in the `dist/` directory:
- Minified JavaScript and CSS
- Static assets with cache-friendly filenames
- Type-checked TypeScript compilation
```
