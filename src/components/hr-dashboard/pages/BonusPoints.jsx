import { useState, useEffect } from 'react';
import axios from 'axios';
import './BonusPoints.css';

const BonusPoints = () => {
  const [employees, setEmployees] = useState([]);
  const [bonusRecords, setBonusRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employeeId: '',
    points: '',
    type: 'reward',
    category: 'performance',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  const API_URL = 'http://localhost:5000/api';

  const bonusCategories = [
    { value: 'performance', label: 'Performance Excellence', icon: 'fa-star', color: '#1e7b4e' },
    { value: 'attendance', label: 'Perfect Attendance', icon: 'fa-calendar-check', color: '#2e7d32' },
    { value: 'punctuality', label: 'Punctuality', icon: 'fa-clock', color: '#1976d2' },
    { value: 'teamwork', label: 'Team Collaboration', icon: 'fa-users', color: '#7b1fa2' },
    { value: 'innovation', label: 'Innovation & Ideas', icon: 'fa-lightbulb', color: '#f57c00' },
    { value: 'sales', label: 'Sales Achievement', icon: 'fa-chart-line', color: '#c62828' },
    { value: 'customer', label: 'Customer Service', icon: 'fa-smile', color: '#00897b' },
    { value: 'other', label: 'Other', icon: 'fa-gift', color: '#5e35b1' }
  ];

  const pointsPresets = [
    { value: 10, label: '+10 Points', color: '#e8f5e9' },
    { value: 25, label: '+25 Points', color: '#c8e6c9' },
    { value: 50, label: '+50 Points', color: '#a5d6a7' },
    { value: 100, label: '+100 Points', color: '#81c784' },
    { value: 250, label: '+250 Points', color: '#66bb6a' }
  ];

  useEffect(() => {
    fetchEmployees();
    generateMockBonusData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [bonusRecords, searchQuery, filterType]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setLoading(false);
    }
  };

  const generateMockBonusData = () => {
    // Mock bonus records - in production, fetch from backend
    const mockRecords = [
      {
        id: 1,
        employeeId: 'emp1',
        employeeName: 'John Doe',
        points: 50,
        type: 'reward',
        category: 'performance',
        reason: 'Exceeded monthly sales target',
        date: '2024-12-05',
        addedBy: 'HR Admin',
        timestamp: new Date('2024-12-05T10:30:00')
      },
      {
        id: 2,
        employeeId: 'emp1',
        employeeName: 'John Doe',
        points: 25,
        type: 'reward',
        category: 'punctuality',
        reason: 'Perfect attendance for November',
        date: '2024-12-01',
        addedBy: 'HR Admin',
        timestamp: new Date('2024-12-01T09:00:00')
      }
    ];

    setBonusRecords(mockRecords);
  };

  const filterRecords = () => {
    let filtered = [...bonusRecords];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(record => record.category === filterType);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredRecords(filtered);
  };

  const calculateEmployeePoints = (employeeId) => {
    return bonusRecords
      .filter(record => record.employeeId === employeeId)
      .reduce((sum, record) => {
        return record.type === 'reward' ? sum + record.points : sum - record.points;
      }, 0);
  };

  const getEmployeeRanking = () => {
    const employeePoints = {};
    
    bonusRecords.forEach(record => {
      if (!employeePoints[record.employeeId]) {
        employeePoints[record.employeeId] = {
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          totalPoints: 0
        };
      }
      employeePoints[record.employeeId].totalPoints += 
        record.type === 'reward' ? record.points : -record.points;
    });

    return Object.values(employeePoints)
      .sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      points: '',
      type: 'reward',
      category: 'performance',
      reason: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddBonus = () => {
    resetForm();
    setShowAddModal(true);
  };

  const saveBonus = (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.points || !formData.reason.trim()) {
      alert('⚠️ Please fill in all required fields!');
      return;
    }

    const employee = employees.find(e => e._id === formData.employeeId);
    if (!employee) {
      alert('⚠️ Employee not found!');
      return;
    }

    const newRecord = {
      id: Date.now(),
      employeeId: formData.employeeId,
      employeeName: employee.name,
      points: parseInt(formData.points),
      type: formData.type,
      category: formData.category,
      reason: formData.reason,
      date: formData.date,
      addedBy: 'HR Admin',
      timestamp: new Date()
    };

    setBonusRecords(prev => [newRecord, ...prev]);
    setShowAddModal(false);
    resetForm();
    
    const action = formData.type === 'reward' ? 'awarded' : 'deducted';
    alert(`✅ ${formData.points} points ${action} successfully to ${employee.name}!`);
  };

  const viewEmployeeHistory = (employeeId, employeeName) => {
    setSelectedEmployee({ id: employeeId, name: employeeName });
    setShowHistoryModal(true);
  };

  const getEmployeeHistory = () => {
    if (!selectedEmployee) return [];
    return bonusRecords
      .filter(record => record.employeeId === selectedEmployee.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getCategoryInfo = (category) => {
    return bonusCategories.find(c => c.value === category) || bonusCategories[0];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStats = () => {
    const totalAwarded = bonusRecords
      .filter(r => r.type === 'reward')
      .reduce((sum, r) => sum + r.points, 0);
    
    const totalDeducted = bonusRecords
      .filter(r => r.type === 'deduction')
      .reduce((sum, r) => sum + r.points, 0);

    const uniqueEmployees = new Set(bonusRecords.map(r => r.employeeId)).size;

    return {
      totalAwarded,
      totalDeducted,
      netPoints: totalAwarded - totalDeducted,
      totalTransactions: bonusRecords.length,
      uniqueEmployees
    };
  };

  const stats = getStats();
  const rankings = getEmployeeRanking();

  return (
    <div className="bonus-points">
      {/* Header */}
      <div className="bonus-header">
        <div className="bonus-header-left">
          <h2>
            <i className="fas fa-star"></i>
            Bonus Points Management
          </h2>
          <p>Reward and incentivize your team members</p>
        </div>
        <div className="bonus-header-right">
          <button className="btn-primary" onClick={handleAddBonus}>
            <i className="fas fa-plus"></i>
            Award Points
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bonus-stats-grid">
        <div className="bonus-stat-card primary">
          <div className="bonus-stat-icon">
            <i className="fas fa-award"></i>
          </div>
          <div className="bonus-stat-content">
            <div className="bonus-stat-value">{stats.totalAwarded.toLocaleString()}</div>
            <div className="bonus-stat-label">Total Awarded</div>
          </div>
        </div>

        <div className="bonus-stat-card success">
          <div className="bonus-stat-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="bonus-stat-content">
            <div className="bonus-stat-value">{stats.netPoints.toLocaleString()}</div>
            <div className="bonus-stat-label">Net Points</div>
          </div>
        </div>

        <div className="bonus-stat-card info">
          <div className="bonus-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="bonus-stat-content">
            <div className="bonus-stat-value">{stats.uniqueEmployees}</div>
            <div className="bonus-stat-label">Employees Rewarded</div>
          </div>
        </div>

        <div className="bonus-stat-card warning">
          <div className="bonus-stat-icon">
            <i className="fas fa-list"></i>
          </div>
          <div className="bonus-stat-content">
            <div className="bonus-stat-value">{stats.totalTransactions}</div>
            <div className="bonus-stat-label">Total Transactions</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="bonus-content-grid">
        {/* Leaderboard */}
        <div className="leaderboard-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-medal"></i>
              Top Performers
            </h3>
          </div>
          <div className="card-body">
            {rankings.length === 0 ? (
              <div className="empty-state-small">
                <i className="fas fa-trophy"></i>
                <p>No bonus records yet</p>
              </div>
            ) : (
              <div className="leaderboard-list">
                {rankings.slice(0, 10).map((emp, index) => (
                  <div
                    key={emp.employeeId}
                    className={`leaderboard-item ${index < 3 ? `rank-${index + 1}` : ''}`}
                    onClick={() => viewEmployeeHistory(emp.employeeId, emp.employeeName)}
                  >
                    <div className="rank-badge">
                      {index === 0 && <i className="fas fa-crown"></i>}
                      {index === 1 && <i className="fas fa-medal"></i>}
                      {index === 2 && <i className="fas fa-award"></i>}
                      {index > 2 && <span>#{index + 1}</span>}
                    </div>
                    <div className="employee-info-leader">
                      <div className="employee-avatar-leader">
                        {emp.employeeName.charAt(0)}
                      </div>
                      <div className="employee-details">
                        <div className="employee-name-leader">{emp.employeeName}</div>
                        <div className="employee-points-label">Total Points</div>
                      </div>
                    </div>
                    <div className="points-badge-leader">
                      <i className="fas fa-star"></i>
                      {emp.totalPoints}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-history"></i>
              Recent Transactions
            </h3>
            <div className="filter-controls">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-bonus"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {bonusCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-state-small">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading transactions...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="empty-state-small">
                <i className="fas fa-inbox"></i>
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="transactions-list">
                {filteredRecords.map(record => {
                  const categoryInfo = getCategoryInfo(record.category);
                  return (
                    <div key={record.id} className="transaction-item">
                      <div
                        className="category-icon"
                        style={{ background: `${categoryInfo.color}20`, color: categoryInfo.color }}
                      >
                        <i className={`fas ${categoryInfo.icon}`}></i>
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-header">
                          <span className="employee-name-trans">{record.employeeName}</span>
                          <span
                            className={`points-change ${record.type}`}
                            style={{ color: record.type === 'reward' ? '#2e7d32' : '#c62828' }}
                          >
                            {record.type === 'reward' ? '+' : '-'}{record.points}
                            <i className="fas fa-star"></i>
                          </span>
                        </div>
                        <div className="transaction-reason">{record.reason}</div>
                        <div className="transaction-meta">
                          <span className="category-tag" style={{ borderColor: categoryInfo.color, color: categoryInfo.color }}>
                            {categoryInfo.label}
                          </span>
                          <span className="transaction-date">
                            <i className="far fa-calendar"></i>
                            {formatDate(record.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Bonus Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-star"></i>
                Award Bonus Points
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={saveBonus}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>
                      Select Employee <span className="required">*</span>
                    </label>
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Choose an employee...</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Transaction Type <span className="required">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="reward">✅ Award Points (Add)</option>
                      <option value="deduction">❌ Deduct Points (Remove)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Category <span className="required">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      {bonusCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Points <span className="required">*</span>
                    </label>
                    <div className="points-input-group">
                      <input
                        type="number"
                        name="points"
                        value={formData.points}
                        onChange={handleInputChange}
                        placeholder="Enter points"
                        min="1"
                        max="1000"
                        required
                      />
                      <div className="points-presets">
                        {pointsPresets.map(preset => (
                          <button
                            key={preset.value}
                            type="button"
                            className="preset-btn"
                            style={{ background: preset.color }}
                            onClick={() => setFormData(prev => ({ ...prev, points: preset.value }))}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Reason <span className="required">*</span>
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Enter reason for awarding/deducting points..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {formData.employeeId && (
                  <div className="info-box">
                    <i className="fas fa-info-circle"></i>
                    <div>
                      <strong>Current Points:</strong>{' '}
                      {calculateEmployeePoints(formData.employeeId)} points
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
                  {formData.type === 'reward' ? 'Award Points' : 'Deduct Points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee History Modal */}
      {showHistoryModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-history"></i>
                Points History - {selectedEmployee.name}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowHistoryModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="history-summary">
                <div className="summary-item">
                  <div className="summary-label">Total Points</div>
                  <div className="summary-value primary">
                    {calculateEmployeePoints(selectedEmployee.id)}
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Transactions</div>
                  <div className="summary-value">
                    {getEmployeeHistory().length}
                  </div>
                </div>
              </div>

              <div className="history-list">
                {getEmployeeHistory().map(record => {
                  const categoryInfo = getCategoryInfo(record.category);
                  return (
                    <div key={record.id} className="history-item">
                      <div
                        className="history-icon"
                        style={{ background: `${categoryInfo.color}20`, color: categoryInfo.color }}
                      >
                        <i className={`fas ${categoryInfo.icon}`}></i>
                      </div>
                      <div className="history-details">
                        <div className="history-header">
                          <span className="history-category">{categoryInfo.label}</span>
                          <span
                            className={`history-points ${record.type}`}
                          >
                            {record.type === 'reward' ? '+' : '-'}{record.points}
                          </span>
                        </div>
                        <div className="history-reason">{record.reason}</div>
                        <div className="history-date">
                          <i className="far fa-calendar"></i>
                          {formatDate(record.date)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusPoints;