import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  DollarSign,
  Wind,
  Luggage,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { Vehicle } from '../types';
import { useStore } from '../store/useStore';
import { InteractiveRouteMap } from '../components/maps/InteractiveRouteMap';
import {
  getTodayISO,
  getTomorrowISO,
  getDayAfterTomorrowISO,
  getUpcomingWeekendISO,
  formatFriendlyDate
} from '../lib/dateUtils';

interface StopItem {
  place_name: string;
  lat: number;
  lng: number;
  price_from_origin: number;
}

export const PublishRidePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();
  const dayAfterISO = getDayAfterTomorrowISO();
  const weekendISO = getUpcomingWeekendISO();

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Route
  const [origin, setOrigin] = useState('Bangalore (Koramangala)');
  const [originLat, setOriginLat] = useState(12.9352);
  const [originLng, setOriginLng] = useState(77.6245);
  const [destination, setDestination] = useState('Mysore (Suburban Bus Stand)');
  const [destLat, setDestLat] = useState(12.3072);
  const [destLng, setDestLng] = useState(76.6558);
  const [stops, setStops] = useState<StopItem[]>([]);

  // Step 2: Schedule
  const [departureDate, setDepartureDate] = useState(tomorrowISO);
  const [departureTime, setDepartureTime] = useState('08:30');
  const [estimatedDurationHours, setEstimatedDurationHours] = useState(3.5);


  // Step 3: Vehicle & Pricing
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [seatsTotal, setSeatsTotal] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState(320);
  const [bookingMode, setBookingMode] = useState<'INSTANT' | 'APPROVAL'>('INSTANT');

  // Step 4: Preferences & Notes
  const [ac, setAc] = useState(true);
  const [luggageSize, setLuggageSize] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>('MEDIUM');
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [notes, setNotes] = useState('Clean car, smooth highway commute. Happy to stop briefly for coffee.');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/rides/new' } } });
      return;
    }

    // Fetch user's registered vehicles
    const fetchVehicles = async () => {
      try {
        const data = await api.get<Vehicle[]>('/vehicles');
        setVehicles(data);
        if (data.length > 0) {
          setSelectedVehicleId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchVehicles();
  }, [user]);

  const addStop = () => {
    setStops([...stops, { place_name: '', lat: 12.72, lng: 77.28, price_from_origin: 150 }]);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, field: keyof StopItem, value: any) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], [field]: value };
    setStops(updated);
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');

    try {
      const departureDateTime = new Date(`${departureDate}T${departureTime}:00`);
      if (departureDateTime.getTime() <= Date.now()) {
        setError('Departure schedule must be in the future. Please select an upcoming date and time.');
        setLoading(false);
        setStep(2);
        return;
      }
      const arrivalDateTime = new Date(departureDateTime.getTime() + estimatedDurationHours * 3600 * 1000);


      const payload = {
        origin_text: origin,
        destination_text: destination,
        origin_lat: originLat,
        origin_lng: originLng,
        destination_lat: destLat,
        destination_lng: destLng,
        departure_at: departureDateTime.toISOString(),
        estimated_arrival: arrivalDateTime.toISOString(),
        seats_total: seatsTotal,
        price_per_seat: pricePerSeat,
        booking_mode: bookingMode,
        luggage_size: luggageSize,
        ac,
        smoking_allowed: smokingAllowed,
        pets_allowed: petsAllowed,
        women_only: womenOnly,
        notes,
        vehicle_id: selectedVehicleId || undefined,
        stops: stops.filter(s => s.place_name.trim()).map((s, idx) => ({
          stop_order: idx + 1,
          place_name: s.place_name,
          lat: s.lat,
          lng: s.lng,
          price_from_origin: s.price_from_origin,
          pickup_allowed: true,
          drop_allowed: true,
        })),
      };

      const publishedRide = await api.post('/rides', payload);
      navigate(`/rides/${publishedRide.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to publish ride');
    } finally {
      setLoading(false);
    }
  };

  const mapOrigin = { name: origin, lat: originLat, lng: originLng };
  const mapDest = { name: destination, lat: destLat, lng: destLng };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <span className="bg-lavender-500/15 text-lavender-300 text-xs font-semibold px-3 py-1 rounded-full border border-lavender-500/30">
          Driver Ride Publisher
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">Publish a Shared Ride</h1>
        <p className="text-xs sm:text-sm text-gray-400">Step {step} of 4 • Set your route, seats, pricing and passenger preferences</p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-between max-w-xl mx-auto px-4">
        {[
          { num: 1, label: 'Route' },
          { num: 2, label: 'Timing' },
          { num: 3, label: 'Vehicle & Price' },
          { num: 4, label: 'Review & Publish' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <button
              onClick={() => s.num < step && setStep(s.num)}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === s.num
                  ? 'bg-lavender-500 text-white shadow-glow-sm ring-4 ring-lavender-500/20'
                  : step > s.num
                  ? 'bg-emerald-500 text-white cursor-pointer'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </button>
            <span className="text-[11px] text-gray-400 font-medium mt-1.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Wizard Form Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Route & Waypoints */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-lavender-400" /> Specify Your Corridor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Origin Departure Point
                </label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Bangalore (Koramangala)"
                  className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none focus:border-lavender-400"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Destination Drop Point
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Mysore (Suburban Bus Stand)"
                  className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none focus:border-lavender-400"
                />
              </div>
            </div>

            {/* Intermediate Stops */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300 font-semibold">Intermediate Waypoints / Stopovers</label>
                <button
                  type="button"
                  onClick={addStop}
                  className="text-xs text-lavender-400 hover:text-lavender-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Stopover
                </button>
              </div>

              {stops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Stop ${idx + 1} (e.g. Ramanagara, Mandya)`}
                    value={stop.place_name}
                    onChange={(e) => updateStop(idx, 'place_name', e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">₹</span>
                    <input
                      type="number"
                      placeholder="Fare"
                      value={stop.price_from_origin}
                      onChange={(e) => updateStop(idx, 'price_from_origin', Number(e.target.value))}
                      className="w-20 p-2.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStop(idx)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Live Map Preview */}
            <div className="pt-2">
              <InteractiveRouteMap
                origin={mapOrigin}
                destination={mapDest}
                stops={stops.map((s, i) => ({ name: s.place_name, lat: s.lat, lng: s.lng, order: i + 1 }))}
                height="220px"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Timing & Duration */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-lavender-500/15">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-lavender-400" /> Trip Schedule & Timing
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Specify when you are leaving and estimated trip duration</p>
              </div>
            </div>

            {/* Departure Date */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-lavender-400" /> Departure Date
                </label>
                {departureDate && (
                  <span className="text-[11px] text-lavender-300 font-bold">
                    Selected: {formatFriendlyDate(departureDate)}
                  </span>
                )}
              </div>

              <input
                type="date"
                required
                min={todayISO}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none focus:border-lavender-400"
              />

              {/* Quick Date Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDepartureDate(todayISO)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    departureDate === todayISO
                      ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDepartureDate(tomorrowISO)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    departureDate === tomorrowISO
                      ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDepartureDate(dayAfterISO)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    departureDate === dayAfterISO
                      ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                  }`}
                >
                  Day After
                </button>
                <button
                  type="button"
                  onClick={() => setDepartureDate(weekendISO)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    departureDate === weekendISO
                      ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
                  }`}
                >
                  This Weekend
                </button>
              </div>
            </div>

            {/* Departure Time & Presets */}
            <div className="space-y-2 text-left">
              <label className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-lavender-400" /> Departure Time
              </label>
              <input
                type="time"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none focus:border-lavender-400"
              />

              {/* Time Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: 'Morning (07:30)', val: '07:30' },
                  { label: 'Morning (09:00)', val: '09:00' },
                  { label: 'Afternoon (14:00)', val: '14:00' },
                  { label: 'Evening (18:00)', val: '18:00' },
                  { label: 'Night (21:00)', val: '21:00' },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setDepartureTime(t.val)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold border transition-all ${
                      departureTime === t.val
                        ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider & Live Arrival Calculation */}
            <div className="space-y-3 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-semibold">Estimated Trip Duration</span>
                <span className="font-bold text-lavender-300">{estimatedDurationHours} hours</span>
              </div>
              <input
                type="range"
                step="0.5"
                min="0.5"
                max="12"
                value={estimatedDurationHours}
                onChange={(e) => setEstimatedDurationHours(Number(e.target.value))}
                className="w-full accent-lavender-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>30 mins</span>
                <span>6 hours</span>
                <span>12 hours</span>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            {departureDate && departureTime && (
              <div className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Scheduled Departure:</span>
                  <span className="font-bold text-white">
                    {formatFriendlyDate(departureDate)}, {departureTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Calculated Arrival:</span>
                  <span className="font-bold text-lavender-300">
                    {(() => {
                      const dep = new Date(`${departureDate}T${departureTime}:00`);
                      const arr = new Date(dep.getTime() + estimatedDurationHours * 3600 * 1000);
                      return `${arr.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${arr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                    })()}
                  </span>
                </div>
              </div>
            )}

          </div>
        )}


        {/* STEP 3: Vehicle & Pricing */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-lavender-400" /> Vehicle & Pricing
            </h3>

            {/* Vehicle Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs text-gray-300 font-semibold">Select Your Vehicle</label>
              {vehicles.length > 0 ? (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.registration_no}) - {v.seats_total} Seats
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center justify-between">
                  <span>Using standard 4-seater car profile</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seats offered */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs text-gray-300 font-semibold">Available Empty Seats Offered</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSeatsTotal(num)}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs border transition-all ${
                        seatsTotal === num
                          ? 'bg-lavender-600 text-white border-lavender-400 shadow-glow-sm'
                          : 'bg-[#16131D] text-gray-400 border-lavender-500/20'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price per seat */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs text-gray-300 font-semibold">Price Per Seat (₹)</label>
                <div className="relative">
                  <span className="text-sm text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-bold">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(Number(e.target.value))}
                    className="w-full p-3.5 pl-8 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white font-bold focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-emerald-400">
                  Recommended corridor benchmark: ₹280 - ₹360
                </span>
              </div>
            </div>

            {/* Booking Mode */}
            <div className="space-y-2 text-left">
              <label className="text-xs text-gray-300 font-semibold">Booking Confirmation Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookingMode('INSTANT')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    bookingMode === 'INSTANT'
                      ? 'bg-lavender-500/20 border-lavender-400 text-white shadow-glow-sm'
                      : 'bg-[#16131D] border-lavender-500/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Instant Booking
                  </span>
                  <span className="text-[10px] text-gray-400 block">Riders book instantly without waiting for your manual approval.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingMode('APPROVAL')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    bookingMode === 'APPROVAL'
                      ? 'bg-lavender-500/20 border-lavender-400 text-white shadow-glow-sm'
                      : 'bg-[#16131D] border-lavender-500/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs text-lavender-300 flex items-center gap-1 mb-1">
                    Manual Approval
                  </span>
                  <span className="text-[10px] text-gray-400 block">Review each rider's profile before confirming the booking.</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Preferences & Review */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lavender-400" /> Amenities & Final Review
            </h3>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-left">
              <button
                type="button"
                onClick={() => setAc(!ac)}
                className={`p-3 rounded-xl border text-center font-medium transition-all ${
                  ac ? 'bg-lavender-500/20 border-lavender-400 text-lavender-200' : 'bg-white/5 border-white/5 text-gray-400'
                }`}
              >
                ❄️ AC: {ac ? 'On' : 'Off'}
              </button>

              <button
                type="button"
                onClick={() => setPetsAllowed(!petsAllowed)}
                className={`p-3 rounded-xl border text-center font-medium transition-all ${
                  petsAllowed ? 'bg-lavender-500/20 border-lavender-400 text-amber-300' : 'bg-white/5 border-white/5 text-gray-400'
                }`}
              >
                🐾 Pets: {petsAllowed ? 'Allowed' : 'No'}
              </button>

              <button
                type="button"
                onClick={() => setSmokingAllowed(!smokingAllowed)}
                className={`p-3 rounded-xl border text-center font-medium transition-all ${
                  smokingAllowed ? 'bg-rose-500/20 border-rose-400 text-rose-300' : 'bg-white/5 border-white/5 text-gray-400'
                }`}
              >
                🚭 Smoking: {smokingAllowed ? 'Yes' : 'No'}
              </button>

              <button
                type="button"
                onClick={() => setWomenOnly(!womenOnly)}
                className={`p-3 rounded-xl border text-center font-medium transition-all ${
                  womenOnly ? 'bg-pink-500/20 border-pink-400 text-pink-300' : 'bg-white/5 border-white/5 text-gray-400'
                }`}
              >
                🌸 Women Only: {womenOnly ? 'Yes' : 'No'}
              </button>
            </div>

            {/* Luggage Size */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs text-gray-300 font-semibold">Max Luggage Size Per Passenger</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SMALL', 'MEDIUM', 'LARGE'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setLuggageSize(size)}
                    className={`py-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      luggageSize === size
                        ? 'bg-lavender-600 text-white border-lavender-400'
                        : 'bg-[#16131D] text-gray-400 border-lavender-500/20'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Notes */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs text-gray-300 font-semibold">Trip Notes for Passengers</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention pickup landmark, music preference, luggage details..."
                className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Summary Review Strip */}
            <div className="p-4 rounded-2xl bg-lavender-500/10 border border-lavender-500/20 text-left text-xs space-y-2">
              <span className="font-bold text-lavender-300 block">Published Summary:</span>
              <p className="text-white font-semibold">{origin} ➔ {destination}</p>
              <p className="text-gray-300">{departureDate} at {departureTime} • {seatsTotal} Seats • ₹{pricePerSeat} / seat</p>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-secondary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="btn-primary px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-glow-md"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Publish Ride Now</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
