# 🌿 Garden Management System - Frontend

A comprehensive, scalable, and production-ready React.js web application for managing garden maintenance, landscaping services, and client relationships.

## 📋 Project Overview

The Garden Management System Frontend is a role-based dashboard application designed for:

- **Administrators**: Manage clients, workers, tasks, inventory, and invoices
- **Workers**: View and complete assigned tasks with photo documentation
- **Clients**: Access task details, photos, and provide feedback
- **Accountants**: Manage invoices and financial data

### Target Users

- Garden maintenance company administrators
- Field workers and technicians
- Clients receiving garden services
- Accounting staff

### Main UI Goals

- Provide intuitive, role-specific interfaces
- Enable efficient task management with visual documentation
- Support multilingual communication (English, Arabic, Bengali)
- Ensure responsive design for desktop and mobile devices
- Maintain high performance with optimized data fetching

## 🛠️ Tech Stack

### Framework

- **React.js** (v19.1.1) with Vite build system
- **React Router DOM** (v7.9.5) for client-side routing
- **Vite** for fast development and optimized production builds

### Styling Solution

- **Tailwind CSS** (v4.1.16) for utility-first styling
- **Tailwind CSS RTL** plugin for right-to-left language support
- Custom primary color palette with green theme

### State Management

- **React Query** (@tanstack/react-query v5.80.1) for server state management
- **Context API** for authentication and language state
- **Local Storage** for persistent authentication

### API Communication

- **Axios** (v1.13.1) for HTTP requests
- Comprehensive request/response interceptors
- Automatic token injection and error handling

### Internationalization

- **i18next** (v25.7.1) with react-i18next
- Language detection and switching
- RTL/LTR direction handling

### Additional Libraries

- **React Hook Form** (v7.66.0) - Form validation and management
- **Recharts** (v3.3.0) - Data visualization and charts
- **Lucide React** (v0.552.0) - Icon library
- **Sonner** (v2.0.7) - Toast notifications
- **Socket.io-client** (v4.8.3) - Real-time updates
- **React PDF** (v10.2.0) - PDF generation and viewing

## 📁 Folder Structure (CRITICAL)

```
frontend/
├── public/                  # Static assets
│   ├── locales/             # Translation files
│   │   ├── en/              # English translations
│   │   ├── ar/              # Arabic translations
│   │   └── bn/              # Bengali translations
│   └── vite.svg             # Vite logo
│
├── src/                    # Main source code
│   ├── assets/              # Static images and assets
│   │
│   ├── components/          # Reusable UI components
│   │   ├── admin/            # Admin-specific components
│   │   │   ├── clients/      # Client management components
│   │   │   ├── employees/    # Employee management components
│   │   │   ├── workers/      # Worker management components
│   │   │   ├── inventory/    # Inventory components
│   │   │   └── modals/       # Admin modals
│   │   ├── finance/          # Finance components (Invoices, etc.)
│   │   └── common/           # Shared components (Button, Modal, etc.)
│   │
│   ├── contexts/            # React context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── LanguageContext.jsx # Language state
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── queries/          # React Query hooks
│   │   │   ├── useAuth.js     # Auth queries
│   │   │   ├── useClients.js  # Client queries
│   │   │   ├── useSites.js    # Site queries
│   │   │   └── ...           # Other query hooks
│   │   └── useWorkers.js     # Worker-specific hooks
│   │
│   ├── layouts/             # Layout components
│   │   ├── DashboardLayout.jsx # Main dashboard layout
│   │   ├── Navbar.jsx        # Navigation bar
│   │   └── Sidebar.jsx       # Side navigation
│   │
│   ├── lib/                 # Library configurations
│   │   └── react-query.js    # React Query configuration
│   │
│   ├── pages/               # Page components (route-based)
│   │   ├── accountant/       # Accountant pages
│   │   ├── admin/            # Admin pages
│   │   ├── client/           # Client pages
│   │   └── worker/           # Worker pages
│   │
│   ├── services/            # API services
│   │   ├── api.js            # Main API client
│   │   └── translationService.js # Translation utilities
│   │
│   ├── utils/               # Utility functions
│   │
│   ├── App.jsx              # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
│
├── .gitignore               # Git ignore rules
├── eslint.config.js          # ESLint configuration
├── package.json              # Project dependencies
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

### Pages vs Components

- **Pages**: Route-specific components that represent full views (e.g., `Dashboard.jsx`, `Clients.jsx`)
- **Components**: Reusable UI elements that can be composed into pages (e.g., `Button.jsx`, `Modal.jsx`)

### Hooks

Custom React hooks for encapsulating logic:
- **Query hooks**: Data fetching using React Query (e.g., `useClients.js`, `useSites.js`)
- **Utility hooks**: Reusable logic (e.g., `useWorkers.js`)

### Services / API Layer

Centralized API client with:
- Base URL configuration
- Request/response interceptors
- Error handling
- API endpoint organization

### Utils / Helpers

Utility functions for common operations:
- Localization helpers
- Data transformation
- Formatting utilities

## 🏗️ Application Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── LanguageProvider
│       └── SocketProvider
│           └── AppRoutes
│               ├── ProtectedRoute
│               │   └── DashboardLayout
│               │       ├── Navbar
│               │       ├── Sidebar
│               │       └── PageContent
│               └── PublicRoutes
└── ToastNotifications
```

