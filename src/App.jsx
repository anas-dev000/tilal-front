import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Loading from "./components/common/Loading";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Clients from "./pages/admin/Clients";
import Workers from "./pages/admin/Workers";
import WorkerDetails from "./pages/admin/WorkerDetails";
import Tasks from "./pages/admin/Tasks";
import Inventory from "./pages/admin/Inventory";
import AdminTaskDetail from "./pages/admin/AdminTaskDetail";
import Sites from "./pages/admin/Sites";
import SiteSectionsPage from "./pages/admin/SiteSectionsPage";
import SectionTasksView from "./pages/admin/SectionTasksView";

// Worker Pages
import WorkerLogin from "./pages/worker/Login"; // ✅ Now unified for all
import MyTasks from "./pages/worker/MyTasks";
import TaskDetail from "./pages/worker/TaskDetail";

// Client Pages
import ClientPortal from "./pages/client/ClientPortal";
import ClientDetails from "./pages/admin/ClientDetails";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ UNIFIED: Single login for all user types */}
      <Route path="/login" element={<WorkerLogin />} />

      {/* ✅ REMOVED: /client/login (now uses /login) */}

      {/* Client Routes */}
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientPortal />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Clients />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Workers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Tasks />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <AdminTaskDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sites"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Sites />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sites/:id/sections"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <SiteSectionsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sites/:siteId/sections/:sectionId/tasks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <SectionTasksView />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Clients />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <ClientDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Worker Routes */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRoles={["worker"]}>
            <DashboardLayout>
              <MyTasks />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/tasks"
        element={
          <ProtectedRoute allowedRoles={["worker"]}>
            <DashboardLayout>
              <MyTasks />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker/tasks/:id"
        element={
          <ProtectedRoute allowedRoles={["worker"]}>
            <DashboardLayout>
              <TaskDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workers/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <WorkerDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/unauthorized"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unauthorized Access
              </h2>
              <p className="text-gray-600">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        }
      />
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600">
                The page you're looking for doesn't exist.
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
