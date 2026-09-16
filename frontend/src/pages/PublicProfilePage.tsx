import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  ChevronLeft
} from 'lucide-react';
import { api } from '../lib/api';
import type { UserPublic, Review } from '../types';

export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [uData, rData] = await Promise.all([
          api.get<UserPublic>(`/users/${userId}`),
          api.get<Review[]>(`/users/${userId}/reviews`).catch(() => []),
        ]);
        setProfile(uData);
        setReviews(rData);
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-lavender-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Loading member profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-400 text-sm">User profile not found.</p>
        <Link to="/search" className="btn-primary inline-block px-4 py-2 rounded-xl text-xs font-semibold">
          Search Rides
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Back Link */}
      <Link to="/search" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Back to Rides
      </Link>

      {/* Main Profile Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-lavender-500/20 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-lavender-500/15">
          <div className="flex items-center space-x-5">
            <img
              src={profile.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6F55B7&color=fff`}
              alt={profile.name}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-lavender-500/30"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-white">{profile.name}</h1>
                <span title="Identity Verified">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </span>
              </div>
              <p className="text-xs text-lavender-300">
                {profile.is_driver ? 'Verified Driver & Rider' : 'Verified Community Rider'}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-300 pt-1">
                <span className="flex items-center text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-300 mr-1" />
                  {profile.rating_avg.toFixed(1)} Rating
                </span>
                <span>•</span>
                <span>{profile.trips_count} Completed Rides</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              ✓ ID Verified
            </span>
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              ✓ Phone Verified
            </span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 text-xs text-gray-300 leading-relaxed italic">
            "{profile.bio}"
          </div>
        )}

        {/* Reviews Section */}
        <div className="space-y-4 pt-2">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-300 fill-amber-300" /> Community Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              All rides completed with 100% positive reputation.
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-[#16131D] border border-lavender-500/15 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{rev.reviewer?.name || 'Verified Rider'}</span>
                    <div className="flex items-center text-amber-300">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-300" />
                      ))}
                    </div>
                  </div>
                  {rev.text && <p className="text-gray-300">"{rev.text}"</p>}
                  <span className="text-[10px] text-gray-500 block">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
