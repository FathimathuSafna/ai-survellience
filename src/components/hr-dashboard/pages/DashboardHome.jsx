import { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardHome.css';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onBreak: 0,
    lateToday: 0,
    onLeave: 0,
    unknownDetections: 0,
    pendingLeaves: 0
  });
  
  const [todaySummaries, setTodaySummaries] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardData();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Refresh data every 30 seconds
    const dataInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data
      const [facesRes, attendanceRes, unknownRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/faces`),
        axios.get(`${API_URL}/attendance/today`),
        axios.get(`${API_URL}/unknown/list?limit=100`),
        axios.get(`${API_URL}/attendance/logs?limit=20`)
      ]);

      const faces = facesRes.data;
      const attendanceData = attendanceRes.data;
      const unknownData = unknownRes.data;
      const logsData = logsRes.data;

      // Calculate stats
      const totalEmployees = faces.length;
      const presentToday = attendanceData.summaries?.length || 0;
      const unknownDetections = unknownData.total || 0;

      // Count employees on break (those who are currently OUT)
      const onBreak = attendanceData.summaries?.filter(summary => {
        // Check if last event was 'out'
        return summary.sessions && summary.sessions.length > 0 && 
               summary.sessions[summary.sessions.length - 1].timeOut !== null;
      }).length || 0;

      setStats({
        totalEmployees,
        presentToday,
        absentToday: totalEmployees - presentToday,
        onBreak,
        lateToday: 0, // Will be calculated based on shift times
        onLeave: 2, // Mock data - will be from leave management
        unknownDetections,
        pendingLeaves: 2 // Mock data
      });

      setTodaySummaries(attendanceData.summaries || []);
      setRecentActivity(logsData.logs || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventIcon = (event) => {
    return event === 'in' ? '🚪' : '👋';
  };

  const getEventColor = (event) => {
    return event === 'in' ? '#1e7b4e' : '#ff9900';
  };

  return (
    <div className="dashboard-home">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>{getGreeting()}, HR Admin!</h2>
          <p>Here's what's happening with your team today</p>
        </div>
        <div className="current-datetime">
          <div className="current-time">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </div>
          <div className="current-date">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Employees */}
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{stats.totalEmployees}</div>
            <div className="stat-footer">
              <span className="stat-change positive">
                <i className="fas fa-arrow-up"></i> Active
              </span>
            </div>
          </div>
        </div>

        {/* Present Today */}
        <div className="stat-card success">
          <div className="stat-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Present Today</div>
            <div className="stat-value">{stats.presentToday}</div>
            <div className="stat-footer">
              <span className="stat-change">
                {((stats.presentToday / stats.totalEmployees) * 100).toFixed(0)}% Attendance
              </span>
            </div>
          </div>
        </div>

        {/* Absent Today */}
        <div className="stat-card danger">
          <div className="stat-icon">
            <i className="fas fa-user-times"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Absent Today</div>
            <div className="stat-value">{stats.absentToday}</div>
            <div className="stat-footer">
              <span className="stat-change">
                {stats.absentToday > 0 ? 'Needs attention' : 'Perfect!'}
              </span>
            </div>
          </div>
        </div>

        {/* On Break */}
        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="fas fa-coffee"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">On Break</div>
            <div className="stat-value">{stats.onBreak}</div>
            <div className="stat-footer">
              <span className="stat-change">
                Currently away
              </span>
            </div>
          </div>
        </div>

        {/* Late Today */}
        <div className="stat-card info">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Late Today</div>
            <div className="stat-value">{stats.lateToday}</div>
            <div className="stat-footer">
              <span className="stat-change">
                On-time arrivals
              </span>
            </div>
          </div>
        </div>

        {/* On Leave */}
        <div className="stat-card purple">
          <div className="stat-icon">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">On Leave</div>
            <div className="stat-value">{stats.onLeave}</div>
            <div className="stat-footer">
              <span className="stat-change">
                {stats.pendingLeaves} pending approval
              </span>
            </div>
          </div>
        </div>

        {/* Unknown Detections */}
        <div className="stat-card alert">
          <div className="stat-icon">
            <i className="fas fa-user-secret"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Unknown Detections</div>
            <div className="stat-value">{stats.unknownDetections}</div>
            <div className="stat-footer">
              <span className="stat-change negative">
                <i className="fas fa-exclamation-triangle"></i> Security Alert
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="stat-card actions">
          <div className="stat-content">
            <div className="stat-label">Quick Actions</div>
            <div className="action-buttons">
              <button className="action-btn">
                <i className="fas fa-user-plus"></i>
                Add Employee
              </button>
              <button className="action-btn">
                <i className="fas fa-file-export"></i>
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Today's Attendance Summary */}
        <div className="content-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-users"></i>
              Today's Attendance Summary
            </h3>
            <button className="refresh-btn" onClick={fetchDashboardData}>
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading data...</p>
              </div>
            ) : todaySummaries.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No attendance records for today</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>First In</th>
                      <th>Last Out</th>
                      <th>Total Hours</th>
                      <th>Sessions</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySummaries.slice(0, 5).map((summary, index) => (
                      <tr key={index}>
                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">
                              {summary.employeeName.charAt(0)}
                            </div>
                            <span>{summary.employeeName}</span>
                          </div>
                        </td>
                        <td>{summary.firstIn ? formatTime(summary.firstIn) : '-'}</td>
                        <td>{summary.lastOut ? formatTime(summary.lastOut) : '-'}</td>
                        <td>
                          <span className="badge badge-time">
                            {summary.totalHours || '0h 0m'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-count">
                            {summary.sessions?.length || 0}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${summary.lastOut ? 'status-out' : 'status-in'}`}>
                            {summary.lastOut ? 'OUT' : 'IN'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {todaySummaries.length > 5 && (
              <div className="card-footer">
                <button className="view-all-btn">
                  View All ({todaySummaries.length}) <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="content-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-history"></i>
              Recent Activity
            </h3>
            <span className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </span>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.slice(0, 8).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon" style={{ background: getEventColor(activity.event) }}>
                      {getEventIcon(activity.event)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        <strong>{activity.employeeName}</strong>
                        <span className={`activity-event ${activity.event}`}>
                          {activity.event === 'in' ? 'checked in' : 'checked out'}
                        </span>
                      </div>
                      <div className="activity-time">
                        {formatTime(activity.event === 'in' ? activity.timeIn : activity.timeOut)}
                      </div>
                    </div>
                    {activity.duration && (
                      <div className="activity-duration">
                        {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        {/* Quick Stats */}
        <div className="quick-stats-card">
          <h4>
            <i className="fas fa-chart-pie"></i>
            Attendance Overview
          </h4>
          <div className="quick-stats-grid">
            <div className="quick-stat">
              <div className="quick-stat-label">Present Rate</div>
              <div className="quick-stat-value success">
                {stats.totalEmployees > 0 
                  ? ((stats.presentToday / stats.totalEmployees) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-label">Absent Rate</div>
              <div className="quick-stat-value danger">
                {stats.totalEmployees > 0 
                  ? ((stats.absentToday / stats.totalEmployees) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-label">On Break</div>
              <div className="quick-stat-value warning">
                {stats.onBreak}
              </div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-label">Unknown</div>
              <div className="quick-stat-value alert">
                {stats.unknownDetections}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="alerts-card">
          <h4>
            <i className="fas fa-bell"></i>
            Alerts & Notifications
          </h4>
          <div className="alerts-list">
            {stats.unknownDetections > 0 && (
              <div className="alert-item alert">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="alert-content">
                  <div className="alert-title">{stats.unknownDetections} Unknown Person(s) Detected</div>
                  <div className="alert-time">Security check required</div>
                </div>
              </div>
            )}
            {stats.pendingLeaves > 0 && (
              <div className="alert-item info">
                <i className="fas fa-calendar-check"></i>
                <div className="alert-content">
                  <div className="alert-title">{stats.pendingLeaves} Leave Request(s) Pending</div>
                  <div className="alert-time">Approval needed</div>
                </div>
              </div>
            )}
            {stats.absentToday > 3 && (
              <div className="alert-item warning">
                <i className="fas fa-user-times"></i>
                <div className="alert-content">
                  <div className="alert-title">High Absence Rate Today</div>
                  <div className="alert-time">{stats.absentToday} employees absent</div>
                </div>
              </div>
            )}
            {stats.unknownDetections === 0 && stats.pendingLeaves === 0 && stats.absentToday <= 3 && (
              <div className="no-alerts">
                <i className="fas fa-check-circle"></i>
                <p>All clear! No alerts at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;