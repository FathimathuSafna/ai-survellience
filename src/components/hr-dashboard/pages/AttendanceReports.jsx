import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import './AttendanceReports.css';

const AttendanceReports = () => {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalEmployees: 0,
    presentCount: 0,
    absentCount: 0,
    totalHours: 0,
    averageHours: 0,
    lateCount: 0,
    onTimeCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [employees, setEmployees] = useState([]);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchEmployees();
    generateReport();
  }, []);

  useEffect(() => {
    generateReport();
  }, [reportType, selectedDate, selectedMonth, startDate, endDate, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let data = [];
      
      if (reportType === 'daily') {
        data = await fetchDailyReport(selectedDate);
      } else if (reportType === 'weekly') {
        data = await fetchWeeklyReport();
      } else if (reportType === 'monthly') {
        data = await fetchMonthlyReport(selectedMonth);
      }

      if (selectedEmployee !== 'all') {
        data = data.filter(item => item.userId === selectedEmployee);
      }

      setReportData(data);
      calculateSummaryStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setLoading(false);
    }
  };

  // --- Mock/Fetch Functions ---
  const fetchDailyReport = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/today`);
      const summaries = response.data.summaries || [];
      return summaries.map(summary => ({
        userId: summary.userId,
        employeeName: summary.employeeName,
        date: summary.date,
        firstIn: summary.firstIn,
        lastOut: summary.lastOut,
        totalHours: summary.totalHours,
        totalMinutes: summary.totalMinutes,
        sessions: summary.sessions?.length || 0,
        breaks: summary.breaks,
        status: summary.lastOut ? 'Completed' : 'In Progress'
      }));
    } catch (err) {
      console.error('Error fetching daily report:', err);
      return [];
    }
  };

  const fetchWeeklyReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await axios.get(`${API_URL}/attendance/logs`, {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 1000 }
      });

      const logs = response.data.logs || [];
      const grouped = {};

      logs.forEach(log => {
        if (!grouped[log.userId]) {
          grouped[log.userId] = {
            userId: log.userId,
            employeeName: log.employeeName,
            totalMinutes: 0,
            days: 0
          };
        }
        if (log.duration) {
          grouped[log.userId].totalMinutes += log.duration;
          grouped[log.userId].days++;
        }
      });

      return Object.values(grouped).map(item => {
        const hours = Math.floor(item.totalMinutes / 60);
        const mins = item.totalMinutes % 60;
        return {
          ...item,
          totalHours: `${hours}h ${mins}m`,
          averageHours: `${Math.floor(item.totalMinutes / item.days / 60)}h ${Math.floor((item.totalMinutes / item.days) % 60)}m`,
          status: 'Completed'
        };
      });
    } catch (err) {
      console.error('Error fetching weekly report:', err);
      return [];
    }
  };

  const fetchMonthlyReport = async (month) => {
    try {
      const response = await axios.get(`${API_URL}/attendance/logs`, { params: { limit: 1000 } });
      const logs = response.data.logs || [];
      const grouped = {};
      logs.forEach(log => {
        if (!grouped[log.userId]) {
          grouped[log.userId] = {
            userId: log.userId,
            employeeName: log.employeeName,
            totalMinutes: 0,
            days: 0,
            presentDays: new Set()
          };
        }
        if (log.duration) {
          grouped[log.userId].totalMinutes += log.duration;
          const dateKey = new Date(log.timeOut || log.timeIn).toISOString().split('T')[0];
          grouped[log.userId].presentDays.add(dateKey);
        }
      });
      return Object.values(grouped).map(item => {
        const hours = Math.floor(item.totalMinutes / 60);
        const mins = item.totalMinutes % 60;
        const daysPresent = item.presentDays.size;
        return {
          ...item,
          totalHours: `${hours}h ${mins}m`,
          daysPresent,
          averageHours: daysPresent > 0 ? `${Math.floor(item.totalMinutes / daysPresent / 60)}h ${Math.floor((item.totalMinutes / daysPresent) % 60)}m` : '0h 0m',
          status: 'Completed'
        };
      });
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      return [];
    }
  };

  const calculateSummaryStats = (data) => {
    const totalEmployees = employees.length;
    const presentCount = data.length;
    const absentCount = totalEmployees - presentCount;
    let totalMinutes = 0;
    data.forEach(item => { totalMinutes += item.totalMinutes || 0; });
    const totalHours = Math.floor(totalMinutes / 60);
    const avgMinutes = presentCount > 0 ? totalMinutes / presentCount : 0;
    const averageHours = Math.floor(avgMinutes / 60);
    const averageMins = Math.floor(avgMinutes % 60);
    setSummaryStats({
      totalEmployees, presentCount, absentCount,
      totalHours: `${totalHours}h ${totalMinutes % 60}m`,
      averageHours: `${averageHours}h ${averageMins}m`,
      lateCount: 0, onTimeCount: presentCount
    });
  };

  const formatTime = (date) => !date ? '-' : new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (date) => !date ? '-' : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const exportToExcel = () => { alert('📊 Export to Excel feature coming soon!'); };
  const exportToPDF = () => { alert('📄 Export to PDF feature coming soon!'); };
  const printReport = () => { window.print(); };

  // ----------------------------------------
  // 📈 PROFESSIONAL GRADIENT AREA CHART
  // ----------------------------------------
  const renderLineChart = () => {
    // Professional Mock Data for Trends
    const chartData = [
      { name: 'Mon', present: 32, absent: 5, late: 2 },
      { name: 'Tue', present: 45, absent: 3, late: 1 },
      { name: 'Wed', present: 38, absent: 4, late: 3 },
      { name: 'Thu', present: 52, absent: 2, late: 0 },
      { name: 'Fri', present: 49, absent: 3, late: 1 },
      { name: 'Sat', present: 15, absent: 10, late: 0 },
      { name: 'Sun', present: 0, absent: 0, late: 0 },
    ];

    return (
      <div className="line-chart-section">
        <div className="line-chart-card">
          <div className="line-chart-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1a252f' }}>
                <i className="fas fa-chart-line" style={{ marginRight: '8px', color: '#2e7d32' }}></i>
                Weekly Attendance Trends
              </h3>
              <p style={{ margin: '4px 0 0 28px', fontSize: '12px', color: '#64748b' }}>
                Comparison of Present vs Absent employees over the last 7 days
              </p>
            </div>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Green Gradient for Present */}
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                  </linearGradient>
                  {/* Red Gradient for Absent */}
                  <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#d32f2f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 500, paddingBottom: '2px' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}
                />
                
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                />

                <Area 
                  type="monotone" 
                  dataKey="present" 
                  name="Present"
                  stroke="#2e7d32" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorPresent)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#2e7d32' }}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="absent" 
                  name="Absent"
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorAbsent)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-left">
          <h2><i className="fas fa-chart-bar"></i> Attendance Reports</h2>
          <p>Generate and analyze attendance reports</p>
        </div>
        <div className="reports-header-right">
          <button className="export-btn" onClick={exportToExcel}><i className="fas fa-file-excel"></i> Export Excel</button>
          <button className="export-btn" onClick={exportToPDF}><i className="fas fa-file-pdf"></i> Export PDF</button>
          <button className="export-btn" onClick={printReport}><i className="fas fa-print"></i> Print</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats-grid">
        <div className="summary-stat-card primary">
          <div className="summary-stat-icon"><i className="fas fa-users"></i></div>
          <div className="summary-stat-content">
            <div className="summary-stat-value">{summaryStats.totalEmployees}</div>
            <div className="summary-stat-label">Total Employees</div>
          </div>
        </div>
        <div className="summary-stat-card success">
          <div className="summary-stat-icon"><i className="fas fa-user-check"></i></div>
          <div className="summary-stat-content">
            <div className="summary-stat-value">{summaryStats.presentCount}</div>
            <div className="summary-stat-label">Present</div>
            <div className="summary-stat-footer">{summaryStats.totalEmployees > 0 ? `${((summaryStats.presentCount / summaryStats.totalEmployees) * 100).toFixed(1)}%` : '0%'}</div>
          </div>
        </div>
        <div className="summary-stat-card danger">
          <div className="summary-stat-icon"><i className="fas fa-user-times"></i></div>
          <div className="summary-stat-content">
            <div className="summary-stat-value">{summaryStats.absentCount}</div>
            <div className="summary-stat-label">Absent</div>
            <div className="summary-stat-footer">{summaryStats.totalEmployees > 0 ? `${((summaryStats.absentCount / summaryStats.totalEmployees) * 100).toFixed(1)}%` : '0%'}</div>
          </div>
        </div>
        <div className="summary-stat-card info">
          <div className="summary-stat-icon"><i className="far fa-clock"></i></div>
          <div className="summary-stat-content">
            <div className="summary-stat-value">{summaryStats.totalHours}</div>
            <div className="summary-stat-label">Total Hours</div>
            <div className="summary-stat-footer">Avg: {summaryStats.averageHours}</div>
          </div>
        </div>
        <div className="summary-stat-card warning">
          <div className="summary-stat-icon"><i className="fas fa-clock"></i></div>
          <div className="summary-stat-content">
            <div className="summary-stat-value">{summaryStats.lateCount}</div>
            <div className="summary-stat-label">Late Arrivals</div>
          </div>
        </div>
        <div className="summary-stat-card purple">
          <div className="summary-stat-icon"><i className="fas fa-user-clock"></i></div>
          <div className="summary-stat-content">
            <div className="summary-stat-value">{summaryStats.onTimeCount}</div>
            <div className="summary-stat-label">On Time</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="reports-filters">
        <div className="filter-section">
          <label>Report Type</label>
          <div className="report-type-tabs">
            <button className={`tab-btn ${reportType === 'daily' ? 'active' : ''}`} onClick={() => setReportType('daily')}>
              <i className="far fa-calendar-day"></i> Daily
            </button>
            <button className={`tab-btn ${reportType === 'weekly' ? 'active' : ''}`} onClick={() => setReportType('weekly')}>
              <i className="far fa-calendar-week"></i> Weekly
            </button>
            <button className={`tab-btn ${reportType === 'monthly' ? 'active' : ''}`} onClick={() => setReportType('monthly')}>
              <i className="far fa-calendar-alt"></i> Monthly
            </button>
          </div>
        </div>
        <div className="filter-section">
          {reportType === 'daily' && (
            <>
              <label>Select Date</label>
              <input type="date" className="filter-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </>
          )}
          {reportType === 'monthly' && (
            <>
              <label>Select Month</label>
              <input type="month" className="filter-input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} max={new Date().toISOString().slice(0, 7)} />
            </>
          )}
          {reportType === 'weekly' && (
            <div className="date-range-inputs">
              <div>
                <label>Start Date</label>
                <input type="date" className="filter-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label>End Date</label>
                <input type="date" className="filter-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          )}
        </div>
        <div className="filter-section">
          <label>Employee</label>
          <select className="filter-input" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
            <option value="all">All Employees</option>
            {employees.map(emp => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
          </select>
        </div>
        <div className="filter-section">
          <label>&nbsp;</label>
          <button className="generate-btn" onClick={generateReport}>
            <i className="fas fa-sync-alt"></i> Generate Report
          </button>
        </div>
      </div>

      {/* --- RENDER LINE CHART --- */}
      {reportData.length >= 0 && renderLineChart()}

      {/* Report Table */}
      <div className="report-table-container">
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Generating report...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-chart-line"></i>
            <p>No attendance data found for the selected period</p>
            <button className="generate-btn" onClick={generateReport}>
              <i className="fas fa-redo"></i> Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="report-info-bar">
              <div className="report-title">
                <i className="fas fa-table"></i>
                {reportType === 'daily' && `Daily Report - ${formatDate(selectedDate)}`}
                {reportType === 'weekly' && `Weekly Report - Last 7 Days`}
                {reportType === 'monthly' && `Monthly Report - ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              </div>
              <div className="report-count">
                Showing {reportData.length} record{reportData.length !== 1 ? 's' : ''}
              </div>
            </div>

            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee Name</th>
                  {reportType === 'daily' && (<><th>First In</th><th>Last Out</th><th>Sessions</th><th>Breaks</th></>)}
                  {reportType === 'weekly' && (<><th>Days Present</th><th>Average Hours</th></>)}
                  {reportType === 'monthly' && (<><th>Days Present</th><th>Average Hours/Day</th></>)}
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((record, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="employee-cell-report">
                        <div className="employee-avatar-report">{record.employeeName.charAt(0)}</div>
                        <span>{record.employeeName}</span>
                      </div>
                    </td>
                    {reportType === 'daily' && (
                      <>
                        <td><span className="time-badge-report in">{formatTime(record.firstIn)}</span></td>
                        <td><span className="time-badge-report out">{formatTime(record.lastOut)}</span></td>
                        <td><span className="sessions-badge">{record.sessions} session{record.sessions !== 1 ? 's' : ''}</span></td>
                        <td>
                          <div className="breaks-cell">
                            {record.breaks?.tea > 0 && <span className="break-item">☕ {Math.floor(record.breaks.tea)}m</span>}
                            {record.breaks?.lunch > 0 && <span className="break-item">🍽️ {Math.floor(record.breaks.lunch)}m</span>}
                            {record.breaks?.snacks > 0 && <span className="break-item">🍪 {Math.floor(record.breaks.snacks)}m</span>}
                            {!record.breaks || (record.breaks.tea === 0 && record.breaks.lunch === 0 && record.breaks.snacks === 0) && <span className="no-breaks">No breaks</span>}
                          </div>
                        </td>
                      </>
                    )}
                    {reportType === 'weekly' && (<><td><span className="days-badge">{record.days} day{record.days !== 1 ? 's' : ''}</span></td><td><span className="hours-badge">{record.averageHours}</span></td></>)}
                    {reportType === 'monthly' && (<><td><span className="days-badge">{record.daysPresent} day{record.daysPresent !== 1 ? 's' : ''}</span></td><td><span className="hours-badge">{record.averageHours}</span></td></>)}
                    <td>
                      <span className="total-hours-badge"><i className="far fa-clock"></i> {record.totalHours}</span>
                    </td>
                    <td>
                      <span className={`status-badge-report ${record.status.toLowerCase().replace(' ', '-')}`}>{record.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Pie & Bar Charts Section */}
      {reportData.length > 0 && (
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header"><h3><i className="fas fa-chart-pie"></i> Attendance Distribution</h3></div>
            <div className="chart-body">
              <div className="pie-chart-placeholder">
                <div className="pie-chart-visual">
                  <div className="pie-slice present" style={{ '--percentage': summaryStats.totalEmployees > 0 ? (summaryStats.presentCount / summaryStats.totalEmployees) * 100 : 0 }}></div>
                  <div className="pie-center">
                    <div className="pie-percentage">{summaryStats.totalEmployees > 0 ? ((summaryStats.presentCount / summaryStats.totalEmployees) * 100).toFixed(0) : 0}%</div>
                    <div className="pie-label">Present</div>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item"><span className="legend-color present"></span><span className="legend-label">Present ({summaryStats.presentCount})</span></div>
                  <div className="legend-item"><span className="legend-color absent"></span><span className="legend-label">Absent ({summaryStats.absentCount})</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header"><h3><i className="fas fa-chart-bar"></i> Hours Worked Distribution</h3></div>
            <div className="chart-body">
              <div className="bar-chart-placeholder">
                {reportData.slice(0, 5).map((record, index) => {
                  const maxMinutes = Math.max(...reportData.map(r => r.totalMinutes || 0));
                  const percentage = maxMinutes > 0 ? ((record.totalMinutes || 0) / maxMinutes) * 100 : 0;
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-label">{record.employeeName.split(' ')[0]}</div>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: `${percentage}%` }}>
                          <span className="bar-value">{record.totalHours}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {reportData.length === 0 && <div className="no-data">No data to display</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;