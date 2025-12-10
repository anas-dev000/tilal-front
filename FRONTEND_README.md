# 🌿 Garden Management System - Frontend

A responsive, multilingual React.js web application for managing garden maintenance and landscaping services.

## 🚀 Features

- **Multilingual Support**: Arabic (RTL), English (LTR), Bengali (LTR)
- **Role-Based Dashboards**: Admin, Worker, and Client interfaces
- **Responsive Design**: Built with TailwindCSS
- **Modern UI Components**: Reusable components for tables, forms, modals, charts
- **API Integration Ready**: Axios service layer configured
- **Authentication**: JWT-based authentication with protected routes

## 📋 Tech Stack

- **React.js** (Vite)
- **TailwindCSS** - Styling
- **React Router DOM** - Routing
- **Axios** - API calls
- **i18next** - Internationalization
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 🛠️ Installation & Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🌐 Routes

### Public Routes
- `/login` - Login page for Admin and Workers
- `/client/:token` - Client portal (JWT token-based access)

### Admin Routes (Protected)
- `/admin` - Admin dashboard with statistics and charts
- `/admin/clients` - Client management
- `/admin/workers` - Worker management
- `/admin/tasks` - Task management with photo viewing
- `/admin/invoices` - Invoice center with PDF download
- `/admin/inventory` - Inventory management with low stock alerts

### Worker Routes (Protected)
- `/worker` - Worker dashboard
- `/worker/tasks` - My tasks list with filters
- `/worker/tasks/:id` - Task details with photo upload

## 👥 User Roles

### Admin
- View dashboard with statistics and charts
- Manage clients, workers, tasks, invoices, inventory
- Create and assign tasks
- View before/after photos
- Download invoices

### Worker
- View assigned tasks
- Start and finish tasks
- Upload before/after photos (camera support)
- Confirm materials received
- View AI quality scores

### Client
- View task details (via JWT link)
- See before/after photos
- Download invoices
- Submit feedback and ratings

## 🌍 Language Support

- **English (en)** - Default, LTR
- **Arabic (ar)** - RTL support
- **Bengali (bn)** - LTR

Language switcher available in header.

## 🔐 Authentication

Demo Credentials:
- **Admin**: admin@garden.com / admin123
- **Worker**: worker@garden.com / worker123

## 📊 Current Status

✅ **Completed Features:**
- Full project structure setup
- Multilingual support (3 languages)
- All admin pages (Dashboard, Clients, Workers, Tasks, Invoices, Inventory)
- All worker pages (Login, My Tasks, Task Details)
- Client portal page
- Reusable UI components
- Routing with protected routes
- Context API for state management
- API service layer ready
- Responsive design with TailwindCSS

📝 **Using Mock Data:**
Currently using mock data for demonstration. To integrate with backend:
1. Update `VITE_API_BASE_URL` in `.env`
2. Replace mock data with API calls using `src/services/api.js`

## 🚀 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser at `http://localhost:5173`

3. Login with demo credentials

## 📁 Key Files

- `src/App.jsx` - Main app with routing
- `src/i18n/index.js` - i18next configuration
- `src/services/api.js` - API service layer
- `src/contexts/AuthContext.jsx` - Authentication context
- `src/contexts/LanguageContext.jsx` - Language context
- `public/locales/` - Translation files

---

**Built with ❤️ using React.js and TailwindCSS**

