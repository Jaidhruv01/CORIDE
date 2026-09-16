import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata_json?: string;
  created_at?: string;
}

export const AdminSecurityPage: React.FC = () => {
  const { user } = useStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Change PIN Form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await api.get<AuditLog[]>('/admin/audit-logs');
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    if (newPin.length < 4) {
      setPinError('New PIN must be at least 4 digits.');
      return;
    }

    setPinLoading(true);
    try {
      await api.post('/admin/auth/change-pin', {
        current_pin: currentPin,
        new_pin: newPin,
      });
      setPinSuccess('Master Admin PIN successfully updated!');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      fetchAuditLogs();
    } catch (err: any) {
      setPinError(err?.message || 'Failed to update Master PIN.');
    } finally {
      setPinLoading(false);
    }
  };

  const handleImmediateLock = () => {
    sessionStorage.removeItem('coride_admin_clearance');
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-lavender-500 flex items-center justify-center text-white shadow-glow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl text-white">
                  Security Vault & Master Key Console
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Clearance Active
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Session protected by AES-256 clearance token • Owner: {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleImmediateLock}
            className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Session Now</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Master PIN & Credentials (col 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-6 text-left">
            <div className="flex items-center gap-2.5 pb-4 border-b border-purple-500/15">
              <KeyRound className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-display font-bold text-white text-base">Update Master PIN</h3>
                <p className="text-[11px] text-gray-400">Change your private 6-digit access code</p>
              </div>
            </div>

            {pinSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pinSuccess}</span>
              </div>
            )}

            {pinError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleChangePin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Current Master PIN</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current PIN (default: 984210)"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#16131D] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">New Master PIN</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new 6-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#16131D] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-semibold">Confirm New PIN</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#16131D] border border-purple-500/20 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={pinLoading}
                className="btn-primary w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow-sm hover:shadow-glow-md disabled:opacity-50"
              >
                {pinLoading ? 'Updating PIN...' : 'Save New Master PIN'}
              </button>
            </form>
          </div>

          {/* Security Protocols Notice */}
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/15 space-y-3 text-xs">
            <h4 className="font-bold text-purple-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> Active Security Controls
            </h4>
            <ul className="space-y-2 text-gray-400 text-[11px] list-disc list-inside">
              <li>Automatic 15-minute inactivity session lockdown</li>
              <li>Rate-limited brute-force protection (30s cooldown on 3 failures)</li>
              <li>Full administrative action audit trail recording</li>
              <li>Dual authentication gate (Password + Master Key / PIN)</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Live Platform Security Audit Trail (col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 space-y-4">
            
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/15">
              <div>
                <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" /> Security & Admin Audit Log
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Realtime immutable ledger of platform access & modifications
                </p>
              </div>
              <button
                onClick={fetchAuditLogs}
                disabled={loadingLogs}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingLogs ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No audit logs recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {logs.map((log) => {
                  const date = log.created_at ? new Date(log.created_at) : new Date();
                  const isSuccess = log.action.includes('GRANTED') || log.action.includes('VERIFIED') || log.action.includes('RESOLVED');
                  const isFail = log.action.includes('FAILED') || log.action.includes('REJECTED');

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-[#16131D]/80 border border-purple-500/15 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : isFail
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            {log.entity_type} • ID: {log.entity_id.slice(0, 8)}...
                          </span>
                        </div>

                        {log.metadata_json && (
                          <p className="text-[11px] text-gray-400 font-mono truncate max-w-sm">
                            {log.metadata_json}
                          </p>
                        )}
                      </div>

                      <div className="text-right text-[10px] text-gray-500 shrink-0">
                        <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <p>{date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
