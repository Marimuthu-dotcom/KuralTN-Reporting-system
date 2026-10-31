// Frontend/src/pages/citizen/NotificationsPage.jsx
import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationList } from '../../components/notifications/NotificationList';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { CheckCheck } from 'lucide-react';

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs items={[{ label: 'Notifications' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4]">
        <div>
          <h1 className="text-2xl font-black text-[#171717] tracking-tight">
            Notifications & System Alerts
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Stay informed on target dates, resolution evidence proposals, and community notices
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={markAllAsRead}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        onMarkRead={markAsRead}
      />
    </div>
  );
}
