// Frontend/src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

const LOCAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Complaint Acknowledged by Ward 43',
    message: 'CIV-2026-00007 (Streetlight outage near Millerpuram) has been reviewed by the Ward Councillor.',
    type: 'STATUS_UPDATE',
    is_read: false,
    link: '/complaints/comp-007',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'Ward Community Announcement',
    message: 'Scheduled overhead water tank cleaning in Millerpuram Ward 43 this Sunday morning.',
    type: 'ANNOUNCEMENT',
    is_read: false,
    link: '/ward/announcements',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'Department Repair In Progress',
    message: 'Public Works team has been dispatched for drainage desilting on 2nd Street.',
    type: 'DEADLINE_ALERT',
    is_read: true,
    link: '/complaints/comp-006',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications();
      const list = data?.length ? data : LOCAL_NOTIFICATIONS;
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch {
      setNotifications(LOCAL_NOTIFICATIONS);
      setUnreadCount(LOCAL_NOTIFICATIONS.filter((n) => !n.is_read).length);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
