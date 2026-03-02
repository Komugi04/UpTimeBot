import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { getMe } from './api/authApi';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import VerifyOtp from './pages/auth/VerifyOtp';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import AdminMonitors from './pages/admin/Monitors';
import AdminIncidents from './pages/admin/Incidents';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserMonitors from './pages/user/Monitors';
import UserIncidents from './pages/user/Incidents';

export default function App() {
  const { token, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    if (token) {
      // Token exists — verify it with the server
      getMe()
        .then(res => {
          setAuth(res.data, token); // valid → store user, stop loading
        })
        .catch(() => {
          clearAuth(); // invalid/expired token → clear everything, stop loading
        });
    } else {
      // No token at all → stop loading immediately
      setLoading(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        containerStyle={{ bottom: 40, right: 40 }}
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '16px',
            padding: '16px 22px',
            minWidth: '320px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/monitors" element={<AdminMonitors />} />
            <Route path="/admin/incidents" element={<AdminIncidents />} />
          </Route>
        </Route>

        {/* User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/monitors" element={<UserMonitors />} />
            <Route path="/user/incidents" element={<UserIncidents />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}