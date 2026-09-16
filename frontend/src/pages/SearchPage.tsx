import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  Zap,
  Wind,
  Luggage,
  Sparkles,
  Map as MapIcon,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { Ride } from '../types';
import { RideCard } from '../components/rides/RideCard';
import { InteractiveRouteMap } from '../components/maps/InteractiveRouteMap';
import {
  getTodayISO,
  getTomorrowISO,
  getUpcomingWeekendISO,
  formatFriendlyDate
} from '../lib/dateUtils';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();
  const weekendISO = getUpcomingWeekendISO();

  // URL State
  const initialOrigin = searchParams.get('origin') || '';
  const initialDestination = searchParams.get('destination') || '';
  const initialDate = searchParams.get('date') || '';
  const initialSeats = Number(searchParams.get('seats')) || 1;


  // Form State
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(initialDate);
  const [seats, setSeats] = useState(initialSeats);

  // Filter State
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [instantOnly, setInstantOnly] = useState(false);
  const [acOnly, setAcOnly] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [luggageSize, setLuggageSize] = useState<string>('');
  const [sortBy, setSortBy] = useState('departure_asc');
  const [showMap, setShowMap] = useState(true);

  // Data & Loading State
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRides = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (origin.trim()) params.append('origin', origin.trim());
      if (destination.trim()) params.append('destination', destination.trim());
      if (date) params.append('date', date);
      if (seats > 1) params.append('seats', seats.toString());
      if (maxPrice < 1000) params.append('max_price', maxPrice.toString());
      if (instantOnly) params.append('instant_only', 'true');
      if (acOnly) params.append('ac', 'true');
      if (womenOnly) params.append('women_only', 'true');
      if (luggageSize) params.append('luggage_size', luggageSize);
      if (sortBy) params.append('sort_by', sortBy);

      const data = await api.get<Ride[]>(`/search?${params.toString()}`);
      setRides(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [origin, destination, date, seats, maxPrice, instantOnly, acOnly, womenOnly, luggageSize, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (origin) newParams.set('origin', origin);
    if (destination) newParams.set('destination', destination);
    if (date) newParams.set('date', date);
    if (seats > 1) newParams.set('seats', seats.toString());
    setSearchParams(newParams);
    fetchRides();
  };

  const resetFilters = () => {
    setMaxPrice(1000);
    setInstantOnly(false);
    setAcOnly(false);
    setWomenOnly(false);
    setLuggageSize('');
    setSortBy('departure_asc');
  };

  // Coordinates for Map
  const mapOrigin = {
    name: origin || 'Bangalore',
    lat: 12.9716,
    lng: 77.5946,
  };
  const mapDest = {
    name: destination || 'Mysore',
    lat: 12.2958,
    lng: 76.6394,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Search Banner Form */}
      <div className="glass-panel p-4 rounded-3xl border border-lavender-500/20 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="p-2.5 rounded-2xl bg-[#16131D] border border-lavender-500/15">
            <label className="text-[10px] uppercase font-bold text-lavender-300 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> From
            </label>
            <input
              type="text"
              placeholder="Origin city..."
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-[#16131D] border border-lavender-500/15">
            <label className="text-[10px] uppercase font-bold text-lavender-300 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-rose-400" /> To
            </label>
            <input
              type="text"
              placeholder="Destination city..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-[#16131D] border border-lavender-500/15">
            <label className="text-[10px] uppercase font-bold text-lavender-300 flex items-center justify-between gap-1 mb-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-lavender-400" /> Date
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
              className="w-full bg-transparent text-xs text-white focus:outline-none"
            />
          </div>

          <div className="p-2.5 rounded-2xl bg-[#16131D] border border-lavender-500/15">
            <label className="text-[10px] uppercase font-bold text-lavender-300 flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-lavender-400" /> Seats
            </label>
            <select
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value={1} className="bg-[#1E1B26]">1 Passenger</option>
              <option value={2} className="bg-[#1E1B26]">2 Passengers</option>
              <option value={3} className="bg-[#1E1B26]">3 Passengers</option>
              <option value={4} className="bg-[#1E1B26]">4 Passengers</option>
            </select>
          </div>

          <div className="flex items-center">
            <button
              type="submit"
              className="btn-primary w-full h-full min-h-[48px] rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Update Search</span>
            </button>
          </div>

        </form>

        {/* Quick Date Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-lavender-500/10 text-xs">
          <span className="text-[11px] text-gray-400 font-medium">Quick Date Filter:</span>
          <button
            type="button"
            onClick={() => { setDate(''); }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              !date
                ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            All Dates
          </button>
          <button
            type="button"
            onClick={() => { setDate(todayISO); }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              date === todayISO
                ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => { setDate(tomorrowISO); }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              date === tomorrowISO
                ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
            }`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => { setDate(weekendISO); }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              date === weekendISO
                ? 'bg-lavender-500 text-white border-lavender-400 shadow-glow-sm'
                : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
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
      </div>


      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Filters (col 4) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-lavender-500/15">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-lavender-400" /> Filter Rides
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-lavender-400 hover:text-lavender-300 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-semibold block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-xs text-white focus:outline-none focus:border-lavender-400"
              >
                <option value="departure_asc">Earliest Departure</option>
                <option value="price_asc">Lowest Price First</option>
                <option value="rating_desc">Highest Driver Rating</option>
              </select>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300 font-semibold">Max Price / Seat</span>
                <span className="font-bold text-lavender-300">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={100}
                max={1000}
                step={20}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-lavender-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>₹100</span>
                <span>₹1,000</span>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-2">
              <label className="text-xs text-gray-300 font-semibold block">Preferences & Amenities</label>
              
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-200 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Instant Booking Only
                </span>
                <input
                  type="checkbox"
                  checked={instantOnly}
                  onChange={(e) => setInstantOnly(e.target.checked)}
                  className="w-4 h-4 accent-lavender-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-xs text-gray-200 flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-lavender-400" /> Air Conditioning (AC)
                </span>
                <input
                  type="checkbox"
                  checked={acOnly}
                  onChange={(e) => setAcOnly(e.target.checked)}
                  className="w-4 h-4 accent-lavender-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-xs text-pink-200 flex items-center gap-2">
                  🌸 Women Only
                </span>
                <input
                  type="checkbox"
                  checked={womenOnly}
                  onChange={(e) => setWomenOnly(e.target.checked)}
                  className="w-4 h-4 accent-pink-500 rounded"
                />
              </label>
            </div>

            {/* Luggage Size Filter */}
            <div className="space-y-2 pt-2">
              <label className="text-xs text-gray-300 font-semibold block">Luggage Capacity</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['', 'SMALL', 'MEDIUM', 'LARGE'].map((size) => (
                  <button
                    key={size || 'all'}
                    type="button"
                    onClick={() => setLuggageSize(size)}
                    className={`py-2 px-1 rounded-xl border text-center font-medium transition-all ${
                      luggageSize === size
                        ? 'bg-lavender-500/20 border-lavender-400 text-lavender-300'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {size || 'Any'}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Route Map Card in Sidebar */}
          <div className="glass-panel p-4 rounded-3xl border border-lavender-500/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5 text-lavender-400" /> Route Overview
              </span>
              <button
                onClick={() => setShowMap(!showMap)}
                className="text-lavender-400 hover:text-lavender-300 text-[11px]"
              >
                {showMap ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showMap && (
              <InteractiveRouteMap
                origin={mapOrigin}
                destination={mapDest}
                height="220px"
              />
            )}
          </div>
        </aside>

        {/* Right Section: Ride Results List (col 8) */}
        <main className="lg:col-span-8 space-y-4">
          
          {/* Results Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Available Shared Rides
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? 'Searching routes...' : `${rides.length} ride${rides.length === 1 ? '' : 's'} available along this corridor`}
              </p>
            </div>

            {date && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-lavender-500/15 border border-lavender-500/30 text-lavender-300 text-xs font-semibold self-start sm:self-auto">
                <Calendar className="w-3.5 h-3.5 text-lavender-400" />
                <span>Departing: {formatFriendlyDate(date)}</span>
                <button
                  type="button"
                  onClick={() => setDate('')}
                  className="hover:text-white ml-1 text-gray-400 font-bold"
                  title="Remove date filter"
                >
                  ✕
                </button>
              </div>
            )}
          </div>


          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-12 bg-white/5 rounded" />
                  <div className="h-8 bg-white/10 rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results List */}
          {!loading && !error && (
            <div className="space-y-4">
              {rides.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-lavender-500/20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-lavender-500/10 text-lavender-400 flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">No Exact Rides Found</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                      No published rides match your exact filter criteria right now. Try resetting your filters or publishing a ride request!
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={resetFilters}
                      className="btn-secondary px-4 py-2 rounded-xl text-xs"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => { setOrigin(''); setDestination(''); setDate(''); }}
                      className="btn-primary px-4 py-2 rounded-xl text-xs"
                    >
                      View All Active Rides
                    </button>
                  </div>
                </div>
              ) : (
                rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))
              )}
            </div>
          )}

        </main>

      </div>
    </div>
  );
};
