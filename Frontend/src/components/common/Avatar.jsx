// Frontend/src/components/common/Avatar.jsx
import React from 'react';

export function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const initials = (name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border border-[#E7E5E4] shrink-0 ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-neutral-200 text-[#171717] flex items-center justify-center font-medium border border-[#E7E5E4] shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
