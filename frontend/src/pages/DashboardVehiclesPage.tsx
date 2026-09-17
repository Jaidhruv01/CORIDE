import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Car,
  Plus,
  ShieldCheck,
  Wind,
  Luggage,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { Vehicle } from '../types';

export const DashboardVehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE'>('CAR');
  const [make, setMake] = useState('Hyundai');
  const [model, setModel] = useState('Creta');
  const [year, setYear] = useState(2024);
  const [color, setColor] = useState('Knight Black');
  const [registrationNo, setRegistrationNo] = useState('');
  const [seatsTotal, setSeatsTotal] = useState(4);
  const [helmetProvided, setHelmetProvided] = useState(true);
  const [ac, setAc] = useState(true);
  const [luggageCapacity, setLuggageCapacity] = useState('MEDIUM');
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api.get<Vehicle[]>('/vehicles');
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleTypeSelect = (type: 'CAR' | 'BIKE') => {
    setVehicleType(type);
    if (type === 'BIKE') {
      setMake('Royal Enfield');
      setModel('Classic 350');
      setColor('Stealth Black');
      setSeatsTotal(1);
      setAc(false);
      setLuggageCapacity('SMALL');
      setHelmetProvided(true);
    } else {
      setMake('Hyundai');
      setModel('Creta');
      setColor('Knight Black');
      setSeatsTotal(4);
      setAc(true);
      setLuggageCapacity('MEDIUM');
      setHelmetProvided(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNo.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/vehicles', {
        vehicle_type: vehicleType,
        make,
        model,
        year,
        color,
        registration_no: registrationNo.toUpperCase().trim(),
        seats_total: seatsTotal,
        helmet_provided: vehicleType === 'BIKE' ? helmetProvided : false,
        ac: vehicleType === 'BIKE' ? false : ac,
        luggage_capacity: luggageCapacity,
        smoking_allowed: smokingAllowed,
        pets_allowed: petsAllowed,
        image_url: vehicleType === 'BIKE'
          ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      });

      setShowAddModal(false);
      setRegistrationNo('');
      fetchVehicles();
    } catch (err: any) {
      alert(err?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-lavender-500/15">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-lavender-400" /> My Registered Vehicles
          </h2>
          <p className="text-xs text-gray-400">Manage cars and two-wheelers for your carpool and bike pool rides</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Vehicle / Bike
        </button>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-xs">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-xs space-y-3">
          <p>No vehicles added yet. Add your car or bike to begin offering rides as a driver.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-block px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Add Your Vehicle Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-[#16131D] border border-lavender-500/20 space-y-4 relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{v.vehicle_type === 'BIKE' ? '🏍️' : '🚗'}</span>
                    <h3 className="font-bold text-white text-base">{v.make} {v.model}</h3>
                    <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {v.verified}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{v.color} • {v.year || 2023}</p>
                </div>

                <button
                  onClick={() => handleDeleteVehicle(v.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/15 text-gray-400 hover:text-rose-400 transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Registration Plate:</span>
                <span className="font-mono font-bold text-lavender-300 bg-[#16131D] px-2 py-0.5 rounded border border-lavender-500/20">
                  {v.registration_no}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-gray-300 pt-1">
                <span className={`px-2.5 py-1 rounded-lg border font-semibold ${
                  v.vehicle_type === 'BIKE'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-lavender-500/15 text-lavender-300 border-lavender-500/30'
                }`}>
                  {v.vehicle_type === 'BIKE' ? '🏍️ Two-Wheeler / Bike' : '🚗 Four-Wheeler / Car'}
                </span>

                <span className="bg-[#16131D] px-2.5 py-1 rounded-lg border border-lavender-500/20">
                  👥 {v.seats_total} {v.vehicle_type === 'BIKE' ? 'Pillion Seat' : 'Seats'}
                </span>

                {v.vehicle_type === 'BIKE' ? (
                  <span className={`px-2.5 py-1 rounded-lg border ${
                    v.helmet_provided
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-[#16131D] text-gray-400 border-lavender-500/20'
                  }`}>
                    🪖 {v.helmet_provided ? 'Helmet Provided' : 'No Spare Helmet'}
                  </span>
                ) : (
                  <span className="bg-[#16131D] px-2.5 py-1 rounded-lg border border-lavender-500/20 text-lavender-300">
                    ❄️ {v.ac ? 'Air Conditioned' : 'Non-AC'}
                  </span>
                )}

                <span className="bg-[#16131D] px-2.5 py-1 rounded-lg border border-lavender-500/20">
                  🧳 {v.luggage_capacity} Luggage
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#1E1B26] border border-lavender-500/30 shadow-2xl p-6 sm:p-8 text-white space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-display font-bold text-xl text-white">Register New Vehicle</h3>
              <p className="text-xs text-gray-400 mt-0.5">Enter details of the car or two-wheeler you will use for published rides</p>
            </div>

            {/* Vehicle Type Switcher */}
            <div className="space-y-1.5 text-xs">
              <label className="text-gray-300 font-semibold block">Vehicle Category</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeSelect('CAR')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    vehicleType === 'CAR'
                      ? 'bg-lavender-500/20 border-lavender-400 text-white shadow-glow-sm'
                      : 'bg-[#16131D] border-lavender-500/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                    <span>🚗</span> Four-Wheeler (Car)
                  </div>
                  <span className="text-[10px] text-gray-400 block">Sedan, SUV, Hatchback</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('BIKE')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    vehicleType === 'BIKE'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-glow-sm'
                      : 'bg-[#16131D] border-lavender-500/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300 mb-0.5">
                    <span>🏍️</span> Two-Wheeler (Bike)
                  </div>
                  <span className="text-[10px] text-gray-400 block">Motorcycle, Scooter, EV</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Make / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder={vehicleType === 'BIKE' ? 'e.g. Royal Enfield, Honda, Yamaha' : 'e.g. Tata, Hyundai, Honda'}
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder={vehicleType === 'BIKE' ? 'e.g. Classic 350, Activa 6G' : 'e.g. Nexon EV, City, Creta'}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Color</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">
                    {vehicleType === 'BIKE' ? 'Pillion Seats' : 'Max Seats'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={vehicleType === 'BIKE' ? 1 : 8}
                    value={seatsTotal}
                    onChange={(e) => setSeatsTotal(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Registration Number (Number Plate)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA01AB1234 or MH12CD5678"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white font-mono uppercase focus:outline-none"
                />
              </div>

              {vehicleType === 'BIKE' ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-emerald-300 font-bold">
                      🪖 Extra Helmet Provided for Pillion Rider
                    </span>
                    <input
                      type="checkbox"
                      checked={helmetProvided}
                      onChange={(e) => setHelmetProvided(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAc(!ac)}
                    className={`p-3 rounded-xl border text-center font-medium transition-all ${
                      ac ? 'bg-lavender-500/20 border-lavender-400 text-lavender-200' : 'bg-white/5 border-white/5 text-gray-400'
                    }`}
                  >
                    ❄️ AC: {ac ? 'Enabled' : 'Disabled'}
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
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary px-4 py-2.5 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-2.5 rounded-xl font-bold"
                >
                  {submitting ? 'Registering...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
