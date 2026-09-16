import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';
import L from 'leaflet';

interface Stop {
  name: string;
  lat: number;
  lng: number;
  order?: number;
}

interface InteractiveRouteMapProps {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  stops?: Stop[];
  currentLocation?: { lat: number; lng: number };
  height?: string;
  interactive?: boolean;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  origin,
  destination,
  stops = [],
  currentLocation,
  height = '320px',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Dark theme map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Custom marker icon creator
      const createCustomIcon = (color: string, label: string) => {
        return L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: ${color};
              color: white;
              font-weight: 700;
              font-size: 11px;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 0 12px ${color};
            ">
              ${label}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
      };

      const points: [number, number][] = [];

      // Origin Marker
      if (origin.lat && origin.lng) {
        const originMarker = L.marker([origin.lat, origin.lng], {
          icon: createCustomIcon('#10B981', 'A'),
        }).addTo(map);
        originMarker.bindPopup(`<b>Origin:</b> ${origin.name}`);
        points.push([origin.lat, origin.lng]);
      }

      // Intermediate Stops
      stops.forEach((stop, index) => {
        if (stop.lat && stop.lng) {
          const stopMarker = L.marker([stop.lat, stop.lng], {
            icon: createCustomIcon('#9B7EDE', `${index + 1}`),
          }).addTo(map);
          stopMarker.bindPopup(`<b>Stop:</b> ${stop.name}`);
          points.push([stop.lat, stop.lng]);
        }
      });

      // Destination Marker
      if (destination.lat && destination.lng) {
        const destMarker = L.marker([destination.lat, destination.lng], {
          icon: createCustomIcon('#F43F5E', 'B'),
        }).addTo(map);
        destMarker.bindPopup(`<b>Destination:</b> ${destination.name}`);
        points.push([destination.lat, destination.lng]);
      }

      // Draw polyline connecting points
      if (points.length >= 2) {
        const polyline = L.polyline(points, {
          color: '#9B7EDE',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      } else if (points.length === 1) {
        map.setView(points[0], 12);
      }

      // Active live car marker if tracking
      if (currentLocation) {
        const carIcon = L.divIcon({
          className: 'custom-car-pin',
          html: `
            <div style="
              background-color: #A78BFA;
              color: white;
              padding: 4px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 15px #9B7EDE;
              animation: pulse 1.5s infinite;
            ">
              🚗
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([currentLocation.lat, currentLocation.lng], { icon: carIcon }).addTo(map);
      }
    } catch (e) {
      console.error('Error rendering Leaflet map:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, stops, currentLocation, interactive]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-lavender-500/20 shadow-lg">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Overlay Badge */}
      <div className="absolute top-3 left-3 bg-[#1E1B26]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-lavender-500/20 flex items-center gap-2 text-xs font-semibold text-lavender-200 z-[1000] pointer-events-none">
        <Navigation className="w-3.5 h-3.5 text-lavender-400" />
        <span>Live Route Visualizer</span>
      </div>

      {/* Waypoints Legend Bottom */}
      <div className="absolute bottom-3 left-3 right-3 bg-[#1E1B26]/95 backdrop-blur-md p-2 rounded-xl border border-lavender-500/20 flex items-center justify-between text-xs z-[1000]">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-gray-300 truncate font-medium">{origin.name}</span>
        </div>
        <span className="text-lavender-400 font-bold px-2">➔</span>
        <div className="flex items-center gap-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
          <span className="text-gray-300 truncate font-medium">{destination.name}</span>
        </div>
      </div>
    </div>
  );
};
