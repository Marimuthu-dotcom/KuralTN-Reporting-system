// Frontend/src/components/complaints/ComplaintCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  MessageSquare,
  Building,
  Calendar,
} from 'lucide-react';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { DeadlineIndicator } from './DeadlineIndicator';
import { SupportButton } from './SupportButton';
import { formatDate } from '../../utils/dateUtils';
import { useLanguage } from '../../hooks/useLanguage';
import { AnimatedCheckmark, AnimatedAlert, AnimatedPin } from '../common/AnimatedIcons';

export function ComplaintCard({ complaint, onSupportChange }) {
  const { t, getCategoryTitle, isTamil } = useLanguage();

  if (!complaint) return null;

  const isResolved = complaint.status === 'Resolved' || complaint.status === 'Closed';
  const isAwaitingConfirmation = complaint.verification_state === 'AWAITING_CITIZEN_CONFIRMATION';

  const primaryImage =
    complaint.images && complaint.images.length > 0 ? complaint.images[0].image_url : null;

  const localizedCategory = getCategoryTitle(complaint.category_id, complaint.category_name);

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Top Banner for Resolution Status if awaiting confirmation */}
      {isAwaitingConfirmation && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AnimatedAlert className="w-4 h-4 text-white shrink-0" />
            <span>
              {isTamil
                ? 'பணி முடிந்தது — நீங்கள் நேரில் பார்த்து உறுதிசெய்ய வேண்டும்'
                : 'Resolution Proposed — Action Required by Citizen'}
            </span>
          </div>
          <Link to={`/complaints/${complaint.id}`} className="underline hover:text-amber-100 shrink-0 ml-2">
            {isTamil ? 'ஆதாரம் பார்க்க' : 'Review Evidence'}
          </Link>
        </div>
      )}

      {isResolved && complaint.verification_state === 'CONFIRMED_RESOLVED' && (
        <div className="bg-green-700 text-white px-4 py-1.5 text-xs font-semibold flex items-center gap-2">
          <AnimatedCheckmark className="w-4 h-4 text-white shrink-0" />
          <span>
            {isTamil ? 'அதிகாரப்பூர்வமாகத் தீர்க்கப்பட்டு மக்களால் உறுதிசெய்யப்பட்டது' : 'Officially Verified & Confirmed Resolved'}
          </span>
        </div>
      )}

      <div className="p-5 flex-1">
        {/* Header row: Reference ID + Category + Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-neutral-100 text-[#171717] border border-neutral-200">
              {complaint.reference_id}
            </span>
            <span className="text-xs font-semibold text-[#F97316]">
              {localizedCategory}
            </span>
          </div>

          <ComplaintStatusBadge
            status={complaint.status}
            verificationState={complaint.verification_state}
          />
        </div>

        {/* Title & Link */}
        <Link to={`/complaints/${complaint.id}`} className="group block mb-2">
          <h3 className="text-base font-bold text-[#171717] group-hover:text-[#F97316] transition-colors line-clamp-2 leading-snug">
            {complaint.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-[#737373] line-clamp-2 mb-4 leading-relaxed">
          {complaint.description}
        </p>

        {/* Thumbnail preview if photo exists */}
        {primaryImage && (
          <div className="mb-4 rounded-xl overflow-hidden h-36 bg-neutral-100 border border-[#E7E5E4]">
            <img
              src={primaryImage}
              alt={complaint.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Middleware Routing Badge: Councillor Verification vs Department Dispatch */}
        {!complaint.councillor_verified && complaint.status === 'Pending Councillor Verification' ? (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-black text-amber-700 shrink-0">🛡️ {isTamil ? 'வார்டு கவுன்சிலர் சரிபார்ப்பில் உள்ளது:' : 'Councillor Middleware:'}</span>
              <span className="text-amber-800 font-medium truncate">
                {isTamil ? 'கவுன்சிலர் சரிபார்த்து துறைக்கு அனுப்ப வேண்டும்' : 'Awaiting verification before department dispatch'}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white text-[10px] font-bold text-amber-800 border border-amber-200 shrink-0">
              {isTamil ? 'சரிபார்க்க' : 'Pending'}
            </span>
          </div>
        ) : (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-black text-[#F97316] shrink-0">🏛️ {isTamil ? 'பொறுப்புத் துறை:' : 'Managing Dept:'}</span>
              <span className="font-bold text-[#171717] truncate">
                {isTamil
                  ? (complaint.department?.name_ta || complaint.department_name_ta || 'நகராட்சி நிர்வாகம்')
                  : (complaint.department?.name || complaint.department_name || 'Municipal Administration')}
              </span>
            </div>
            {complaint.councillor_verified && (
              <span className="px-1.5 py-0.5 rounded bg-green-50 text-[10px] font-bold text-green-700 border border-green-200 shrink-0 flex items-center gap-1">
                ✓ {isTamil ? 'கவுன்சிலர் அனுமதித்தது' : 'Councillor Verified'}
              </span>
            )}
          </div>
        )}

        {/* Location & Ward metadata */}
        <div className="space-y-1 mb-4 text-xs text-[#737373]">
          <div className="flex items-center gap-1.5">
            <AnimatedPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
            <span className="truncate">{complaint.address_text}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#737373] shrink-0" />
            <span className="truncate">
              {complaint.ward_name || `Ward ${complaint.ward_id}`} &bull; {complaint.district_name || 'Tamil Nadu'}
            </span>
          </div>
        </div>

        {/* Deadline Indicator Component */}
        <div className="mb-2">
          <DeadlineIndicator
            deadline={complaint.active_deadline}
            condition={complaint.deadline_condition}
            isResolved={isResolved}
          />
        </div>
      </div>

      {/* Footer action bar */}
      <div className="px-5 py-3.5 bg-[#FAF9F6] border-t border-[#E7E5E4] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <SupportButton
            complaintId={complaint.id}
            initialCount={complaint.supports_count}
            complaintWardId={complaint.ward_id}
            onSupportChange={onSupportChange}
          />

          <Link
            to={`/complaints/${complaint.id}#comments`}
            className="flex items-center gap-1 text-[#737373] hover:text-[#171717] font-semibold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{complaint.comments_count || 0}</span>
            <span className="hidden sm:inline">{t('comments')}</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 text-[#737373] text-[11px]">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(complaint.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
