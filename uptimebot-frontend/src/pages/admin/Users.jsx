import { useState, useEffect } from 'react';
import { Trash2, Mail, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUsers, createUser, deleteUser, updateStatus, resendOtp } from '../../api/adminApi';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 2000); // Refresh every 5s to update online status
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser({ email });
      toast.success('User added! OTP sent to their email.');
      setEmail('');
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateStatus(id, { status: newStatus });
      toast.success('Status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleResendOtp = async (userEmail) => {
    try {
      await resendOtp({ email: userEmail });
      toast.success('OTP resent!');
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  const getStatusBadge = (status, isOnline) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending OTP' },
      registered: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Registered' },
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
      disabled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Disabled' },
    };

    const config = statusConfig[status] || statusConfig.registered;

    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
        {status !== 'pending' && status !== 'disabled' && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            {isOnline ? (
              <>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Online
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-gray-600 rounded-full" />
                Offline
              </>
            )}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition"
        >
          <Mail size={20} />
          Add User by Email
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left text-gray-400 px-6 py-4 font-medium">Name</th>
              <th className="text-left text-gray-400 px-6 py-4 font-medium">Email</th>
              <th className="text-left text-gray-400 px-6 py-4 font-medium">Status</th>
              <th className="text-left text-gray-400 px-6 py-4 font-medium">Monitors</th>
              <th className="text-left text-gray-400 px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role !== 'admin').map(user => (
              <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                <td className="px-6 py-4 text-white">{user.name}</td>
                <td className="px-6 py-4 text-gray-400">{user.email}</td>
                <td className="px-6 py-4">{getStatusBadge(user.status, user.is_online)}</td>
                <td className="px-6 py-4 text-gray-400">{user.monitors_count || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.status === 'pending' && (
                      <button
                        onClick={() => handleResendOtp(user.email)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded transition"
                        title="Resend OTP"
                      >
                        <Mail size={16} />
                      </button>
                    )}
                    <select
                      value={user.status}
                      onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                      className="px-2 py-1 bg-gray-800 text-white text-xs rounded border border-gray-700 focus:border-green-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="registered">Registered</option>
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-semibold mb-4">Add User by Email</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">User Gmail Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  pattern=".*@gmail\.com$"
                  title="Must be a Gmail address"
                  placeholder="user@gmail.com"
                  className="w-full mt-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                />
                <p className="text-gray-500 text-xs mt-2">
                User will receive an OTP when they try to login for the first time.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}