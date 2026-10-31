// Frontend/src/components/community/AnnouncementCard.jsx
import React from 'react';
import { Megaphone, Calendar, Shield } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

export function AnnouncementCard({ announcement }) {
  if (!announcement) return null;

  const priorityVariantMap = {
    URGENT: 'danger',
    IMPORTANT: 'warning',
    NORMAL: 'primary',
  };

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[#F97316]" />
          <Badge variant={priorityVariantMap[announcement.priority] || 'primary'} size="xs">
            {announcement.priority} ANNOUNCEMENT
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#737373]">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(announcement.created_at)}</span>
        </div>
      </div>

      <h3 className="text-sm font-bold text-[#171717]">{announcement.title}</h3>

      <p className="text-xs text-[#737373] leading-relaxed whitespace-pre-wrap">
        {announcement.content}
      </p>

      {announcement.expires_at && (
        <div className="text-[10px] text-[#737373] italic">
          Active through: {formatDate(announcement.expires_at)}
        </div>
      )}
    </div>
  );
}
