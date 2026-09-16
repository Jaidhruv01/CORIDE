import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Layers,
  CreditCard,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { Booking, Ride } from '../types';
import { useStore } from '../store/useStore';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useStore();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [driverRides, setDriverRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [tData, rData] = await Promise.all([
          api.get<Booking[]>('/bookings/my/trips').catch(() => []),
          api.get<Ride[]>('/rides/driver/my-rides').catch(() => []),
        ]);
        setTrips(tData);
        setDriverRides(rData);
      } finally {
        setLoading(false);
      }
    };
    loadOverviewData();
  }, []);

  const upcomingBookings = trips.filter(t => t.status === 'CONFIRMED' || t.status === 'PENDING');
  const activePublishedRides = driverRides.filter(r => r.status === 'PUBLISHED' || r.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 text-left">
      
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-lavender-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Rider Bookings</span>
            <Layers className="w-4 h-4 text-lavender-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="font-extrabold text-2xl text-white">{trips.length}</h3>
            <span className="text-xs text-emerald-400 font-semibold">{upcomingBookings.length} upcoming</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-lavender-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Published Rides</span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="font-extrabold text-2xl text-white">{driverRides.length}</h3>
            <span className="text-xs text-lavender-300 font-semibold">{activePublishedRides.length} active</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-lavender-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Trust Score</span>
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="font-extrabold text-2xl text-white">
              {user?.rating_avg ? user.rating_avg.toFixed(1) : '5.0'}
            </h3>
            <span className="text-xs text-gray-400">{user?.trips_count || 0} completed</span>
          </div>
        </div>

      </div>

      {/* Upcoming Rider Trips */}
      <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-lavender-400" /> Upcoming Reserved Rides
          </h3>
          <Link to="/dashboard/trips" className="text-xs text-lavender-400 hover:text-lavender-300 font-semibold flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs space-y-2">
            <p>You have no upcoming booked rides.</p>
            <Link to="/search" className="btn-primary inline-block px-4 py-2 rounded-xl font-semibold text-xs mt-2">
              Find a Shared Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.pickup_stop_name} ➔ {b.drop_stop_name}</span>
                    <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">
                    Pass: <strong>{b.booking_code}</strong> • {b.seats} Seat(s) • ₹{b.total}
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Link
                    to={`/booking/${b.id}`}
                    className="btn-primary flex-1 sm:flex-initial px-4 py-2 rounded-xl font-semibold text-xs text-center"
                  >
                    View Ticket Pass
                  </Link>
                  <Link
                    to={`/messages/${b.id}`}
                    className="btn-secondary px-3 py-2 rounded-xl text-xs"
                  >
                    Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Driver Rides */}
      <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-lavender-400" /> My Published Driving Corridors
          </h3>
          <Link to="/dashboard/rides" className="text-xs text-lavender-400 hover:text-lavender-300 font-semibold flex items-center gap-1">
            Manage Rides <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activePublishedRides.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs space-y-2">
            <p>You have no active rides published.</p>
            <Link to="/rides/new" className="btn-primary inline-block px-4 py-2 rounded-xl font-semibold text-xs mt-2">
              Publish a New Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activePublishedRides.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{r.origin_text} ➔ {r.destination_text}</span>
                    <span className="bg-lavender-500/15 text-lavender-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">
                    {new Date(r.departure_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} • {r.seats_available} seats left • ₹{r.price_per_seat}
                  </p>
                </div>

                <Link
                  to="/dashboard/rides"
                  className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Driver Controls
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
