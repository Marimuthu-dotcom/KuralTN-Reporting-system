// Frontend/src/components/common/Textarea.jsx
import React from 'react';

export function Textarea({
  label,
  id,
  rows = 4,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || props.name || `textarea-${Math.random().toString(36).substring(2, 7)}`;

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
        <textarea
          id={inputId}
          rows={rows}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-all bg-white text-[#171717] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] disabled:bg-neutral-100 disabled:text-neutral-400 p-3 ${
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
