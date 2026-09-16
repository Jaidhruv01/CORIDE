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
  ChevronRight
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
          <span className="gradient-text-lavender">Share the Cost.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Connect with trusted, verified drivers and riders traveling along your corridor. Save up to 70% on travel expenses while reducing road congestion and carbon footprint.
        </p>

        {/* Hero Search Box */}
        <div className="mt-10 max-w-4xl mx-auto">
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
                  <Users className="w-3.5 h-3.5 text-lavender-400" /> Seats
                </label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value={1} className="bg-[#1E1B26]">1 Seat</option>
                  <option value={2} className="bg-[#1E1B26]">2 Seats</option>
                  <option value={3} className="bg-[#1E1B26]">3 Seats</option>
                  <option value={4} className="bg-[#1E1B26]">4 Seats</option>
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
              For Car Owners & Commuters
            </span>
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Driving somewhere soon? <br />
              <span className="text-lavender-300">Offset your fuel & toll costs.</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Publish your upcoming commute or weekend trip in 60 seconds. Set your seats, price, and passenger preferences.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-300">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Keep 92% of seat earnings</span>
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

    </div>
  );
};
