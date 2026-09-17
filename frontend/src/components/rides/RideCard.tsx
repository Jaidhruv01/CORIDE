import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Star,
  Users,
  ShieldCheck,
  Zap,
  Wind,
  Luggage,
  ArrowRight,
  PawPrint
} from 'lucide-react';
import type { Ride } from '../../types';
import { formatRideDate } from '../../lib/dateUtils';

interface RideCardProps {
  ride: Ride;
}

export const RideCard: React.FC<RideCardProps> = ({ ride }) => {
  const { relativeBadge, formattedDate, formattedTime, isToday, isTomorrow } = formatRideDate(ride.departure_at);

  const driver = ride.driver;
  const vehicle = ride.vehicle;

  return (
    <div className="glass-panel-hover rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden group text-left">
      {/* Top Banner: Date, Booking Mode, Instant Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-lavender-500/15">
        <div className="flex items-center space-x-2 text-xs text-lavender-200">
          <Clock className="w-4 h-4 text-lavender-400" />
          {relativeBadge && (
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              isToday
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-lavender-500/20 text-lavender-300 border border-lavender-500/30'
            }`}>
              {relativeBadge}
            </span>
          )}
          <span className="font-semibold text-white">{formattedDate}</span>
          <span>•</span>
          <span className="bg-lavender-500/20 text-lavender-300 px-2 py-0.5 rounded-md font-mono font-medium">
            {formattedTime}
          </span>
        </div>


        <div className="flex items-center space-x-2">
          {ride.ride_type === 'BIKEPOOL' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
              🏍️ Bike Pool
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-lavender-500/10 text-lavender-300 border border-lavender-500/20 px-2 py-0.5 rounded-full">
              🚗 Carpool
            </span>
          )}
          {ride.helmet_provided && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              🪖 Helmet Provided
            </span>
          )}
          {ride.booking_mode === 'INSTANT' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3 text-emerald-400" /> Instant Book
            </span>
          )}
          {ride.women_only && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/30 px-2.5 py-0.5 rounded-full">
              🌸 Women Only
            </span>
          )}
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
            ride.seats_available > 1
              ? 'bg-lavender-500/15 text-lavender-300 border border-lavender-500/30'
              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse'
          }`}>
            <Users className="w-3 h-3 inline mr-1" />
            {ride.seats_available} {ride.ride_type === 'BIKEPOOL' ? 'pillion seat' : `seat${ride.seats_available > 1 ? 's' : ''}`} left
          </span>
        </div>
      </div>

      {/* Main Body: Route Timeline & Pricing */}
      <div className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Route Timeline (col 7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative pl-6 space-y-4">
            {/* Connecting line */}
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-400 via-lavender-400 to-rose-400" />

            {/* Origin */}
            <div className="relative flex items-start justify-between">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#1E1B26]" />
              <div>
                <p className="font-semibold text-white text-sm sm:text-base leading-tight">
                  {ride.origin_text}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Pickup Corridor</p>
              </div>
            </div>

            {/* Intermediate Stopovers if any */}
            {ride.stops && ride.stops.length > 0 && (
              <div className="relative flex items-center text-xs text-lavender-300/80 pl-2">
                <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-lavender-400 ring-4 ring-[#1E1B26]" />
                <span className="bg-white/5 px-2 py-0.5 rounded-md">
                  Via {ride.stops.map(s => s.place_name.split(' ')[0]).join(', ')}
                </span>
              </div>
            )}

            {/* Destination */}
            <div className="relative flex items-start justify-between">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-rose-400 ring-4 ring-[#1E1B26]" />
              <div>
                <p className="font-semibold text-white text-sm sm:text-base leading-tight">
                  {ride.destination_text}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Destination Drop</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Action (col 5) */}
        <div className="lg:col-span-5 flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-lavender-500/15 pt-4 lg:pt-0 lg:pl-6">
          <div className="text-left lg:text-right">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Price per seat</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-lavender-200 to-lavender-400">
                ₹{ride.price_per_seat}
              </span>
              <span className="text-xs text-gray-400">/ rider</span>
            </div>
          </div>

          <Link
            to={`/rides/${ride.id}`}
            className="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-glow-sm hover:shadow-glow-md"
          >
            <span>View & Reserve</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Driver and Vehicle Meta Bottom Bar */}
      <div className="pt-4 border-t border-lavender-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Driver */}
        <div className="flex items-center space-x-3">
          <img
            src={driver?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver?.name || 'Driver')}&background=6F55B7&color=fff`}
            alt={driver?.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-lavender-500/30"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{driver?.name || 'Verified Driver'}</span>
              <span title="Verified Driver">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <span className="flex items-center text-amber-300 font-semibold">
                <Star className="w-3 h-3 fill-amber-300 mr-0.5" />
                {driver?.rating_avg ? driver.rating_avg.toFixed(1) : '5.0'}
              </span>
              <span>•</span>
              <span>{driver?.trips_count || 0} rides completed</span>
            </div>
          </div>
        </div>

        {/* Vehicle & Amenity tags */}
        <div className="flex items-center space-x-2 text-gray-400 text-[11px]">
          {vehicle && (
            <span className="bg-[#16131D] px-2.5 py-1 rounded-lg border border-lavender-500/20 text-gray-300 font-medium">
              {vehicle.vehicle_type === 'BIKE' || ride.ride_type === 'BIKEPOOL' ? '🏍️' : '🚗'} {vehicle.make} {vehicle.model}
            </span>
          )}
          {ride.ac && ride.ride_type !== 'BIKEPOOL' && (
            <span className="bg-[#16131D] px-2 py-1 rounded-lg border border-lavender-500/20 text-lavender-300 flex items-center gap-1">
              <Wind className="w-3 h-3 text-lavender-400" /> AC
            </span>
          )}
          <span className="bg-[#16131D] px-2 py-1 rounded-lg border border-lavender-500/20 text-gray-400 flex items-center gap-1">
            <Luggage className="w-3 h-3 text-lavender-400" /> {ride.luggage_size}
          </span>
          {ride.pets_allowed && (
            <span className="bg-[#16131D] px-2 py-1 rounded-lg border border-lavender-500/20 text-amber-300 flex items-center gap-1">
              <PawPrint className="w-3 h-3 text-amber-400" /> Pets
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
