import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Send,
  MessageCircle,
  Car,
  Clock,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { Message, Booking } from '../types';
import { useStore } from '../store/useStore';

export const ChatPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, token } = useStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [bData, mData] = await Promise.all([
          api.get<Booking>(`/bookings/${bookingId}`),
          api.get<Message[]>(`/bookings/${bookingId}/messages`),
        ]);
        setBooking(bData);
        setMessages(mData);
      } catch (e) {
        console.error('Failed to load chat data:', e);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchInitialData();
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime WebSocket setup
  useEffect(() => {
    if (!bookingId || !token) return;

    const wsUrl = `ws://localhost:8001/api/v1/ws/bookings/${bookingId}?token=${token}`;
    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const msgData = JSON.parse(event.data);
          setMessages((prev) => {
            if (prev.some((m) => m.id === msgData.id)) return prev;
            return [...prev, msgData];
          });
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      socket.onclose = () => {
        setConnected(false);
      };

      socket.onerror = () => {
        setConnected(false);
      };

      return () => {
        socket.close();
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  }, [bookingId, token]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || newMessage;
    if (!textToSend.trim() || sending) return;

    setSending(true);
    try {
      // If WebSocket open, send via socket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ body: textToSend.trim() }));
      } else {
        // Fallback REST POST
        const msg = await api.post(`/bookings/${bookingId}/messages`, {
          body: textToSend.trim(),
        });
        setMessages((prev) => [...prev, msg]);
      }
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    'I have arrived at the pickup spot! 📍',
    'Running 5 minutes late ⏱️',
    'Where exactly should I look for your car? 🚗',
    'Waiting near the main entrance 👋',
  ];

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-lavender-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Connecting to secure ride room...</p>
      </div>
    );
  }

  const ride = booking?.ride;
  const isRider = booking?.rider_id === user?.id;
  const counterpartName = isRider ? ride?.driver?.name || 'Driver' : booking?.rider?.name || 'Passenger';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col space-y-4">
      
      {/* Top Chat Header */}
      <div className="glass-panel p-4 rounded-2xl border border-lavender-500/20 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <Link
            to={booking ? `/booking/${booking.id}` : '/dashboard'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-white text-sm">{counterpartName}</h2>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`} title={connected ? 'Live Connected' : 'Connecting'} />
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-xs">
              Ride #{booking?.booking_code} • {ride?.origin_text} ➔ {ride?.destination_text}
            </p>
          </div>
        </div>

        <Link
          to={`/booking/${bookingId}`}
          className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold"
        >
          View Pass
        </Link>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 glass-panel p-4 sm:p-6 rounded-3xl border border-lavender-500/20 overflow-y-auto space-y-4 shadow-xl text-left">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
            <MessageCircle className="w-10 h-10 text-lavender-400" />
            <p className="font-bold text-white text-sm">Direct Ride Coordination</p>
            <p className="text-xs max-w-xs">
              Use this chat to coordinate exact pickup spots, timing adjustments, or luggage questions.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-gray-500 mb-1 px-1">
                  {isMe ? 'You' : msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div
                  className={`max-w-md p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-lavender-600 to-lavender-500 text-white rounded-tr-none shadow-glow-sm'
                      : 'bg-[#1E1B26] text-gray-200 border border-lavender-500/20 rounded-tl-none'
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-gray-500 shrink-0">Quick:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(undefined, prompt)}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-lavender-500/20 text-gray-300 hover:text-lavender-200 border border-lavender-500/15 whitespace-nowrap transition-colors text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder={`Message ${counterpartName}...`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3.5 rounded-2xl bg-[#1E1B26] border border-lavender-500/20 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="btn-primary p-3.5 rounded-2xl font-bold text-white flex items-center justify-center shrink-0 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
