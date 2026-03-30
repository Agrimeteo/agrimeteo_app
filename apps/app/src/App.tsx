import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import RoleSelection from './pages/auth/RoleSelection';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import BeginnerDashboard from './pages/dashboard/BeginnerDashboard';
import CropManagement from './pages/crops/CropManagement';
import AddCrop from './pages/crops/AddCrop';
import CropPlan from './pages/crops/CropPlan';
import PlantDiagnosis from './pages/farmer/PlantDiagnosis';
import Weather from './pages/weather/Weather';
import Chatbot from './pages/chatbot/Chatbot';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import Notifications from './pages/profile/Notifications';
import Settings from './pages/settings/Settings';
import Help from './pages/help/Help';
import Tutorials from './pages/tutorials/Tutorials';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCrops from './pages/admin/AdminCrops';
import AdminReports from './pages/admin/AdminReports';
import AdminWeather from './pages/admin/AdminWeather';
import AdminStats from './pages/admin/AdminStats';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/auth/AdminLogin';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, role } = useAuth();

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? (
          <Navigate to={role === 'farmer' ? '/farmer-dashboard' : '/beginner-dashboard'} />
        ) : (
          <Onboarding />
        )} />
        
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Navigate
                to={role === 'farmer' ? '/farmer-dashboard' : '/beginner-dashboard'}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/beginner-dashboard" element={<BeginnerDashboard />} />
          <Route path="/crops" element={<CropManagement />} />
          <Route path="/add-crop" element={<AddCrop />} />
          <Route path="/crop-plan/:id" element={<CropPlan />} />
          <Route path="/plant-diagnosis" element={<PlantDiagnosis />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/tutorials" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="crops" element={<AdminCrops />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="weather" element={<AdminWeather />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
