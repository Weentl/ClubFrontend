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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          
          {/* Protected routes with sidebar layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/customers" element={<ClientsList />} />
            <Route path="/clubs" element={<ClubsPage/>} />
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/employees" element={<EmployeeManagement />} />
          </Route>
          <Route path="/onboarding" element={
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
