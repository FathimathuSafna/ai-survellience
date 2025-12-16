import { useState, useEffect } from 'react';
import axios from 'axios';
import './UnknownPersons.css';

const UnknownPersons = () => {
  const [unknownDetections, setUnknownDetections] = useState([]);
  const [filteredDetections, setFilteredDetections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [identifyForm, setIdentifyForm] = useState({
    employeeId: '',
    notes: ''
  });

  const API_URL = 'http://localhost:5000/api';

  const statusTypes = [
    { value: 'pending', label: 'Pending Review', color: '#f57c00', icon: 'fa-clock' },
    { value: 'identified', label: 'Identified', color: '#2e7d32', icon: 'fa-check-circle' },
    { value: 'ignored', label: 'Ignored', color: '#9e9e9e', icon: 'fa-ban' },
    { value: 'flagged', label: 'Security Alert', color: '#c62828', icon: 'fa-exclamation-triangle' }
  ];

  useEffect(() => {
    fetchEmployees();
    generateMockDetections();
  }, []);

  useEffect(() => {
    filterDetections();
  }, [unknownDetections, searchQuery, filterDate, filterStatus]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const generateMockDetections = () => {
    const mockDetections = [
      {
        id: 'det-1',
        imageUrl: 'https://via.placeholder.com/300x400?text=Unknown+Person+1',
        detectedAt: new Date('2024-12-09T09:15:00'),
        location: 'Main Entrance',
        confidence: 0,
        status: 'pending',
        identifiedAs: null,
        identifiedBy: null,
        identifiedAt: null,
        notes: null,
        attempts: 1
      },
      {
        id: 'det-2',
        imageUrl: 'https://via.placeholder.com/300x400?text=Unknown+Person+2',
        detectedAt: new Date('2024-12-09T08:30:00'),
        location: 'Office Floor 2',
        confidence: 0,
        status: 'flagged',
        identifiedAs: null,
        identifiedBy: null,
        identifiedAt: null,
        notes: 'Multiple failed attempts detected',
        attempts: 5
      },
      {
        id: 'det-3',
        imageUrl: 'https://via.placeholder.com/300x400?text=Unknown+Person+3',
        detectedAt: new Date('2024-12-08T14:20:00'),
        location: 'Main Entrance',
        confidence: 0,
        status: 'identified',
        identifiedAs: 'John Doe',
        identifiedBy: 'HR Manager',
        identifiedAt: new Date('2024-12-08T15:00:00'),
        notes: 'New employee - face not yet registered',
        attempts: 1
      },
      {
        id: 'det-4',
        imageUrl: 'https://via.placeholder.com/300x400?text=Unknown+Person+4',
        detectedAt: new Date('2024-12-08T10:45:00'),
        location: 'Parking Area',
        confidence: 0,
        status: 'ignored',
        identifiedAs: null,
        identifiedBy: 'Security',
        identifiedAt: new Date('2024-12-08T11:00:00'),
        notes: 'Delivery person - authorized visitor',
        attempts: 1
      },
      {
        id: 'det-5',
        imageUrl: 'https://via.placeholder.com/300x400?text=Unknown+Person+5',
        detectedAt: new Date('2024-12-07T16:30:00'),
        location: 'Reception',
        confidence: 0,
        status: 'pending',
        identifiedAs: null,
        identifiedBy: null,
        identifiedAt: null,
        notes: null,
        attempts: 1
      }
    ];

    setUnknownDetections(mockDetections);
  };

  const filterDetections = () => {
    let filtered = [...unknownDetections];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(det =>
        det.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (det.identifiedAs && det.identifiedAs.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (det.notes && det.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(det => {
        const detDate = new Date(det.detectedAt);
        if (filterDate === 'today') {
          return detDate.toDateString() === now.toDateString();
        } else if (filterDate === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return detDate >= weekAgo;
        } else if (filterDate === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return detDate >= monthAgo;
        }
        return true;
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(det => det.status === filterStatus);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));

    setFilteredDetections(filtered);
  };

  const viewDetails = (detection) => {
    setSelectedDetection(detection);
    setShowDetailsModal(true);
  };

  const openIdentifyModal = (detection) => {
    setSelectedDetection(detection);
    setIdentifyForm({
      employeeId: '',
      notes: ''
    });
    setShowIdentifyModal(true);
  };

  const identifyPerson = (e) => {
    e.preventDefault();

    if (!identifyForm.employeeId) {
      alert('⚠️ Please select an employee!');
      return;
    }

    const employee = employees.find(e => e._id === identifyForm.employeeId);

    setUnknownDetections(prev => prev.map(det =>
      det.id === selectedDetection.id
        ? {
            ...det,
            status: 'identified',
            identifiedAs: employee.name,
            identifiedBy: 'HR Manager',
            identifiedAt: new Date(),
            notes: identifyForm.notes || det.notes
          }
        : det
    ));

    setShowIdentifyModal(false);
    setShowDetailsModal(false);
    alert('✅ Person identified successfully!');
  };

  const markAsIgnored = (detectionId, reason = '') => {
    setUnknownDetections(prev => prev.map(det =>
      det.id === detectionId
        ? {
            ...det,
            status: 'ignored',
            identifiedBy: 'Security',
            identifiedAt: new Date(),
            notes: reason || 'Marked as ignored'
          }
        : det
    ));
    
    if (showDetailsModal) {
      setShowDetailsModal(false);
    }
    
    alert('✅ Detection marked as ignored!');
  };

  const flagAsSecurity = (detectionId, reason = '') => {
    if (window.confirm('Flag this detection as a security alert?')) {
      setUnknownDetections(prev => prev.map(det =>
        det.id === detectionId
          ? {
              ...det,
              status: 'flagged',
              notes: reason || 'Flagged for security review'
            }
          : det
      ));
      
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      
      alert('⚠️ Detection flagged as security alert!');
    }
  };

  const deleteDetection = (detectionId) => {
    if (window.confirm('Are you sure you want to delete this detection?')) {
      setUnknownDetections(prev => prev.filter(det => det.id !== detectionId));
      
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      
      alert('✅ Detection deleted successfully!');
    }
  };

  const clearAllResolved = () => {
    if (window.confirm('Clear all identified and ignored detections?')) {
      setUnknownDetections(prev => 
        prev.filter(det => det.status === 'pending' || det.status === 'flagged')
      );
      alert('✅ Resolved detections cleared!');
    }
  };

  const getStatusInfo = (status) => {
    return statusTypes.find(s => s.value === status) || statusTypes[0];
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return formatDate(date);
  };

  const getStats = () => {
    const totalDetections = unknownDetections.length;
    const pendingReview = unknownDetections.filter(d => d.status === 'pending').length;
    const identified = unknownDetections.filter(d => d.status === 'identified').length;
    const flagged = unknownDetections.filter(d => d.status === 'flagged').length;
    const todayDetections = unknownDetections.filter(d => {
      const today = new Date().setHours(0, 0, 0, 0);
      const detDate = new Date(d.detectedAt).setHours(0, 0, 0, 0);
      return detDate === today;
    }).length;

    return {
      totalDetections,
      pendingReview,
      identified,
      flagged,
      todayDetections
    };
  };

  const stats = getStats();

  return (
    <div className="unknown-persons">
      {/* Header */}
      <div className="unknown-header">
        <div className="unknown-header-left">
          <h2>
            <i className="fas fa-user-secret"></i>
            Unknown Persons
          </h2>
          <p>Manage unrecognized face detections and security alerts</p>
        </div>
        <div className="unknown-header-right">
          <button className="btn-secondary" onClick={clearAllResolved}>
            <i className="fas fa-broom"></i>
            Clear Resolved
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="unknown-stats-grid">
        <div className="unknown-stat-card total">
          <div className="unknown-stat-icon">
            <i className="fas fa-user-secret"></i>
          </div>
          <div className="unknown-stat-content">
            <div className="unknown-stat-value">{stats.totalDetections}</div>
            <div className="unknown-stat-label">Total Detections</div>
          </div>
        </div>

        <div className="unknown-stat-card pending">
          <div className="unknown-stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="unknown-stat-content">
            <div className="unknown-stat-value">{stats.pendingReview}</div>
            <div className="unknown-stat-label">Pending Review</div>
            {stats.pendingReview > 0 && <div className="stat-badge-unknown">Action Required</div>}
          </div>
        </div>

        <div className="unknown-stat-card identified">
          <div className="unknown-stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="unknown-stat-content">
            <div className="unknown-stat-value">{stats.identified}</div>
            <div className="unknown-stat-label">Identified</div>
          </div>
        </div>

        <div className="unknown-stat-card flagged">
          <div className="unknown-stat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="unknown-stat-content">
            <div className="unknown-stat-value">{stats.flagged}</div>
            <div className="unknown-stat-label">Security Alerts</div>
          </div>
        </div>

        <div className="unknown-stat-card today">
          <div className="unknown-stat-icon">
            <i className="far fa-calendar-day"></i>
          </div>
          <div className="unknown-stat-content">
            <div className="unknown-stat-value">{stats.todayDetections}</div>
            <div className="unknown-stat-label">Today</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="unknown-filters">
        <input
          type="text"
          placeholder="Search detections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-unknown"
        />
        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="filter-select-unknown"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select-unknown"
        >
          <option value="all">All Status</option>
          {statusTypes.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Detections Grid */}
      <div className="detections-grid">
        {filteredDetections.length === 0 ? (
          <div className="empty-state-unknown">
            <i className="fas fa-user-check"></i>
            <p>No unknown detections found</p>
            <span className="empty-subtitle">All faces are recognized!</span>
          </div>
        ) : (
          filteredDetections.map(detection => {
            const statusInfo = getStatusInfo(detection.status);

            return (
              <div
                key={detection.id}
                className={`detection-card ${detection.status}`}
                onClick={() => viewDetails(detection)}
              >
                <div className="detection-image-container">
                  <img 
                    src={detection.imageUrl} 
                    alt="Unknown person" 
                    className="detection-image"
                  />
                  <div className="image-overlay">
                    <button className="overlay-btn">
                      <i className="fas fa-search-plus"></i>
                      View Details
                    </button>
                  </div>
                  
                  {detection.attempts > 1 && (
                    <div className="attempts-badge">
                      <i className="fas fa-redo"></i>
                      {detection.attempts} attempts
                    </div>
                  )}
                </div>

                <div className="detection-info">
                  <div className="detection-header">
                    <span
                      className="status-badge-unknown"
                      style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                    >
                      <i className={`fas ${statusInfo.icon}`}></i>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="detection-details">
                    <div className="detail-row">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{detection.location}</span>
                    </div>
                    <div className="detail-row">
                      <i className="far fa-clock"></i>
                      <span>{getTimeAgo(detection.detectedAt)}</span>
                    </div>
                    {detection.identifiedAs && (
                      <div className="detail-row identified">
                        <i className="fas fa-user-check"></i>
                        <span>{detection.identifiedAs}</span>
                      </div>
                    )}
                  </div>

                  {detection.status === 'pending' && (
                    <div className="detection-actions">
                      <button
                        className="action-btn-unknown identify"
                        onClick={(e) => {
                          e.stopPropagation();
                          openIdentifyModal(detection);
                        }}
                      >
                        <i className="fas fa-user-check"></i>
                        Identify
                      </button>
                      <button
                        className="action-btn-unknown ignore"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsIgnored(detection.id);
                        }}
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                      <button
                        className="action-btn-unknown flag"
                        onClick={(e) => {
                          e.stopPropagation();
                          flagAsSecurity(detection.id);
                        }}
                      >
                        <i className="fas fa-flag"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDetection && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-info-circle"></i>
                Detection Details
              </h3>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="details-layout">
                <div className="details-image-section">
                  <img 
                    src={selectedDetection.imageUrl} 
                    alt="Unknown person" 
                    className="details-image"
                  />
                  <div
                    className="details-status-badge"
                    style={{
                      background: `${getStatusInfo(selectedDetection.status).color}20`,
                      color: getStatusInfo(selectedDetection.status).color
                    }}
                  >
                    <i className={`fas ${getStatusInfo(selectedDetection.status).icon}`}></i>
                    {getStatusInfo(selectedDetection.status).label}
                  </div>
                </div>

                <div className="details-info-section">
                  <h4>Detection Information</h4>
                  
                  <div className="info-grid-unknown">
                    <div className="info-item-unknown">
                      <div className="info-label-unknown">Detected At</div>
                      <div className="info-value-unknown">
                        <i className="far fa-calendar-alt"></i>
                        {formatDateTime(selectedDetection.detectedAt)}
                      </div>
                    </div>

                    <div className="info-item-unknown">
                      <div className="info-label-unknown">Location</div>
                      <div className="info-value-unknown">
                        <i className="fas fa-map-marker-alt"></i>
                        {selectedDetection.location}
                      </div>
                    </div>

                    <div className="info-item-unknown">
                      <div className="info-label-unknown">Detection ID</div>
                      <div className="info-value-unknown">
                        <i className="fas fa-fingerprint"></i>
                        {selectedDetection.id}
                      </div>
                    </div>

                    <div className="info-item-unknown">
                      <div className="info-label-unknown">Attempts</div>
                      <div className="info-value-unknown">
                        <i className="fas fa-redo"></i>
                        {selectedDetection.attempts} {selectedDetection.attempts === 1 ? 'time' : 'times'}
                      </div>
                    </div>

                    {selectedDetection.identifiedAs && (
                      <>
                        <div className="info-item-unknown">
                          <div className="info-label-unknown">Identified As</div>
                          <div className="info-value-unknown identified">
                            <i className="fas fa-user-check"></i>
                            {selectedDetection.identifiedAs}
                          </div>
                        </div>

                        <div className="info-item-unknown">
                          <div className="info-label-unknown">Identified By</div>
                          <div className="info-value-unknown">
                            <i className="fas fa-user-tie"></i>
                            {selectedDetection.identifiedBy}
                          </div>
                        </div>

                        <div className="info-item-unknown">
                          <div className="info-label-unknown">Identified On</div>
                          <div className="info-value-unknown">
                            <i className="far fa-clock"></i>
                            {formatDateTime(selectedDetection.identifiedAt)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {selectedDetection.notes && (
                    <div className="notes-section-unknown">
                      <div className="notes-label">Notes</div>
                      <div className="notes-content-unknown">
                        <i className="fas fa-sticky-note"></i>
                        {selectedDetection.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedDetection.status === 'pending' && (
                <>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowDetailsModal(false);
                      openIdentifyModal(selectedDetection);
                    }}
                  >
                    <i className="fas fa-user-check"></i>
                    Identify Person
                  </button>
                  <button
                    className="btn-warning"
                    onClick={() => flagAsSecurity(selectedDetection.id)}
                  >
                    <i className="fas fa-flag"></i>
                    Flag as Alert
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => markAsIgnored(selectedDetection.id)}
                  >
                    <i className="fas fa-ban"></i>
                    Ignore
                  </button>
                </>
              )}
              {selectedDetection.status !== 'pending' && (
                <>
                  <button
                    className="btn-danger"
                    onClick={() => deleteDetection(selectedDetection.id)}
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Identify Modal */}
      {showIdentifyModal && selectedDetection && (
        <div className="modal-overlay" onClick={() => setShowIdentifyModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-check"></i>
                Identify Person
              </h3>
              <button className="modal-close-btn" onClick={() => setShowIdentifyModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={identifyPerson}>
              <div className="modal-body">
                <div className="identify-preview">
                  <img 
                    src={selectedDetection.imageUrl} 
                    alt="Unknown person" 
                    className="identify-image"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Select Employee <span className="required">*</span>
                  </label>
                  <select
                    value={identifyForm.employeeId}
                    onChange={(e) => setIdentifyForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    required
                  >
                    <option value="">Choose employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={identifyForm.notes}
                    onChange={(e) => setIdentifyForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional information..."
                    rows="3"
                  />
                </div>

                <div className="info-box">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    This will mark the detection as identified and associate it with the selected employee's record.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowIdentifyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-check"></i>
                  Confirm Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnknownPersons;