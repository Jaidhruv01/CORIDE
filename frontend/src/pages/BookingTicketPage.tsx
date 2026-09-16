import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Share2,
  XCircle,
  Phone
} from 'lucide-react';
import { api } from '../lib/api';
import { Booking } from '../types';
import { useStore } from '../store/useStore';
import { SOSModal } from '../components/safety/SOSModal';

export const BookingTicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<Booking>(`/bookings/${id}`);
      setBooking(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load booking ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      await api.post(`/bookings/${id}/cancel`, {
        cancellation_reason: cancelReason || 'Cancelled by passenger',
      });
      setShowCancelModal(false);
      fetchBooking();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-lavender-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Retrieving your digital ticket pass...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error || 'Booking ticket not found'}
        </div>
      </div>
    );
  }

  const ride = booking.ride;
  const departureDate = ride?.departure_at ? new Date(ride.departure_at) : new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">Digital Boarding Pass</h1>
          <p className="text-xs text-gray-400">Present this QR ticket to your driver at the pickup point</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSOS(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Emergency SOS
          </button>
        </div>
      </div>

      {/* Main Boarding Pass Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-lavender-500/30 shadow-2xl">
        
        {/* Top Header of Ticket */}
        <div className="bg-gradient-to-r from-lavender-700 to-lavender-500 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 text-white">
          <div className="space-y-1 text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-lavender-200">
              CoRide Confirmed Pass
            </span>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-black text-2xl sm:text-3xl tracking-wider">
                {booking.booking_code}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              booking.status === 'CONFIRMED'
                ? 'bg-emerald-500 text-white shadow-sm'
                : booking.status === 'COMPLETED'
                ? 'bg-blue-500 text-white'
                : booking.status === 'CANCELLED' || booking.status === 'REJECTED'
                ? 'bg-rose-500 text-white'
                : 'bg-amber-500 text-white animate-pulse'
            }`}>
              ● {booking.status === 'PENDING' ? 'PENDING DRIVER APPROVAL' : booking.status === 'REJECTED' ? 'DECLINED BY DRIVER' : booking.status}
            </span>
          </div>
        </div>

        {/* Status Alert if Pending Driver Approval */}
        {booking.status === 'PENDING' && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 p-3.5 text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Booking Request Pending: The driver has been notified to accept or decline your seat reservation.</span>
          </div>
        )}

        {/* Status Alert if Declined */}
        {booking.status === 'REJECTED' && (
          <div className="bg-rose-500/20 border-b border-rose-500/30 p-3.5 text-center text-xs font-bold text-rose-300 flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Booking Declined: The driver was unable to accept this booking. Any payment amount has been fully refunded.</span>
          </div>
        )}

        {/* Status Alert if Live Ride */}
        {ride?.driver_arrived_at && booking.status === 'CONFIRMED' && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 p-3 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 animate-pulse">
            <Car className="w-4 h-4" /> Driver has arrived at the pickup location!
          </div>
        )}

        {ride?.status === 'IN_PROGRESS' && (
          <div className="bg-lavender-500/20 border-b border-lavender-500/30 p-3 text-center text-xs font-bold text-lavender-300 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Trip is currently in progress. Enjoy your ride!
          </div>
        )}


        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6 text-left">
          
          {/* Route Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-lavender-500/15">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Boarding Point
              </span>
              <p className="font-bold text-white text-base sm:text-lg">
                {booking.pickup_stop_name || ride?.origin_text}
              </p>
              <p className="text-xs text-lavender-300">
                Departure: {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center sm:justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Drop-off Point
              </span>
              <p className="font-bold text-white text-base sm:text-lg">
                {booking.drop_stop_name || ride?.destination_text}
              </p>
              <p className="text-xs text-gray-400">
                Date: {departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Passenger & Driver Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-lavender-500/15 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block font-medium">Passenger</span>
              <p className="font-bold text-white text-sm">{user?.name || booking.rider?.name}</p>
              <span className="text-gray-400">{booking.seats} Seat(s) Reserved</span>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 block font-medium">Driver & Vehicle</span>
              <p className="font-bold text-white text-sm">{ride?.driver?.name || 'Verified Driver'}</p>
              <span className="text-lavender-300 font-mono font-semibold">
                {ride?.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model} • ${ride.vehicle.registration_no}` : 'Standard 4-Seater'}
              </span>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-gray-400 block font-medium">Payment & Fare</span>
              <p className="font-bold text-white text-sm">₹{booking.total.toFixed(2)}</p>
              {booking.payment?.provider === 'cash' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                  💵 Pay Cash to Driver
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold text-[11px]">
                  ✓ Paid Online ({booking.payment?.provider?.toUpperCase() || 'RAZORPAY'})
                </span>
              )}
            </div>
          </div>

          {/* Bottom Row: Simulated QR Code & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            
            {/* QR Code Simulation */}
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-white text-black shadow-md">
                <QrCode className="w-20 h-20" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-bold text-white block">Scan at Pickup</span>
                <p className="text-[11px] text-gray-400 max-w-[200px]">
                  {booking.payment?.provider === 'cash'
                    ? `Driver will verify code (${booking.booking_code}). Please have ₹${booking.total.toFixed(0)} in cash ready at boarding.`
                    : `Driver will scan or verify your code (${booking.booking_code}) before trip departure.`}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <Link
                to={`/messages/${booking.id}`}
                className="btn-primary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Driver</span>
              </Link>

              {booking.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 border border-white/5 text-xs font-semibold transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#1E1B26] border border-lavender-500/30 shadow-2xl p-6 text-white space-y-4 text-left">
            <h3 className="font-display font-bold text-xl text-white">Cancel Booking?</h3>
            <p className="text-xs text-gray-300">
              Are you sure you want to cancel your seat reservation for <strong>{booking.booking_code}</strong>?
            </p>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-lavender-200 space-y-1">
              <span className="font-bold block">Refund Estimation:</span>
              <p>Full refund of ₹{booking.total.toFixed(2)} will be initiated automatically to your original payment method.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-400">Reason for cancellation (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Change of schedule, booked another ride..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      <SOSModal
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
        rideId={ride?.id}
        bookingId={booking.id}
      />

    </div>
  );
};
