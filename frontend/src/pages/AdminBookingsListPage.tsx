import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, QrCode, MessageCircle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Booking } from '../types';

export const AdminBookingsListPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await api.get<Booking[]>('/admin/bookings');
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-6 text-left">
      <div className="pb-4 border-b border-purple-500/15">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-purple-400" /> Platform Confirmed Bookings
        </h2>
        <p className="text-xs text-gray-400">Master record of all passenger seat reservations and active passes</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">No bookings found on platform.</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-[#16131D] border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded">
                    {b.booking_code}
                  </span>
                  <span className="font-bold text-white">{b.pickup_stop_name} ➔ {b.drop_stop_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.status === 'CONFIRMED'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : b.status === 'COMPLETED'
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'bg-rose-500/15 text-rose-300'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-gray-400">
                  Rider: <strong>{b.rider?.name}</strong> • Seats: {b.seats} • Total: ₹{b.total}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  to={`/booking/${b.id}`}
                  className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" /> Pass
                </Link>
                <Link
                  to={`/messages/${b.id}`}
                  className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
