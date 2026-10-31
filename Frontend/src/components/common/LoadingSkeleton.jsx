// Frontend/src/components/common/LoadingSkeleton.jsx
import React from 'react';

export function LoadingSkeleton({ count = 3, className = '' }) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-white rounded-xl border border-[#E7E5E4] space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-neutral-200 rounded-md w-1/4" />
            <div className="h-4 bg-neutral-200 rounded-md w-16" />
          </div>
          <div className="h-5 bg-neutral-200 rounded-md w-3/4" />
          <div className="h-4 bg-neutral-200 rounded-md w-full" />
          <div className="h-4 bg-neutral-200 rounded-md w-1/2" />
          <div className="pt-2 flex gap-4">
            <div className="h-6 bg-neutral-200 rounded-md w-24" />
            <div className="h-6 bg-neutral-200 rounded-md w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
