"use client";

import { useState, useEffect } from "react";
import { Bell, X, Calendar, Heart, AlertTriangle, Info } from "lucide-react";

export default function PeriodNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Check for notifications every hour
    const interval = setInterval(fetchNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/period-tracker/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setHasUnread(data.notifications?.length > 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "period_reminder":
      case "period_start":
        return <Calendar className="w-5 h-5 text-pink-600" />;
      case "fertility_window":
      case "ovulation":
        return <Heart className="w-5 h-5 text-green-600" />;
      case "late_period":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const dismissNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
    if (notifications.length === 1) {
      setHasUnread(false);
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition-colors z-40"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-pink-50">
              <h3 className="text-lg font-semibold text-pink-800">Health Reminders</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} border-b border-gray-100 last:border-b-0`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.date).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => dismissNotification(index)}
                          className="text-xs text-pink-600 hover:text-pink-800 font-medium"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Notifications are based on your cycle tracking data
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}