// Frontend/src/components/complaints/ComplaintSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

export function ComplaintSearch({ value, onChange, onClear, placeholder = 'Search by keyword, street, landmark, or ref (CIV-...)' }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737373]">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-[#E7E5E4] bg-white text-[#171717] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#171717]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
