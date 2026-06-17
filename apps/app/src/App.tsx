import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionsProvider, usePermissions } from './context/PermissionsContext';
import { SettingsProvider } from './context/SettingsContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import SplashScreen from './pages/SplashScreen';
import Onboarding from './pages/Onboarding';
import AuthCallback from './pages/auth/AuthCallback';
import RoleSelection from './pages/auth/RoleSelection';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import BeginnerDashboard from './pages/dashboard/BeginnerDashboard';
import CropManagement from './pages/crops/CropManagement';
import AddCrop from './pages/crops/AddCrop';
import CropPlan from './pages/crops/CropPlan';
import PlantDiagnosis from './pages/farmer/PlantDiagnosis';
import Weather from './pages/weather/Weather';
import Chatbot from './pages/chatbot/Chatbot';
import Community from './pages/community/Community';
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
import AdminPermissions from './pages/admin/AdminPermissions';
import AdminAudit from './pages/admin/AdminAudit';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminWeather from './pages/admin/AdminWeather';
import AdminStats from './pages/admin/AdminStats';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/auth/AdminLogin';
import { getRouteForRole } from './utils/authRouting';
import type { PermissionCode } from './types/permission';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializing, isAuthenticated, needsRoleSelection } = useAuth();
  if (initializing) {
    return <div className="min-h-screen bg-[#f6f8f8]" />;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsRoleSelection) return <Navigate to="/role-selection" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializing, isAuthenticated, role, needsRoleSelection } = useAuth();
  if (initializing) {
    return <div className="min-h-screen bg-[#f6f8f8]" />;
  }
  if (needsRoleSelection) {
    return <Navigate to="/role-selection" replace />;
  }
  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
};

const BeginnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializing, isAuthenticated, role, needsRoleSelection } = useAuth();

  if (initializing) {
    return <div className="min-h-screen bg-[#f6f8f8]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsRoleSelection) {
    return <Navigate to="/role-selection" replace />;
  }

  if (role !== 'beginner') {
    return <Navigate to={getRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

const RoleSelectionRoute: React.FC = () => {
  const { initializing, isAuthenticated, role, needsRoleSelection } = useAuth();

  if (initializing) {
    return <div className="min-h-screen bg-[#f6f8f8]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!needsRoleSelection) {
    return <Navigate to={getRouteForRole(role)} replace />;
  }

  return <RoleSelection />;
};

const PublicAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializing, isAuthenticated, role, needsRoleSelection } = useAuth();

  if (initializing) {
    return <div className="min-h-screen bg-[#f6f8f8]" />;
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return <Navigate to={needsRoleSelection ? '/role-selection' : getRouteForRole(role)} replace />;
};

const PermissionRoute: React.FC<{ permission: PermissionCode; children: React.ReactNode }> = ({
  permission,
  children,
}) => {
  const { initializing, isAuthenticated, role } = useAuth();
  const { loading, hasPermission } = usePermissions();

  if (initializing || loading) {
    return <div className="min-h-screen bg-[#f6f8f8]" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to={getRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { initializing, isAuthenticated, role, needsRoleSelection } = useAuth();

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (initializing) {
    return <div className="min-h-screen bg-[#f6f8f8]" />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? (
          <Navigate to={needsRoleSelection ? '/role-selection' : getRouteForRole(role)} />
        ) : (
          <Onboarding />
        )} />
        
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/role-selection" element={<RoleSelectionRoute />} />
        <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
        <Route path="/admin-login" element={<PublicAuthRoute><AdminLogin /></PublicAuthRoute>} />
        <Route path="/register" element={<PublicAuthRoute><Register /></PublicAuthRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Navigate to={needsRoleSelection ? '/role-selection' : getRouteForRole(role)} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/beginner-dashboard" element={<BeginnerDashboard />} />
          <Route path="/crops" element={<PermissionRoute permission="crops.read"><CropManagement /></PermissionRoute>} />
          <Route path="/add-crop" element={<PermissionRoute permission="crops.create"><AddCrop /></PermissionRoute>} />
          <Route path="/crop-plan/:id" element={<PermissionRoute permission="crops.read"><CropPlan /></PermissionRoute>} />
          <Route path="/plant-diagnosis" element={<PlantDiagnosis />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><PermissionRoute permission="settings.read"><Settings /></PermissionRoute></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/tutorials" element={<BeginnerRoute><Tutorials /></BeginnerRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<PermissionRoute permission="users.read"><AdminUsers /></PermissionRoute>} />
          <Route path="crops" element={<PermissionRoute permission="crops.read"><AdminCrops /></PermissionRoute>} />
          <Route path="reports" element={<PermissionRoute permission="reports.read"><AdminReports /></PermissionRoute>} />
          <Route path="permissions" element={<PermissionRoute permission="permissions.read"><AdminPermissions /></PermissionRoute>} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="community" element={<AdminCommunity />} />
          <Route path="weather" element={<AdminWeather />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="settings" element={<PermissionRoute permission="settings.read"><AdminSettings /></PermissionRoute>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </PermissionsProvider>
    </AuthProvider>
  );
}
