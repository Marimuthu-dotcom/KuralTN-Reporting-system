// Frontend/src/components/common/Card.jsx
import React from 'react';

export function Card({ children, className = '', hover = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E7E5E4] shadow-xs p-6 ${
        hover ? 'transition-all duration-200 hover:shadow-md hover:border-neutral-300 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-[#E7E5E4] mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-[#171717]">{title}</h3>
        {subtitle && <p className="text-xs text-[#737373] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