### Smart vs Dumb Components

- **Smart Components**: Pages and containers that manage state and logic
- **Dumb Components**: Presentational components that receive props and render UI

### State Flow

1. **Server State**: Managed by React Query with centralized query keys
2. **Authentication State**: Managed by AuthContext with localStorage persistence
3. **Language State**: Managed by LanguageContext with i18next integration
4. **UI State**: Local component state using useState/useReducer

### Data Fetching Strategy

- **React Query**: Primary data fetching library
- **Optimistic Updates**: For mutations where appropriate
- **Stale-While-Revalidate**: Default caching strategy
- **Prefetching**: For improved user experience

### Error & Loading States

- **Global Loading**: Full-screen loading during authentication checks
- **Component Loading**: Local loading states for data fetching
- **Error Boundaries**: Global error handling
- **Fallback UI**: Graceful degradation for failed requests

## 🔐 Authentication Flow

### Login Flow

1. User submits credentials via login form
2. API call to `/auth/login` or `/clients/login`
3. Token and user data stored in localStorage
4. Authentication context updated
5. User redirected to role-specific dashboard

### Token Storage

- **Storage**: localStorage with keys `token` and `user`
- **Persistence**: Maintained across page refreshes
- **Security**: JWT tokens with expiration handling

### Protected Routes

- **ProtectedRoute Component**: Wraps routes requiring authentication
- **Role-Based Access**: Routes restricted by user role
- **Unauthorized Handling**: Redirect to `/unauthorized` for role mismatches

### Logout Handling

1. Clear localStorage (`token` and `user`)
2. Reset authentication context
3. Redirect to login page

## 🌐 API Integration

### Base API Setup

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Interceptors

- **Request Interceptor**: Adds authorization token, logs requests
- **Response Interceptor**: Handles errors, logs responses, manages retries
- **Error Handling**: Automatic 401 handling with logout

### Error Handling

- **Global Error Handling**: In response interceptor
- **Status-Specific Handling**: 401 redirects to login
- **Retry Logic**: Automatic retries for rate-limited requests
- **User Feedback**: Toast notifications for errors

### Pagination Handling

- **Query Parameters**: Standard `page` and `limit` parameters
- **Response Structure**: Consistent pagination metadata
- **UI Components**: Reusable Pagination component

### Caching Strategy

- **React Query Cache**: 5-minute stale time, 10-minute cache time
- **Query Keys**: Centralized in `src/lib/react-query.js`
- **Cache Invalidation**: Automatic on mutations

## 🎨 UI & UX Guidelines

### Reusable Components

- **Button**: Customizable button component
- **Modal**: Reusable modal dialog
- **Table**: Data table with sorting and pagination
- **Card**: Information display cards
- **Form Inputs**: Consistent form controls

### Form Handling

- **React Hook Form**: For form validation and management
- **Validation**: Built-in validation rules
- **Error Display**: Consistent error message presentation

### Validation Strategy

- **Client-Side**: React Hook Form validation
- **Server-Side**: API validation with error feedback
- **Real-Time**: Immediate feedback on user input

### Accessibility Considerations

- **Semantic HTML**: Proper use of HTML elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA attributes where needed
- **Color Contrast**: WCAG-compliant color schemes
- **RTL Support**: Full right-to-left language support

## ⚡ Performance Optimization

### Memoization

- **React.memo**: For preventing unnecessary re-renders
- **useMemo**: For expensive calculations
- **useCallback**: For stable function references

### Lazy Loading

- **React.lazy**: For code-splitting components
- **Suspense**: For loading fallbacks
- **Dynamic Imports**: For large dependencies

### Code Splitting

- **Route-Based**: Split code by route
- **Component-Based**: Split large components
- **Vendor Splitting**: Separate vendor libraries

### React Query Optimizations

- **Stale-While-Revalidate**: Default caching strategy
- **Prefetching**: Load data before navigation
- **Optimistic Updates**: Immediate UI updates
- **Background Updates**: Silent data refresh

## 🔧 Environment Variables

### Required Frontend Env Vars

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Usage Explanation

- **VITE_API_BASE_URL**: Base URL for API requests
- **Prefix**: `VITE_` required for Vite environment variables
- **Access**: `import.meta.env.VITE_API_BASE_URL`

## 🚀 Running the Project

### Installation

```bash
# Navigate to project directory
cd frontend

# Install dependencies
npm install
```

### Development Mode

```bash
# Start development server
npm run dev

# Access application at http://localhost:5173
```

### Build

```bash
# Create production build
npm run build

# Build output in dist/ directory
```

### Deployment Notes

- **Static Hosting**: Deploy `dist/` directory contents
- **Environment**: Set `VITE_API_BASE_URL` to production API
- **Caching**: Configure appropriate cache headers
- **CDN**: Consider CDN for static assets

## ❌ Error Handling Strategy

### Global Error Boundaries

- **React Error Boundary**: Catches component errors
- **Fallback UI**: User-friendly error messages
- **Error Reporting**: Log errors to console

### API Errors

- **Interceptor Handling**: Centralized error processing
- **Status Codes**: Specific handling for different codes
- **User Feedback**: Toast notifications for errors

### UI Fallback States

- **Loading States**: Skeleton loaders and spinners
- **Error States**: Clear error messages with retry options
- **Empty States**: Helpful messages for empty data

## 🎨 Styling & Theming

### Tailwind Structure

- **Utility Classes**: Primary styling approach
- **Custom Colors**: Extended color palette
- **Responsive Design**: Mobile-first breakpoints

### Global Styles

- **Base Styles**: In `src/index.css`
- **Reset**: Normalize.css included via Tailwind
- **Typography**: System font stack

### Responsive Breakpoints

```javascript
// tailwind.config.js
theme: {
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
  }
}
```

## 🔮 Future Development Guide (VERY IMPORTANT)

### How to Add a New Page

1. **Create Page Component**: Add new file in appropriate `pages/` subdirectory
2. **Add Route**: Update `App.jsx` with new route definition
3. **Add Navigation**: Update Sidebar/Navbar if needed
4. **Add Query Hook**: Create new query hook if data fetching required
5. **Add Translations**: Update translation files for new text

### How to Add a New API Integration

1. **Extend API Service**: Add new methods to `src/services/api.js`
2. **Create Query Hook**: Add new query/mutation in `src/hooks/queries/`
3. **Update Query Keys**: Add new keys to `src/lib/react-query.js`
4. **Use in Component**: Import and use the new hook

### How to Add a New Reusable Component

1. **Create Component**: Add new file in `src/components/common/`
2. **Define Props**: Use TypeScript or PropTypes for documentation
3. **Add Story**: Create Storybook story if available
4. **Document Usage**: Add comments and examples

### How to Keep Performance High

1. **Code Splitting**: Use dynamic imports for large components
2. **Memoization**: Use React.memo and useMemo appropriately
3. **Query Optimization**: Use React Query effectively
4. **Bundle Analysis**: Monitor bundle size
5. **Image Optimization**: Use modern formats and compression

## ✅ Best Practices

### Naming Conventions

- **Components**: PascalCase (e.g., `Button.jsx`, `UserProfile.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.js`, `useClients.js`)
- **Variables**: camelCase (e.g., `userData`, `isLoading`)
- **Constants**: UPPER_CASE (e.g., `API_BASE_URL`)

### Folder Rules

- **Single Responsibility**: Each folder/component should have one clear purpose
- **Colocation**: Keep related files together (components, hooks, styles)
- **Flat Structure**: Avoid deep nesting where possible
- **Consistent Naming**: Follow established patterns

### Clean Code Rules

- **Small Functions**: Keep functions focused and short
- **Descriptive Names**: Use meaningful variable and function names
- **Consistent Formatting**: Follow ESLint rules
- **Comments**: Document complex logic and decisions
- **Error Handling**: Always handle errors gracefully
- **Type Safety**: Consider adding TypeScript for large-scale projects

## 📚 Additional Documentation

- **Project Summary**: See `PROJECT_SUMMARY.md`
- **Quick Start**: See `QUICK_START.md`
- **Test Instructions**: See `TEST_INSTRUCTIONS.md`

## 🤝 Contributing

1. **Fork Repository**: Create your own fork
2. **Create Branch**: Use descriptive branch names
3. **Make Changes**: Follow best practices
4. **Test Thoroughly**: Ensure no regressions
5. **Submit PR**: With clear description of changes

## 📝 License

This project is proprietary software. All rights reserved.

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using React.js, Tailwind CSS, and modern web technologies**