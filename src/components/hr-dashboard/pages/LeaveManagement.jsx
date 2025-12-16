import { useState, useEffect } from 'react';
import axios from 'axios';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    halfDayPeriod: 'morning'
  });

  const API_URL = 'http://localhost:5000/api';

  const leaveTypes = [
    { value: 'sick', label: 'Sick Leave', icon: 'fa-notes-medical', color: '#c62828', allowance: 12 },
    { value: 'casual', label: 'Casual Leave', icon: 'fa-umbrella-beach', color: '#1976d2', allowance: 10 },
    { value: 'annual', label: 'Annual Leave', icon: 'fa-calendar-check', color: '#2e7d32', allowance: 20 },
    { value: 'maternity', label: 'Maternity Leave', icon: 'fa-baby', color: '#f57c00', allowance: 90 },
    { value: 'paternity', label: 'Paternity Leave', icon: 'fa-male', color: '#7b1fa2', allowance: 7 },
    { value: 'unpaid', label: 'Unpaid Leave', icon: 'fa-ban', color: '#9e9e9e', allowance: 0 },
    { value: 'compensatory', label: 'Compensatory Off', icon: 'fa-exchange-alt', color: '#00897b', allowance: 0 },
    { value: 'emergency', label: 'Emergency Leave', icon: 'fa-exclamation-triangle', color: '#d32f2f', allowance: 3 }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: '#f57c00', icon: 'fa-clock' },
    { value: 'approved', label: 'Approved', color: '#2e7d32', icon: 'fa-check-circle' },
    { value: 'rejected', label: 'Rejected', color: '#c62828', icon: 'fa-times-circle' },
    { value: 'cancelled', label: 'Cancelled', color: '#9e9e9e', icon: 'fa-ban' }
  ];

  useEffect(() => {
    fetchEmployees();
    generateMockLeaveRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [leaveRequests, searchQuery, filterStatus, filterType]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const generateMockLeaveRequests = () => {
    const mockRequests = [
      {
        id: 'LV-1001',
        employeeId: 'emp1',
        employeeName: 'John Doe',
        leaveType: 'sick',
        startDate: '2024-12-10',
        endDate: '2024-12-12',
        days: 3,
        reason: 'Fever and cold',
        status: 'pending',
        appliedOn: new Date('2024-12-08T09:00:00'),
        approvedBy: null,
        approvedOn: null,
        rejectionReason: null,
        halfDay: false
      },
      {
        id: 'LV-1002',
        employeeId: 'emp2',
        employeeName: 'Jane Smith',
        leaveType: 'annual',
        startDate: '2024-12-15',
        endDate: '2024-12-20',
        days: 6,
        reason: 'Family vacation',
        status: 'approved',
        appliedOn: new Date('2024-12-05T14:30:00'),
        approvedBy: 'HR Manager',
        approvedOn: new Date('2024-12-06T10:00:00'),
        rejectionReason: null,
        halfDay: false
      },
      {
        id: 'LV-1003',
        employeeId: 'emp3',
        employeeName: 'Mike Johnson',
        leaveType: 'casual',
        startDate: '2024-12-11',
        endDate: '2024-12-11',
        days: 0.5,
        reason: 'Personal work',
        status: 'approved',
        appliedOn: new Date('2024-12-10T08:00:00'),
        approvedBy: 'HR Manager',
        approvedOn: new Date('2024-12-10T09:30:00'),
        rejectionReason: null,
        halfDay: true,
        halfDayPeriod: 'morning'
      },
      {
        id: 'LV-1004',
        employeeId: 'emp4',
        employeeName: 'Sarah Williams',
        leaveType: 'emergency',
        startDate: '2024-12-09',
        endDate: '2024-12-09',
        days: 1,
        reason: 'Family emergency',
        status: 'rejected',
        appliedOn: new Date('2024-12-08T16:00:00'),
        approvedBy: 'HR Manager',
        approvedOn: new Date('2024-12-09T10:00:00'),
        rejectionReason: 'Insufficient leave balance',
        halfDay: false
      }
    ];

    setLeaveRequests(mockRequests);
  };

  const filterRequests = () => {
    let filtered = [...leaveRequests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(req => req.leaveType === filterType);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

    setFilteredRequests(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateDays = (start, end, halfDay) => {
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return halfDay ? 0.5 : diffDays;
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      leaveType: 'sick',
      startDate: '',
      endDate: '',
      reason: '',
      halfDay: false,
      halfDayPeriod: 'morning'
    });
  };

  const handleApplyLeave = () => {
    resetForm();
    setShowApplyModal(true);
  };

  const saveLeaveRequest = (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
      alert('⚠️ Please fill in all required fields!');
      return;
    }

    const employee = employees.find(e => e._id === formData.employeeId);
    if (!employee) {
      alert('⚠️ Employee not found!');
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate, formData.halfDay);

    const newRequest = {
      id: `LV-${1000 + leaveRequests.length + 1}`,
      employeeId: formData.employeeId,
      employeeName: employee.name,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: days,
      reason: formData.reason,
      status: 'pending',
      appliedOn: new Date(),
      approvedBy: null,
      approvedOn: null,
      rejectionReason: null,
      halfDay: formData.halfDay,
      halfDayPeriod: formData.halfDay ? formData.halfDayPeriod : null
    };

    setLeaveRequests(prev => [newRequest, ...prev]);
    setShowApplyModal(false);
    resetForm();
    alert('✅ Leave request submitted successfully!');
  };

  const viewRequest = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const confirmApprove = () => {
    setLeaveRequests(prev => prev.map(req =>
      req.id === selectedRequest.id
        ? {
            ...req,
            status: 'approved',
            approvedBy: 'HR Manager',
            approvedOn: new Date()
          }
        : req
    ));
    setShowApproveModal(false);
    setShowViewModal(false);
    alert('✅ Leave request approved successfully!');
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Please provide a reason for rejection!');
      return;
    }

    setLeaveRequests(prev => prev.map(req =>
      req.id === selectedRequest.id
        ? {
            ...req,
            status: 'rejected',
            approvedBy: 'HR Manager',
            approvedOn: new Date(),
            rejectionReason: rejectionReason
          }
        : req
    ));
    setShowRejectModal(false);
    setShowViewModal(false);
    setRejectionReason('');
    alert('✅ Leave request rejected!');
  };

  const getLeaveTypeInfo = (type) => {
    return leaveTypes.find(t => t.value === type) || leaveTypes[0];
  };

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const formatDate = (date) => {
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
    const totalRequests = leaveRequests.length;
    const pending = leaveRequests.filter(r => r.status === 'pending').length;
    const approved = leaveRequests.filter(r => r.status === 'approved').length;
    const rejected = leaveRequests.filter(r => r.status === 'rejected').length;
    const totalDays = leaveRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.days, 0);

    return {
      totalRequests,
      pending,
      approved,
      rejected,
      totalDays
    };
  };

  const getEmployeeLeaveBalance = (employeeId) => {
    // Mock leave balance calculation
    return {
      sick: 8,
      casual: 7,
      annual: 15,
      total: 30
    };
  };

  const stats = getStats();

  return (
    <div className="leave-management">
      {/* Header */}
      <div className="leave-header">
        <div className="leave-header-left">
          <h2>
            <i className="fas fa-plane-departure"></i>
            Leave Management
          </h2>
          <p>Manage employee leave requests and approvals</p>
        </div>
        <div className="leave-header-right">
          <button className="btn-primary" onClick={handleApplyLeave}>
            <i className="fas fa-plus"></i>
            Apply Leave
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="leave-stats-grid">
        <div className="leave-stat-card total">
          <div className="leave-stat-icon">
            <i className="fas fa-list"></i>
          </div>
          <div className="leave-stat-content">
            <div className="leave-stat-value">{stats.totalRequests}</div>
            <div className="leave-stat-label">Total Requests</div>
          </div>
        </div>

        <div className="leave-stat-card pending">
          <div className="leave-stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="leave-stat-content">
            <div className="leave-stat-value">{stats.pending}</div>
            <div className="leave-stat-label">Pending</div>
            {stats.pending > 0 && <div className="stat-badge">Action Required</div>}
          </div>
        </div>

        <div className="leave-stat-card approved">
          <div className="leave-stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="leave-stat-content">
            <div className="leave-stat-value">{stats.approved}</div>
            <div className="leave-stat-label">Approved</div>
          </div>
        </div>

        <div className="leave-stat-card rejected">
          <div className="leave-stat-icon">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="leave-stat-content">
            <div className="leave-stat-value">{stats.rejected}</div>
            <div className="leave-stat-label">Rejected</div>
          </div>
        </div>

        <div className="leave-stat-card days">
          <div className="leave-stat-icon">
            <i className="far fa-calendar"></i>
          </div>
          <div className="leave-stat-content">
            <div className="leave-stat-value">{stats.totalDays}</div>
            <div className="leave-stat-label">Days Approved</div>
          </div>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="leave-controls">
        <div className="view-toggle-leave">
          <button
            className={`view-btn-leave ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list"></i>
            List View
          </button>
          <button
            className={`view-btn-leave ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <i className="far fa-calendar"></i>
            Calendar View
          </button>
        </div>

        <div className="leave-filters">
          <input
            type="text"
            placeholder="Search leaves..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-leave"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select-leave"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select-leave"
          >
            <option value="all">All Types</option>
            {leaveTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="leave-requests-container">
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>No leave requests found</p>
              <button className="btn-primary" onClick={handleApplyLeave}>
                <i className="fas fa-plus"></i>
                Apply First Leave
              </button>
            </div>
          ) : (
            <div className="leave-requests-list">
              {filteredRequests.map(request => {
                const typeInfo = getLeaveTypeInfo(request.leaveType);
                const statusInfo = getStatusInfo(request.status);

                return (
                  <div
                    key={request.id}
                    className={`leave-request-card ${request.status}`}
                    onClick={() => viewRequest(request)}
                  >
                    <div className="request-header">
                      <div className="request-id-section">
                        <span className="request-id">{request.id}</span>
                        <div
                          className="leave-type-badge"
                          style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                        >
                          <i className={`fas ${typeInfo.icon}`}></i>
                          {typeInfo.label}
                        </div>
                      </div>
                      <span
                        className="status-badge-leave"
                        style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                      >
                        <i className={`fas ${statusInfo.icon}`}></i>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="request-body">
                      <div className="employee-info-leave">
                        <div className="employee-avatar-leave">
                          {request.employeeName.charAt(0)}
                        </div>
                        <div className="employee-details-leave">
                          <div className="employee-name-leave">{request.employeeName}</div>
                          <div className="applied-date">
                            Applied on {formatDate(request.appliedOn)}
                          </div>
                        </div>
                      </div>

                      <div className="leave-dates">
                        <div className="date-item">
                          <i className="far fa-calendar-alt"></i>
                          <div>
                            <div className="date-label">From</div>
                            <div className="date-value">{formatDate(request.startDate)}</div>
                          </div>
                        </div>
                        <div className="date-arrow">→</div>
                        <div className="date-item">
                          <i className="far fa-calendar-check"></i>
                          <div>
                            <div className="date-label">To</div>
                            <div className="date-value">{formatDate(request.endDate)}</div>
                          </div>
                        </div>
                        <div className="days-count">
                          <i className="fas fa-hourglass-half"></i>
                          <strong>{request.days}</strong> {request.days === 1 ? 'day' : 'days'}
                          {request.halfDay && <span className="half-day-badge">Half Day ({request.halfDayPeriod})</span>}
                        </div>
                      </div>

                      <div className="leave-reason">
                        <i className="fas fa-comment-alt"></i>
                        <span>{request.reason}</span>
                      </div>
                    </div>

                    <div className="request-footer">
                      {request.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="action-btn approve"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(request);
                            }}
                          >
                            <i className="fas fa-check"></i>
                            Approve
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(request);
                            }}
                          >
                            <i className="fas fa-times"></i>
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status === 'approved' && request.approvedBy && (
                        <div className="approval-info">
                          <i className="fas fa-user-check"></i>
                          Approved by <strong>{request.approvedBy}</strong> on {formatDate(request.approvedOn)}
                        </div>
                      )}
                      {request.status === 'rejected' && request.approvedBy && (
                        <div className="rejection-info">
                          <i className="fas fa-user-times"></i>
                          Rejected by <strong>{request.approvedBy}</strong>
                        </div>
                      )}
                      <div className="view-details-leave">
                        View Details <i className="fas fa-chevron-right"></i>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-view-container">
          <div className="calendar-placeholder">
            <i className="far fa-calendar-alt"></i>
            <h3>Calendar View</h3>
            <p>Calendar integration coming soon!</p>
            <p className="calendar-note">
              This will show all approved leaves on a monthly calendar view
            </p>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-plane-departure"></i>
                Apply for Leave
              </h3>
              <button className="modal-close-btn" onClick={() => setShowApplyModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={saveLeaveRequest}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>
                      Employee <span className="required">*</span>
                    </label>
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select employee...</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Leave Type <span className="required">*</span>
                    </label>
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleInputChange}
                      required
                    >
                      {leaveTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} {type.allowance > 0 ? `(${type.allowance} days/year)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Start Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      End Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="halfDay"
                        checked={formData.halfDay}
                        onChange={handleInputChange}
                      />
                      <span>Half Day Leave</span>
                    </label>
                  </div>

                  {formData.halfDay && (
                    <div className="form-group">
                      <label>Half Day Period</label>
                      <select
                        name="halfDayPeriod"
                        value={formData.halfDayPeriod}
                        onChange={handleInputChange}
                      >
                        <option value="morning">Morning (First Half)</option>
                        <option value="afternoon">Afternoon (Second Half)</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group full-width">
                    <label>
                      Reason <span className="required">*</span>
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Please provide a reason for your leave..."
                      rows="4"
                      required
                    />
                  </div>
                </div>

                {formData.startDate && formData.endDate && (
                  <div className="info-box">
                    <i className="fas fa-info-circle"></i>
                    <div>
                      <strong>Duration:</strong>{' '}
                      {calculateDays(formData.startDate, formData.endDate, formData.halfDay)}{' '}
                      {calculateDays(formData.startDate, formData.endDate, formData.halfDay) === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                )}

                {formData.employeeId && (
                  <div className="leave-balance-info">
                    <h4>Available Leave Balance</h4>
                    <div className="balance-grid">
                      <div className="balance-item">
                        <span className="balance-label">Sick Leave</span>
                        <span className="balance-value">8 days</span>
                      </div>
                      <div className="balance-item">
                        <span className="balance-label">Casual Leave</span>
                        <span className="balance-value">7 days</span>
                      </div>
                      <div className="balance-item">
                        <span className="balance-label">Annual Leave</span>
                        <span className="balance-value">15 days</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-paper-plane"></i>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-file-alt"></i>
                Leave Request Details - {selectedRequest.id}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="view-badges">
                <span
                  className="badge-large"
                  style={{
                    background: `${getStatusInfo(selectedRequest.status).color}20`,
                    color: getStatusInfo(selectedRequest.status).color
                  }}
                >
                  <i className={`fas ${getStatusInfo(selectedRequest.status).icon}`}></i>
                  {getStatusInfo(selectedRequest.status).label}
                </span>
                <span
                  className="badge-large"
                  style={{
                    background: `${getLeaveTypeInfo(selectedRequest.leaveType).color}20`,
                    color: getLeaveTypeInfo(selectedRequest.leaveType).color
                  }}
                >
                  <i className={`fas ${getLeaveTypeInfo(selectedRequest.leaveType).icon}`}></i>
                  {getLeaveTypeInfo(selectedRequest.leaveType).label}
                </span>
              </div>

              <div className="view-details-grid">
                <div className="detail-group">
                  <label>Employee</label>
                  <div className="detail-value">
                    <i className="far fa-user"></i>
                    {selectedRequest.employeeName}
                  </div>
                </div>

                <div className="detail-group">
                  <label>Duration</label>
                  <div className="detail-value">
                    <i className="fas fa-hourglass-half"></i>
                    {selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}
                    {selectedRequest.halfDay && ` (${selectedRequest.halfDayPeriod})`}
                  </div>
                </div>

                <div className="detail-group">
                  <label>Start Date</label>
                  <div className="detail-value">
                    <i className="far fa-calendar-alt"></i>
                    {formatDate(selectedRequest.startDate)}
                  </div>
                </div>

                <div className="detail-group">
                  <label>End Date</label>
                  <div className="detail-value">
                    <i className="far fa-calendar-check"></i>
                    {formatDate(selectedRequest.endDate)}
                  </div>
                </div>

                <div className="detail-group">
                  <label>Applied On</label>
                  <div className="detail-value">
                    <i className="far fa-clock"></i>
                    {formatDateTime(selectedRequest.appliedOn)}
                  </div>
                </div>

                {selectedRequest.approvedBy && (
                  <div className="detail-group">
                    <label>{selectedRequest.status === 'approved' ? 'Approved By' : 'Rejected By'}</label>
                    <div className="detail-value">
                      <i className="fas fa-user-tie"></i>
                      {selectedRequest.approvedBy}
                    </div>
                  </div>
                )}
              </div>

              <div className="reason-section">
                <label>Reason for Leave</label>
                <div className="reason-text">{selectedRequest.reason}</div>
              </div>

              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="rejection-section">
                  <label>Rejection Reason</label>
                  <div className="rejection-text">
                    <i className="fas fa-info-circle"></i>
                    {selectedRequest.rejectionReason}
                  </div>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="action-section">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(selectedRequest)}
                  >
                    <i className="fas fa-check-circle"></i>
                    Approve Request
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(selectedRequest)}
                  >
                    <i className="fas fa-times-circle"></i>
                    Reject Request
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-container modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header approve">
              <h3>
                <i className="fas fa-check-circle"></i>
                Approve Leave Request
              </h3>
              <button className="modal-close-btn" onClick={() => setShowApproveModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-content">
                <div className="confirm-icon approve">
                  <i className="fas fa-check-circle"></i>
                </div>
                <p>
                  Are you sure you want to approve this leave request for{' '}
                  <strong>{selectedRequest.employeeName}</strong>?
                </p>
                <div className="confirm-details">
                  <div className="confirm-item">
                    <strong>Duration:</strong> {selectedRequest.days} {selectedRequest.days === 1 ? 'day' : 'days'}
                  </div>
                  <div className="confirm-item">
                    <strong>Dates:</strong> {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-approve"
                onClick={confirmApprove}
              >
                <i className="fas fa-check"></i>
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-container modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header reject">
              <h3>
                <i className="fas fa-times-circle"></i>
                Reject Leave Request
              </h3>
              <button className="modal-close-btn" onClick={() => setShowRejectModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-content">
                <div className="confirm-icon reject">
                  <i className="fas fa-times-circle"></i>
                </div>
                <p>
                  Please provide a reason for rejecting leave request for{' '}
                  <strong>{selectedRequest.employeeName}</strong>:
                </p>

                <textarea
                  className="rejection-input"
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={confirmReject}
              >
                <i className="fas fa-times"></i>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;