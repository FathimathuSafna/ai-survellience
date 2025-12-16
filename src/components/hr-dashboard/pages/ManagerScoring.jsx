import { useState, useEffect } from 'react';
import axios from 'axios';
import './ManagerScoring.css';

const ManagerScoring = () => {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  const [scoreForm, setScoreForm] = useState({
    teamPerformance: 0,
    attendanceRate: 0,
    punctuality: 0,
    taskCompletion: 0,
    teamSatisfaction: 0,
    leadership: 0,
    communication: 0,
    problemSolving: 0,
    notes: ''
  });

  const API_URL = 'http://localhost:5000/api';

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'Operations',
    'IT',
    'Customer Support'
  ];

  const scoreCategories = [
    { key: 'teamPerformance', label: 'Team Performance', icon: 'fa-users', color: '#1976d2' },
    { key: 'attendanceRate', label: 'Attendance Rate', icon: 'fa-calendar-check', color: '#2e7d32' },
    { key: 'punctuality', label: 'Punctuality', icon: 'fa-clock', color: '#f57c00' },
    { key: 'taskCompletion', label: 'Task Completion', icon: 'fa-tasks', color: '#7b1fa2' },
    { key: 'teamSatisfaction', label: 'Team Satisfaction', icon: 'fa-smile', color: '#00897b' },
    { key: 'leadership', label: 'Leadership', icon: 'fa-award', color: '#c62828' },
    { key: 'communication', label: 'Communication', icon: 'fa-comments', color: '#1e7b4e' },
    { key: 'problemSolving', label: 'Problem Solving', icon: 'fa-lightbulb', color: '#d84315' }
  ];

  useEffect(() => {
    generateMockManagers();
  }, []);

  useEffect(() => {
    filterAndSortManagers();
  }, [managers, searchQuery, filterDepartment, sortBy]);

  const generateMockManagers = () => {
    const mockManagers = [
      {
        id: 'mgr-1',
        name: 'Sarah Johnson',
        department: 'Engineering',
        teamSize: 12,
        email: 'sarah.johnson@company.com',
        phone: '+1 555-0101',
        joinDate: '2022-01-15',
        scores: {
          teamPerformance: 92,
          attendanceRate: 95,
          punctuality: 88,
          taskCompletion: 90,
          teamSatisfaction: 87,
          leadership: 94,
          communication: 89,
          problemSolving: 91
        },
        overallScore: 90.75,
        lastEvaluated: new Date('2024-12-01'),
        evaluatedBy: 'HR Manager',
        notes: 'Excellent team leader with strong technical skills',
        achievements: [
          'Delivered 3 major projects on time',
          'Improved team productivity by 25%',
          'Zero attrition in team this year'
        ]
      },
      {
        id: 'mgr-2',
        name: 'Michael Chen',
        department: 'Sales',
        teamSize: 8,
        email: 'michael.chen@company.com',
        phone: '+1 555-0102',
        joinDate: '2021-06-20',
        scores: {
          teamPerformance: 88,
          attendanceRate: 92,
          punctuality: 90,
          taskCompletion: 85,
          teamSatisfaction: 91,
          leadership: 87,
          communication: 93,
          problemSolving: 86
        },
        overallScore: 89,
        lastEvaluated: new Date('2024-11-28'),
        evaluatedBy: 'HR Manager',
        notes: 'Great communicator, consistently meets sales targets',
        achievements: [
          'Exceeded quarterly targets by 30%',
          'Built strong client relationships',
          'Trained 5 new team members'
        ]
      },
      {
        id: 'mgr-3',
        name: 'Emily Rodriguez',
        department: 'Marketing',
        teamSize: 10,
        email: 'emily.rodriguez@company.com',
        phone: '+1 555-0103',
        joinDate: '2020-03-10',
        scores: {
          teamPerformance: 85,
          attendanceRate: 89,
          punctuality: 87,
          taskCompletion: 88,
          teamSatisfaction: 90,
          leadership: 86,
          communication: 92,
          problemSolving: 84
        },
        overallScore: 87.625,
        lastEvaluated: new Date('2024-12-05'),
        evaluatedBy: 'HR Manager',
        notes: 'Creative leader with strong campaign execution',
        achievements: [
          'Launched 4 successful campaigns',
          'Increased brand awareness by 40%',
          'Won Marketing Excellence Award'
        ]
      },
      {
        id: 'mgr-4',
        name: 'David Williams',
        department: 'IT',
        teamSize: 6,
        email: 'david.williams@company.com',
        phone: '+1 555-0104',
        joinDate: '2023-02-01',
        scores: {
          teamPerformance: 78,
          attendanceRate: 82,
          punctuality: 80,
          taskCompletion: 79,
          teamSatisfaction: 75,
          leadership: 77,
          communication: 76,
          problemSolving: 81
        },
        overallScore: 78.5,
        lastEvaluated: new Date('2024-11-20'),
        evaluatedBy: 'HR Manager',
        notes: 'New manager, showing improvement. Needs mentoring on leadership',
        achievements: [
          'Implemented new security protocols',
          'Reduced downtime by 15%'
        ]
      }
    ];

    setManagers(mockManagers);
  };

  const filterAndSortManagers = () => {
    let filtered = [...managers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(mgr =>
        mgr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mgr.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mgr.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(mgr => mgr.department === filterDepartment);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return b.overallScore - a.overallScore;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'department') {
        return a.department.localeCompare(b.department);
      } else if (sortBy === 'teamSize') {
        return b.teamSize - a.teamSize;
      }
      return 0;
    });

    setFilteredManagers(filtered);
  };

  const handleScoreChange = (category, value) => {
    setScoreForm(prev => ({
      ...prev,
      [category]: parseInt(value)
    }));
  };

  const resetScoreForm = () => {
    if (selectedManager) {
      setScoreForm({
        teamPerformance: selectedManager.scores.teamPerformance,
        attendanceRate: selectedManager.scores.attendanceRate,
        punctuality: selectedManager.scores.punctuality,
        taskCompletion: selectedManager.scores.taskCompletion,
        teamSatisfaction: selectedManager.scores.teamSatisfaction,
        leadership: selectedManager.scores.leadership,
        communication: selectedManager.scores.communication,
        problemSolving: selectedManager.scores.problemSolving,
        notes: selectedManager.notes
      });
    } else {
      setScoreForm({
        teamPerformance: 0,
        attendanceRate: 0,
        punctuality: 0,
        taskCompletion: 0,
        teamSatisfaction: 0,
        leadership: 0,
        communication: 0,
        problemSolving: 0,
        notes: ''
      });
    }
  };

  const openScoreModal = (manager) => {
    setSelectedManager(manager);
    if (manager) {
      setScoreForm({
        teamPerformance: manager.scores.teamPerformance,
        attendanceRate: manager.scores.attendanceRate,
        punctuality: manager.scores.punctuality,
        taskCompletion: manager.scores.taskCompletion,
        teamSatisfaction: manager.scores.teamSatisfaction,
        leadership: manager.scores.leadership,
        communication: manager.scores.communication,
        problemSolving: manager.scores.problemSolving,
        notes: manager.notes
      });
    }
    setShowScoreModal(true);
  };

  const saveScore = (e) => {
    e.preventDefault();

    const overallScore = (
      scoreForm.teamPerformance +
      scoreForm.attendanceRate +
      scoreForm.punctuality +
      scoreForm.taskCompletion +
      scoreForm.teamSatisfaction +
      scoreForm.leadership +
      scoreForm.communication +
      scoreForm.problemSolving
    ) / 8;

    setManagers(prev => prev.map(mgr =>
      mgr.id === selectedManager.id
        ? {
            ...mgr,
            scores: {
              teamPerformance: scoreForm.teamPerformance,
              attendanceRate: scoreForm.attendanceRate,
              punctuality: scoreForm.punctuality,
              taskCompletion: scoreForm.taskCompletion,
              teamSatisfaction: scoreForm.teamSatisfaction,
              leadership: scoreForm.leadership,
              communication: scoreForm.communication,
              problemSolving: scoreForm.problemSolving
            },
            overallScore: overallScore,
            lastEvaluated: new Date(),
            evaluatedBy: 'HR Manager',
            notes: scoreForm.notes
          }
        : mgr
    ));

    setShowScoreModal(false);
    alert('✅ Manager score updated successfully!');
  };

  const viewDetails = (manager) => {
    setSelectedManager(manager);
    setShowDetailsModal(true);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#2e7d32';
    if (score >= 80) return '#1e7b4e';
    if (score >= 70) return '#f57c00';
    if (score >= 60) return '#fb8c00';
    return '#c62828';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getRankBadge = (index) => {
    if (index === 0) return { icon: 'fa-crown', color: '#f59e0b', label: '1st' };
    if (index === 1) return { icon: 'fa-medal', color: '#9ca3af', label: '2nd' };
    if (index === 2) return { icon: 'fa-award', color: '#f87171', label: '3rd' };
    return null;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStats = () => {
    const totalManagers = managers.length;
    const avgScore = managers.reduce((sum, mgr) => sum + mgr.overallScore, 0) / totalManagers || 0;
    const topPerformers = managers.filter(mgr => mgr.overallScore >= 90).length;
    const needsImprovement = managers.filter(mgr => mgr.overallScore < 70).length;
    const totalTeamMembers = managers.reduce((sum, mgr) => sum + mgr.teamSize, 0);

    return {
      totalManagers,
      avgScore: avgScore.toFixed(1),
      topPerformers,
      needsImprovement,
      totalTeamMembers
    };
  };

  const stats = getStats();

  return (
    <div className="manager-scoring">
      {/* Header */}
      <div className="scoring-header">
        <div className="scoring-header-left">
          <h2>
            <i className="fas fa-user-tie"></i>
            Manager Performance Scoring
          </h2>
          <p>Evaluate and track manager performance metrics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="scoring-stats-grid">
        <div className="scoring-stat-card total">
          <div className="scoring-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="scoring-stat-content">
            <div className="scoring-stat-value">{stats.totalManagers}</div>
            <div className="scoring-stat-label">Total Managers</div>
          </div>
        </div>

        <div className="scoring-stat-card average">
          <div className="scoring-stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="scoring-stat-content">
            <div className="scoring-stat-value">{stats.avgScore}</div>
            <div className="scoring-stat-label">Average Score</div>
          </div>
        </div>

        <div className="scoring-stat-card top">
          <div className="scoring-stat-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="scoring-stat-content">
            <div className="scoring-stat-value">{stats.topPerformers}</div>
            <div className="scoring-stat-label">Top Performers (90+)</div>
          </div>
        </div>

        <div className="scoring-stat-card improvement">
          <div className="scoring-stat-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div className="scoring-stat-content">
            <div className="scoring-stat-value">{stats.needsImprovement}</div>
            <div className="scoring-stat-label">Needs Improvement</div>
          </div>
        </div>

        <div className="scoring-stat-card team">
          <div className="scoring-stat-icon">
            <i className="fas fa-user-friends"></i>
          </div>
          <div className="scoring-stat-content">
            <div className="scoring-stat-value">{stats.totalTeamMembers}</div>
            <div className="scoring-stat-label">Total Team Members</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="scoring-filters">
        <input
          type="text"
          placeholder="Search managers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-scoring"
        />
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="filter-select-scoring"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select-scoring"
        >
          <option value="score">Sort by Score</option>
          <option value="name">Sort by Name</option>
          <option value="department">Sort by Department</option>
          <option value="teamSize">Sort by Team Size</option>
        </select>
      </div>

      {/* Managers Grid */}
      <div className="managers-grid">
        {filteredManagers.map((manager, index) => {
          const rankBadge = getRankBadge(index);
          const scoreColor = getScoreColor(manager.overallScore);

          return (
            <div
              key={manager.id}
              className="manager-card"
              style={{ borderTopColor: scoreColor }}
            >
              {rankBadge && (
                <div className="rank-badge-top" style={{ background: rankBadge.color }}>
                  <i className={`fas ${rankBadge.icon}`}></i>
                  {rankBadge.label}
                </div>
              )}

              <div className="manager-card-header">
                <div className="manager-avatar-scoring">
                  {manager.name.split(' ').map(n => n.charAt(0)).join('')}
                </div>
                <div className="manager-info-scoring">
                  <h3>{manager.name}</h3>
                  <div className="manager-department">{manager.department}</div>
                  <div className="manager-team-size">
                    <i className="fas fa-users"></i>
                    Team of {manager.teamSize}
                  </div>
                </div>
              </div>

              <div className="score-display">
                <div className="score-circle" style={{ borderColor: scoreColor }}>
                  <div className="score-value" style={{ color: scoreColor }}>
                    {manager.overallScore.toFixed(1)}
                  </div>
                  <div className="score-max">/100</div>
                </div>
                <div className="score-label" style={{ color: scoreColor }}>
                  {getScoreLabel(manager.overallScore)}
                </div>
              </div>

              <div className="score-breakdown">
                {scoreCategories.slice(0, 4).map(category => {
                  const score = manager.scores[category.key];
                  return (
                    <div key={category.key} className="breakdown-item">
                      <div className="breakdown-header">
                        <i className={`fas ${category.icon}`} style={{ color: category.color }}></i>
                        <span>{category.label}</span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-fill"
                          style={{
                            width: `${score}%`,
                            background: getScoreColor(score)
                          }}
                        ></div>
                      </div>
                      <div className="breakdown-score">{score}</div>
                    </div>
                  );
                })}
              </div>

              <div className="manager-card-footer">
                <div className="last-evaluated">
                  <i className="far fa-clock"></i>
                  Last evaluated: {formatDate(manager.lastEvaluated)}
                </div>
                <div className="card-actions">
                  <button
                    className="action-btn-scoring view"
                    onClick={() => viewDetails(manager)}
                  >
                    <i className="fas fa-eye"></i>
                    Details
                  </button>
                  <button
                    className="action-btn-scoring score"
                    onClick={() => openScoreModal(manager)}
                  >
                    <i className="fas fa-star"></i>
                    Score
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Score Modal */}
      {showScoreModal && selectedManager && (
        <div className="modal-overlay" onClick={() => setShowScoreModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-star"></i>
                Evaluate Manager - {selectedManager.name}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowScoreModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={saveScore}>
              <div className="modal-body">
                <div className="score-form-grid">
                  {scoreCategories.map(category => (
                    <div key={category.key} className="score-input-group">
                      <div className="score-input-header">
                        <div className="score-input-label">
                          <i className={`fas ${category.icon}`} style={{ color: category.color }}></i>
                          {category.label}
                        </div>
                        <div
                          className="score-input-value"
                          style={{ color: getScoreColor(scoreForm[category.key]) }}
                        >
                          {scoreForm[category.key]}/100
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={scoreForm[category.key]}
                        onChange={(e) => handleScoreChange(category.key, e.target.value)}
                        className="score-slider"
                        style={{
                          background: `linear-gradient(to right, ${getScoreColor(scoreForm[category.key])} 0%, ${getScoreColor(scoreForm[category.key])} ${scoreForm[category.key]}%, #e2e8f0 ${scoreForm[category.key]}%, #e2e8f0 100%)`
                        }}
                      />
                      <div className="score-marks">
                        <span>0</span>
                        <span>25</span>
                        <span>50</span>
                        <span>75</span>
                        <span>100</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overall-score-preview">
                  <div className="preview-label">Overall Score</div>
                  <div
                    className="preview-score"
                    style={{
                      color: getScoreColor(
                        (scoreForm.teamPerformance +
                          scoreForm.attendanceRate +
                          scoreForm.punctuality +
                          scoreForm.taskCompletion +
                          scoreForm.teamSatisfaction +
                          scoreForm.leadership +
                          scoreForm.communication +
                          scoreForm.problemSolving) / 8
                      )
                    }}
                  >
                    {(
                      (scoreForm.teamPerformance +
                        scoreForm.attendanceRate +
                        scoreForm.punctuality +
                        scoreForm.taskCompletion +
                        scoreForm.teamSatisfaction +
                        scoreForm.leadership +
                        scoreForm.communication +
                        scoreForm.problemSolving) / 8
                    ).toFixed(1)}
                    /100
                  </div>
                  <div
                    className="preview-label-status"
                    style={{
                      color: getScoreColor(
                        (scoreForm.teamPerformance +
                          scoreForm.attendanceRate +
                          scoreForm.punctuality +
                          scoreForm.taskCompletion +
                          scoreForm.teamSatisfaction +
                          scoreForm.leadership +
                          scoreForm.communication +
                          scoreForm.problemSolving) / 8
                      )
                    }}
                  >
                    {getScoreLabel(
                      (scoreForm.teamPerformance +
                        scoreForm.attendanceRate +
                        scoreForm.punctuality +
                        scoreForm.taskCompletion +
                        scoreForm.teamSatisfaction +
                        scoreForm.leadership +
                        scoreForm.communication +
                        scoreForm.problemSolving) / 8
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Evaluation Notes</label>
                  <textarea
                    value={scoreForm.notes}
                    onChange={(e) => setScoreForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this evaluation..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowScoreModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i>
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedManager && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-tie"></i>
                Manager Details - {selectedManager.name}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="details-overview">
                <div className="details-avatar">
                  {selectedManager.name.split(' ').map(n => n.charAt(0)).join('')}
                </div>
                <div className="details-info">
                  <h2>{selectedManager.name}</h2>
                  <div className="details-meta">
                    <span><i className="fas fa-briefcase"></i> {selectedManager.department}</span>
                    <span><i className="fas fa-users"></i> Team of {selectedManager.teamSize}</span>
                    <span><i className="far fa-envelope"></i> {selectedManager.email}</span>
                    <span><i className="fas fa-phone"></i> {selectedManager.phone}</span>
                    <span><i className="far fa-calendar"></i> Joined {formatDate(selectedManager.joinDate)}</span>
                  </div>
                </div>
                <div className="details-score-big">
                  <div
                    className="score-circle-big"
                    style={{ borderColor: getScoreColor(selectedManager.overallScore) }}
                  >
                    <div className="score-value-big" style={{ color: getScoreColor(selectedManager.overallScore) }}>
                      {selectedManager.overallScore.toFixed(1)}
                    </div>
                    <div className="score-max-big">/100</div>
                  </div>
                  <div className="score-label-big" style={{ color: getScoreColor(selectedManager.overallScore) }}>
                    {getScoreLabel(selectedManager.overallScore)}
                  </div>
                </div>
              </div>

              <div className="details-scores-section">
                <h4>Performance Breakdown</h4>
                <div className="details-scores-grid">
                  {scoreCategories.map(category => {
                    const score = selectedManager.scores[category.key];
                    return (
                      <div key={category.key} className="details-score-item">
                        <div className="details-score-header">
                          <i className={`fas ${category.icon}`} style={{ color: category.color }}></i>
                          <span>{category.label}</span>
                        </div>
                        <div className="details-score-bar">
                          <div
                            className="details-score-fill"
                            style={{
                              width: `${score}%`,
                              background: getScoreColor(score)
                            }}
                          >
                            <span className="details-score-text">{score}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedManager.achievements && selectedManager.achievements.length > 0 && (
                <div className="achievements-section">
                  <h4>Key Achievements</h4>
                  <ul className="achievements-list">
                    {selectedManager.achievements.map((achievement, index) => (
                      <li key={index}>
                        <i className="fas fa-check-circle"></i>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedManager.notes && (
                <div className="notes-section">
                  <h4>Evaluation Notes</h4>
                  <div className="notes-content">
                    <i className="fas fa-sticky-note"></i>
                    {selectedManager.notes}
                  </div>
                </div>
              )}

              <div className="evaluation-info">
                <div className="eval-item">
                  <strong>Last Evaluated:</strong> {formatDate(selectedManager.lastEvaluated)}
                </div>
                <div className="eval-item">
                  <strong>Evaluated By:</strong> {selectedManager.evaluatedBy}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  openScoreModal(selectedManager);
                }}
              >
                <i className="fas fa-star"></i>
                Update Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerScoring;