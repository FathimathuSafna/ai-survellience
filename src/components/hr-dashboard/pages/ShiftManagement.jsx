import { useState, useEffect } from 'react';
import axios from 'axios';
import './ShiftManagement.css';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([
    {
      id: 'shift-1',
      name: 'Morning Shift',
      startTime: '09:00',
      endTime: '17:00',
      breakDuration: 60,
      color: '#2e7d32',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      assignedEmployees: [],
      isActive: true
    },
    {
      id: 'shift-2',
      name: 'Evening Shift',
      startTime: '14:00',
      endTime: '22:00',
      breakDuration: 45,
      color: '#f57c00',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      assignedEmployees: [],
      isActive: true
    },
    {
      id: 'shift-3',
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      breakDuration: 60,
      color: '#7b1fa2',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      assignedEmployees: [],
      isActive: true
    }
  ]);

  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'schedule'

  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    breakDuration: 60,
    color: '#1e7b4e',
    daysOfWeek: [],
    isActive: true
  });

  const API_URL = 'http://localhost:5000/api';

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shiftColors = [
    { value: '#1e7b4e', label: 'Green' },
    { value: '#2e7d32', label: 'Dark Green' },
    { value: '#1976d2', label: 'Blue' },
    { value: '#f57c00', label: 'Orange' },
    { value: '#7b1fa2', label: 'Purple' },
    { value: '#c62828', label: 'Red' },
    { value: '#00897b', label: 'Teal' }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      breakDuration: 60,
      color: '#1e7b4e',
      daysOfWeek: [],
      isActive: true
    });
  };

  const handleAddShift = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditShift = (shift) => {
    setSelectedShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      color: shift.color,
      daysOfWeek: shift.daysOfWeek,
      isActive: shift.isActive
    });
    setShowEditModal(true);
  };

  const handleDeleteShift = (shift) => {
    setSelectedShift(shift);
    setShowDeleteModal(true);
  };

  const handleAssignEmployees = (shift) => {
    setSelectedShift(shift);
    setShowAssignModal(true);
  };

  const saveShift = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.startTime || !formData.endTime) {
      alert('⚠️ Please fill in all required fields!');
      return;
    }

    if (formData.daysOfWeek.length === 0) {
      alert('⚠️ Please select at least one working day!');
      return;
    }

    const newShift = {
      id: `shift-${Date.now()}`,
      ...formData,
      assignedEmployees: []
    };

    setShifts(prev => [...prev, newShift]);
    setShowAddModal(false);
    resetForm();
    alert('✅ Shift created successfully!');
  };

  const updateShift = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.startTime || !formData.endTime) {
      alert('⚠️ Please fill in all required fields!');
      return;
    }

    if (formData.daysOfWeek.length === 0) {
      alert('⚠️ Please select at least one working day!');
      return;
    }

    setShifts(prev => prev.map(shift =>
      shift.id === selectedShift.id
        ? { ...shift, ...formData }
        : shift
    ));

    setShowEditModal(false);
    resetForm();
    alert('✅ Shift updated successfully!');
  };

  const confirmDelete = () => {
    setShifts(prev => prev.filter(shift => shift.id !== selectedShift.id));
    setShowDeleteModal(false);
    setSelectedShift(null);
    alert('✅ Shift deleted successfully!');
  };

  const toggleEmployeeAssignment = (employeeId) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === selectedShift.id) {
        const isAssigned = shift.assignedEmployees.includes(employeeId);
        return {
          ...shift,
          assignedEmployees: isAssigned
            ? shift.assignedEmployees.filter(id => id !== employeeId)
            : [...shift.assignedEmployees, employeeId]
        };
      }
      return shift;
    }));
  };

  const calculateShiftDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e._id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const getShiftStats = () => {
    return {
      totalShifts: shifts.length,
      activeShifts: shifts.filter(s => s.isActive).length,
      inactiveShifts: shifts.filter(s => !s.isActive).length,
      totalAssignments: shifts.reduce((sum, s) => sum + s.assignedEmployees.length, 0)
    };
  };

  const stats = getShiftStats();

  return (
    <div className="shift-management">
      {/* Header */}
      <div className="shift-header">
        <div className="shift-header-left">
          <h2>
            <i className="fas fa-clock"></i>
            Shift Management
          </h2>
          <p>Create and manage work shifts and schedules</p>
        </div>
        <div className="shift-header-right">
          <button className="btn-primary" onClick={handleAddShift}>
            <i className="fas fa-plus"></i>
            Create New Shift
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="shift-stats-grid">
        <div className="shift-stat-card">
          <div className="shift-stat-icon total">
            <i className="fas fa-clock"></i>
          </div>
          <div className="shift-stat-content">
            <div className="shift-stat-value">{stats.totalShifts}</div>
            <div className="shift-stat-label">Total Shifts</div>
          </div>
        </div>

        <div className="shift-stat-card">
          <div className="shift-stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="shift-stat-content">
            <div className="shift-stat-value">{stats.activeShifts}</div>
            <div className="shift-stat-label">Active Shifts</div>
          </div>
        </div>

        <div className="shift-stat-card">
          <div className="shift-stat-icon inactive">
            <i className="fas fa-pause-circle"></i>
          </div>
          <div className="shift-stat-content">
            <div className="shift-stat-value">{stats.inactiveShifts}</div>
            <div className="shift-stat-label">Inactive Shifts</div>
          </div>
        </div>

        <div className="shift-stat-card">
          <div className="shift-stat-icon assignments">
            <i className="fas fa-users"></i>
          </div>
          <div className="shift-stat-content">
            <div className="shift-stat-value">{stats.totalAssignments}</div>
            <div className="shift-stat-label">Total Assignments</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-controls">
        <div className="view-toggle-shift">
          <button
            className={`view-btn-shift ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <i className="fas fa-th"></i>
            Grid View
          </button>
          <button
            className={`view-btn-shift ${viewMode === 'schedule' ? 'active' : ''}`}
            onClick={() => setViewMode('schedule')}
          >
            <i className="fas fa-calendar-week"></i>
            Schedule View
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="shifts-grid">
          {shifts.map(shift => (
            <div key={shift.id} className="shift-card" style={{ borderTopColor: shift.color }}>
              <div className="shift-card-header">
                <div className="shift-name-section">
                  <div className="shift-color-dot" style={{ background: shift.color }}></div>
                  <h3>{shift.name}</h3>
                </div>
                <div className="shift-status-badge" style={{
                  background: shift.isActive ? '#e8f5e9' : '#ffebee',
                  color: shift.isActive ? '#2e7d32' : '#c62828'
                }}>
                  {shift.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="shift-card-body">
                <div className="shift-time-info">
                  <div className="time-item">
                    <i className="fas fa-sun"></i>
                    <div>
                      <div className="time-label">Start Time</div>
                      <div className="time-value">{formatTime(shift.startTime)}</div>
                    </div>
                  </div>
                  <div className="time-divider">→</div>
                  <div className="time-item">
                    <i className="fas fa-moon"></i>
                    <div>
                      <div className="time-label">End Time</div>
                      <div className="time-value">{formatTime(shift.endTime)}</div>
                    </div>
                  </div>
                </div>

                <div className="shift-details">
                  <div className="detail-row">
                    <i className="far fa-clock"></i>
                    <span>Duration: <strong>{calculateShiftDuration(shift.startTime, shift.endTime)}</strong></span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-coffee"></i>
                    <span>Break: <strong>{shift.breakDuration} minutes</strong></span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-users"></i>
                    <span>Assigned: <strong>{shift.assignedEmployees.length} employees</strong></span>
                  </div>
                </div>

                <div className="shift-days">
                  <div className="days-label">Working Days:</div>
                  <div className="days-list">
                    {shift.daysOfWeek.map(day => (
                      <span key={day} className="day-badge" style={{ borderColor: shift.color }}>
                        {day.substring(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                {shift.assignedEmployees.length > 0 && (
                  <div className="assigned-employees-preview">
                    <div className="employees-avatars">
                      {shift.assignedEmployees.slice(0, 5).map(empId => (
                        <div
                          key={empId}
                          className="employee-avatar-small"
                          style={{ background: shift.color }}
                          title={getEmployeeName(empId)}
                        >
                          {getEmployeeName(empId).charAt(0)}
                        </div>
                      ))}
                      {shift.assignedEmployees.length > 5 && (
                        <div className="more-employees" style={{ borderColor: shift.color }}>
                          +{shift.assignedEmployees.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="shift-card-footer">
                <button
                  className="shift-action-btn assign"
                  onClick={() => handleAssignEmployees(shift)}
                  title="Assign Employees"
                >
                  <i className="fas fa-user-plus"></i>
                  Assign
                </button>
                <button
                  className="shift-action-btn edit"
                  onClick={() => handleEditShift(shift)}
                  title="Edit Shift"
                >
                  <i className="fas fa-edit"></i>
                  Edit
                </button>
                <button
                  className="shift-action-btn delete"
                  onClick={() => handleDeleteShift(shift)}
                  title="Delete Shift"
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule View */}
      {viewMode === 'schedule' && (
        <div className="schedule-view">
          <div className="schedule-container">
            <div className="schedule-header">
              <div className="schedule-corner">Shift</div>
              {daysOfWeek.map(day => (
                <div key={day} className="schedule-day-header">
                  {day}
                </div>
              ))}
            </div>

            <div className="schedule-body">
              {shifts.map(shift => (
                <div key={shift.id} className="schedule-row">
                  <div className="schedule-shift-name" style={{ borderLeftColor: shift.color }}>
                    <div className="shift-name-cell">
                      <div className="shift-color-indicator" style={{ background: shift.color }}></div>
                      <div>
                        <div className="shift-name-text">{shift.name}</div>
                        <div className="shift-time-text">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {daysOfWeek.map(day => (
                    <div
                      key={day}
                      className={`schedule-cell ${shift.daysOfWeek.includes(day) ? 'active' : ''}`}
                      style={{
                        background: shift.daysOfWeek.includes(day) ? `${shift.color}20` : 'transparent',
                        borderColor: shift.daysOfWeek.includes(day) ? shift.color : 'transparent'
                      }}
                    >
                      {shift.daysOfWeek.includes(day) && (
                        <>
                          <i className="fas fa-check-circle" style={{ color: shift.color }}></i>
                          <div className="cell-employees-count">
                            {shift.assignedEmployees.length > 0 && (
                              <span>{shift.assignedEmployees.length} emp</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-plus"></i>
                Create New Shift
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={saveShift}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Shift Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Morning Shift"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Shift Color
                    </label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                    >
                      {shiftColors.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Start Time <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      End Time <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="breakDuration"
                      value={formData.breakDuration}
                      onChange={handleInputChange}
                      min="0"
                      max="120"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        style={{ width: 'auto', marginRight: '8px' }}
                      />
                      Active Shift
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Working Days <span className="required">*</span>
                    </label>
                    <div className="days-selector">
                      {daysOfWeek.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${formData.daysOfWeek.includes(day) ? 'active' : ''}`}
                          onClick={() => handleDayToggle(day)}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.startTime && formData.endTime && (
                  <div className="info-box">
                    <i className="fas fa-info-circle"></i>
                    <div>
                      <strong>Shift Duration:</strong> {calculateShiftDuration(formData.startTime, formData.endTime)}
                      {formData.breakDuration > 0 && (
                        <> (excluding {formData.breakDuration} min break)</>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i>
                  Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      {showEditModal && selectedShift && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-edit"></i>
                Edit Shift
              </h3>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={updateShift}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Shift Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Shift Color</label>
                    <select
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                    >
                      {shiftColors.map(color => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Start Time <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      End Time <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Break Duration (minutes)</label>
                    <input
                      type="number"
                      name="breakDuration"
                      value={formData.breakDuration}
                      onChange={handleInputChange}
                      min="0"
                      max="120"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        style={{ width: 'auto', marginRight: '8px' }}
                      />
                      Active Shift
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Working Days <span className="required">*</span>
                    </label>
                    <div className="days-selector">
                      {daysOfWeek.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn ${formData.daysOfWeek.includes(day) ? 'active' : ''}`}
                          onClick={() => handleDayToggle(day)}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i>
                  Update Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedShift && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header delete">
              <h3>
                <i className="fas fa-exclamation-triangle"></i>
                Confirm Deletion
              </h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <p>
                  Are you sure you want to delete <strong>{selectedShift.name}</strong>?
                </p>
                {selectedShift.assignedEmployees.length > 0 && (
                  <p className="warning-text">
                    This shift has {selectedShift.assignedEmployees.length} assigned employee(s). 
                    They will be unassigned from this shift.
                  </p>
                )}
                <p className="warning-text">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={confirmDelete}
              >
                <i className="fas fa-trash"></i>
                Yes, Delete Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Employees Modal */}
      {showAssignModal && selectedShift && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-plus"></i>
                Assign Employees to {selectedShift.name}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAssignModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="assign-info">
                <div className="shift-preview" style={{ borderColor: selectedShift.color }}>
                  <div className="shift-color-indicator" style={{ background: selectedShift.color }}></div>
                  <div>
                    <div className="shift-name">{selectedShift.name}</div>
                    <div className="shift-time">
                      {formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}
                    </div>
                  </div>
                </div>

                <div className="current-assignments">
                  <strong>Currently Assigned:</strong> {selectedShift.assignedEmployees.length} employee(s)
                </div>
              </div>

              <div className="employees-assign-list">
                {employees.map(employee => {
                  const isAssigned = selectedShift.assignedEmployees.includes(employee._id);
                  return (
                    <div
                      key={employee._id}
                      className={`employee-assign-item ${isAssigned ? 'assigned' : ''}`}
                      onClick={() => toggleEmployeeAssignment(employee._id)}
                    >
                      <div className="employee-info-assign">
                        <div
                          className="employee-avatar-assign"
                          style={{
                            background: isAssigned ? selectedShift.color : '#e0e0e0'
                          }}
                        >
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="employee-name-assign">{employee.name}</div>
                          <div className="employee-id-assign">{employee._id.slice(0, 8)}...</div>
                        </div>
                      </div>
                      <div className="assign-checkbox">
                        {isAssigned ? (
                          <i className="fas fa-check-circle" style={{ color: selectedShift.color }}></i>
                        ) : (
                          <i className="far fa-circle"></i>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={() => {
                  setShowAssignModal(false);
                  alert('✅ Employee assignments updated successfully!');
                }}
              >
                <i className="fas fa-save"></i>
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;