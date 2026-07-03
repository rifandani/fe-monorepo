# @workspace/expo

## 1.1.0

### Minor Changes

- #### 🚀 Features

  **UI Library Upgrade to IntentUI v3**

  - Complete migration from JustD to IntentUI v3 for both SPA and Web apps
  - Updated 80+ UI components with improved design system
  - Added new chart components: `area-chart`, `bar-chart`, `bar-list`, `line-chart`, `pie-chart`
  - Enhanced components: `avatar`, `button`, `calendar`, `checkbox`, `dialog`, `sidebar`, and more
  - Replaced `@intentui/icons` with Iconify for better icon management

  **Observability & Telemetry**

  - Added comprehensive telemetry using `@vercel/otel` for Web app
  - Implemented OpenTelemetry instrumentation for SPA app
  - Enhanced error tracking and performance monitoring
  - Added server-side telemetry with structured logging

  #### 🛠️ Infrastructure & DevOps

  **Build System & Dependencies**

  - Upgraded Bun to v1.2.19 with isolated linker configuration
  - Updated GitHub Actions workflow with `oven-sh/setup-bun`
  - Added Sherif for dependency management
  - Removed React Query from core package (moved to app-specific implementations)

  **Code Quality & Linting**

  - Enhanced ESLint configuration with Tailwind CSS plugins
  - Added support for both SPA and Web apps in linting rules
  - Improved import ordering and removed duplicates across codebase
  - Added comprehensive Tailwind CSS class name validation

  #### 📱 Mobile (Expo)

  - Added `@react-navigation/native` dependency
  - Updated `react-hook-form` to v7.59.0
  - Fixed TypeScript compilation issues

  #### 🌐 Web Applications

  **Configuration & Environment**

  - Increased server timeout to 5 minutes for both SPA and Web
  - Enhanced environment variable documentation
  - Simplified OpenTelemetry configuration
  - Added comprehensive README updates

  **Performance & UX**

  - Improved component performance with better memoization
  - Enhanced accessibility with React Aria Components
  - Added "use client" directives for proper client-side rendering

  #### 🐛 Bug Fixes

  - Fixed TypeScript compilation errors across all apps
  - Resolved import issues in slider UI components
  - Fixed linting violations across 91 files
  - Corrected color picker and date picker component behaviors

  #### 📦 Dependencies Updates

  - Major dependency bumps across all packages
  - Removed `@swc/core` from trusted dependencies
  - Updated build tools and development dependencies
  - Enhanced security with updated packages

  #### 🔧 Developer Experience

  - Moved Docker configuration to dedicated folder
  - Enhanced documentation with environment variable tutorials
  - Improved development setup instructions
  - Better error boundaries and debugging tools

### Patch Changes

- Updated dependencies
  - @workspace/core@1.1.0

## 1.0.0

### Major Changes

- First release using changeset

### Patch Changes

- Updated dependencies
  - @workspace/core@1.0.0
