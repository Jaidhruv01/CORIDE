import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { Payment } from '../types';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const data = await api.get<Payment[]>('/admin/payments');
        setPayments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-6 text-left">
      <div className="pb-4 border-b border-purple-500/15">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-purple-400" /> Platform Payments & Settlement Ledger
        </h2>
        <p className="text-xs text-gray-400">Auditable record of all gateway payment orders, captures, and refund transactions</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading ledger...</div>
      ) : payments.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">No payments found.</div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-[#16131D] border border-purple-500/20 flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono">{p.provider_order_id || p.id.slice(0, 10)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'CAPTURED'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : p.status === 'REFUNDED'
                      ? 'bg-blue-500/15 text-blue-300'
                      : p.status === 'PENDING_CASH'
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}>
                    {p.status === 'PENDING_CASH' ? '💵 CASH PENDING' : p.status}
                  </span>
                </div>
                <p className="text-gray-400">
                  Method: <strong className={p.provider === 'cash' ? 'text-amber-300' : 'text-purple-300'}>{p.provider.toUpperCase()}</strong> • Ref: {p.provider_payment_id || 'Direct'}
                </p>
                <span className="text-[10px] text-gray-500 block">
                  {new Date(p.created_at).toLocaleString()}
                </span>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-base text-white block">
                  ₹{p.amount.toFixed(2)}
                </span>
                {p.refund_amount > 0 && (
                  <span className="text-[11px] text-rose-400 font-semibold block">
                    Refunded: ₹{p.refund_amount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
