// Frontend/src/components/common/Badge.jsx
import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }) {
  const variants = {
    neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    primary: 'bg-orange-50 text-[#F97316] border-orange-200',
    success: 'bg-green-50 text-[#15803D] border-green-200',
    warning: 'bg-amber-50 text-[#B45309] border-amber-200',
    danger: 'bg-red-50 text-[#B91C1C] border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border tracking-wide uppercase ${
        variants[variant] || variants.neutral
      } ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
