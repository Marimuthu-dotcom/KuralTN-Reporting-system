// Frontend/src/components/common/ErrorState.jsx
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while loading this information. Please check your connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center bg-white rounded-xl border border-red-200 ${className}`}
    >
      <div className="p-3 bg-red-100 text-[#B91C1C] rounded-full mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[#171717]">{title}</h3>
      <p className="text-sm text-[#737373] max-w-md mt-1 mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
