// Frontend/src/components/complaints/DeadlineIndicator.jsx
import React from 'react';
import { formatDate, getDaysRemaining } from '../../utils/dateUtils';
import { formatDeadlineType } from '../../utils/formatters';
import { useLanguage } from '../../hooks/useLanguage';
import { AnimatedClock, AnimatedAlert, AnimatedCheckmark } from '../common/AnimatedIcons';

export function DeadlineIndicator({ deadline, condition = 'ON_TRACK', isResolved = false }) {
  const { t, isTamil } = useLanguage();

  if (isResolved) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#15803D] bg-green-50 px-3 py-2 rounded-lg border border-green-200 shadow-2xs">
        <AnimatedCheckmark className="w-4 h-4 shrink-0 text-[#15803D]" />
        <span className="font-semibold">
          {isTamil ? 'திட்டமிட்டபடி வெற்றிகரமாக முடிக்கப்பட்டது' : 'Resolved within workflow'}
        </span>
      </div>
    );
  }

  if (!deadline) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#737373] bg-neutral-50 px-3 py-2 rounded-lg border border-[#E7E5E4]">
        <AnimatedClock className="w-3.5 h-3.5 shrink-0 text-[#737373]" />
        <span>
          {isTamil
            ? 'தீர்வு நாள்: துறை ஆய்வுக்குப் பின் உறுதிசெய்யப்படும்'
            : 'Target date pending departmental review'}
        </span>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(deadline.current_target_date);
  const isOverdue = condition === 'OVERDUE' || (daysRemaining !== null && daysRemaining < 0);
  const isApproaching = condition === 'APPROACHING' || (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 2);

  return (
    <div
      className={`rounded-lg border p-3 text-xs transition-all ${
        isOverdue
          ? 'bg-red-50/80 border-red-200 text-red-950 shadow-2xs'
          : isApproaching
          ? 'bg-amber-50/80 border-amber-200 text-amber-950 shadow-2xs'
          : 'bg-orange-50/50 border-orange-200 text-[#171717]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          {isOverdue ? (
            <AnimatedAlert className="w-4 h-4 text-[#B91C1C]" />
          ) : (
            <AnimatedClock className="w-4 h-4 text-[#F97316]" />
          )}
          <span>{t('targetDate')}: {formatDate(deadline.current_target_date)}</span>
        </div>

        <div>
          {isOverdue ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#B91C1C] text-white uppercase animate-pulse">
              {isTamil ? `காலக்கெடு கடந்தது (${Math.abs(daysRemaining || 0)} நாள்)` : `Overdue (${Math.abs(daysRemaining || 0)}d)`}
            </span>
          ) : isApproaching ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#B45309] text-white uppercase">
              {isTamil ? `இன்னும் ${daysRemaining} நாட்கள்` : `Due in ${daysRemaining}d`}
            </span>
          ) : condition === 'EXTENDED' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
              {isTamil ? 'கால நீட்டிப்பு' : 'Extended'}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase">
              {isTamil ? 'திட்டமிட்டபடி நடக்கிறது' : 'On Track'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-0.5 text-[11px] text-[#737373]">
        <div>
          <span className="font-semibold text-[#171717]">{isTamil ? 'வகைப்பாடு: ' : 'Classification: '}</span>
          {formatDeadlineType(deadline.deadline_type)}
        </div>
        {deadline.responsible_department && (
          <div>
            <span className="font-semibold text-[#171717]">{isTamil ? 'பொறுப்புத் துறை: ' : 'Responsible: '}</span>
            {deadline.responsible_department}
          </div>
        )}
        {deadline.supporting_source_text && (
          <div className="italic pt-0.5 text-neutral-600">
            &ldquo;{deadline.supporting_source_text}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
