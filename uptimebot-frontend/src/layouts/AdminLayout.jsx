import { Link, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, MonitorCheck, AlertCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { logout } from '../api/authApi';
import toast from 'react-hot-toast';
import Logo from '../components/shared/Logo';

export default function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    clearAuth();
    toast.success('Logged out');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: MonitorCheck, label: 'Monitors', path: '/admin/monitors' },
    { icon: AlertCircle, label: 'Incidents', path: '/admin/incidents' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Logo size="default" />
            <div>
              <h1 className="text-white text-xl font-bold">ServerSentinel</h1>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}