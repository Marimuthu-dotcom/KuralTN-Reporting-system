// Frontend/src/components/complaints/ComplaintMap.jsx
import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export function ComplaintMap({ latitude, longitude, addressText, landmark }) {
  const hasCoords = Boolean(latitude && longitude);

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText || 'Tamil Nadu')}`;

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-[#F97316]" />
          <span>Location & Civic Map Pin</span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-semibold text-[#F97316] hover:underline"
        >
          <span>Open in Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Visual map preview block */}
      <div className="relative h-44 rounded-lg bg-neutral-100 border border-[#E7E5E4] overflow-hidden flex items-center justify-center text-center p-4">
        {hasCoords ? (
          <div className="space-y-2">
            <div className="inline-flex p-3 bg-orange-100 text-[#F97316] rounded-full shadow-xs animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-[#171717]">
              GPS: {latitude}&deg; N, {longitude}&deg; E
            </div>
            <div className="text-[11px] text-[#737373]">
              Pinned in Tamil Nadu Local Ward Spatial Grid
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#737373] space-y-1">
            <Navigation className="w-5 h-5 mx-auto text-[#A8A29E]" />
            <p className="font-semibold text-[#171717]">Coordinates not explicitly pinned</p>
            <p>Relying on street address and prominent landmarks.</p>
          </div>
        )}
      </div>

      <div className="text-xs space-y-1">
        <div>
          <span className="font-bold text-[#171717]">Address: </span>
          <span className="text-[#737373]">{addressText}</span>
        </div>
        {landmark && (
          <div>
            <span className="font-bold text-[#171717]">Landmark: </span>
            <span className="text-[#737373]">{landmark}</span>
          </div>
        )}
      </div>
    </div>
  );
}
