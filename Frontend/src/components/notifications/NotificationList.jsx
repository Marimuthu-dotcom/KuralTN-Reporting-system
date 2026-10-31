// Frontend/src/components/notifications/NotificationList.jsx
import React from 'react';
import { NotificationItem } from './NotificationItem';
import { EmptyState } from '../common/EmptyState';
import { Bell } from 'lucide-react';

export function NotificationList({ notifications = [], onMarkRead }) {
  if (!notifications || notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="You have no notifications yet. Status updates, official responses, and deadline changes will appear here."
        icon={Bell}
      />
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
}
