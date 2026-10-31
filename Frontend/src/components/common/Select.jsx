// Frontend/src/components/common/Select.jsx
import React from 'react';

export function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const selectId = id || props.name || `select-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-[#B91C1C]">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        <select
          id={selectId}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-all bg-white text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] disabled:bg-neutral-100 disabled:text-neutral-400 px-3 py-2.5 appearance-none cursor-pointer ${
            error ? 'border-[#B91C1C] focus:ring-[#B91C1C]' : 'border-[#E7E5E4]'
          }`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
              {opt.label ?? opt.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#737373]">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-[#B91C1C] font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-[#737373]">{helperText}</p>
      )}
    </div>
  );
}
