// Frontend/src/components/common/Toast.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#15803D]" />,
    error: <AlertCircle className="w-5 h-5 text-[#B91C1C]" />,
    info: <Info className="w-5 h-5 text-[#F97316]" />,
  };

  const borders = {
    success: 'border-[#15803D]/30 bg-green-50/95 text-green-950',
    error: 'border-[#B91C1C]/30 bg-red-50/95 text-red-950',
    info: 'border-[#F97316]/30 bg-orange-50/95 text-orange-950',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up max-w-md">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-xs ${
          borders[type] || borders.info
        }`}
      >
        <div className="shrink-0 mt-0.5">{icons[type]}</div>
        <div className="text-sm font-medium leading-relaxed pr-2">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-md hover:bg-black/5 text-[#737373] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
