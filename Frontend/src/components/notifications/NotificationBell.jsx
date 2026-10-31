// Frontend/src/components/notifications/NotificationBell.jsx
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export function NotificationBell({ onClick, className = '' }) {
  const { unreadCount } = useNotifications();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-2 text-[#737373] hover:text-[#171717] rounded-lg hover:bg-neutral-100 transition-colors ${className}`}
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B91C1C] text-white text-[10px] font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
