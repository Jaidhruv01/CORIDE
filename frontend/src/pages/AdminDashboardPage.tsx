import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Users,
  Car,
  Layers,
  ShieldCheck,
  FileWarning,
  PieChart,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../lib/api';
import { AdminStats } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await api.get<AdminStats>('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-xs text-gray-400">Loading platform metrics...</div>;
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* 4 Main Marketplace Financial & Volume Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <span className="text-xs text-gray-400 block font-medium">Gross Booking Value</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-extrabold text-2xl text-white">₹{stats?.total_gross_booking_value.toFixed(2)}</h3>
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Total seat sales
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <span className="text-xs text-gray-400 block font-medium">Platform Fee Revenue</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-extrabold text-2xl text-purple-300">₹{stats?.total_platform_revenue.toFixed(2)}</h3>
          </div>
          <span className="text-[11px] text-purple-200/70">0% Promotional Take Rate</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <span className="text-xs text-gray-400 block font-medium">Active / Total Rides</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-extrabold text-2xl text-white">{stats?.active_rides} <span className="text-sm font-normal text-gray-400">/ {stats?.total_rides}</span></h3>
          </div>
          <span className="text-[11px] text-lavender-300">{stats?.completed_rides} completed trips</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 space-y-2">
          <span className="text-xs text-gray-400 block font-medium">Seat Utilization Rate</span>
          <div className="flex items-baseline justify-between">
            <h3 className="font-extrabold text-2xl text-white">{stats?.seat_utilization_rate}%</h3>
          </div>
          <span className="text-[11px] text-emerald-400">Seats booked vs offered</span>
        </div>

      </div>

      {/* Operational Queues Alert Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <Link
          to="/admin/verifications"
          className="glass-panel p-6 rounded-3xl border border-purple-500/20 hover:border-purple-400 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Verification Queue</h3>
              <p className="text-xs text-gray-400">
                {stats?.pending_verifications} pending driver ID / vehicle approvals
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </Link>

        <Link
          to="/admin/reports"
          className="glass-panel p-6 rounded-3xl border border-purple-500/20 hover:border-purple-400 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <FileWarning className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Safety & Reports Queue</h3>
              <p className="text-xs text-gray-400">
                {stats?.pending_reports} unresolved community safety tickets
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </Link>

      </div>

      {/* Quick Summary Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-4">
        <h3 className="font-display font-bold text-lg text-white">Community & Growth Breakdown</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#16131D] border border-white/5 space-y-1">
            <span className="text-gray-400">Total Registered</span>
            <p className="font-extrabold text-xl text-white">{stats?.total_users}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#16131D] border border-white/5 space-y-1">
            <span className="text-gray-400">Verified Drivers</span>
            <p className="font-extrabold text-xl text-lavender-300">{stats?.total_drivers}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#16131D] border border-white/5 space-y-1">
            <span className="text-gray-400">Total Bookings</span>
            <p className="font-extrabold text-xl text-white">{stats?.total_bookings}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#16131D] border border-white/5 space-y-1">
            <span className="text-gray-400">Confirmed Passes</span>
            <p className="font-extrabold text-xl text-emerald-400">{stats?.confirmed_bookings}</p>
          </div>
        </div>
      </div>

    </div>
  );
};
