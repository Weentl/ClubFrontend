// En App.tsx o en un archivo de rutas similar

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import PasswordReset from './components/auth/PasswordReset';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import ProductsPage from './components/products/ProductsPage';
import InventoryList from './components/inventory/InventoryList';
import SalesPage from './components/sales/SalesPage';
import ClientsList from './components/clients/ClientsList';
import ClubsPage from './components/clubs/ClubsPage';
import ReportsPage from './components/reports/ReportsPage';
import ExpensesPage from './components/expenses/ExpensesPage';
import SettingsPage from './components/settings/SettingsPage';
import EmployeeManagement from './components/employees/EmployeeManagement';
import EmployeeChangePassword from './components/EmployeeSection/EmployeeChangePassword';
import EmployeeDashboard from './components/EmployeeSection/EmployeeDashboard';
import LandingPage from './components/landing/LandingPage';

// Componente PrivateRoute genérico
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

// Ruta para dueños: solo se permite acceso si el usuario no es empleado
function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.userType === 'employee') {
    return <Navigate to="/employee/dashboard" />;
  }
  return <>{children}</>;
}

// Ruta para empleados: solo se permite acceso si el usuario es empleado
function EmployeeRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.userType === 'owner') {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
}

// Layout para empleados (puedes personalizarlo)
const EmployeeLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/myadclub" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<PasswordReset />} />

          {/* Rutas para dueños (owner) usando MainLayout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <OwnerRoute>
                  <MainLayout />
                </OwnerRoute>
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="customers" element={<ClientsList />} />
            <Route path="clubs" element={<ClubsPage />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="employees" element={<EmployeeManagement />} />
          </Route>

          {/* Rutas para empleados */}
          <Route
            path="/employee/*"
            element={
              <PrivateRoute>
                <EmployeeRoute>
                  <EmployeeLayout>
                    <Routes>
                      <Route path="dashboard" element={<EmployeeDashboard />} />
                      <Route path="change-password" element={<EmployeeChangePassword />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </EmployeeLayout>
                </EmployeeRoute>
              </PrivateRoute>
            }
          />

          {/* Rutas de onboarding */}
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <OnboardingFlow />
              </PrivateRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;

