// Frontend/src/components/complaints/SupportButton.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { supportService } from '../../services/supportService';
import { AnimatedThumbsUp } from '../common/AnimatedIcons';

export function SupportButton({
  complaintId,
  initialCount = 0,
  initialSupported = false,
  complaintWardId,
  onSupportChange,
}) {
  const { user, isAuthenticated } = useAuth();
  const { t, isTamil } = useLanguage();
  const [count, setCount] = useState(initialCount);
  const [isSupported, setIsSupported] = useState(initialSupported);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user belongs to this ward
  const isSameWard = user && user.ward_id === complaintWardId;
  const isPrivilegedRole = user && (user.role === 'ADMIN' || user.role === 'WARD_COUNCILLOR');
  const canParticipate = isAuthenticated && (isSameWard || isPrivilegedRole);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setErrorMessage(t('signInToSupport'));
      return;
    }

    if (!canParticipate) {
      setErrorMessage(t('wardRestrictedNotice'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await supportService.toggleSupport(complaintId);
      setIsSupported(res.supported);
      setCount(res.supports_count);
      if (onSupportChange) onSupportChange(res);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || (isTamil ? 'ஆதரவு அளிக்க இயலவில்லை.' : 'Unable to update support at this time.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
          isSupported
            ? 'bg-orange-50 border-[#F97316] text-[#F97316] shadow-2xs'
            : 'bg-white border-[#E7E5E4] text-[#171717] hover:bg-neutral-50'
        } ${isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
      >
        <AnimatedThumbsUp className={`w-3.5 h-3.5 ${isSupported ? 'text-[#F97316]' : 'text-[#737373]'}`} />
        <span>{count}</span>
        <span className="hidden sm:inline">{t('supports')}</span>
      </button>

      {errorMessage && (
        <div className="absolute left-0 bottom-full mb-1 w-64 p-2.5 bg-neutral-900 text-white text-[11px] rounded-lg shadow-lg z-20">
          {errorMessage}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setErrorMessage('');
            }}
            className="block mt-1 text-[10px] text-orange-400 underline cursor-pointer"
          >
            {isTamil ? 'மூடுக' : 'Dismiss'}
          </button>
        </div>
      )}
    </div>
  );
}
