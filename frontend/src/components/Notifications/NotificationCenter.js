import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, X, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';
import './Notifications.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = () => {
    // Mock notifications based on user role and recent activity
    const mockNotifications = [
      {
        _id: 'notif_1',
        type: 'assignment',
        title: user?.role === 'teacher' ? 'New Assignment Submission' : 'Assignment Due Soon',
        message: user?.role === 'teacher' 
          ? 'Jane Student submitted "React Components Assignment"'
          : 'React Components Assignment is due in 2 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        icon: Calendar
      },
      {
        _id: 'notif_2',
        type: 'grade',
        title: user?.role === 'teacher' ? 'Grading Reminder' : 'New Grade Posted',
        message: user?.role === 'teacher'
          ? 'You have 3 assignments pending grading'
          : 'Your grade for "JavaScript Basics" has been posted: 85/100',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        icon: CheckCircle
      },
      {
        _id: 'notif_3',
        type: 'course',
        title: user?.role === 'teacher' ? 'New Student Enrollment' : 'Course Update',
        message: user?.role === 'teacher'
          ? 'John Doe enrolled in "Advanced JavaScript"'
          : 'New materials added to "Introduction to React"',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: true,
        icon: Info
      },
      {
        _id: 'notif_4',
        type: 'system',
        title: 'System Update',
        message: 'New features added: Discussion forums and file sharing',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        icon: AlertCircle
      }
    ];

    setNotifications(mockNotifications);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif._id !== notificationId)
    );
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'assignment': return '#f59e0b';
      case 'grade': return '#10b981';
      case 'course': return '#3b82f6';
      case 'system': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay">
      <div className="notification-panel">
        <div className="notification-header">
          <h3>Notifications</h3>
          <div className="notification-actions">
            {notifications.some(n => !n.read) && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="close-notifications">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="notification-content">
                    <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                      <IconComponent size={20} />
                    </div>
                    <div className="notification-text">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    {!notification.read && <div className="unread-indicator" />}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    className="delete-notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty-notifications">
              <Bell size={48} />
              <h4>No notifications</h4>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
