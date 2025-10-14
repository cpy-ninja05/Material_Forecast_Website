import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/AuthPage';
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
import Navigation from './components/Navigation';
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

const AppContent = () => {
  return (
    <>
      <Navigation />
      <main className="ml-64">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forecasting" element={<ForecastingPage />} />
          <Route path="/procurement" element={<PurchaseRequests />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/projects" element={<ProjectManagement />} />
          <Route path="/suppliers" element={<SupplierManagement />} />
          <Route path="/planning" element={<PlanningApprovals />} />
          <Route path="/om" element={<OperationsMaintenance />} />
          <Route path="/dispatch" element={<LoadDispatch />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
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
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
