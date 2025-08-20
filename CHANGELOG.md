# Changelog

All notable changes to the PDF Complete project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive project documentation
  - Main README.md with project overview and setup instructions
  - API.md with detailed API endpoint documentation
  - CONTRIBUTING.md with development guidelines
  - DEPLOYMENT.md with deployment instructions
- Updated webapp README.md with frontend-specific information
- Updated HTML title to be more descriptive

### Changed
- Enhanced documentation structure for better project onboarding

## [Previous Releases]

### Features Implemented
- React 19 frontend with TypeScript
- PDF selection and management interface
- Multi-PDF field detection and merging
- Intelligent field deduplication with case-insensitive matching
- Form field caching to optimize API calls
- Dark/light theme support
- Responsive design with Tailwind CSS
- State management with Zustand
- Comprehensive testing with Vitest
- Type-safe API client
- ESLint and Prettier configuration
- Field type support (text, number, checkbox, radio, date)
- Field occurrence tracking across multiple PDFs
- Options merging for select/radio fields

### Technical Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- State Management: Zustand
- Testing: Vitest with jsdom
- Code Quality: ESLint, Prettier
- UI Components: Custom components with Radix UI primitives