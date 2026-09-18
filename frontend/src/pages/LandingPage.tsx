import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Leaf,
  Clock,
  Car,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Mail,
  Quote,
  ExternalLink,
  Globe
} from 'lucide-react';
import { RideCard } from '../components/rides/RideCard';
import { Ride } from '../types';
import {
  getTodayISO,
  getTomorrowISO,
  getUpcomingWeekendISO,
  formatFriendlyDate
} from '../lib/dateUtils';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);
  const [rideType, setRideType] = useState<string>('');

  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();
  const weekendISO = getUpcomingWeekendISO();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    if (seats > 1) params.append('seats', seats.toString());
    if (rideType) params.append('ride_type', rideType);
    navigate(`/search?${params.toString()}`);
  };


  const popularCorridors = [
    {
      id: 'blr-mys',
      from: 'Bangalore',
      to: 'Mysore',
      price: 280,
      duration: '3h 15m',
      distance: '145 km',
      img: 'https://images.unsplash.com/photo-1600100397608-f010f444f475?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mum-pun',
      from: 'Mumbai',
      to: 'Pune',
      price: 320,
      duration: '3h 30m',
      distance: '148 km',
      img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'del-jai',
      from: 'Delhi',
      to: 'Jaipur',
      price: 450,
      duration: '4h 45m',
      distance: '280 km',
      img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sf-sjc',
      from: 'San Francisco',
      to: 'San Jose',
      price: 18,
      duration: '1h 10m',
      distance: '48 mi',
      img: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-lavender-500/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-glow-sm">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>🎉 Launch Offer: 0% Platform Fees • 100% Free Rideshare Community</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Share the Route. <br />
          <span className="gradient-text-lavender">Carpool & Bike Pool.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Connect with trusted, verified car and motorcycle owners traveling along your corridor. Save up to 70% on travel expenses while reducing road congestion and carbon footprint.
        </p>

        {/* Hero Search Box */}
        <div className="mt-10 max-w-4xl mx-auto">
          {/* Pool Mode Tab Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <button
              type="button"
              onClick={() => { setRideType(''); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                !rideType
                  ? 'bg-lavender-600 text-white border-lavender-400 shadow-glow-sm'
                  : 'bg-[#16131D]/80 text-gray-400 border-lavender-500/20 hover:text-white'
              }`}
            >
              <span>✨ All Rides</span>
            </button>
            <button
              type="button"
              onClick={() => { setRideType('CARPOOL'); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                rideType === 'CARPOOL'
                  ? 'bg-lavender-600 text-white border-lavender-400 shadow-glow-sm'
                  : 'bg-[#16131D]/80 text-gray-400 border-lavender-500/20 hover:text-white'
              }`}
            >
              <span>🚗 Carpool</span>
            </button>
            <button
              type="button"
              onClick={() => { setRideType('BIKEPOOL'); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                rideType === 'BIKEPOOL'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-glow-sm'
                  : 'bg-[#16131D]/80 text-gray-400 border-lavender-500/20 hover:text-white'
              }`}
            >
              <span>🏍️ Bike Pool (2-Wheeler)</span>
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="glass-panel p-3 sm:p-4 rounded-3xl border border-lavender-500/30 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left"
          >
            {/* Origin */}
            <div className="p-3 rounded-2xl bg-[#16131D]/80 border border-lavender-500/15 focus-within:border-lavender-400 transition-colors">
              <label className="text-[10px] uppercase font-bold text-lavender-300/80 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Leaving From
              </label>
              <input
                type="text"
                placeholder="Bangalore, Mumbai, SF..."
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 font-medium focus:outline-none"
              />
            </div>

            {/* Destination */}
            <div className="p-3 rounded-2xl bg-[#16131D]/80 border border-lavender-500/15 focus-within:border-lavender-400 transition-colors">
              <label className="text-[10px] uppercase font-bold text-lavender-300/80 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Going To
              </label>
              <input
                type="text"
                placeholder="Mysore, Pune, San Jose..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 font-medium focus:outline-none"
              />
            </div>

            {/* Date & Seats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-[#16131D]/80 border border-lavender-500/15 focus-within:border-lavender-400 transition-colors">
                <label className="text-[10px] uppercase font-bold text-lavender-300/80 flex items-center justify-between gap-1 mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-lavender-400" /> Date
                  </span>
                  {date && (
                    <span className="text-[9px] text-lavender-300 font-semibold lowercase">
                      ({formatFriendlyDate(date)})
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  min={todayISO}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-gray-500 font-medium focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#16131D]/80 border border-lavender-500/15 focus-within:border-lavender-400 transition-colors">
                <label className="text-[10px] uppercase font-bold text-lavender-300/80 flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-lavender-400" /> {rideType === 'BIKEPOOL' ? 'Pillion' : 'Seats'}
                </label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value={1} className="bg-[#1E1B26]">1 Seat</option>
                  {rideType !== 'BIKEPOOL' && (
                    <>
                      <option value={2} className="bg-[#1E1B26]">2 Seats</option>
                      <option value={3} className="bg-[#1E1B26]">3 Seats</option>
                      <option value={4} className="bg-[#1E1B26]">4 Seats</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center">
              <button
                type="submit"
                className="btn-primary w-full h-full min-h-[52px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow-md"
              >
                <Search className="w-4 h-4" />
                <span>Find Rides</span>
              </button>
            </div>
          </form>

          {/* Quick Date Shortcuts Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 px-2 text-xs">
            <span className="text-[11px] text-gray-400 font-medium">Quick Dates:</span>
            <button
              type="button"
              onClick={() => setDate(todayISO)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                date === todayISO
                  ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                  : 'bg-[#16131D]/80 text-gray-300 border-lavender-500/20 hover:border-lavender-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDate(tomorrowISO)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                date === tomorrowISO
                  ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                  : 'bg-[#16131D]/80 text-gray-300 border-lavender-500/20 hover:border-lavender-400 hover:text-white'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setDate(weekendISO)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                date === weekendISO
                  ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                  : 'bg-[#16131D]/80 text-gray-300 border-lavender-500/20 hover:border-lavender-400 hover:text-white'
              }`}
            >
              This Weekend
            </button>
            {date && (
              <button
                type="button"
                onClick={() => setDate('')}
                className="text-[11px] text-lavender-400 hover:text-lavender-300 underline underline-offset-2 ml-1"
              >
                Clear Date
              </button>
            )}
          </div>


          {/* Quick Corridor Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
            <span className="font-medium text-gray-500">Popular:</span>
            <button
              onClick={() => { setOrigin('Bangalore'); setDestination('Mysore'); }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all"
            >
              Bangalore ➔ Mysore
            </button>
            <button
              onClick={() => { setOrigin('Mumbai'); setDestination('Pune'); }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all"
            >
              Mumbai ➔ Pune
            </button>
            <button
              onClick={() => { setOrigin('Delhi'); setDestination('Jaipur'); }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all"
            >
              Delhi ➔ Jaipur
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Highlights Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-white">100% Verified</h4>
            <p className="text-xs text-gray-400">Government ID & License checked</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-lavender-500/15 text-lavender-300 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-white">Instant Booking</h4>
            <p className="text-xs text-gray-400">Atomic seat locks, zero wait</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-white">Secure Payments</h4>
            <p className="text-xs text-gray-400">Escrow & automatic refund policies</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center mx-auto mb-3">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-white">Eco Commute</h4>
            <p className="text-xs text-gray-400">Save 4.2 kg CO₂ per shared ride</p>
          </div>
        </div>
      </section>

      {/* Popular Corridors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Trending Travel Corridors
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Top requested commuter and weekend intercity routes with frequent daily departures
            </p>
          </div>
          <Link
            to="/search"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-lavender-400 hover:text-lavender-300"
          >
            Explore all corridors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCorridors.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/search?origin=${c.from}&destination=${c.to}`)}
              className="glass-panel-hover rounded-3xl overflow-hidden cursor-pointer group flex flex-col"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={c.img}
                  alt={`${c.from} to ${c.to}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16131D] via-[#16131D]/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="bg-lavender-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {c.distance} • {c.duration}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-lavender-300 transition-colors">
                    {c.from} ➔ {c.to}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Multiple daily drivers</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Starting from</span>
                  <span className="text-lg font-bold text-lavender-300">₹{c.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Simpler Than Booking a Cab
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Seamless 4-step carpooling experience built for reliability, comfort, and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 text-center space-y-3 relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-lavender-600 text-white font-bold text-xs flex items-center justify-center ring-4 ring-[#16131D]">
              1
            </span>
            <div className="w-12 h-12 rounded-2xl bg-lavender-500/10 text-lavender-400 flex items-center justify-center mx-auto mt-2">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Search Route</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enter your pickup, destination, and preferred date to see available seats.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 text-center space-y-3 relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-lavender-600 text-white font-bold text-xs flex items-center justify-center ring-4 ring-[#16131D]">
              2
            </span>
            <div className="w-12 h-12 rounded-2xl bg-lavender-500/10 text-lavender-400 flex items-center justify-center mx-auto mt-2">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Reserve Seat</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Inspect driver ratings, vehicle amenities, and reserve instantly with safe checkout.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 text-center space-y-3 relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-lavender-600 text-white font-bold text-xs flex items-center justify-center ring-4 ring-[#16131D]">
              3
            </span>
            <div className="w-12 h-12 rounded-2xl bg-lavender-500/10 text-lavender-400 flex items-center justify-center mx-auto mt-2">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Meet & Ride</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Coordinate via in-app chat, track driver arrival, and enjoy a comfortable ride.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 text-center space-y-3 relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-lavender-600 text-white font-bold text-xs flex items-center justify-center ring-4 ring-[#16131D]">
              4
            </span>
            <div className="w-12 h-12 rounded-2xl bg-lavender-500/10 text-lavender-400 flex items-center justify-center mx-auto mt-2">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Rate Each Other</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Build mutual community trust by submitting directional ratings and reviews.
            </p>
          </div>

        </div>
      </section>

      {/* Driver CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-lavender-900/90 via-[#1E1B26] to-[#16131D] border border-lavender-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl text-left">
            <span className="bg-lavender-500/20 text-lavender-300 text-xs font-semibold px-3 py-1 rounded-full border border-lavender-500/30">
              For Car & Two-Wheeler Owners
            </span>
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Driving or riding somewhere soon? <br />
              <span className="text-lavender-300">Offset your fuel & toll expenses.</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Publish your upcoming car commute or motorcycle pillion ride in 60 seconds. Set your seats, price, and passenger preferences.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Keep 100% of seat contributions</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant automated payouts</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/rides/new"
              className="btn-primary px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow-md"
            >
              <Car className="w-5 h-5" />
              <span>Publish a Ride Now</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Meet Our CEO Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden glass-panel border border-lavender-500/25 shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-lavender-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* CEO Portrait Card (col 5) */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-lavender-500 via-purple-500 to-emerald-400 rounded-3xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
                <div className="relative w-64 sm:w-72 aspect-[3/4] rounded-3xl overflow-hidden border border-lavender-400/30 bg-[#16131D] shadow-2xl">
                  <img
                    src="/jaidhruv-gupta-ceo.jpg"
                    alt="Jaidhruv Gupta - CEO & Founder of CoRide"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16131D] via-transparent to-transparent opacity-60" />
                  
                  {/* Verified Founder Badge */}
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-2xl bg-[#16131D]/90 backdrop-blur-md border border-lavender-500/30 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">Jaidhruv Gupta</h4>
                        <p className="text-[11px] text-lavender-300 font-medium">Founder & CEO, CoRide</p>
                      </div>
                      <span className="bg-emerald-500/15 text-emerald-300 p-1.5 rounded-xl border border-emerald-500/30">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social / Connect Links */}
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://github.com/Jaidhruv01"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-lavender-500/20 text-gray-400 hover:text-lavender-300 border border-white/5 hover:border-lavender-400/40 transition-all text-xs flex items-center gap-1.5 font-medium"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-lavender-500/20 text-gray-400 hover:text-lavender-300 border border-white/5 hover:border-lavender-400/40 transition-all text-xs flex items-center gap-1.5 font-medium"
                >
                  <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="mailto:contact@coride.io"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-lavender-500/20 text-gray-400 hover:text-lavender-300 border border-white/5 hover:border-lavender-400/40 transition-all text-xs flex items-center gap-1.5 font-medium"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Contact</span>
                </a>
              </div>
            </div>

            {/* CEO Vision & Details (col 7) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lavender-500/15 border border-lavender-500/30 text-lavender-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-lavender-400" />
                <span>Meet Our CEO</span>
              </div>

              <div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  Driving the Future of <br />
                  <span className="gradient-text-lavender">Shared & Sustainable Mobility</span>
                </h2>
                <p className="text-sm font-semibold text-emerald-400 mt-1">
                  Jaidhruv Gupta • Founder & Chief Executive Officer
                </p>
              </div>

              <div className="relative p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-300 text-xs sm:text-sm leading-relaxed italic">
                <Quote className="w-5 h-5 text-lavender-400/40 mb-1" />
                "We built CoRide with a single mission: to make everyday commuting and intercity travel affordable, safe, and truly sustainable. By connecting drivers with co-travelers and enabling seamless carpool and bike pool journeys, we are eliminating traffic bottlenecks and reducing road emissions together."
              </div>

              {/* Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#16131D] border border-lavender-500/20 space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    🌱
                  </div>
                  <h4 className="font-bold text-white text-xs">Zero Waste Rides</h4>
                  <p className="text-[11px] text-gray-400">Slashing emissions by maximizing corridor seat occupancy.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#16131D] border border-lavender-500/20 space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-lavender-500/15 text-lavender-400 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <h4 className="font-bold text-white text-xs">Car + Bike Pool</h4>
                  <p className="text-[11px] text-gray-400">Flexible options tailored for highway and city traffic.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#16131D] border border-lavender-500/20 space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs">
                    🛡️
                  </div>
                  <h4 className="font-bold text-white text-xs">Trust & Safety First</h4>
                  <p className="text-[11px] text-gray-400">100% ID verification, route tracking & emergency response.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
