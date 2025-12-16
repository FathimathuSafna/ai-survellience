import { useState, useEffect } from 'react';
import axios from 'axios';
import './LiveAttendance.css';

const LiveAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchLiveAttendance();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Auto-refresh every 10 seconds
    const refreshInterval = setInterval(() => {
      if (autoRefresh) {
        fetchLiveAttendance();
      }
    }, 10000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    filterData();
  }, [attendanceData, searchQuery, statusFilter]);

  const fetchLiveAttendance = async () => {
    try {
      const [facesRes, todayRes] = await Promise.all([
        axios.get(`${API_URL}/faces`),
        axios.get(`${API_URL}/attendance/today`)
      ]);

      const allEmployees = facesRes.data;
      const todaySummaries = todayRes.data.summaries || [];

      // Create live attendance array
      const liveData = allEmployees.map(employee => {
        const summary = todaySummaries.find(s => s.userId.toString() === employee._id.toString());
        
        let status = 'ABSENT';
        let timeIn = null;
        let timeOut = null;
        let duration = '0h 0m';
        let currentSession = null;
        let breakType = 'none';

        if (summary) {
          // Check if employee is currently IN or OUT
          const lastSession = summary.sessions && summary.sessions.length > 0 
            ? summary.sessions[summary.sessions.length - 1] 
            : null;

          timeIn = summary.firstIn;
          timeOut = summary.lastOut;
          duration = summary.totalHours || '0h 0m';

          if (lastSession) {
            if (lastSession.timeOut) {
              // Last session has timeOut - employee is OUT/ON BREAK
              status = 'OUT';
              breakType = lastSession.breakType || 'other';
            } else {
              // Last session has no timeOut - employee is IN
              status = 'IN';
              currentSession = {
                startTime: lastSession.timeIn,
                duration: calculateDuration(lastSession.timeIn, new Date())
              };
            }
          } else {
            // Has summary but no sessions - just logged in
            status = 'IN';
          }
        }

        return {
          id: employee._id,
          name: employee.name,
          status,
          timeIn,
          timeOut,
          duration,
          currentSession,
          breakType,
          totalMinutes: summary?.totalMinutes || 0,
          sessions: summary?.sessions || []
        };
      });

      setEmployees(allEmployees);
      setAttendanceData(liveData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching live attendance:', err);
      setLoading(false);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filterData = () => {
    let filtered = [...attendanceData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN': return '#2e7d32';
      case 'OUT': return '#f57c00';
      case 'ABSENT': return '#c62828';
      default: return '#718096';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN': return 'fa-user-check';
      case 'OUT': return 'fa-coffee';
      case 'ABSENT': return 'fa-user-times';
      default: return 'fa-user';
    }
  };

  const getBreakIcon = (breakType) => {
    switch (breakType) {
      case 'tea': return '☕';
      case 'lunch': return '🍽️';
      case 'snacks': return '🍪';
      case 'other': return '⏸️';
      default: return '';
    }
  };

  const getBreakLabel = (breakType) => {
    switch (breakType) {
      case 'tea': return 'Tea Break';
      case 'lunch': return 'Lunch Break';
      case 'snacks': return 'Snacks Break';
      case 'other': return 'Break';
      default: return '';
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleManualCheckIn = async (employeeId, employeeName) => {
    if (!window.confirm(`Manually check in ${employeeName}?`)) return;

    try {
      const response = await axios.post(`${API_URL}/attendance/in`, {
        userId: employeeId,
        employeeName
      });

      if (response.data.success) {
        alert(`✅ ${employeeName} checked in successfully!`);
        fetchLiveAttendance();
      }
    } catch (err) {
      console.error('Manual check-in error:', err);
      alert('❌ Failed to check in. ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const handleManualCheckOut = async (employeeId, employeeName) => {
    if (!window.confirm(`Manually check out ${employeeName}?`)) return;

    try {
      const response = await axios.post(`${API_URL}/attendance/out`, {
        userId: employeeId,
        employeeName
      });

      if (response.data.success) {
        const { sessionDuration, breakLabel, todayTotal } = response.data.data;
        alert(`✅ ${employeeName} checked out!\nSession: ${sessionDuration}\nBreak: ${breakLabel}\nToday Total: ${todayTotal}`);
        fetchLiveAttendance();
      }
    } catch (err) {
      console.error('Manual check-out error:', err);
      alert('❌ Failed to check out. ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(e => e.status === 'IN').length,
    absent: attendanceData.filter(e => e.status === 'ABSENT').length,
    onBreak: attendanceData.filter(e => e.status === 'OUT').length
  };

  return (
    <div className="live-attendance">
      {/* Header Section */}
      <div className="live-header">
        <div className="live-header-content">
          <div className="live-title">
            <h2>
              <span className="live-indicator">
                <span className="live-dot"></span>
                LIVE
              </span>
              Real-Time Attendance Monitor
            </h2>
            <p>Auto-updates every 10 seconds • Last updated: {formatTime(lastUpdate)}</p>
          </div>
          
          <div className="live-time">
            <div className="current-time-display">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </div>
            <div className="current-date-display">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-row">
          <div className="quick-stat-item">
            <div className="stat-icon total">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>

          <div className="quick-stat-item">
            <div className="stat-icon present">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>

          <div className="quick-stat-item">
            <div className="stat-icon absent">
              <i className="fas fa-user-times"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.absent}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>

          <div className="quick-stat-item">
            <div className="stat-icon break">
              <i className="fas fa-coffee"></i>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.onBreak}</div>
              <div className="stat-label">On Break</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-filter-row">
          <div className="search-box-live">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search employee by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <i className="fas fa-list"></i> All
            </button>
            <button
              className={`filter-btn ${statusFilter === 'IN' ? 'active' : ''}`}
              onClick={() => setStatusFilter('IN')}
            >
              <i className="fas fa-user-check"></i> Present ({stats.present})
            </button>
            <button
              className={`filter-btn ${statusFilter === 'OUT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('OUT')}
            >
              <i className="fas fa-coffee"></i> On Break ({stats.onBreak})
            </button>
            <button
              className={`filter-btn ${statusFilter === 'ABSENT' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ABSENT')}
            >
              <i className="fas fa-user-times"></i> Absent ({stats.absent})
            </button>
          </div>
        </div>

        <div className="action-buttons-row">
          <button
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <i className={`fas fa-sync-alt ${autoRefresh ? 'fa-spin' : ''}`}></i>
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </button>

          <button className="manual-refresh-btn" onClick={fetchLiveAttendance}>
            <i className="fas fa-redo-alt"></i>
            Refresh Now
          </button>

          <button className="export-btn">
            <i className="fas fa-file-export"></i>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Live Attendance Table */}
      <div className="live-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading live attendance...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No employees found</p>
            {searchQuery && (
              <button className="clear-filters-btn" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <table className="live-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee</th>
                <th>Status</th>
                <th>First In</th>
                <th>Last Out</th>
                <th>Current Session</th>
                <th>Total Hours</th>
                <th>Break Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((employee, index) => (
                <tr key={employee.id} className={`status-${employee.status.toLowerCase()}`}>
                  <td>{index + 1}</td>
                  
                  <td>
                    <div className="employee-cell">
                      <div 
                        className="employee-avatar" 
                        style={{ background: getStatusColor(employee.status) }}
                      >
                        {employee.name.charAt(0)}
                      </div>
                      <div className="employee-info">
                        <div className="employee-name">{employee.name}</div>
                        <div className="employee-id">{employee.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="status-cell">
                      <span 
                        className="status-badge"
                        style={{ 
                          background: `${getStatusColor(employee.status)}20`,
                          color: getStatusColor(employee.status)
                        }}
                      >
                        <i className={`fas ${getStatusIcon(employee.status)}`}></i>
                        {employee.status}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="time-badge time-in">
                      {employee.timeIn ? formatTime(employee.timeIn) : '-'}
                    </span>
                  </td>

                  <td>
                    <span className="time-badge time-out">
                      {employee.timeOut ? formatTime(employee.timeOut) : '-'}
                    </span>
                  </td>

                  <td>
                    {employee.currentSession ? (
                      <div className="session-info">
                        <div className="session-duration">
                          {employee.currentSession.duration}
                        </div>
                        <div className="session-start">
                          Since {formatTime(employee.currentSession.startTime)}
                        </div>
                      </div>
                    ) : (
                      <span className="no-session">-</span>
                    )}
                  </td>

                  <td>
                    <span className="duration-badge">
                      <i className="far fa-clock"></i>
                      {employee.duration}
                    </span>
                  </td>

                  <td>
                    {employee.status === 'OUT' && employee.breakType !== 'none' ? (
                      <span className="break-badge">
                        {getBreakIcon(employee.breakType)} {getBreakLabel(employee.breakType)}
                      </span>
                    ) : (
                      <span className="no-break">-</span>
                    )}
                  </td>

                  <td>
                    <div className="action-buttons">
                      {employee.status === 'ABSENT' && (
                        <button
                          className="action-btn check-in"
                          onClick={() => handleManualCheckIn(employee.id, employee.name)}
                          title="Manual Check In"
                        >
                          <i className="fas fa-sign-in-alt"></i>
                          Check In
                        </button>
                      )}
                      {employee.status === 'IN' && (
                        <button
                          className="action-btn check-out"
                          onClick={() => handleManualCheckOut(employee.id, employee.name)}
                          title="Manual Check Out"
                        >
                          <i className="fas fa-sign-out-alt"></i>
                          Check Out
                        </button>
                      )}
                      {employee.status === 'OUT' && (
                        <button
                          className="action-btn check-in"
                          onClick={() => handleManualCheckIn(employee.id, employee.name)}
                          title="Manual Check In"
                        >
                          <i className="fas fa-sign-in-alt"></i>
                          Check In
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="live-footer">
        <div className="footer-info">
          <i className="fas fa-info-circle"></i>
          Showing {filteredData.length} of {attendanceData.length} employees
          {statusFilter !== 'all' && ` • Filtered by: ${statusFilter}`}
        </div>
        <div className="footer-actions">
          <span className="refresh-indicator">
            {autoRefresh ? (
              <>
                <i className="fas fa-sync-alt fa-spin"></i>
                Auto-refreshing...
              </>
            ) : (
              <>
                <i className="fas fa-pause"></i>
                Auto-refresh paused
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveAttendance;