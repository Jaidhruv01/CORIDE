import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#120F18] border-t border-lavender-500/15 pt-12 pb-8 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/5">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-lavender-700 to-lavender-500 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Co<span className="text-lavender-400">Ride</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Share the Route • Share the Cost. CoRide is a high-trust digital marketplace connecting daily commuters and intercity travelers.
            </p>
            <div className="flex items-center space-x-2 text-xs text-lavender-300">
              <Shield className="w-4 h-4 text-lavender-400" />
              <span>100% ID Verified Community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/search" className="hover:text-lavender-300 transition-colors">Search Rides</Link></li>
              <li><Link to="/rides/new" className="hover:text-lavender-300 transition-colors">Publish a Ride</Link></li>
              <li><Link to="/safety" className="hover:text-lavender-300 transition-colors">Safety Center & SOS</Link></li>
              <li><Link to="/dashboard" className="hover:text-lavender-300 transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          {/* Popular Corridors */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Popular Corridors</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/search?origin=Bangalore&destination=Mysore" className="hover:text-lavender-300 transition-colors flex items-center gap-1.5"><MapPin className="w-3 h-3 text-lavender-400" /> Bangalore ↔ Mysore</Link></li>
              <li><Link to="/search?origin=Mumbai&destination=Pune" className="hover:text-lavender-300 transition-colors flex items-center gap-1.5"><MapPin className="w-3 h-3 text-lavender-400" /> Mumbai ↔ Pune</Link></li>
              <li><Link to="/search?origin=Delhi&destination=Jaipur" className="hover:text-lavender-300 transition-colors flex items-center gap-1.5"><MapPin className="w-3 h-3 text-lavender-400" /> Delhi ↔ Jaipur</Link></li>
              <li><Link to="/search?origin=San+Francisco&destination=San+Jose" className="hover:text-lavender-300 transition-colors flex items-center gap-1.5"><MapPin className="w-3 h-3 text-lavender-400" /> San Francisco ↔ San Jose</Link></li>
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Support & Trust</h4>
            <p className="text-xs text-gray-400 mb-3">24x7 Safety Response & Customer Operations</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-3.5 h-3.5 text-lavender-400" />
                <span>+91 800-CORIDE-HELP</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-3.5 h-3.5 text-lavender-400" />
                <span>safety@coride.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} CoRide Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-lavender-400">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for smart travelers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
