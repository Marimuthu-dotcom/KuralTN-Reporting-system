// Frontend/src/components/notifications/NotificationItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export function NotificationItem({ notification, onMarkRead }) {
  const typeIcons = {
    RESOLUTION_PROPOSED: <AlertTriangle className="w-4 h-4 text-[#B45309]" />,
    RESOLUTION_CONFIRMED: <CheckCircle2 className="w-4 h-4 text-[#15803D]" />,
    DEADLINE_SET: <Clock className="w-4 h-4 text-[#F97316]" />,
    DEADLINE_OVERDUE: <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />,
    DEADLINE_EXTENDED: <Clock className="w-4 h-4 text-[#B45309]" />,
    STATUS_CHANGED: <Shield className="w-4 h-4 text-[#F97316]" />,
    NEW_COMMENT: <MessageSquare className="w-4 h-4 text-blue-600" />,
    ACCOUNTABILITY_UPDATE: <Lock className="w-4 h-4 text-purple-600" />,
  };

  const getTargetUrl = () => {
    if (notification.related_entity_type === 'COMPLAINT' && notification.related_entity_id) {
      return `/complaints/${notification.related_entity_id}`;
    }
    if (notification.related_entity_type === 'ACCOUNTABILITY_CASE' && notification.related_entity_id) {
      return `/accountability/cases/${notification.related_entity_id}`;
    }
    return null;
  };

  const targetUrl = getTargetUrl();

  const content = (
    <div
      onClick={() => {
        if (!notification.is_read && onMarkRead) {
          onMarkRead(notification.id);
        }
      }}
      className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
        !notification.is_read
          ? 'bg-orange-50/50 border-orange-200'
          : 'bg-white border-[#E7E5E4] hover:bg-neutral-50'
      }`}
    >
      <div className="shrink-0 p-2 bg-white rounded-lg border border-[#E7E5E4] mt-0.5 shadow-2xs">
        {typeIcons[notification.type] || <Bell className="w-4 h-4 text-[#737373]" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-xs font-bold text-[#171717] truncate">
            {notification.title}
          </h4>
          <span className="text-[10px] text-[#737373] shrink-0">
            {formatDateTime(notification.created_at)}
          </span>
        </div>

        <p className="text-xs text-[#737373] leading-relaxed">
          {notification.message}
        </p>
      </div>

      {!notification.is_read && (
        <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0 self-center" />
      )}
    </div>
  );

  return targetUrl ? (
    <Link to={targetUrl} className="block">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
}
