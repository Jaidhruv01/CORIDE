import React from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  FileWarning,
  Car,
  Layers,
  CreditCard,
  Sparkles,
  KeyRound,
  Lock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { AdminGuard } from '../admin/AdminGuard';

export const AdminLayout: React.FC = () => {
  const { user } = useStore();
  const location = useLocation();

  if (!user || !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLockSession = () => {
    sessionStorage.removeItem('coride_admin_clearance');
    window.location.reload();
  };

  const navItems = [
    { label: 'Overview & Metrics', path: '/admin', icon: LayoutDashboard },
    { label: 'Verification Queue', path: '/admin/verifications', icon: ShieldCheck },
    { label: 'Safety & Disputes', path: '/admin/reports', icon: FileWarning },
    { label: 'All Platform Rides', path: '/admin/rides', icon: Car },
    { label: 'All Bookings', path: '/admin/bookings', icon: Layers },
    { label: 'Payments & Revenue', path: '/admin/payments', icon: CreditCard },
    { label: 'Security & Master Key', path: '/admin/security', icon: KeyRound },
  ];

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-lavender-500 flex items-center justify-center text-white shadow-glow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-white">CoRide Admin Portal</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Owner Clearance Active
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Authenticated Platform Owner: <strong className="text-white">{user.name}</strong> ({user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleLockSession}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Lock Admin Terminal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Terminal</span>
            </button>

            <Link
              to="/dashboard"
              className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Exit to User App
            </Link>
          </div>
        </div>

        {/* Grid Layout: Admin Sidebar + Views */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar (col 3) */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="glass-panel p-3 rounded-2xl border border-purple-500/20 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-glow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Admin Content Area (col 9) */}
          <main className="lg:col-span-9">
            <Outlet />
          </main>

        </div>
      </div>
    </AdminGuard>
  );
};
