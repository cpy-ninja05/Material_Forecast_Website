import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import ForecastingPage from './components/ForecastingPage';
import MaterialsPage from './components/MaterialsPage';
import PlanningApprovals from './components/PlanningApprovals';
import OperationsMaintenance from './components/OperationsMaintenance';
import LoadDispatch from './components/LoadDispatch';
import MapView from './components/MapView';
import ProjectManagement from './components/ProjectManagement';
import SupplierManagement from './components/SupplierManagement';
import PurchaseRequests from './components/PurchaseRequests';
import Inventory from './components/Inventory';
import Teams from './components/Teams';
import TeamInvitation from './components/TeamInvitation';
import Navigation from './components/Navigation';
import RowRiskDashboard from './components/RowRiskDashboard';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/auth" replace />;
};

const ProtectedLayout = ({ children }) => {
  return (
    <>
      <Navigation />
      <main className="with-sidebar transition-all duration-300 ease-in-out min-h-screen md:pt-0 pt-14" style={{ marginLeft: '0px' }}>
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/team-invitation" element={<TeamInvitation />} />
            <Route path="/project-invitation" element={<TeamInvitation />} />
            <Route path="/auth/team-invitation" element={<TeamInvitation />} />
            <Route path="/auth/project-invitation" element={<TeamInvitation />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/forecasting" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ForecastingPage />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/procurement" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PurchaseRequests />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/materials" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MaterialsPage />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MapView />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/row-risk" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <RowRiskDashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Inventory />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ProjectManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/suppliers" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <SupplierManagement />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/planning" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PlanningApprovals />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/om" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <OperationsMaintenance />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/dispatch" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <LoadDispatch />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/teams" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Teams />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
        {/* Toast notifications with dark mode support */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            // Default options for all toasts
            className: '',
            duration: 3000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-text)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            // Success toast styling
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#ffffff',
              },
            },
            // Error toast styling
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
