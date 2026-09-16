import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Play,
  Navigation,
  Sparkles,
  AlertTriangle,
  MessageCircle,
  Plus,
  ShieldCheck,
  X,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { Ride, Booking } from '../types';
import { formatRideDate } from '../lib/dateUtils';

export const DashboardRidesPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [driverRequests, setDriverRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [manifestRide, setManifestRide] = useState<Ride | null>(null);
  const [manifest, setManifest] = useState<Booking[]>([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ridesData, requestsData] = await Promise.all([
        api.get<Ride[]>('/rides/driver/my-rides'),
        api.get<Booking[]>('/bookings/driver/requests').catch(() => [] as Booking[]),
      ]);
      setRides(ridesData);
      setDriverRequests(requestsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotificationToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    setActionLoading(`accept-${bookingId}`);
    try {
      await api.post(`/bookings/${bookingId}/accept`);
      showNotificationToast('Booking accepted! Rider has been notified and seats are confirmed.');
      await fetchData();
      if (manifestRide) {
        handleOpenManifest(manifestRide);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to accept booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to decline this booking request? The reserved seats will be returned to your ride.')) {
      return;
    }
    setActionLoading(`reject-${bookingId}`);
    try {
      await api.post(`/bookings/${bookingId}/reject`, { reason: 'Declined by driver' });
      showNotificationToast('Booking request declined. Seats have been restored to your ride.');
      await fetchData();
      if (manifestRide) {
        handleOpenManifest(manifestRide);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to decline booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkArrived = async (rideId: string) => {
    setActionLoading(rideId);
    try {
      await api.post(`/rides/${rideId}/arrive`);
      showNotificationToast('Marked arrived! Passengers have been notified.');
      fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartRide = async (rideId: string) => {
    setActionLoading(rideId);
    try {
      await api.post(`/rides/${rideId}/start`);
      showNotificationToast('Trip started! Have a safe and pleasant journey.');
      fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to start ride');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteRide = async (rideId: string) => {
    setActionLoading(rideId);
    try {
      await api.post(`/rides/${rideId}/complete`);
      showNotificationToast('Trip completed! Payout has been released to your balance.');
      fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to complete ride');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenManifest = async (ride: Ride) => {
    setManifestRide(ride);
    setManifestLoading(true);
    try {
      const data = await api.get<Booking[]>(`/rides/${ride.id}/manifest`);
      setManifest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setManifestLoading(false);
    }
  };

  const pendingRequests = driverRequests.filter((b) => b.status === 'PENDING');

  return (
    <div className="space-y-6 text-left">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500/90 backdrop-blur-md text-white border border-emerald-400/30 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-lavender-500/15">
          <div>
            <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Car className="w-6 h-6 text-lavender-400" /> Driver Rides & Passenger Manifest
            </h2>
            <p className="text-xs text-gray-400">
              Manage booking requests, accept/reject passengers, and control trip state transitions
            </p>
          </div>

          <Link
            to="/rides/new"
            className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-glow-sm"
          >
            <Plus className="w-4 h-4" /> Publish New Ride
          </Link>
        </div>

        {/* Section 1: Pending Rider Booking Requests (Accept / Reject) */}
        {pendingRequests.length > 0 && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-lavender-900/20 to-purple-900/30 border border-purple-500/30 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <h3 className="font-display font-bold text-base text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-300" /> Incoming Booking Requests ({pendingRequests.length})
                </h3>
              </div>
              <span className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Action Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => {
                const isAccepting = actionLoading === `accept-${req.id}`;
                const isRejecting = actionLoading === `reject-${req.id}`;

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#16131D]/90 border border-purple-500/25 space-y-3 shadow-md text-xs"
                  >
                    {/* Rider Info Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={req.rider?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.rider?.name || 'Rider')}&background=6F55B7&color=fff`}
                          alt={req.rider?.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-lavender-500/30"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{req.rider?.name || 'Passenger'}</p>
                          <p className="text-[10px] text-gray-400">
                            ★ {req.rider?.rating_avg?.toFixed(1) || '5.0'} • {req.rider?.trips_count || 0} completed trips
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-lavender-500/20 text-lavender-300 border border-lavender-500/30">
                          {req.seats} Seat{req.seats > 1 ? 's' : ''} (₹{req.total})
                        </span>
                        {req.payment?.provider === 'cash' ? (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                            💵 Collect Cash
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25">
                            ✓ Online Paid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Corridor & Route Info */}
                    <div className="p-2.5 rounded-xl bg-white/5 space-y-1 text-[11px]">
                      <p className="text-gray-300 font-medium truncate">
                        <strong className="text-white">Route:</strong> {req.ride?.origin_text} ➔ {req.ride?.destination_text}
                      </p>
                      <p className="text-gray-400 truncate">
                        <strong className="text-lavender-300">Boarding:</strong> {req.pickup_stop_name || req.ride?.origin_text}
                      </p>
                    </div>

                    {/* Action Buttons: Accept or Reject */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isAccepting || isRejecting}
                        onClick={() => handleAcceptBooking(req.id)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAccepting ? 'Accepting...' : 'Accept Request'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isAccepting || isRejecting}
                        onClick={() => handleRejectBooking(req.id)}
                        className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{isRejecting ? 'Declining...' : 'Decline'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Published Rides List */}
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">Loading published rides...</div>
        ) : rides.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs space-y-3">
            <p>You haven't published any rides yet.</p>
            <Link to="/rides/new" className="btn-primary inline-block px-4 py-2 rounded-xl text-xs font-semibold">
              Publish Your First Commute
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => {
              const { formattedDate, formattedTime, relativeBadge } = formatRideDate(ride.departure_at);
              const isCompleted = ride.status === 'COMPLETED';
              const isCancelled = ride.status === 'CANCELLED';
              const isInProgress = ride.status === 'IN_PROGRESS';

              return (
                <div
                  key={ride.id}
                  className="p-5 rounded-2xl bg-[#16131D] border border-lavender-500/20 space-y-4"
                >
                  {/* Header info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {ride.origin_text} ➔ {ride.destination_text}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {relativeBadge && (
                        <span className="bg-lavender-500/20 text-lavender-300 border border-lavender-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {relativeBadge}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        ride.status === 'PUBLISHED'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : ride.status === 'IN_PROGRESS'
                          ? 'bg-lavender-500/20 text-lavender-300 border border-lavender-500/40 animate-pulse'
                          : ride.status === 'COMPLETED'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        ● {ride.status}
                      </span>
                    </div>
                  </div>

                  {/* Timing & Seats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                    <div>
                      <span className="text-gray-400 block font-medium">Departure Schedule</span>
                      <p className="font-semibold text-white">
                        {formattedDate} at {formattedTime}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Seats Inventory</span>
                      <p className="font-semibold text-white">
                        {ride.seats_available} of {ride.seats_total} seats available (₹{ride.price_per_seat}/seat)
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-gray-400 block font-medium">Vehicle</span>
                      <p className="font-semibold text-lavender-300 font-mono">
                        {ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : '4-Wheeler'}
                      </p>
                    </div>
                  </div>

                  {/* Live Trip Lifecycle Triggers Bar */}
                  <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Passenger Manifest & Requests */}
                      <button
                        type="button"
                        onClick={() => handleOpenManifest(ride)}
                        className="btn-secondary px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 hover:bg-lavender-500/20"
                      >
                        <Users className="w-3.5 h-3.5 text-lavender-400" /> Manage Passengers & Manifest
                      </button>

                      {/* Step 1: Mark Arrived */}
                      {!ride.driver_arrived_at && ride.status === 'PUBLISHED' && (
                        <button
                          type="button"
                          onClick={() => handleMarkArrived(ride.id)}
                          disabled={actionLoading === ride.id}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-500/30 flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Mark Driver Arrived
                        </button>
                      )}

                      {/* Step 2: Start Trip */}
                      {ride.status === 'PUBLISHED' && (
                        <button
                          type="button"
                          onClick={() => handleStartRide(ride.id)}
                          disabled={actionLoading === ride.id}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold hover:bg-emerald-500/30 flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" /> Start Trip Now
                        </button>
                      )}

                      {/* Step 3: Complete Trip */}
                      {isInProgress && (
                        <button
                          type="button"
                          onClick={() => handleCompleteRide(ride.id)}
                          disabled={actionLoading === ride.id}
                          className="btn-primary px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-glow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete Trip & Release Payout
                        </button>
                      )}

                      {isCompleted && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed Successfully
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/rides/${ride.id}`}
                      className="text-lavender-400 hover:text-lavender-300 font-semibold"
                    >
                      Public Ride Page ➔
                    </Link>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Passenger Manifest Modal with Accept / Reject Controls */}
      {manifestRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#1E1B26] border border-lavender-500/30 shadow-2xl p-6 text-white space-y-5 text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-lavender-500/15">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-lavender-400" /> Passenger Manifest & Booking Requests
                </h3>
                <p className="text-[11px] text-gray-400">
                  {manifestRide.origin_text} ➔ {manifestRide.destination_text}
                </p>
              </div>
              <button
                onClick={() => setManifestRide(null)}
                className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {manifestLoading ? (
              <div className="py-10 text-center text-xs text-gray-400">Loading passenger roster...</div>
            ) : manifest.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-gray-500" />
                <p>No passenger bookings registered on this ride yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {manifest.map((b) => {
                  const isPending = b.status === 'PENDING';
                  const isConfirmed = b.status === 'CONFIRMED' || b.status === 'COMPLETED';
                  const isRejected = b.status === 'REJECTED' || b.status === 'CANCELLED';

                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition-all text-xs space-y-3 ${
                        isPending
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : isConfirmed
                          ? 'bg-[#16131D] border-lavender-500/15'
                          : 'bg-white/5 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        
                        {/* Passenger Details */}
                        <div className="flex items-center space-x-3">
                          <img
                            src={b.rider?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.rider?.name || 'Rider')}&background=6F55B7&color=fff`}
                            alt={b.rider?.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-lavender-500/30"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{b.rider?.name || 'Passenger'}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : isConfirmed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                ● {b.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span>{b.seats} Seat(s) • Total: ₹{b.total}</span>
                              <span>•</span>
                              <span>Code: <strong className="text-lavender-300 font-mono">{b.booking_code}</strong></span>
                              <span>•</span>
                              {b.payment?.provider === 'cash' ? (
                                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                                  💵 Cash to Collect
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/25">
                                  ✓ Online Paid
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons based on status */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading === `accept-${b.id}`}
                                onClick={() => handleAcceptBooking(b.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === `reject-${b.id}`}
                                onClick={() => handleRejectBooking(b.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Decline
                              </button>
                            </>
                          )}

                          {isConfirmed && (
                            <>
                              <Link
                                to={`/messages/${b.id}`}
                                className="btn-primary px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Chat
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleRejectBooking(b.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 text-[11px] transition-all"
                                title="Cancel passenger seat"
                              >
                                Cancel Seat
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pickup & Drop Points */}
                      <div className="text-[11px] text-gray-400 pt-1 border-t border-white/5 flex flex-wrap justify-between gap-2">
                        <span>Boarding Point: <strong className="text-gray-200">{b.pickup_stop_name}</strong></span>
                        <span>Drop Location: <strong className="text-gray-200">{b.drop_stop_name}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setManifestRide(null)}
                className="btn-secondary px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Close Roster
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
