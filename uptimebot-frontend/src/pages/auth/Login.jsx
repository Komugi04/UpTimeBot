import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/shared/Logo';

function pickLaravelError(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;

  // If Laravel ValidationException returns: { message, errors: { field: [msg] } }
  if (data?.errors && typeof data.errors === 'object') {
    const firstField = Object.keys(data.errors)[0];
    const firstMsg = data.errors[firstField]?.[0];
    if (firstMsg) return firstMsg;
  }

  return data?.message || fallback;
}

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const checkEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      // ✅ email-only probe (do not send empty password)
      const res = await login({ email });

      // OTP flow
      if (res.data.requires_otp) {
        toast.success(res.data.message || 'OTP sent to your email');
        navigate('/verify-otp', { state: { email } });
        return;
      }

      // Logged in (admin OR user w/ password and backend accepted without OTP)
      if (res.data.token && res.data.user) {
        setAuth(res.data.user, res.data.token);
        toast.success('Welcome back!');
        navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
        return;
      }

      // If backend responds but doesn't return token/otp (rare)
      setShowPasswordField(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg = pickLaravelError(err, 'Login failed');

      // If backend says password required, show password form
      // (Your controller returns: "Password required..." with 422)
      if (status === 422 && /password required/i.test(msg)) {
        setShowPasswordField(true);
        return;
      }

      if (status === 404) {
        toast.error('Email not found. Please contact administrator.');
        return;
      }

      if (status === 403) {
        toast.error(msg || 'Your account has been disabled.');
        return;
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitWithPassword = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });

      if (res.data.requires_otp) {
        toast.success(res.data.message || 'OTP sent to your email');
        navigate('/verify-otp', { state: { email } });
        return;
      }

      setAuth(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      toast.error(pickLaravelError(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  const backToEmail = () => {
    setShowPasswordField(false);
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-800">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Logo size="large" />
          <h1 className="text-white text-2xl font-bold">ServerSentinel</h1>
        </div>

        <h2 className="text-gray-300 text-lg mb-6">Sign in</h2>

        {!showPasswordField ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkEmail();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@gmail.com"
                className="w-full mt-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitWithPassword} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full mt-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 outline-none opacity-75"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full mt-1 px-4 py-2 pr-12 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={backToEmail}
              className="w-full text-sm text-gray-400 hover:text-green-400 transition"
            >
              ← Back to email
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>First time? Enter email to receive OTP</p>
          <p className="mt-1">Already registered? Use your password</p>
        </div>
      </div>
    </div>
  );
}