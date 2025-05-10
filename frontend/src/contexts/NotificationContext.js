// NotificationContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '~/services/notificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { notifications, unreadCount } = await notificationService.fetchNotifications(userId);
      setNotifications(notifications);
      setUnreadCount(unreadCount);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (userId, notificationId) => {
    try {
        console.log("Marking notification as read:", userId, notificationId);
        
        
      await notificationService.markAsRead(userId, notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllAsRead = async (userId) => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, error, fetchNotifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);