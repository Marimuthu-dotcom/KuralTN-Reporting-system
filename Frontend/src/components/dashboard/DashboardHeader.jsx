// Frontend/src/components/dashboard/DashboardHeader.jsx
import React from 'react';

export function DashboardHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5E4] mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#737373] mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
