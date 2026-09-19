import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car,
  Search,
  PlusCircle,
  Shield,
  Bell,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CheckCheck,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  CreditCard,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Navbar: React.FC = () => {
  const { user, logout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, activeMode, setActiveMode, theme, toggleTheme } = useStore();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-lavender-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lavender-700 to-lavender-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-2xl tracking-tight text-white flex items-center gap-1">
              Co<span className="text-lavender-400">Ride</span>
            </span>
            <span className="text-[10px] text-lavender-200/60 font-medium tracking-wider uppercase -mt-1">
              Smart Carpooling
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/search"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname.startsWith('/search')
                ? 'text-lavender-300 bg-lavender-500/15'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4 text-lavender-400" />
            Find a Ride
          </Link>

          <Link
            to="/rides/new"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/rides/new'
                ? 'text-lavender-300 bg-lavender-500/15'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-lavender-400" />
            Publish Ride
          </Link>

          <Link
            to="/safety"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/safety'
                ? 'text-lavender-300 bg-lavender-500/15'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4 text-lavender-400" />
            Safety & Trust
          </Link>

          {user?.is_admin && (
            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/admin')
                  ? 'text-purple-300 bg-purple-500/20'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Section: Theme Mode Toggle, Mode Pill, Notifications, User Menu */}
        <div className="flex items-center space-x-2.5">
          
          {/* Theme Mode Toggle Button (Always visible) */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            title={theme === 'dark' ? 'Switch to Day Mode (☀️ Light)' : 'Switch to Night Mode (🌙 Dark)'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-lavender-500/20 transition-all duration-300 relative group flex items-center justify-center shadow-sm"
          >
            {theme === 'dark' ? (
              <div className="flex items-center gap-1.5 px-0.5">
                <Sun className="w-4 h-4 text-amber-300 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden xl:inline text-[11px] font-semibold text-amber-200">Day</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-0.5">
                <Moon className="w-4 h-4 text-lavender-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden xl:inline text-[11px] font-semibold text-lavender-700">Night</span>
              </div>
            )}
          </button>

          {user ? (
            <>
              {/* Role Perspective Switcher Pill */}
              <div className="hidden sm:flex items-center bg-[#1E1B26] p-1 rounded-xl border border-lavender-500/20 text-xs font-medium">
                <button
                  onClick={() => setActiveMode('rider')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMode === 'rider'
                      ? 'bg-lavender-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Rider
                </button>
                <button
                  onClick={() => setActiveMode('driver')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeMode === 'driver'
                      ? 'bg-lavender-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Driver
                </button>
                {user.is_admin && (
                  <button
                    onClick={() => setActiveMode('admin')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeMode === 'admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-lavender-500/30 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-lavender-500/15">
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4 text-lavender-400" /> Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllNotificationsRead()}
                          className="text-xs text-lavender-400 hover:text-lavender-300 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-white/5 mt-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.type.startsWith('BOOKING') || n.type.startsWith('RIDE')) {
                                navigate('/dashboard/trips');
                              }
                              setShowNotifMenu(false);
                            }}
                            className={`p-3 rounded-xl cursor-pointer transition-colors ${
                              !n.read_at ? 'bg-lavender-500/10 hover:bg-lavender-500/15' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-semibold text-lavender-300">{n.title}</span>
                              {!n.read_at && <span className="w-2 h-2 rounded-full bg-lavender-400" />}
                            </div>
                            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{n.body}</p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-lavender-500/20 transition-all"
                >
                  <img
                    src={user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6F55B7&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">{user.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-lavender-300 capitalize">{activeMode} Mode</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl glass-panel border border-lavender-500/30 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="font-semibold text-white text-sm">{user.name}</p>
                      <p className="text-gray-400 truncate">{user.email}</p>
                    </div>

                    {/* Mode Toggle inside Dropdown */}
                    <button
                      onClick={() => toggleTheme()}
                      className="w-full text-left flex items-center justify-between px-4 py-2.5 text-gray-300 hover:text-white hover:bg-lavender-500/15"
                    >
                      <div className="flex items-center gap-2.5">
                        {theme === 'dark' ? (
                          <Sun className="w-4 h-4 text-amber-300" />
                        ) : (
                          <Moon className="w-4 h-4 text-lavender-600" />
                        )}
                        <span>Theme: {theme === 'dark' ? 'Night (Dark)' : 'Day (Light)'}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-lavender-400 bg-lavender-500/10 px-2 py-0.5 rounded-md border border-lavender-500/20">
                        Switch
                      </span>
                    </button>

                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-lavender-500/15"
                    >
                      <LayoutDashboard className="w-4 h-4 text-lavender-400" />
                      Dashboard Overview
                    </Link>

                    <Link
                      to="/dashboard/trips"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-lavender-500/15"
                    >
                      <Layers className="w-4 h-4 text-lavender-400" />
                      My Bookings (Rider)
                    </Link>

                    <Link
                      to="/dashboard/rides"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-lavender-500/15"
                    >
                      <Car className="w-4 h-4 text-lavender-400" />
                      My Published Rides
                    </Link>

                    <Link
                      to="/dashboard/vehicles"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-lavender-500/15"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-lavender-400" />
                      My Vehicles
                    </Link>

                    <Link
                      to="/dashboard/payments"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-lavender-500/15"
                    >
                      <CreditCard className="w-4 h-4 text-lavender-400" />
                      Earnings & Payments
                    </Link>

                    <Link
                      to="/dashboard/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-lavender-500/15"
                    >
                      <User className="w-4 h-4 text-lavender-400" />
                      Profile & Verification
                    </Link>

                    {user.is_admin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-purple-300 hover:text-purple-200 hover:bg-purple-500/15 border-t border-white/5"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-400" />
                        Admin Portal
                      </Link>
                    )}

                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          navigate('/');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
