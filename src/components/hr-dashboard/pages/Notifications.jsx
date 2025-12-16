import { useState, useEffect } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    attendance: {
      checkIn: true,
      checkOut: true,
      missedPunch: true,
      lateArrival: true
    },
    leave: {
      newRequest: true,
      approved: true,
      rejected: true,
      upcoming: true
    },
    bonus: {
      awarded: true,
      milestones: true
    },
    system: {
      updates: true,
      maintenance: true,
      security: true
    },
    manager: {
      teamUpdates: true,
      approvalRequired: true,
      lowPerformance: true
    }
  });

  const notificationTypes = [
    { value: 'attendance', label: 'Attendance', icon: 'fa-calendar-check', color: '#2e7d32' },
    { value: 'leave', label: 'Leave', icon: 'fa-plane-departure', color: '#1976d2' },
    { value: 'bonus', label: 'Bonus Points', icon: 'fa-star', color: '#f59e0b' },
    { value: 'system', label: 'System', icon: 'fa-cog', color: '#7b1fa2' },
    { value: 'manager', label: 'Manager', icon: 'fa-user-tie', color: '#f57c00' },
    { value: 'help', label: 'Help Desk', icon: 'fa-headset', color: '#00897b' },
    { value: 'shift', label: 'Shift', icon: 'fa-clock', color: '#c62828' },
    { value: 'salary', label: 'Salary', icon: 'fa-dollar-sign', color: '#1e7b4e' }
  ];

  useEffect(() => {
    generateMockNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filterType, filterStatus, searchQuery]);

  const generateMockNotifications = () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        type: 'attendance',
        title: 'Late Check-In Alert',
        message: 'John Doe checked in 15 minutes late today',
        timestamp: new Date('2024-12-09T09:15:00'),
        isRead: false,
        priority: 'medium',
        actionUrl: '/live-attendance',
        relatedUser: 'John Doe'
      },
      {
        id: 'notif-2',
        type: 'leave',
        title: 'New Leave Request',
        message: 'Sarah Williams has applied for sick leave from Dec 10-12',
        timestamp: new Date('2024-12-09T08:30:00'),
        isRead: false,
        priority: 'high',
        actionUrl: '/leave-management',
        relatedUser: 'Sarah Williams'
      },
      {
        id: 'notif-3',
        type: 'bonus',
        title: 'Bonus Points Awarded',
        message: 'You awarded 50 bonus points to Mike Johnson for excellent performance',
        timestamp: new Date('2024-12-08T16:45:00'),
        isRead: true,
        priority: 'low',
        actionUrl: '/bonus-points',
        relatedUser: 'Mike Johnson'
      },
      {
        id: 'notif-4',
        type: 'system',
        title: 'System Maintenance Scheduled',
        message: 'System maintenance is scheduled for Dec 15, 2024 from 2:00 AM - 4:00 AM',
        timestamp: new Date('2024-12-08T14:00:00'),
        isRead: true,
        priority: 'medium',
        actionUrl: null,
        relatedUser: null
      },
      {
        id: 'notif-5',
        type: 'help',
        title: 'New Support Ticket',
        message: 'Emily Rodriguez created a ticket: "Cannot access HR portal"',
        timestamp: new Date('2024-12-08T10:30:00'),
        isRead: false,
        priority: 'high',
        actionUrl: '/help-issues',
        relatedUser: 'Emily Rodriguez'
      },
      {
        id: 'notif-6',
        type: 'attendance',
        title: 'Missed Check-Out',
        message: 'David Chen forgot to check out yesterday',
        timestamp: new Date('2024-12-08T09:00:00'),
        isRead: true,
        priority: 'medium',
        actionUrl: '/live-attendance',
        relatedUser: 'David Chen'
      },
      {
        id: 'notif-7',
        type: 'manager',
        title: 'Team Performance Alert',
        message: 'Engineering team attendance rate dropped below 85% this week',
        timestamp: new Date('2024-12-07T17:00:00'),
        isRead: true,
        priority: 'high',
        actionUrl: '/manager-scoring',
        relatedUser: null
      },
      {
        id: 'notif-8',
        type: 'leave',
        title: 'Leave Approved',
        message: 'Your leave request for Dec 15-17 has been approved',
        timestamp: new Date('2024-12-07T11:00:00'),
        isRead: true,
        priority: 'low',
        actionUrl: '/leave-management',
        relatedUser: null
      },
      {
        id: 'notif-9',
        type: 'shift',
        title: 'Shift Change Request',
        message: 'Alex Brown requested to swap shift on Dec 12',
        timestamp: new Date('2024-12-06T15:30:00'),
        isRead: false,
        priority: 'medium',
        actionUrl: '/shift-management',
        relatedUser: 'Alex Brown'
      },
      {
        id: 'notif-10',
        type: 'salary',
        title: 'Payroll Processed',
        message: 'November payroll has been processed successfully',
        timestamp: new Date('2024-12-05T10:00:00'),
        isRead: true,
        priority: 'low',
        actionUrl: '/salary-management',
        relatedUser: null
      }
    ];

    setNotifications(mockNotifications);
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(notif => notif.type === filterType);
    }

    // Status filter
    if (filterStatus === 'unread') {
      filtered = filtered.filter(notif => !notif.isRead);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(notif => notif.isRead);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notif.relatedUser && notif.relatedUser.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredNotifications(filtered);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId
        ? { ...notif, isRead: true }
        : notif
    ));
  };

  const markAsUnread = (notificationId) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId
        ? { ...notif, isRead: false }
        : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    alert('✅ All notifications marked as read!');
  };

  const deleteNotification = (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      alert('✅ Notification deleted successfully!');
    }
  };

  const clearAllRead = () => {
    if (window.confirm('Are you sure you want to clear all read notifications?')) {
      setNotifications(prev => prev.filter(notif => !notif.isRead));
      alert('✅ All read notifications cleared!');
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleSettingToggle = (category, setting = null) => {
    if (setting) {
      setNotificationSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: !prev[category][setting]
        }
      }));
    } else {
      setNotificationSettings(prev => ({
        ...prev,
        [category]: !prev[category]
      }));
    }
  };

  const saveSettings = () => {
    setShowSettingsModal(false);
    alert('✅ Notification settings saved successfully!');
  };

  const getTypeInfo = (type) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return '#c62828';
    if (priority === 'medium') return '#f57c00';
    return '#2e7d32';
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const totalNotifications = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;
    const highPriority = notifications.filter(n => n.priority === 'high' && !n.isRead).length;
    const todayCount = notifications.filter(n => {
      const today = new Date().setHours(0, 0, 0, 0);
      const notifDate = new Date(n.timestamp).setHours(0, 0, 0, 0);
      return notifDate === today;
    }).length;

    return {
      totalNotifications,
      unreadCount,
      readCount,
      highPriority,
      todayCount
    };
  };

  const stats = getStats();

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notif-header">
        <div className="notif-header-left">
          <h2>
            <i className="fas fa-bell"></i>
            Notifications
          </h2>
          <p>Stay updated with system alerts and updates</p>
        </div>
        <div className="notif-header-right">
          <button className="btn-settings-notif" onClick={() => setShowSettingsModal(true)}>
            <i className="fas fa-cog"></i>
            Settings
          </button>
          <button className="btn-secondary" onClick={clearAllRead}>
            <i className="fas fa-trash"></i>
            Clear Read
          </button>
          <button className="btn-primary" onClick={markAllAsRead}>
            <i className="fas fa-check-double"></i>
            Mark All Read
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="notif-stats-grid">
        <div className="notif-stat-card total">
          <div className="notif-stat-icon">
            <i className="fas fa-bell"></i>
          </div>
          <div className="notif-stat-content">
            <div className="notif-stat-value">{stats.totalNotifications}</div>
            <div className="notif-stat-label">Total Notifications</div>
          </div>
        </div>

        <div className="notif-stat-card unread">
          <div className="notif-stat-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="notif-stat-content">
            <div className="notif-stat-value">{stats.unreadCount}</div>
            <div className="notif-stat-label">Unread</div>
            {stats.unreadCount > 0 && <div className="stat-badge-notif">Action Required</div>}
          </div>
        </div>

        <div className="notif-stat-card read">
          <div className="notif-stat-icon">
            <i className="fas fa-envelope-open"></i>
          </div>
          <div className="notif-stat-content">
            <div className="notif-stat-value">{stats.readCount}</div>
            <div className="notif-stat-label">Read</div>
          </div>
        </div>

        <div className="notif-stat-card priority">
          <div className="notif-stat-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div className="notif-stat-content">
            <div className="notif-stat-value">{stats.highPriority}</div>
            <div className="notif-stat-label">High Priority</div>
          </div>
        </div>

        <div className="notif-stat-card today">
          <div className="notif-stat-icon">
            <i className="far fa-calendar-day"></i>
          </div>
          <div className="notif-stat-content">
            <div className="notif-stat-value">{stats.todayCount}</div>
            <div className="notif-stat-label">Today</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="notif-filters">
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-notif"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select-notif"
        >
          <option value="all">All Types</option>
          {notificationTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select-notif"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="notif-list-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state-notif">
            <i className="fas fa-bell-slash"></i>
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="notif-list">
            {filteredNotifications.map(notification => {
              const typeInfo = getTypeInfo(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`notif-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notif-icon-wrapper">
                    <div
                      className="notif-icon"
                      style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                    >
                      <i className={`fas ${typeInfo.icon}`}></i>
                    </div>
                    {!notification.isRead && <div className="unread-dot"></div>}
                  </div>

                  <div className="notif-content">
                    <div className="notif-header-row">
                      <div className="notif-title">{notification.title}</div>
                      <div className="notif-meta">
                        <span
                          className="priority-dot"
                          style={{ background: getPriorityColor(notification.priority) }}
                          title={`${notification.priority} priority`}
                        ></span>
                        <span className="notif-time">{formatTimeAgo(notification.timestamp)}</span>
                      </div>
                    </div>
                    <div className="notif-message">{notification.message}</div>
                    <div className="notif-footer-row">
                      <span
                        className="notif-type-badge"
                        style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                      {notification.relatedUser && (
                        <span className="related-user">
                          <i className="far fa-user"></i>
                          {notification.relatedUser}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notif-actions">
                    {!notification.isRead ? (
                      <button
                        className="action-btn-notif read"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    ) : (
                      <button
                        className="action-btn-notif unread"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnread(notification.id);
                        }}
                        title="Mark as unread"
                      >
                        <i className="fas fa-envelope"></i>
                      </button>
                    )}
                    <button
                      className="action-btn-notif delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-cog"></i>
                Notification Settings
              </h3>
              <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Global Settings */}
              <div className="settings-section">
                <h4>Notification Channels</h4>
                <div className="settings-list">
                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <i className="far fa-envelope"></i>
                      <div>
                        <div className="setting-name-notif">Email Notifications</div>
                        <div className="setting-desc-notif">Receive notifications via email</div>
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={() => handleSettingToggle('emailNotifications')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <i className="fas fa-bell"></i>
                      <div>
                        <div className="setting-name-notif">Push Notifications</div>
                        <div className="setting-desc-notif">Receive browser push notifications</div>
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={() => handleSettingToggle('pushNotifications')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <i className="fas fa-sms"></i>
                      <div>
                        <div className="setting-name-notif">SMS Notifications</div>
                        <div className="setting-desc-notif">Receive notifications via SMS</div>
                      </div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={() => handleSettingToggle('smsNotifications')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Attendance Notifications */}
              <div className="settings-section">
                <h4>
                  <i className="fas fa-calendar-check" style={{ color: '#2e7d32' }}></i>
                  Attendance Notifications
                </h4>
                <div className="settings-list">
                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Check-In Alerts</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.attendance.checkIn}
                        onChange={() => handleSettingToggle('attendance', 'checkIn')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Check-Out Alerts</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.attendance.checkOut}
                        onChange={() => handleSettingToggle('attendance', 'checkOut')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Missed Punch Alerts</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.attendance.missedPunch}
                        onChange={() => handleSettingToggle('attendance', 'missedPunch')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Late Arrival Alerts</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.attendance.lateArrival}
                        onChange={() => handleSettingToggle('attendance', 'lateArrival')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Leave Notifications */}
              <div className="settings-section">
                <h4>
                  <i className="fas fa-plane-departure" style={{ color: '#1976d2' }}></i>
                  Leave Notifications
                </h4>
                <div className="settings-list">
                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">New Leave Requests</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.leave.newRequest}
                        onChange={() => handleSettingToggle('leave', 'newRequest')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Leave Approved</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.leave.approved}
                        onChange={() => handleSettingToggle('leave', 'approved')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Leave Rejected</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.leave.rejected}
                        onChange={() => handleSettingToggle('leave', 'rejected')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Upcoming Leave Reminders</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.leave.upcoming}
                        onChange={() => handleSettingToggle('leave', 'upcoming')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bonus Notifications */}
              <div className="settings-section">
                <h4>
                  <i className="fas fa-star" style={{ color: '#f59e0b' }}></i>
                  Bonus & Rewards Notifications
                </h4>
                <div className="settings-list">
                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Points Awarded</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.bonus.awarded}
                        onChange={() => handleSettingToggle('bonus', 'awarded')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Milestone Achievements</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.bonus.milestones}
                        onChange={() => handleSettingToggle('bonus', 'milestones')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* System Notifications */}
              <div className="settings-section">
                <h4>
                  <i className="fas fa-cog" style={{ color: '#7b1fa2' }}></i>
                  System Notifications
                </h4>
                <div className="settings-list">
                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">System Updates</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.system.updates}
                        onChange={() => handleSettingToggle('system', 'updates')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Maintenance Alerts</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.system.maintenance}
                        onChange={() => handleSettingToggle('system', 'maintenance')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Security Alerts</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.system.security}
                        onChange={() => handleSettingToggle('system', 'security')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Manager Notifications */}
              <div className="settings-section">
                <h4>
                  <i className="fas fa-user-tie" style={{ color: '#f57c00' }}></i>
                  Manager Notifications
                </h4>
                <div className="settings-list">
                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Team Updates</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.manager.teamUpdates}
                        onChange={() => handleSettingToggle('manager', 'teamUpdates')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Approval Required</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.manager.approvalRequired}
                        onChange={() => handleSettingToggle('manager', 'approvalRequired')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-item-notif">
                    <div className="setting-info-notif">
                      <div className="setting-name-notif">Low Performance Alerts</div>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.manager.lowPerformance}
                        onChange={() => handleSettingToggle('manager', 'lowPerformance')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={saveSettings}
              >
                <i className="fas fa-save"></i>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;