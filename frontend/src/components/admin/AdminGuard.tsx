import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';

const SESSION_STORAGE_KEY = 'coride_admin_clearance';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user } = useStore();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return false;
    try {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      if (now - parsed.unlockedAt < INACTIVITY_TIMEOUT_MS) {
        return true;
      }
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return false;
    } catch {
      return false;
    }
  });

  const [pin, setPin] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [authMode, setAuthMode] = useState<'pin' | 'key'>('pin');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Auto-lock on inactivity
  useEffect(() => {
    if (!isUnlocked) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ unlockedAt: Date.now(), token: 'active' })
        );
      }
      timer = setTimeout(() => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setIsUnlocked(false);
      }, INACTIVITY_TIMEOUT_MS);
    };


    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isUnlocked]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setIsLockedOut(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  // If not admin role
  if (!user.is_admin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-rose-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              403 • Restricted Area
            </span>
            <h2 className="font-display font-bold text-2xl text-white">Owner Access Only</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              The Admin Control Center is strictly restricted to the platform owner. Your account (<strong className="text-white">{user.email}</strong>) does not have administrator clearance.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold"
            >
              Return to User Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        submitUnlock({ pin: newPin });
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const submitUnlock = async (payload: { pin?: string; key?: string }) => {
    if (isLockedOut) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.post<any>('/admin/auth/unlock', payload);
      if (res && res.success) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ unlockedAt: Date.now(), token: 'active' })
        );
        setIsUnlocked(true);
        setAttempts(0);
      }
    } catch (err: any) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPin('');
      setSecretKey('');

      if (nextAttempts >= 3) {
        setIsLockedOut(true);
        setCooldown(30);
        setError('Security Lockout: Too many failed attempts. Try again in 30 seconds.');
      } else {
        setError(err?.message || 'Invalid Master Security PIN or Secret Key.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If locked, render the Master Admin Security Gate
  if (!isUnlocked) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-purple-500/40 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-lavender-500/15 blur-[80px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-700 to-lavender-500 text-white flex items-center justify-center mx-auto shadow-glow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted Master Admin Gate</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                Security Clearance
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter your Master PIN to unlock the CoRide Administrative Portal
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#16131D] border border-purple-500/20 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('pin'); setError(''); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                authMode === 'pin'
                  ? 'bg-purple-600 text-white shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> 6-Digit Master PIN
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('key'); setError(''); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
                authMode === 'key'
                  ? 'bg-purple-600 text-white shadow-glow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Secret Passkey
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PIN Input Mode */}
          {authMode === 'pin' && (
            <div className="space-y-6">
              {/* Bullet Display */}
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const filled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full transition-all duration-200 ${
                        filled
                          ? 'bg-purple-400 ring-4 ring-purple-500/30 scale-110'
                          : 'bg-white/10 border border-white/20'
                      }`}
                    />
                  );
                })}
              </div>

              {/* PIN Keypad Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    disabled={isLockedOut || loading}
                    onClick={() => handleKeypadPress(digit)}
                    className="h-14 rounded-2xl bg-[#16131D] border border-purple-500/20 hover:border-purple-400 hover:bg-purple-600/20 text-white font-display font-bold text-xl active:scale-95 transition-all disabled:opacity-40"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={isLockedOut || loading}
                  onClick={handleClear}
                  className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold active:scale-95 transition-all disabled:opacity-40"
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={isLockedOut || loading}
                  onClick={() => handleKeypadPress('0')}
                  className="h-14 rounded-2xl bg-[#16131D] border border-purple-500/20 hover:border-purple-400 hover:bg-purple-600/20 text-white font-display font-bold text-xl active:scale-95 transition-all disabled:opacity-40"
                >
                  0
                </button>

                <button
                  type="button"
                  disabled={isLockedOut || loading}
                  onClick={handleBackspace}
                  className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold active:scale-95 transition-all disabled:opacity-40"
                >
                  ⌫
                </button>
              </div>

              {/* Master PIN Hint for platform owner */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-[11px] text-purple-300">
                  <strong className="text-white">Default Master PIN:</strong> <code className="bg-[#16131D] px-2 py-0.5 rounded font-mono font-bold text-lavender-300">984210</code>
                </p>
              </div>
            </div>
          )}

          {/* Secret Key Input Mode */}
          {authMode === 'key' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (secretKey.trim()) submitUnlock({ key: secretKey.trim() });
              }}
              className="space-y-4 text-left"
            >
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-semibold flex items-center justify-between">
                  <span>Master Secret Key</span>
                  <span className="text-[10px] text-purple-400">Environment Configured</span>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter Master Security Key..."
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    disabled={isLockedOut || loading}
                    className="w-full p-3.5 pr-10 rounded-xl bg-[#16131D] border border-purple-500/30 text-xs text-white focus:outline-none focus:border-purple-400 disabled:opacity-40 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLockedOut || loading || !secretKey.trim()}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow-md disabled:opacity-50"
              >
                {loading ? 'Verifying Key...' : 'Unlock Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-[11px] text-purple-300">
                  <strong className="text-white">Master Key:</strong> <code className="bg-[#16131D] px-2 py-0.5 rounded font-mono font-bold text-lavender-300">CORIDE-MASTER-2026-KEY</code>
                </p>
              </div>
            </form>
          )}

          {/* Cooldown notice */}
          {isLockedOut && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-center text-rose-300 text-xs font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Lockout Active: Please wait {cooldown}s</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 text-center">
            <Link
              to="/dashboard"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Exit to User Dashboard
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
};
