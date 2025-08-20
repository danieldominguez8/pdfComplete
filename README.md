# PDF Complete

A modern web application for filling out and managing PDF forms with intelligent field detection and merging capabilities.

## Overview

PDF Complete is a full-stack application that allows users to:
- Upload and manage multiple PDF forms
- Automatically detect and merge form fields across multiple PDFs
- Fill out combined forms with a unified interface
- Generate completed PDF documents
- Handle various field types (text, number, checkbox, radio, date)

## Features

- **Multi-PDF Field Detection**: Automatically detects and combines form fields from multiple PDF documents
- **Intelligent Field Deduplication**: Merges similar fields (case-insensitive) while preserving options and requirements
- **Modern React Frontend**: Built with React 19, TypeScript, and Tailwind CSS
- **State Management**: Uses Zustand for efficient state management
- **Dark/Light Theme**: Built-in theme toggle support
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type Safety**: Full TypeScript support throughout the application

## Architecture

The application consists of:

### Frontend (`/webapp`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **UI Components**: Custom components with Radix UI primitives
- **Testing**: Vitest with jsdom
- **Linting**: ESLint with TypeScript rules

### Backend API
The frontend communicates with a backend API that provides:
- PDF file management (`/api/pdfs`)
- Form field schema extraction (`/api/fields_schema`)
- Combined field analysis (`/api/combined_fields`)
- PDF form filling (`/api/fill`)
- Administrative functions (`/api/admin/regenerate`)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/danieldominguez8/pdfComplete.git
cd pdfComplete
```

2. Install frontend dependencies:
```bash
cd webapp
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
cd webapp
npm run build
npm run preview
```

## Development

### Frontend Development

The frontend is located in the `/webapp` directory and includes:

#### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

#### Project Structure
```
webapp/
├── src/
│   ├── api/           # API client and types
│   ├── components/    # React components
│   │   ├── ui/        # Reusable UI components
│   │   └── ...        # Feature components
│   ├── lib/           # Utility functions
│   ├── stores/        # Zustand stores
│   ├── types/         # TypeScript type definitions
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── ...               # Configuration files
```

#### Key Components
- **LibraryList**: PDF selection and management interface
- **FormStore**: Global state management for PDF and form data
- **API Client**: Type-safe API communication layer

### Code Quality

The project maintains high code quality standards with:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Vitest for unit testing
- Comprehensive test coverage for critical functionality

## API Reference

### Endpoints

#### GET `/api/pdfs`
Returns a list of available PDF files.

**Response**: `string[]`

#### GET `/api/fields_schema`  
Returns the current schema metadata.

**Response**: `SchemaMeta`

#### POST `/api/combined_fields`
Analyzes and returns combined fields from selected PDFs.

**Request Body**: 
```json
{
  "pdfs": ["form1.pdf", "form2.pdf"]
}
```

**Response**: `CombinedFieldsResponse`

#### POST `/api/fill`
Fills a PDF form with provided field values.

**Request Body**:
```json
{
  "pdf_filename": "form.pdf",
  "field_values": { "name": "John", "age": 30 },
  "download_name": "completed_form.pdf"
}
```

**Response**: PDF blob

#### POST `/api/admin/regenerate`
Administrative endpoint to regenerate schema (requires admin key).

## Field Types

The application supports various PDF form field types:

- **text**: Text input fields
- **number**: Numeric input fields  
- **checkbox**: Boolean checkbox fields
- **radio**: Single-selection radio buttons
- **date**: Date input fields

Each field can have:
- `name`: Field identifier
- `kind`: Field type
- `required`: Whether the field is mandatory
- `options`: Available options (for select/radio fields)
- `occurrences`: Count of field appearances across PDFs

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Write TypeScript with strict type checking
- Include tests for new functionality
- Follow the existing code style (use `npm run format`)
- Ensure all linting passes (`npm run lint`)
- Update documentation for significant changes

## Environment Variables

The frontend supports the following environment variables:

- `VITE_API_BASE`: Base URL for the API (defaults to `/api`)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub.