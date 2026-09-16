import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { UserVerification } from '../types';

export const DashboardProfilePage: React.FC = () => {
  const { user, setUser } = useStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Verification state
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [docType, setDocType] = useState('DRIVER_LICENSE');
  const [docNumber, setDocNumber] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setEmergencyContact(user.emergency_contact || '');
    }

    const fetchVerifs = async () => {
      try {
        const data = await api.get<UserVerification[]>('/me/verifications');
        setVerifications(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchVerifs();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await api.patch('/me', {
        name,
        phone,
        bio,
        emergency_contact: emergencyContact,
      });
      setUser(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) return;

    setSubmittingDoc(true);
    try {
      const newVerif = await api.post('/me/verifications', {
        type: docType,
        document_number: docNumber.trim().toUpperCase(),
        document_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      });
      setVerifications([...verifications, newVerif]);
      setDocNumber('');
      setDocSuccess(true);
      setTimeout(() => setDocSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit document');
    } finally {
      setSubmittingDoc(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Profile Info Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-lavender-500/15">
          <div>
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <User className="w-5 h-5 text-lavender-400" /> Account & Profile Details
            </h3>
            <p className="text-xs text-gray-400">Keep your personal info and emergency contacts up to date</p>
          </div>
          {profileSuccess && (
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-gray-300 font-semibold">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 font-semibold">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 font-semibold">Emergency SOS Contact (Phone)</label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. +91 9811223399 (Parent, Partner, Friend)"
              className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none focus:border-rose-400"
            />
            <span className="text-[10px] text-gray-400">
              This number will be automatically notified if you ever trigger an in-ride SOS alert.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 font-semibold">About You / Driver Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a short bio with riders (e.g. daily commuter, preferred music, hobbies)..."
              className="w-full p-3.5 rounded-xl bg-[#16131D] border border-lavender-500/20 text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary px-6 py-2.5 rounded-xl font-bold text-xs"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Trust & Identity Verification Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-lavender-500/15">
          <div>
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Identity & Driver Verification
            </h3>
            <p className="text-xs text-gray-400">Verify your Government ID or Driver's License to unlock Driver Mode</p>
          </div>
          {docSuccess && (
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Submitted for Review!
            </span>
          )}
        </div>

        {/* Existing Verification Badges */}
        <div className="space-y-3">
          {verifications.length > 0 ? (
            verifications.map((verif) => (
              <div
                key={verif.id}
                className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/20 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-lavender-400" />
                  <div>
                    <p className="font-bold text-white">{verif.type.replace('_', ' ')}</p>
                    <p className="text-[11px] text-gray-400 font-mono">ID: {verif.document_number || 'Uploaded Proof'}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  verif.status === 'VERIFIED'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : verif.status === 'REJECTED'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}>
                  ● {verif.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400">No verification documents submitted yet.</p>
          )}
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUploadVerification} className="p-5 rounded-2xl bg-[#16131D] border border-lavender-500/15 space-y-4 text-xs">
          <h4 className="font-bold text-white text-sm">Submit New Proof Document</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#1E1B26] border border-lavender-500/20 text-white focus:outline-none"
              >
                <option value="DRIVER_LICENSE">Driver's License</option>
                <option value="GOVT_ID">National Government ID (Aadhaar / Passport)</option>
                <option value="STUDENT_ID">University Student ID</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 font-semibold block mb-1">Document / License Number</label>
              <input
                type="text"
                required
                placeholder="e.g. DL142023009944"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#1E1B26] border border-lavender-500/20 text-white font-mono uppercase focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-lavender-500/30 bg-lavender-500/5 text-center space-y-2">
            <Upload className="w-6 h-6 text-lavender-400 mx-auto" />
            <p className="font-semibold text-white">Digital Verification Sandbox</p>
            <p className="text-[11px] text-gray-400">Instant admin verification queue simulation enabled.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingDoc || !docNumber.trim()}
              className="btn-primary px-6 py-2.5 rounded-xl font-bold"
            >
              {submittingDoc ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
