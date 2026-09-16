import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Car,
  SlidersHorizontal,
  CreditCard,
  User,
  Shield,
  Bell,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const DashboardLayout: React.FC = () => {
  const { user, activeMode } = useStore();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Bookings (Rider)', path: '/dashboard/trips', icon: Layers },
    { label: 'Published Rides (Driver)', path: '/dashboard/rides', icon: Car },
    { label: 'My Vehicles', path: '/dashboard/vehicles', icon: SlidersHorizontal },
    { label: 'Earnings & Payments', path: '/dashboard/payments', icon: CreditCard },
    { label: 'Profile & Verification', path: '/dashboard/profile', icon: User },
    { label: 'Safety Center', path: '/safety', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner with User Greeting */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={user?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6F55B7&color=fff`}
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-lavender-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl text-white">
                Hi, {user?.name}
              </h1>
              <span className="bg-lavender-500/20 text-lavender-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-lavender-500/30 capitalize">
                {activeMode} Mode
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {user?.email} • ★ {user?.rating_avg ? user.rating_avg.toFixed(1) : '5.0'} Rating ({user?.trips_count || 0} completed rides)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/rides/new"
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Car className="w-4 h-4" /> Publish Ride
          </Link>
          <Link
            to="/search"
            className="btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            Find Ride
          </Link>
        </div>
      </div>

      {/* Grid: Sidebar + Subpage Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar (col 3) */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="glass-panel p-3 rounded-2xl border border-lavender-500/20 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-lavender-600 text-white shadow-glow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-lavender-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area (col 9) */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
