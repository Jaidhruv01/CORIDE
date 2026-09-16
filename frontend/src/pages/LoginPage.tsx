import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles, Car, Shield, User, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      setAuth(res.user, res.access_token, res.refresh_token);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', {
        email: demoEmail,
        password: demoPass,
      });

      setAuth(res.user, res.access_token, res.refresh_token);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lavender-700 to-lavender-500 flex items-center justify-center mx-auto shadow-glow-sm">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-white">Welcome Back</h2>
          <p className="text-xs text-gray-400">Sign in to manage your rides, bookings, and messages</p>
        </div>

        {/* 1-Click Demo Accounts Quick-Select Card */}
        <div className="glass-panel p-4 rounded-2xl border border-lavender-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-lavender-300 font-semibold mb-2">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-lavender-400" /> Instant Demo Logins</span>
            <span className="text-[10px] text-gray-400">One-click test access</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('priya.sharma@example.com', 'password123')}
              className="p-3 rounded-xl bg-white/5 hover:bg-lavender-500/20 border border-lavender-500/20 text-center transition-all group"
            >
              <Car className="w-4 h-4 mx-auto text-lavender-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="block text-[11px] font-bold text-white">Driver Demo</span>
              <span className="block text-[9px] text-gray-400">Priya Sharma</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rahul.verma@example.com', 'password123')}
              className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-emerald-500/20 text-center transition-all group"
            >
              <User className="w-4 h-4 mx-auto text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="block text-[11px] font-bold text-white">Rider Demo</span>
              <span className="block text-[9px] text-gray-400">Rahul Verma</span>
            </button>
          </div>
        </div>


        {/* Login Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-gray-300 font-medium block mb-1.5">Email Address</label>
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
                <label className="text-xs text-gray-300 font-medium">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-lavender-400 hover:text-lavender-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#16131D] border border-lavender-500/20 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-gray-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-lavender-400 hover:text-lavender-300 font-semibold">
              Create free account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
