import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Lock,
  Eye,
  UserCheck,
  Send
} from 'lucide-react';
import { api } from '../lib/api';
import { SOSModal } from '../components/safety/SOSModal';

export const SafetyPage: React.FC = () => {
  const [showSOS, setShowSOS] = useState(false);

  // Incident report form state
  const [category, setCategory] = useState('SAFETY');
  const [details, setDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    setSubmittingReport(true);
    try {
      await api.post('/reports', {
        category,
        details: details.trim(),
      });
      setReportSuccess(true);
      setDetails('');
      setTimeout(() => setReportSuccess(false), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-lavender-900/90 via-[#1E1B26] to-[#16131D] border border-lavender-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <ShieldAlert className="w-4 h-4" /> 24x7 Safety Control & Response
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Your Safety is Our Highest Priority
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            CoRide incorporates multi-layer identity verification, live GPS ride tracking, masked communication, and 24x7 emergency response protocols.
          </p>
        </div>

        <button
          onClick={() => setShowSOS(true)}
          className="btn-primary px-8 py-5 rounded-3xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm sm:text-base flex items-center gap-3 shadow-2xl shadow-rose-500/40 hover:scale-105 transition-all shrink-0 animate-pulse"
        >
          <AlertTriangle className="w-6 h-6" />
          <span>TRIGGER EMERGENCY SOS</span>
        </button>
      </div>

      {/* Direct Helplines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-lavender-500/20 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">National Police (112)</h3>
          <p className="text-xs text-gray-400">Direct instant emergency dispatch</p>
          <a href="tel:112" className="btn-secondary inline-block px-4 py-1.5 rounded-lg text-xs font-bold mt-1">
            Call 112
          </a>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-lavender-500/20 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Women Helpline (1091)</h3>
          <p className="text-xs text-gray-400">24x7 dedicated emergency helpline</p>
          <a href="tel:1091" className="btn-secondary inline-block px-4 py-1.5 rounded-lg text-xs font-bold mt-1">
            Call 1091
          </a>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-lavender-500/20 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">CoRide Safety Team</h3>
          <p className="text-xs text-gray-400">Dedicated safety operations center</p>
          <a href="mailto:safety@coride.com" className="btn-secondary inline-block px-4 py-1.5 rounded-lg text-xs font-bold mt-1">
            safety@coride.com
          </a>
        </div>
      </div>

      {/* Safety Protocol Features */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-xl space-y-6">
        <h2 className="font-display font-bold text-2xl text-white">CoRide Safety Architecture</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <UserCheck className="w-4 h-4" /> 100% ID Verified Drivers & Vehicles
            </div>
            <p className="text-gray-300 leading-relaxed">
              Every driver on CoRide must submit a valid Government ID, Driver's License, and Vehicle Registration plate for admin inspection prior to offering rides.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-lavender-300 font-bold text-sm">
              <Eye className="w-4 h-4" /> Real-time In-App Communication
            </div>
            <p className="text-gray-300 leading-relaxed">
              Communicate securely with your driver or passenger directly inside the CoRide platform without disclosing personal phone numbers prematurely.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
              <Lock className="w-4 h-4" /> Transparent Escrow & Refund Protection
            </div>
            <p className="text-gray-300 leading-relaxed">
              Driver payouts are released strictly upon trip completion. Full refunds are systematically disbursed in accordance with published cancellation terms.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" /> Instant SOS Alert Broadcast
            </div>
            <p className="text-gray-300 leading-relaxed">
              One-click SOS triggers transmit your live GPS coordinates, vehicle registration, and driver details directly to emergency services and your registered emergency contact.
            </p>
          </div>
        </div>
      </div>

      {/* Incident & Dispute Report Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-lavender-500/15">
          <div>
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-amber-400" /> Report an Incident or Safety Concern
            </h3>
            <p className="text-xs text-gray-400">Our trust & safety team reviews every filed report within 60 minutes</p>
          </div>
          {reportSuccess && (
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Report Filed! Case ID Assigned.
            </span>
          )}
        </div>

        <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
          <div>
            <label className="text-gray-300 font-semibold block mb-1">Incident Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
            >
              <option value="SAFETY">Safety or Rash Driving Incident</option>
              <option value="NO_SHOW">Driver or Rider No-Show</option>
              <option value="HARASSMENT">Inappropriate Communication or Harassment</option>
              <option value="VEHICLE_MISMATCH">Vehicle or License Plate Mismatch</option>
              <option value="OVERCHARGING">Overcharging / Cash Demand</option>
              <option value="OTHER">Other Query or Dispute</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Detailed Description & Evidence</label>
            <textarea
              rows={4}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide exact details of what occurred, time of event, and any pertinent details..."
              className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReport || !details.trim()}
              className="btn-primary px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              {submittingReport ? (
                'Filing Report...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Confidential Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SOS Modal */}
      <SOSModal
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
      />

    </div>
  );
};
