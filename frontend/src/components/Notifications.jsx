import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'team_created':
        return '🎉';
      case 'team_joined':
        return '👥';
      case 'team_removed':
        return '👋';
      case 'project_shared':
        return '📁';
      case 'forecast_updated':
        return '📊';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-8">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium dark:bg-red-600">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Stay updated with team activities and project updates</p>
          </div>
        </div>
      </div>

      <div className="p-8">

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications yet</h3>
          <p className="text-gray-600 dark:text-gray-400">You'll see team invitations and project updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                notification.read 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600' 
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${notification.read ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-300'}`}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default Notifications;
