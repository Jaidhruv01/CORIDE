import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building,
  Smartphone,
  Sparkles,
  ArrowRight,
  Banknote,
  Coins,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { Booking } from '../types';

export const CheckoutPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'card' | 'netbanking'>('cash');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [upiId, setUpiId] = useState('user@okaxis');

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get<Booking>(`/bookings/${bookingId}`);
        setBooking(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchBooking();
  }, [bookingId]);

  const handleCompletePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // 1. Verify or register payment on server
      await api.post('/payments/verify', {
        booking_id: bookingId,
        provider: paymentMethod,
        provider_payment_id: paymentMethod === 'cash' ? `cash_${booking?.booking_code}` : `pay_${paymentMethod}_${Date.now()}`,
        provider_signature: paymentMethod === 'cash' ? 'cash_on_pickup_agreed' : 'simulated_sig_success',
      });

      // 2. Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#9B7EDE', '#6F55B7', '#10B981', '#F59E0B', '#FFFFFF'],
      });

      // 3. Redirect to confirmed boarding pass
      setTimeout(() => {
        navigate(`/booking/${bookingId}`, { replace: true });
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-lavender-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Preparing secure checkout...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error || 'Booking session not found'}
        </div>
      </div>
    );
  }

  const ride = booking.ride;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" /> Secure Seat Reservation & Checkout
        </div>
        <h1 className="font-display font-bold text-3xl text-white">Complete Seat Reservation</h1>
        <p className="text-xs text-gray-400">Select your preferred payment method (Cash to Driver or Online Payment) to secure your seats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Payment Method Drawer (col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
            
            <h3 className="font-display font-bold text-base text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-lavender-400" /> Select Payment Method
              </span>
              <span className="text-[11px] text-emerald-400 font-normal">Cash & Online Supported</span>
            </h3>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-glow-sm ring-1 ring-amber-400/40'
                    : 'bg-[#16131D] border-lavender-500/15 text-gray-400 hover:text-white'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <span className="block text-xs font-bold text-amber-300">Cash</span>
                <span className="text-[10px] text-gray-400">Pay Driver</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-lavender-600/20 border-lavender-400 text-white shadow-glow-sm'
                    : 'bg-[#16131D] border-lavender-500/15 text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="block text-xs font-bold">UPI / QR</span>
                <span className="text-[10px] text-gray-400">GPay, PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-lavender-600/20 border-lavender-400 text-white shadow-glow-sm'
                    : 'bg-[#16131D] border-lavender-500/15 text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-lavender-400" />
                <span className="block text-xs font-bold">Cards</span>
                <span className="text-[10px] text-gray-400">Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'bg-lavender-600/20 border-lavender-400 text-white shadow-glow-sm'
                    : 'bg-[#16131D] border-lavender-500/15 text-gray-400 hover:text-white'
                }`}
              >
                <Building className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <span className="block text-xs font-bold">NetBanking</span>
                <span className="text-[10px] text-gray-400">All Banks</span>
              </button>
            </div>

            {/* Cash Payment Option Form */}
            {paymentMethod === 'cash' && (
              <div className="space-y-4 pt-1 animate-in fade-in text-left">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                      <Banknote className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        Pay Cash to Driver at Pickup
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300">
                          Handover at Car
                        </span>
                      </h4>
                      <p className="text-xs text-amber-200/80">
                        No advance payment needed. Settle ₹{booking.total.toFixed(2)} directly with your driver upon boarding.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-500/20 space-y-2 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Instant digital boarding pass with ride verification QR code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Zero transaction processing fee or convenience charge</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-300/90 font-medium">
                      <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Please carry exact cash of <strong>₹{booking.total.toFixed(0)}</strong> for driver convenience</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* UPI Option Form */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 pt-1 animate-in fade-in text-left">
                <div className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <QrCode className="w-8 h-8 text-lavender-400" />
                    <div>
                      <p className="font-bold text-xs text-white">Instant UPI Dynamic QR</p>
                      <p className="text-[10px] text-gray-400">Scan using GPay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">Zero Convenience Fee</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Or Enter UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobilenumber@upi"
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none focus:border-lavender-400"
                  />
                </div>
              </div>
            )}

            {/* Card Option Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 pt-1 animate-in fade-in text-left">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-300 font-semibold">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-semibold">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-300 font-semibold">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NetBanking Option */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-2 pt-1 animate-in fade-in text-left">
                <label className="text-xs text-gray-300 font-semibold">Select Your Bank</label>
                <select className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none">
                  <option>HDFC Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Notice */}
            <div className="p-3.5 rounded-2xl bg-lavender-500/10 border border-lavender-500/20 text-xs text-lavender-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-lavender-400" />
                {paymentMethod === 'cash' ? 'Cash Handover Guaranteed at Boarding' : 'Secure Online Payment Protection'}
              </span>
              <span className="text-[10px] text-gray-400">{paymentMethod === 'cash' ? 'Pay In Person' : 'Instant Verification'}</span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCompletePayment}
              disabled={processing}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                paymentMethod === 'cash'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/25'
                  : 'btn-primary shadow-glow-md'
              }`}
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {paymentMethod === 'cash' ? <Banknote className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  <span>
                    {paymentMethod === 'cash'
                      ? `Book with Cash to Driver (₹${booking.total.toFixed(2)})`
                      : `Pay ₹${booking.total.toFixed(2)} & Confirm Seats`}
                  </span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Col: Order Summary & Itinerary (col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-5 text-left">
            <h3 className="font-display font-bold text-base text-white">Trip Summary</h3>

            {/* Route & Driver */}
            <div className="space-y-3 pb-4 border-b border-lavender-500/15 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{booking.pickup_stop_name || ride?.origin_text}</span>
                <span className="text-lavender-400 font-bold">➔</span>
                <span className="font-bold text-white text-sm">{booking.drop_stop_name || ride?.destination_text}</span>
              </div>
              <p className="text-gray-400">
                Departure: {ride?.departure_at ? new Date(ride.departure_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Scheduled'}
              </p>
              <div className="flex items-center gap-2 pt-1 text-gray-300">
                <span>Driver: <strong>{ride?.driver?.name || 'Verified Driver'}</strong></span>
                <span>•</span>
                <span className="text-amber-300">★ {ride?.driver?.rating_avg?.toFixed(1) || '5.0'}</span>
              </div>
            </div>

            {/* Seat & Fare Breakdown */}
            <div className="space-y-2.5 text-xs text-gray-300 pb-4 border-b border-lavender-500/15">
              <div className="flex justify-between">
                <span>Reserved Seats</span>
                <span className="font-bold text-white">{booking.seats} Passenger(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal (₹{ride?.price_per_seat} × {booking.seats})</span>
                <span className="font-semibold text-white">₹{booking.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  CoRide Platform & Safety Fee
                  {booking.service_fee === 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      FREE Promo
                    </span>
                  )}
                </span>
                <span className={`font-semibold ${booking.service_fee === 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {booking.service_fee === 0 ? '₹0.00' : `₹${booking.service_fee.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-sm font-bold text-white">
              <span>Total Payable</span>
              <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-lavender-300">
                ₹{booking.total.toFixed(2)}
              </span>
            </div>

            {/* Trust Footer */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Refundable according to cancellation terms</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
