import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Sparkles, Clock, Layers, Car, ShieldAlert, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, fetchNotifications } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-lavender-500/15">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-lavender-400" /> Notification Center
          </h1>
          <p className="text-xs text-gray-400">Stay updated with instant booking events, trip status changes, and platform alerts</p>
        </div>

        {notifications.some((n) => !n.read_at) && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-lavender-400" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      {notifications.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-lavender-500/20 text-center space-y-3">
          <Bell className="w-12 h-12 text-gray-500 mx-auto" />
          <p className="text-sm font-semibold text-white">Your inbox is quiet</p>
          <p className="text-xs text-gray-400">You'll receive notifications when riders book seats or drivers update ride statuses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isRead = !!notif.read_at;
            return (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.type.startsWith('BOOKING') || notif.type.startsWith('RIDE')) {
                    navigate('/dashboard/trips');
                  }
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !isRead
                    ? 'glass-panel border-lavender-500/40 shadow-glow-sm hover:border-lavender-400'
                    : 'bg-[#16131D] border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    notif.type.includes('SOS')
                      ? 'bg-rose-500/20 text-rose-400'
                      : notif.type.includes('CONFIRMED')
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-lavender-500/20 text-lavender-400'
                  }`}>
                    {notif.type.includes('SOS') ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : notif.type.includes('RIDE') ? (
                      <Car className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{notif.title}</h3>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-lavender-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{notif.body}</p>
                    <span className="text-[10px] text-gray-500 block pt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-500 shrink-0 self-center" />
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
