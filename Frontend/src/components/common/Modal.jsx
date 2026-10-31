// Frontend/src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-neutral-900/60 transition-opacity backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal dialog box */}
        <div
          className={`relative w-full ${maxWidth} transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all border border-[#E7E5E4]`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-[#E7E5E4] px-6 py-4">
              <h3 className="text-lg font-bold text-[#171717]">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-[#737373] hover:bg-neutral-100 hover:text-[#171717] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
