import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Check, X, Clock, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { UserVerification } from '../types';

export const AdminVerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchVerifs = async () => {
    setLoading(true);
    try {
      const data = await api.get<UserVerification[]>('/admin/verifications');
      setVerifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifs();
  }, []);

  const handleReview = async (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(id);
    try {
      await api.post(`/admin/verifications/${id}/review`, {
        status: newStatus,
        rejection_reason: newStatus === 'REJECTED' ? 'Document unreadable or invalid credentials' : null,
      });
      fetchVerifs();
    } catch (err: any) {
      alert(err?.message || 'Failed to review verification');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-6 text-left">
      <div className="pb-4 border-b border-purple-500/15">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" /> Driver Document Verification Queue
        </h2>
        <p className="text-xs text-gray-400">Review driver licenses and government IDs to enable Driver Mode permissions</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading verification queue...</div>
      ) : verifications.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">
          No verification requests pending review.
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-[#16131D] border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-3 rounded-xl bg-purple-500/15 text-purple-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{v.type.replace('_', ' ')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'VERIFIED'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : v.status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-gray-400 font-mono">Document No: {v.document_number || 'N/A'}</p>
                  <p className="text-[10px] text-gray-500">Submitted on: {new Date(v.created_at).toLocaleString()}</p>
                </div>
              </div>

              {v.status === 'PENDING' ? (
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleReview(v.id, 'VERIFIED')}
                    disabled={actionLoading === v.id}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReview(v.id, 'REJECTED')}
                    disabled={actionLoading === v.id}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 text-xs">Reviewed</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
