// Frontend/src/components/common/AnimatedIcons.jsx
import React from 'react';

export function AnimatedCheckmark({ className = 'w-6 h-6 text-[#15803D]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="2"
        className="opacity-30"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeWidth="2"
        strokeDasharray="63"
        strokeDashoffset="63"
        className="animate-[dash_1s_ease-in-out_forwards]"
      />
      <path
        d="M7 12.5L10.5 16L17 8.5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="20"
        strokeDashoffset="20"
        className="animate-[dash_0.6s_0.4s_ease-in-out_forwards]"
      />
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

export function AnimatedClock({ className = 'w-6 h-6 text-[#F97316]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth="2" />
      {/* Minute hand rotating */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="6"
        strokeWidth="2"
        strokeLinecap="round"
        className="origin-[12px_12px] animate-[spin_6s_linear_infinite]"
      />
      {/* Hour hand */}
      <line
        x1="12"
        y1="12"
        x2="16"
        y2="12"
        strokeWidth="2"
        strokeLinecap="round"
        className="origin-[12px_12px] animate-[spin_24s_linear_infinite]"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function AnimatedMegaphone({ className = 'w-6 h-6 text-[#F97316]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <g className="animate-[wiggle_2.5s_ease-in-out_infinite] origin-[6px_14px]">
        <path
          d="M3 11V15H6L11 19V7L6 11H3Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path d="M7 15V19C7 19.55 7.45 20 8 20C8.55 20 9 19.55 9 19V15" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Sound waves radiating */}
      <path
        d="M15 9C16.5 10.5 16.5 13.5 15 15"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-[pulse_1.5s_infinite]"
      />
      <path
        d="M18 6.5C21 9.5 21 14.5 18 17.5"
        strokeWidth="2"
        strokeLinecap="round"
        className="animate-[pulse_1.5s_0.3s_infinite]"
      />
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-8deg); }
          30% { transform: rotate(6deg); }
          45% { transform: rotate(-4deg); }
          60% { transform: rotate(2deg); }
        }
      `}</style>
    </svg>
  );
}

export function AnimatedPin({ className = 'w-6 h-6 text-[#F97316]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      {/* Ripple ring at the bottom */}
      <ellipse
        cx="12"
        cy="20"
        rx="6"
        ry="2.5"
        strokeWidth="1.5"
        className="text-[#F97316]/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
      />
      {/* Bouncing pin */}
      <g className="animate-[bouncePin_1.8s_ease-in-out_infinite]">
        <path
          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 21 12 21C12 21 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <circle cx="12" cy="9" r="3" strokeWidth="2" fill="white" />
      </g>
      <style>{`
        @keyframes bouncePin {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </svg>
  );
}

export function AnimatedCamera({ className = 'w-6 h-6 text-[#F97316]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M23 19C23 19.53 22.79 20.04 22.41 20.41C22.04 20.79 21.53 21 21 21H3C2.47 21 1.96 20.79 1.59 20.41C1.21 20.04 1 19.53 1 19V8C1 7.47 1.21 6.96 1.59 6.59C1.96 6.21 2.47 6 3 6H7L9 3H15L17 6H21C21.53 6 22.04 6.21 22.41 6.59C22.79 6.96 23 7.47 23 8V19Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shutter lens pulsing */}
      <circle
        cx="12"
        cy="13"
        r="4"
        strokeWidth="2"
        className="animate-[pulse_2s_infinite]"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Flash sparkle */}
      <circle
        cx="18"
        cy="9"
        r="1"
        className="animate-[ping_1.5s_infinite] fill-amber-400 stroke-amber-400"
      />
    </svg>
  );
}

export function AnimatedAlert({ className = 'w-6 h-6 text-[#B91C1C]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 19.53 1.76 20.04 2.14 20.41C2.51 20.79 3.02 21 3.55 21H20.45C20.98 21 21.49 20.79 21.86 20.41C22.24 20.04 22.45 19.53 22.45 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.53 3.55 13.26 3.3 12.94 3.14C12.62 2.98 12.26 2.89 11.9 2.89C11.54 2.89 11.18 2.98 10.86 3.14C10.54 3.3 10.27 3.55 10.09 3.86H10.29Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-[pulse_1.5s_infinite]"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.25" fill="currentColor" className="animate-[ping_1s_infinite]" />
    </svg>
  );
}

export function AnimatedShield({ className = 'w-6 h-6 text-[#F97316]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Inner check or star shimmer */}
      <path
        d="M9 12L11 14L15 10"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#15803D] animate-[pulse_2s_infinite]"
      />
    </svg>
  );
}

export function AnimatedChat({ className = 'w-6 h-6 text-[#F97316]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 3 typing dots animated */}
      <circle cx="8" cy="10" r="1.5" fill="currentColor" className="animate-[bounce_1.4s_infinite]" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" className="animate-[bounce_1.4s_0.2s_infinite]" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" className="animate-[bounce_1.4s_0.4s_infinite]" />
    </svg>
  );
}

export function AnimatedThumbsUp({ className = 'w-6 h-6 text-[#F97316]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <g className="animate-[popThumb_2s_ease-in-out_infinite] origin-[6px_20px]">
        <path
          d="M7 10V20H4C3.45 20 3 19.55 3 19V11C3 10.45 3.45 10 4 10H7ZM7 10L12 3C12.55 3 13 3.45 13 4V8H19C19.55 8 20 8.45 20 9C20 9.15 19.96 9.3 19.9 9.43L17.5 18.43C17.38 18.88 17.02 19.22 16.57 19.34C16.48 19.37 16.39 19.38 16.3 19.38H7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.15"
        />
      </g>
      <style>{`
        @keyframes popThumb {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(-6deg); }
        }
      `}</style>
    </svg>
  );
}
