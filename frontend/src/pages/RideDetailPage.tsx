import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../lib/api';
import type { Ride, Review } from '../types';
import { useStore } from '../store/useStore';
import { InteractiveRouteMap } from '../components/maps/InteractiveRouteMap';

export const RideDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useStore();

  const [ride, setRide] = useState<Ride | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedDrop, setSelectedDrop] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRideDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get<Ride>(`/rides/${id}`);
        setRide(data);
        setSelectedPickup(data.origin_text);
        setSelectedDrop(data.destination_text);

        if (data.driver_id) {
          const revs = await api.get<Review[]>(`/users/${data.driver_id}/reviews`).catch(() => []);
          setReviews(revs);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRideDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-lavender-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Loading ride details...</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error || 'Ride not found'}
        </div>
        <Link to="/search" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold">
          Back to Search
        </Link>
      </div>
    );
  }

  const departureDate = new Date(ride.departure_at);
  const driver = ride.driver;
  const vehicle = ride.vehicle;

  // Fare calculations (0% platform fee promotional launch)
  const subtotal = ride.price_per_seat * seatsToBook;
  const serviceFee = 0; // Promotional: 100% Free Platform Fee
  const total = subtotal + serviceFee;

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/rides/${ride.id}` } } });
      return;
    }

    if (ride.driver_id === user.id) {
      alert("You cannot book seats on your own published ride.");
      return;
    }

    setBookingLoading(true);
    try {
      const booking = await api.post(`/rides/${ride.id}/bookings`, {
        seats: seatsToBook,
        pickup_stop_name: selectedPickup,
        drop_stop_name: selectedDrop,
      });

      // Direct to checkout & ticket confirmation
      navigate(`/checkout/${booking.id}`);
    } catch (err: any) {
      alert(err?.message || 'Failed to reserve seats');
    } finally {
      setBookingLoading(false);
    }
  };

  const mapOrigin = {
    name: ride.origin_text,
    lat: ride.origin_lat || 12.9716,
    lng: ride.origin_lng || 77.5946,
  };
  const mapDest = {
    name: ride.destination_text,
    lat: ride.destination_lat || 12.2958,
    lng: ride.destination_lng || 76.6394,
  };
  const mapStops = (ride.stops || []).map((s) => ({
    name: s.place_name,
    lat: s.lat,
    lng: s.lng,
    order: s.stop_order,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb Nav */}
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <Link to="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/search" className="hover:text-white">Rides</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-lavender-300 font-medium truncate">{ride.origin_text} ➔ {ride.destination_text}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Trip Itinerary & Driver / Vehicle details (col 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Route Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
            
            {/* Header: Date and badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-lavender-500/15">
              <div className="flex items-center space-x-2 text-sm text-lavender-200">
                <Calendar className="w-4 h-4 text-lavender-400" />
                <span className="font-bold text-white">
                  {departureDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                {ride.booking_mode === 'INSTANT' && (
                  <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> Instant Confirmation
                  </span>
                )}
                <span className="bg-lavender-500/15 text-lavender-300 border border-lavender-500/30 px-3 py-1 rounded-full font-semibold">
                  {ride.seats_available} seats remaining
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-8 space-y-6">
              <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-400 via-lavender-400 to-rose-400" />

              {/* Origin */}
              <div className="relative">
                <span className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-[#1E1B26]" />
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">{ride.origin_text}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Pickup Location / Meeting Point</p>
                  </div>
                  <span className="text-xs font-mono bg-lavender-500/20 text-lavender-300 px-2 py-1 rounded-md">
                    {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Intermediate Stops */}
              {ride.stops && ride.stops.map((stop, idx) => (
                <div key={stop.id || idx} className="relative">
                  <span className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-lavender-400 ring-4 ring-[#1E1B26]" />
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h4 className="font-semibold text-lavender-200 text-sm">Stop {idx + 1}: {stop.place_name}</h4>
                      <p className="text-[11px] text-gray-400">Intermediate Passenger Stop</p>
                    </div>
                    {stop.planned_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(stop.planned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="relative">
                <span className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-rose-400 ring-4 ring-[#1E1B26]" />
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">{ride.destination_text}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Final Drop Location</p>
                  </div>
                  {ride.estimated_arrival && (
                    <span className="text-xs font-mono bg-lavender-500/20 text-lavender-300 px-2 py-1 rounded-md">
                      {new Date(ride.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ride Notes */}
            {ride.notes && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 leading-relaxed">
                <span className="font-bold text-lavender-300 block mb-1">Driver's Trip Note:</span>
                "{ride.notes}"
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Route Map & Stopovers</h3>
            <InteractiveRouteMap
              origin={mapOrigin}
              destination={mapDest}
              stops={mapStops}
              height="320px"
            />
          </div>

          {/* Driver & Vehicle Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Driver Profile */}
            <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider text-lavender-300">About Your Driver</h4>
              
              <div className="flex items-start space-x-4">
                <img
                  src={driver?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver?.name || 'Driver')}&background=6F55B7&color=fff`}
                  alt={driver?.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-lavender-500/30 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-base">{driver?.name}</h3>
                    <span title="Verified ID">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="flex items-center text-amber-300 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-300 mr-1" />
                      {driver?.rating_avg ? driver.rating_avg.toFixed(1) : '5.0'} / 5.0
                    </span>
                    <span>•</span>
                    <span>{driver?.trips_count || 0} rides completed</span>
                  </div>
                </div>
              </div>

              {driver?.bio && (
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{driver.bio}"
                </p>
              )}

              <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px] text-gray-400">
                <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-emerald-300">
                  ✓ Government ID Verified
                </span>
                <span className="bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-emerald-300">
                  ✓ Phone Verified
                </span>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider text-lavender-300">Vehicle & Amenities</h4>
              
              {vehicle ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Vehicle Model:</span>
                    <span className="font-bold text-white">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Color:</span>
                    <span className="text-gray-200">{vehicle.color}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Registration Plate:</span>
                    <span className="font-mono bg-[#16131D] px-2 py-0.5 rounded border border-lavender-500/20 text-lavender-300 font-bold">
                      {vehicle.registration_no}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">AC Available:</span>
                    <span className={vehicle.ac ? "text-emerald-400 font-semibold" : "text-gray-400"}>
                      {vehicle.ac ? "Yes, Climate Controlled" : "Non-AC"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Luggage Allowance:</span>
                    <span className="text-lavender-200 font-medium">{vehicle.luggage_capacity} Bags</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Standard verified 4-wheeler vehicle.</p>
              )}

              {/* Preferences Strip */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[11px]">
                <span className="bg-[#16131D] px-2.5 py-1 rounded-lg border border-lavender-500/20 text-gray-300">
                  🚭 No Smoking
                </span>
                {ride.pets_allowed && (
                  <span className="bg-[#16131D] px-2.5 py-1 rounded-lg border border-lavender-500/20 text-amber-300">
                    🐾 Pets Allowed
                  </span>
                )}
                {ride.women_only && (
                  <span className="bg-pink-500/15 px-2.5 py-1 rounded-lg border border-pink-500/30 text-pink-300">
                    🌸 Women Only
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Community Reviews Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-300 fill-amber-300" /> Driver Reviews & Ratings
              </h3>
              <span className="text-xs text-gray-400">{reviews.length} total reviews</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                This driver maintains a stellar 5.0 star trust rating across all completed corridor trips.
              </p>
            ) : (
              <div className="space-y-4 divide-y divide-white/5">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{rev.reviewer?.name || 'Verified Passenger'}</span>
                      <div className="flex items-center text-amber-300">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-300" />
                        ))}
                      </div>
                    </div>
                    {rev.text && <p className="text-gray-300 italic">"{rev.text}"</p>}
                    <span className="text-[10px] text-gray-500 block">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Sticky Booking & Price Calculator Box (col 4) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/30 shadow-2xl space-y-6">
            
            <div className="flex items-baseline justify-between pb-4 border-b border-lavender-500/15">
              <div>
                <span className="text-xs text-gray-400 block uppercase tracking-wider">Contribution</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-lavender-200 to-lavender-400">
                    ₹{ride.price_per_seat}
                  </span>
                  <span className="text-xs text-gray-400">/ seat</span>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {ride.seats_available} available
              </span>
            </div>

            {/* Seat Quantity Selector */}
            <div className="space-y-2 text-left">
              <label className="text-xs text-gray-300 font-semibold flex items-center justify-between">
                <span>Select Number of Seats</span>
                <span className="text-lavender-400 text-[11px] font-normal">Max {ride.seats_available}</span>
              </label>
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4].filter(n => n <= ride.seats_available).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSeatsToBook(num)}
                    className={`flex-1 py-3 rounded-2xl font-bold text-sm border transition-all ${
                      seatsToBook === num
                        ? 'bg-lavender-600 text-white border-lavender-400 shadow-glow-sm'
                        : 'bg-[#16131D] text-gray-400 border-lavender-500/20 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Pickup & Drop selection if stops exist */}
            {ride.stops && ride.stops.length > 0 && (
              <div className="space-y-3 text-left pt-2 border-t border-white/5">
                <div>
                  <label className="text-xs text-gray-300 font-semibold block mb-1">Boarding Point</label>
                  <select
                    value={selectedPickup}
                    onChange={(e) => setSelectedPickup(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
                  >
                    <option value={ride.origin_text}>{ride.origin_text} (Origin)</option>
                    {ride.stops.filter(s => s.pickup_allowed).map(s => (
                      <option key={s.id} value={s.place_name}>{s.place_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 font-semibold block mb-1">Drop-off Point</label>
                  <select
                    value={selectedDrop}
                    onChange={(e) => setSelectedDrop(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
                  >
                    {ride.stops.filter(s => s.drop_allowed).map(s => (
                      <option key={s.id} value={s.place_name}>{s.place_name}</option>
                    ))}
                    <option value={ride.destination_text}>{ride.destination_text} (Destination)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-lavender-500/15 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Seat Price (₹{ride.price_per_seat} × {seatsToBook})</span>
                <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center gap-1.5">
                  Platform & Safety Fee
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    FREE (100% OFF)
                  </span>
                  <span title="Includes 24x7 safety response, OTP verification & payment protection - Waived during launch">
                    <Info className="w-3 h-3 text-lavender-400" />
                  </span>
                </span>
                <span className="font-semibold text-emerald-400">₹0.00</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-xl text-lavender-300">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleBookNow}
              disabled={bookingLoading || ride.seats_available === 0}
              className="btn-primary w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-glow-md"
            >
              {bookingLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Reserve {seatsToBook} Seat{seatsToBook > 1 ? 's' : ''}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Cancellation Policy note */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-gray-400 leading-relaxed space-y-1">
              <span className="font-bold text-lavender-300 block">Cancellation Policy:</span>
              <p>• 100% full refund if cancelled up to 2 hours before departure.</p>
              <p>• 50% refund if cancelled within 2 hours of departure.</p>
              <p>• 100% full refund if driver cancels for any reason.</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
