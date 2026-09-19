import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Car,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        is_driver: isDriver,
      });

      setAuth(res.user, res.access_token, res.refresh_token);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lavender-700 to-lavender-500 flex items-center justify-center mx-auto shadow-glow-sm">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            Join CoRide
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
            Join thousands of verified commuters sharing routes & saving costs
          </p>
        </div>

        {/* Register Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Intent Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-lavender-500/10 dark:bg-[#16131D] border border-lavender-500/20">
            <button
              type="button"
              onClick={() => setIsDriver(false)}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                !isDriver
                  ? 'bg-lavender-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Rider Account
            </button>
            <button
              type="button"
              onClick={() => setIsDriver(true)}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isDriver
                  ? 'bg-lavender-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" /> Driver Account
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-slate-700 dark:text-gray-300 font-semibold block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-[#16131D] border border-lavender-500/25 pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-lavender-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 dark:text-gray-300 font-semibold block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-[#16131D] border border-lavender-500/25 pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-lavender-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 dark:text-gray-300 font-semibold block mb-1.5">
                Mobile Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-[#16131D] border border-lavender-500/25 pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-lavender-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 dark:text-gray-300 font-semibold block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-[#16131D] border border-lavender-500/25 pl-10 pr-10 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-lavender-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Driver Plan Card */}
            <div
              onClick={() => setIsDriver(!isDriver)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isDriver
                  ? 'bg-lavender-500/15 border-lavender-500/40 text-slate-900 dark:text-white'
                  : 'bg-slate-50 dark:bg-[#16131D] border-lavender-500/15 text-slate-600 dark:text-gray-400 hover:border-lavender-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${isDriver ? 'bg-lavender-600 text-white' : 'bg-lavender-500/10 text-lavender-600 dark:text-gray-400'}`}>
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">
                    I plan to publish & offer rides
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">
                    You can also switch seamlessly between Rider & Driver anytime
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isDriver ? 'bg-lavender-600 border-lavender-600 text-white' : 'border-slate-300 dark:border-gray-500'}`}>
                {isDriver && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mt-4 shadow-glow-sm hover:shadow-glow-md"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/5 text-center text-xs text-slate-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300 font-bold"
            >
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
