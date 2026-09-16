import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Calendar,
  Clock,
  Car,
  Star,
  MessageCircle,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import { Booking } from '../types';

export const DashboardTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Review Modal State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await api.get<Booking[]>('/bookings/my/trips');
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((t) => {
    if (filterTab === 'upcoming') return t.status === 'CONFIRMED' || t.status === 'PENDING';
    if (filterTab === 'completed') return t.status === 'COMPLETED';
    if (filterTab === 'cancelled') return t.status === 'CANCELLED' || t.status === 'REJECTED';
    return true;
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    setSubmittingReview(true);
    try {
      await api.post(`/bookings/${selectedBookingForReview.id}/reviews`, {
        rating,
        text: reviewText.trim(),
        punctuality_rating: 5,
        driving_rating: 5,
        cleanliness_rating: 5,
        communication_rating: 5,
      });

      setReviewSuccess(true);
      setTimeout(() => {
        setSelectedBookingForReview(null);
        setReviewSuccess(false);
        setReviewText('');
        fetchTrips();
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6 text-left">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-lavender-500/15">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-lavender-400" /> My Rider Bookings
          </h2>
          <p className="text-xs text-gray-400">View upcoming ticket passes, chat with drivers, or leave reviews</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-[#16131D] p-1 rounded-xl border border-lavender-500/20 text-xs">
          {(['upcoming', 'completed', 'cancelled', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                filterTab === tab
                  ? 'bg-lavender-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-xs">Loading bookings...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs space-y-3">
          <p>No bookings found in this category.</p>
          <Link to="/search" className="btn-primary inline-block px-4 py-2 rounded-xl text-xs font-semibold">
            Search Available Rides
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((booking) => {
            const ride = booking.ride;
            const depDate = ride?.departure_at ? new Date(ride.departure_at) : new Date();

            return (
              <div
                key={booking.id}
                className="p-5 rounded-2xl bg-[#16131D] border border-lavender-500/20 space-y-4"
              >
                {/* Top Row: Code & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white bg-lavender-500/20 px-2.5 py-1 rounded-lg border border-lavender-500/30">
                      {booking.booking_code}
                    </span>
                    <span className="text-gray-400">
                      {depDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {depDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : booking.status === 'COMPLETED'
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      : booking.status === 'CANCELLED'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : booking.status === 'REJECTED'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}>
                    ● {booking.status === 'PENDING' ? 'Awaiting Driver Approval' : booking.status === 'REJECTED' ? 'Declined by Driver' : booking.status}
                  </span>

                </div>

                {/* Route & Driver Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-400 block font-medium">Route Segment</span>
                    <p className="font-bold text-white text-sm">
                      {booking.pickup_stop_name || ride?.origin_text} ➔ {booking.drop_stop_name || ride?.destination_text}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-400 block font-medium">Driver</span>
                    <p className="font-semibold text-white">{ride?.driver?.name || 'Verified Driver'}</p>
                    <span className="text-gray-400">
                      {ride?.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : '4-Wheeler'}
                    </span>
                  </div>

                  <div className="space-y-1 md:text-right">
                    <span className="text-gray-400 block font-medium">Seats & Fare</span>
                    <p className="font-bold text-lavender-300 text-sm">₹{booking.total.toFixed(2)}</p>
                    <div className="flex items-center md:justify-end gap-1.5">
                      <span className="text-gray-400">{booking.seats} Seat(s)</span>
                      {booking.payment?.provider === 'cash' ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                          💵 Cash to Driver
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25">
                          ✓ Online
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/booking/${booking.id}`}
                      className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" /> View Ticket Pass
                    </Link>

                    <Link
                      to={`/messages/${booking.id}`}
                      className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                    </Link>
                  </div>

                  {booking.status === 'COMPLETED' && (
                    <button
                      onClick={() => setSelectedBookingForReview(booking)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20 flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-300" /> Rate & Review Driver
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#1E1B26] border border-lavender-500/30 shadow-2xl p-6 text-white space-y-4">
            <button
              onClick={() => setSelectedBookingForReview(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {!reviewSuccess ? (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-left">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Rate Your Experience</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    How was your trip with {selectedBookingForReview.ride?.driver?.name || 'the driver'}?
                  </p>
                </div>

                {/* Star Selector */}
                <div className="flex items-center justify-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          s <= rating ? 'text-amber-300 fill-amber-300' : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Written Feedback (Optional)</label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Punctual, friendly conversation, safe driving on expressway..."
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none focus:border-lavender-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary w-full py-3 rounded-xl font-bold text-xs"
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit 5-Star Review'}
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Thank You for Your Feedback!</h4>
                <p className="text-xs text-gray-400">Your review helps keep the CoRide community safe and trusted.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
