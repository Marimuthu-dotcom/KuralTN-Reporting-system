// Frontend/src/components/common/Button.jsx
import React from 'react';

export function Button({
  children,
  variant = 'primary', // primary, secondary, outline, danger, ghost
  size = 'md', // sm, md, lg
  type = 'button',
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs focus:ring-[#F97316]',
    secondary:
      'bg-[#171717] hover:bg-neutral-800 text-white shadow-xs focus:ring-neutral-700',
    outline:
      'border border-[#E7E5E4] bg-white hover:bg-neutral-50 text-[#171717] shadow-xs focus:ring-[#F97316]',
    danger:
      'bg-[#B91C1C] hover:bg-red-800 text-white shadow-xs focus:ring-red-600',
    ghost:
      'text-[#737373] hover:text-[#171717] hover:bg-neutral-100 focus:ring-neutral-400',
    success:
      'bg-[#15803D] hover:bg-green-800 text-white shadow-xs focus:ring-green-600',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
