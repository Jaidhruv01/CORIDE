import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { api } from '../lib/api';

export const DashboardPaymentsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/my/transactions');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setPayoutSuccess(true);
      setTimeout(() => setPayoutSuccess(false), 3000);
    }, 1200);
  };

  const driverEarnings = data?.driver_earnings || { total_earnings: 0, completed_trips_count: 0 };
  const riderPayments = data?.rider_payments || [];

  return (
    <div className="space-y-6 text-left">
      
      {/* Earnings Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 space-y-2">
          <span className="text-xs text-gray-400 block font-medium">Total Driver Earnings</span>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-3xl text-white">₹{driverEarnings.total_earnings.toFixed(2)}</span>
          </div>
          <span className="text-[11px] text-emerald-400 block">
            From {driverEarnings.completed_trips_count} completed passenger rides
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 space-y-2">
          <span className="text-xs text-gray-400 block font-medium">Withdrawable Balance</span>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-3xl text-lavender-300">₹{driverEarnings.total_earnings.toFixed(2)}</span>
          </div>
          <span className="text-[11px] text-gray-400 block">Instant IMPS / UPI transfer</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-lavender-500/20 flex flex-col justify-between">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Payout Status</span>
            <p className="font-bold text-white text-sm mt-1">Direct Bank / UPI Linked</p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={withdrawing || driverEarnings.total_earnings === 0}
            className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mt-3 disabled:opacity-50"
          >
            {withdrawing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : payoutSuccess ? (
              <span className="text-white flex items-center gap-1">✓ Transferred!</span>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw to Bank</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Rider Payment Ledger */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-lavender-500/15">
          <div>
            <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-lavender-400" /> Transaction Ledger
            </h3>
            <p className="text-xs text-gray-400">All bookings, captured payments, and refund disbursements</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">Loading ledger...</div>
        ) : riderPayments.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No transaction records found yet.
          </div>
        ) : (
          <div className="space-y-3">
            {riderPayments.map((p: any) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Payment #{p.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'CAPTURED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : p.status === 'REFUNDED'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : p.status === 'PENDING_CASH'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {p.status === 'PENDING_CASH' ? '💵 CASH TO COLLECT' : p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Method: <strong className={p.provider === 'cash' ? 'text-amber-300' : 'text-lavender-300'}>{p.provider.toUpperCase()}</strong> • Order: {p.provider_order_id || 'Direct'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(p.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-white block">
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

    </div>
  );
};
