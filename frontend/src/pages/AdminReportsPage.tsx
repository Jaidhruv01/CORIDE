import React, { useState, useEffect } from 'react';
import { FileWarning, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { Report } from '../types';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get<Report[]>('/admin/reports');
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await api.post(`/admin/reports/${id}/resolve`, {
        status: 'RESOLVED',
        admin_notes: 'Reviewed and resolved by Platform Moderator.',
      });
      fetchReports();
    } catch (err: any) {
      alert(err?.message || 'Failed to resolve report');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-6 text-left">
      <div className="pb-4 border-b border-purple-500/15">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <FileWarning className="w-6 h-6 text-rose-400" /> Incident Reports & Safety Escalations
        </h2>
        <p className="text-xs text-gray-400">Review reported safety incidents, no-shows, vehicle mismatches, and disputes</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading safety reports...</div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          No incident reports filed.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-[#16131D] border border-purple-500/20 space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    r.category === 'SAFETY'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {r.category}
                  </span>
                  <span className="text-gray-400 text-[11px]">
                    Filed {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  r.status === 'RESOLVED' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                }`}>
                  ● {r.status}
                </span>
              </div>

              <p className="text-white text-sm bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                "{r.details}"
              </p>

              {r.admin_notes && (
                <p className="text-[11px] text-lavender-300 italic">
                  <strong>Moderator Notes:</strong> {r.admin_notes}
                </p>
              )}

              {r.status !== 'RESOLVED' && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleResolve(r.id)}
                    disabled={resolvingId === r.id}
                    className="btn-primary px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
