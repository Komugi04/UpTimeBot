import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ adminOnly = false }) {
  const { user, token, isLoading } = useAuthStore();

  // ⏳ Still checking token with server — show nothing (or a spinner)
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280',
      }}>
        Loading...
      </div>
    );
  }

  // ❌ No token or no user → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Admin-only route but user is not admin → redirect to user dashboard
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }

  // ✅ Authenticated (and correct role) → render the page
  return <Outlet />;
}