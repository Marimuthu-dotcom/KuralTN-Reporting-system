// Frontend/src/components/dashboard/StatCard.jsx
import React from 'react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default', // default, warning, danger, success, primary
  onClick,
}) {
  const variants = {
    default: {
      bg: 'bg-white',
      border: 'border-[#E7E5E4]',
      iconBg: 'bg-neutral-100 text-[#171717]',
    },
    primary: {
      bg: 'bg-orange-50/40',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100 text-[#F97316]',
    },
    warning: {
      bg: 'bg-amber-50/40',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100 text-[#B45309]',
    },
    danger: {
      bg: 'bg-red-50/40',
      border: 'border-red-200',
      iconBg: 'bg-red-100 text-[#B91C1C]',
    },
    success: {
      bg: 'bg-green-50/40',
      border: 'border-green-200',
      iconBg: 'bg-green-100 text-[#15803D]',
    },
  };

  const style = variants[variant] || variants.default;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 shadow-2xs ${style.bg} ${style.border} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${style.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-black text-[#171717]">{value}</span>
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-[#737373]">{subtitle}</p>
      )}
    </div>
  );
}
