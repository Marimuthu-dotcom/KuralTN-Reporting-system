// Frontend/src/components/common/KuralLogo.jsx
import React from 'react';

/**
 * KuralTN Official Civic-Tech Emblem Icon
 * Seamlessly integrates:
 * 1. Location Pin: Represents ward-level local civic administration & geographic mapping
 * 2. Speech Bubble / Voice Wave: Represents the citizen's voice ("Kural" in Tamil)
 * 3. Verified Checkmark: Represents resolution, accountability, and citizen verification
 */
export function KuralLogoIcon({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${currentSize} ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xs"
      >
        <defs>
          {/* Civic Sunrise Gradient: Vibrant Saffron-Orange to Deep Amber */}
          <linearGradient id="kuralBgGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="70%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>

          {/* Golden Yellow Accent for Voice/Civic Light */}
          <linearGradient id="kuralVoiceAccent" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Soft Inner Shadow/Depth Filter */}
          <filter id="kuralShadow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#9A3412" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Base Geo-Pin + Speech Bubble Silhouette */}
        {/* A circular top that flows into a bottom point on the right with a speech notch on the left */}
        <path
          d="M24 4C14.0589 4 6 12.0589 6 22C6 26.6853 7.8284 30.9575 10.8284 34.1716L9 41.5L16.3284 39.6716C18.6215 40.5284 21.2284 41 24 41C33.9411 41 42 32.9411 42 23C42 12.5442 33.9411 4 24 4Z"
          fill="url(#kuralBgGrad)"
        />

        {/* Subtle Voice Wave Radii in golden accent (representing citizen vocal expression / Kural) */}
        <path
          d="M10 21C10 13.268 16.268 7 24 7"
          stroke="url(#kuralVoiceAccent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />

        {/* Small Golden Beacon Dot */}
        <circle cx="34" cy="12" r="2.5" fill="#FDE047" />

        {/* Crisp Verified Resolution Checkmark in center */}
        <path
          d="M16 22.5L21.5 28L32 16.5"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#kuralShadow)"
        />
      </svg>
    </div>
  );
}

/**
 * Full KuralTN Wordmark + Logo Component
 */
export function KuralLogo({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  variant = 'default', // 'default' (dark charcoal) | 'light' (white)
  className = '',
}) {
  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <KuralLogoIcon size={size} />

      {showWordmark && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-lg sm:text-xl font-sans ${
                isLight ? 'text-white' : 'text-[#171717]'
              }`}
            >
              Kural
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-[#F97316] text-white font-black text-xs sm:text-sm tracking-wide shadow-2xs">
              TN
            </span>
          </div>

          {showTagline && (
            <span
              className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 ${
                isLight ? 'text-neutral-400' : 'text-[#737373]'
              }`}
            >
              Civic Grievance & Ward Network
            </span>
          )}
        </div>
      )}
    </div>
  );
}
