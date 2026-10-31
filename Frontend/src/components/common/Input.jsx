// Frontend/src/components/common/Input.jsx
import React from 'react';

export function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const inputId = id || props.name || `input-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-[#B91C1C]">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-all bg-white text-[#171717] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] disabled:bg-neutral-100 disabled:text-neutral-400 ${
            Icon ? 'pl-9.5' : 'pl-3.5'
          } pr-3.5 py-2.5 ${
            error ? 'border-[#B91C1C] focus:ring-[#B91C1C]' : 'border-[#E7E5E4]'
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#B91C1C] font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-[#737373]">{helperText}</p>
      )}
    </div>
  );
}
