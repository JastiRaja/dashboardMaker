import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Home from './pages/Home';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboards from './pages/Dashboards';
import Datasets from './pages/Datasets';
import DashboardView from './pages/DashboardView';
import DashboardEdit from './pages/DashboardEdit';
import PublicDashboard from './pages/PublicDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard/public/:publicId" element={<PublicDashboard />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            
            <Route path="/dashboards" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboards />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/datasets" element={
              <ProtectedRoute>
                <Layout>
                  <Datasets />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/new" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardEdit />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/:id" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardView />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardEdit />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;