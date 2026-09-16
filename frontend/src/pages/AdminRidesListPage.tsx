import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Clock, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Ride } from '../types';

export const AdminRidesListPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      try {
        const data = await api.get<Ride[]>('/admin/rides');
        setRides(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-6 text-left">
      <div className="pb-4 border-b border-purple-500/15">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <Car className="w-6 h-6 text-purple-400" /> Platform Published Rides
        </h2>
        <p className="text-xs text-gray-400">Inspect all active and historical driver ride schedules across corridors</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading rides...</div>
      ) : rides.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">No rides on platform.</div>
      ) : (
        <div className="space-y-3">
          {rides.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl bg-[#16131D] border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{r.origin_text} ➔ {r.destination_text}</span>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {r.status}
                  </span>
                </div>
                <p className="text-gray-400">
                  Driver: <strong>{r.driver?.name}</strong> • Departure: {new Date(r.departure_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <p className="text-gray-400">
                  Seats: {r.seats_available}/{r.seats_total} left • Fare: ₹{r.price_per_seat}
                </p>
              </div>

              <Link
                to={`/rides/${r.id}`}
                className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <span>View Ride</span> <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
