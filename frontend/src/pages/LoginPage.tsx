import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LogIn,
  Mail,
  Lock,
  Sparkles,
  Car,
  Shield,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  KeyRound
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useStore();

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [selectedRole, setSelectedRole] = useState<'rider' | 'driver' | 'admin'>('rider');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91 9811223344');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('coride_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginMethod === 'email') {
        const res = await api.post('/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        if (rememberMe) {
          localStorage.setItem('coride_remember_email', email.trim().toLowerCase());
        } else {
          localStorage.removeItem('coride_remember_email');
        }

        setAuth(res.user, res.access_token, res.refresh_token);
        
        if (redirectPath === '/dashboard') {
          if (res.user.is_admin) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate(redirectPath, { replace: true });
        }
      } else {
        // Phone OTP verification flow
        if (!otpSent) {
          if (!phone || phone.length < 10) {
            throw new Error('Please enter a valid mobile number');
          }
          setOtpSent(true);
          setLoading(false);
          return;
        }

        // Verify simulated OTP
        if (otp !== '1234' && otp.length !== 4 && otp !== '9999') {
          throw new Error('Invalid OTP. For demo mode, enter 1234');
        }

        const targetEmail = selectedRole === 'driver' 
          ? 'priya.sharma@example.com' 
          : selectedRole === 'admin' 
          ? 'admin@coride.com' 
          : 'rahul.verma@example.com';

        const targetPass = selectedRole === 'admin' ? 'admin123' : 'password123';

        const res = await api.post('/auth/login', {
          email: targetEmail,
          password: targetPass,
        });

        setAuth(res.user, res.access_token, res.refresh_token);
        navigate(res.user.is_admin ? '/admin' : '/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please check your login details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: 'rider' | 'driver' | 'admin', demoEmail: string, demoPass: string) => {
    setSelectedRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: demoEmail,
        password: demoPass,
      });

      if (rememberMe) {
        localStorage.setItem('coride_remember_email', demoEmail);
      }

      setAuth(res.user, res.access_token, res.refresh_token);
      
      if (res.user.is_admin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemoCredentials = (demoRole: 'rider' | 'driver' | 'admin') => {
    setSelectedRole(demoRole);
    setError('');
    if (demoRole === 'driver') {
      setEmail('priya.sharma@example.com');
      setPassword('password123');
      setPhone('+91 9811223344');
    } else if (demoRole === 'admin') {
      setEmail('admin@coride.com');
      setPassword('admin123');
      setPhone('+91 9876543210');
    } else {
      setEmail('rahul.verma@example.com');
      setPassword('password123');
      setPhone('+91 9822334455');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lavender-700 to-lavender-500 flex items-center justify-center mx-auto shadow-glow-sm">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-white">
            Welcome to CoRide
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Sign in to manage your rides, bookings, vehicles & messages
          </p>
        </div>

        {/* 1-Click Instant Demo Access Selector */}
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-lavender-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-lavender-300 font-semibold">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-lavender-400" /> Instant Verified Demo Logins
            </span>
            <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-lavender-500/20">
              1-Click Access
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Rider Demo Card */}
            <div
              onClick={() => handleQuickDemoLogin('rider', 'rahul.verma@example.com', 'password123')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all text-left group relative ${
                selectedRole === 'rider'
                  ? 'bg-lavender-500/20 border-lavender-400 shadow-glow-sm'
                  : 'bg-white/5 border-lavender-500/20 hover:border-lavender-400 hover:bg-lavender-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Rider
                </span>
              </div>
              <p className="font-bold text-xs text-white group-hover:text-lavender-300">
                Rahul Verma
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                Find & Book Rides
              </p>
            </div>

            {/* Driver Demo Card */}
            <div
              onClick={() => handleQuickDemoLogin('driver', 'priya.sharma@example.com', 'password123')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all text-left group relative ${
                selectedRole === 'driver'
                  ? 'bg-lavender-500/20 border-lavender-400 shadow-glow-sm'
                  : 'bg-white/5 border-lavender-500/20 hover:border-lavender-400 hover:bg-lavender-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-7 h-7 rounded-lg bg-lavender-500/20 text-lavender-400 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-lavender-300 bg-lavender-500/15 px-1.5 py-0.5 rounded border border-lavender-500/30">
                  Driver
                </span>
              </div>
              <p className="font-bold text-xs text-white group-hover:text-lavender-300">
                Priya Sharma
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                Publish & Earn
              </p>
            </div>

            {/* Admin Demo Card */}
            <div
              onClick={() => handleQuickDemoLogin('admin', 'admin@coride.com', 'admin123')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all text-left group relative ${
                selectedRole === 'admin'
                  ? 'bg-purple-500/25 border-purple-400 shadow-glow-sm'
                  : 'bg-white/5 border-lavender-500/20 hover:border-purple-400 hover:bg-purple-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">
                  Admin
                </span>
              </div>
              <p className="font-bold text-xs text-white group-hover:text-purple-300">
                Platform Admin
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                Master Security
              </p>
            </div>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-5">
          
          {/* Sign In Mode Tabs: Email / Phone */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-[#16131D] border border-lavender-500/20 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setError(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'email'
                  ? 'bg-lavender-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email & Password
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setError(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'phone'
                  ? 'bg-lavender-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" /> Mobile OTP
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            
            {loginMethod === 'email' ? (
              <>
                <div>
                  <label className="text-xs text-gray-300 font-semibold block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-[#16131D] border border-lavender-500/20 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-300 font-semibold">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-lavender-400 hover:text-lavender-300 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-[#16131D] border border-lavender-500/20 pl-10 pr-10 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-lavender-600 focus:ring-lavender-500 border-lavender-500/30"
                    />
                    <span>Remember my email</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => autofillDemoCredentials(selectedRole)}
                    className="text-[11px] text-lavender-400 hover:underline font-medium"
                  >
                    Reset to Demo
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-gray-300 font-semibold block mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={otpSent}
                      className="w-full rounded-xl bg-[#16131D] border border-lavender-500/20 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400 disabled:opacity-60 transition-colors"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300 font-semibold">
                        Enter 4-Digit OTP Code
                      </label>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        (Demo OTP: 1234)
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={4}
                        required
                        placeholder="1234"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full rounded-xl bg-[#16131D] border border-lavender-500/20 pl-10 pr-4 py-3 text-sm tracking-widest font-mono text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400 text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); }}
                      className="text-[11px] text-lavender-400 hover:underline"
                    >
                      Change phone number
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-3 shadow-glow-sm hover:shadow-glow-md"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {loginMethod === 'phone' && !otpSent ? 'Send Login OTP' : 'Sign In to Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Footer */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-gray-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="text-lavender-400 hover:text-lavender-300 font-bold"
            >
              Create free account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
