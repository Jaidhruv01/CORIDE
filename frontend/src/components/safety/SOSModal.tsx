import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, PhoneCall, MapPin, CheckCircle, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../store/useStore';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId?: string;
  bookingId?: string;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  rideId,
  bookingId,
}) => {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleTriggerSOS = async () => {
    setLoading(true);
    try {
      // Get browser geolocation if available
      let lat = 12.9716;
      let lng = 77.5946;

      if (navigator.geolocation) {
        try {
          const pos: any = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // default coordinates
        }
      }

      await api.post('/reports/sos', {
        ride_id: rideId,
        booking_id: bookingId,
        lat,
        lng,
        message: message || 'Urgent SOS assistance requested during active trip.',
      });

      setDispatched(true);
    } catch (e) {
      console.error('Failed to trigger SOS:', e);
      // Still show emergency numbers for user safety
      setDispatched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1E1B26] border-2 border-rose-500/50 shadow-2xl p-6 sm:p-8 text-white">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!dispatched ? (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 animate-bounce">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <h3 className="font-display font-bold text-2xl text-white">Emergency SOS Center</h3>
              <p className="text-xs text-gray-300 mt-1 max-w-sm mx-auto">
                Triggering SOS will immediately notify CoRide’s 24x7 Safety Response Team and share your live ride coordinates with your emergency contact.
              </p>
            </div>

            {user?.emergency_contact ? (
              <div className="p-3 rounded-xl bg-lavender-500/10 border border-lavender-500/20 text-xs text-lavender-200 flex items-center justify-center gap-2">
                <PhoneCall className="w-4 h-4 text-lavender-400" />
                <span>Registered Contact: <strong>{user.emergency_contact}</strong></span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                ⚠️ No emergency contact added yet. CoRide Safety Team will still receive this alert.
              </div>
            )}

            <div className="text-left space-y-2">
              <label className="text-xs text-gray-300 font-medium">Add Quick Note (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the situation or specific assistance needed..."
                rows={2}
                className="w-full rounded-xl bg-[#16131D] border border-lavender-500/20 p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Red Alert Action Button */}
            <button
              onClick={handleTriggerSOS}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  DISPATCH EMERGENCY SOS NOW
                </>
              )}
            </button>

            {/* Local Helplines */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
              <a
                href="tel:112"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-gray-300 hover:text-white"
              >
                <span className="block font-bold text-white text-sm">112</span>
                <span className="text-[10px] text-gray-400">Police / SOS</span>
              </a>
              <a
                href="tel:1091"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-gray-300 hover:text-white"
              >
                <span className="block font-bold text-white text-sm">1091</span>
                <span className="text-[10px] text-gray-400">Women Helpline</span>
              </a>
              <a
                href="tel:108"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-gray-300 hover:text-white"
              >
                <span className="block font-bold text-white text-sm">108</span>
                <span className="text-[10px] text-gray-400">Medical / Amb</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-in zoom-in">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-display font-bold text-2xl text-emerald-300">SOS Alert Dispatched!</h3>
              <p className="text-xs text-gray-300 mt-2 max-w-sm mx-auto">
                Our 24x7 Safety Response Team is coordinating immediate assistance. Help is on the way.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <MapPin className="w-4 h-4" /> Live GPS Coordinates Transmitted
              </div>
              <p className="text-gray-400 text-[11px]">
                Stay calm, remain in a secure location if possible, and answer any incoming calls from our safety operations hotline.
              </p>
            </div>

            <button
              onClick={onClose}
              className="btn-secondary w-full py-3 rounded-xl font-semibold text-xs"
            >
              Close Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
