import { useState, useEffect } from 'react';
import axios from 'axios';
import './ScratchCards.css';

const ScratchCards = () => {
  const [employees, setEmployees] = useState([]);
  const [scratchCards, setScratchCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showScratchModal, setShowScratchModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    rewardType: 'bonus',
    rewardValue: 0,
    validUntil: '',
    maxRedemptions: 1
  });

  const [assignForm, setAssignForm] = useState({
    employeeIds: [],
    cardId: ''
  });

  const API_URL = 'http://localhost:5000/api';

  const rewardTypes = [
    { value: 'bonus', label: 'Bonus Points', icon: 'fa-star', color: '#f59e0b' },
    { value: 'cash', label: 'Cash Reward', icon: 'fa-dollar-sign', color: '#2e7d32' },
    { value: 'leave', label: 'Extra Leave Day', icon: 'fa-calendar-plus', color: '#1976d2' },
    { value: 'gift', label: 'Gift Voucher', icon: 'fa-gift', color: '#c62828' },
    { value: 'discount', label: 'Discount Coupon', icon: 'fa-percentage', color: '#7b1fa2' },
    { value: 'experience', label: 'Experience', icon: 'fa-ticket-alt', color: '#00897b' }
  ];

  const cardStatuses = [
    { value: 'active', label: 'Active', color: '#2e7d32', icon: 'fa-check-circle' },
    { value: 'scratched', label: 'Scratched', color: '#1976d2', icon: 'fa-hand-pointer' },
    { value: 'redeemed', label: 'Redeemed', color: '#7b1fa2', icon: 'fa-gift' },
    { value: 'expired', label: 'Expired', color: '#c62828', icon: 'fa-times-circle' }
  ];

  useEffect(() => {
    fetchEmployees();
    generateMockScratchCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [scratchCards, searchQuery, filterStatus, filterType]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const generateMockScratchCards = () => {
    const mockCards = [
      {
        id: 'card-1',
        employeeId: 'emp1',
        employeeName: 'John Doe',
        title: '🎉 Performance Bonus',
        description: 'Congratulations on exceeding your quarterly targets!',
        rewardType: 'bonus',
        rewardValue: 500,
        status: 'active',
        createdAt: new Date('2024-12-08'),
        validUntil: new Date('2024-12-31'),
        scratchedAt: null,
        redeemedAt: null,
        maxRedemptions: 1
      },
      {
        id: 'card-2',
        employeeId: 'emp2',
        employeeName: 'Sarah Williams',
        title: '💰 Cash Reward',
        description: 'Great work on the client presentation!',
        rewardType: 'cash',
        rewardValue: 100,
        status: 'scratched',
        createdAt: new Date('2024-12-07'),
        validUntil: new Date('2024-12-20'),
        scratchedAt: new Date('2024-12-08'),
        redeemedAt: null,
        maxRedemptions: 1
      },
      {
        id: 'card-3',
        employeeId: 'emp3',
        employeeName: 'Mike Johnson',
        title: '🎁 Gift Voucher',
        description: 'Thank you for your exceptional customer service!',
        rewardType: 'gift',
        rewardValue: 50,
        status: 'redeemed',
        createdAt: new Date('2024-12-05'),
        validUntil: new Date('2024-12-15'),
        scratchedAt: new Date('2024-12-06'),
        redeemedAt: new Date('2024-12-07'),
        maxRedemptions: 1
      },
      {
        id: 'card-4',
        employeeId: 'emp1',
        employeeName: 'John Doe',
        title: '🏖️ Extra Leave Day',
        description: 'Reward for perfect attendance this month!',
        rewardType: 'leave',
        rewardValue: 1,
        status: 'expired',
        createdAt: new Date('2024-11-20'),
        validUntil: new Date('2024-12-05'),
        scratchedAt: null,
        redeemedAt: null,
        maxRedemptions: 1
      }
    ];

    setScratchCards(mockCards);
  };

  const filterCards = () => {
    let filtered = [...scratchCards];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(card => card.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(card => card.rewardType === filterType);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredCards(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetCardForm = () => {
    setCardForm({
      title: '',
      description: '',
      rewardType: 'bonus',
      rewardValue: 0,
      validUntil: '',
      maxRedemptions: 1
    });
  };

  const handleCreateCard = () => {
    resetCardForm();
    setShowCreateModal(true);
  };

  const createCard = (e) => {
    e.preventDefault();

    if (!cardForm.title.trim() || !cardForm.description.trim() || cardForm.rewardValue <= 0 || !cardForm.validUntil) {
      alert('⚠️ Please fill in all required fields!');
      return;
    }

    setAssignForm({
      employeeIds: [],
      cardId: ''
    });

    setShowCreateModal(false);
    setShowAssignModal(true);
  };

  const assignCards = () => {
    if (assignForm.employeeIds.length === 0) {
      alert('⚠️ Please select at least one employee!');
      return;
    }

    const newCards = assignForm.employeeIds.map(employeeId => {
      const employee = employees.find(e => e._id === employeeId);
      return {
        id: `card-${Date.now()}-${Math.random()}`,
        employeeId: employee._id,
        employeeName: employee.name,
        title: cardForm.title,
        description: cardForm.description,
        rewardType: cardForm.rewardType,
        rewardValue: parseFloat(cardForm.rewardValue),
        status: 'active',
        createdAt: new Date(),
        validUntil: new Date(cardForm.validUntil),
        scratchedAt: null,
        redeemedAt: null,
        maxRedemptions: parseInt(cardForm.maxRedemptions)
      };
    });

    setScratchCards(prev => [...newCards, ...prev]);
    setShowAssignModal(false);
    resetCardForm();
    alert(`✅ ${newCards.length} scratch card(s) created and assigned successfully!`);
  };

  const toggleEmployeeSelection = (employeeId) => {
    setAssignForm(prev => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(employeeId)
        ? prev.employeeIds.filter(id => id !== employeeId)
        : [...prev.employeeIds, employeeId]
    }));
  };

  const selectAllEmployees = () => {
    if (assignForm.employeeIds.length === employees.length) {
      setAssignForm(prev => ({ ...prev, employeeIds: [] }));
    } else {
      setAssignForm(prev => ({ ...prev, employeeIds: employees.map(e => e._id) }));
    }
  };

  const openScratchModal = (card) => {
    if (card.status !== 'active') {
      alert('⚠️ This card has already been scratched or has expired!');
      return;
    }

    setSelectedCard(card);
    setScratchProgress(0);
    setIsScratching(false);
    setShowScratchModal(true);
  };

  const startScratching = () => {
    setIsScratching(true);
    
    const interval = setInterval(() => {
      setScratchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            revealReward();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  const revealReward = () => {
    setScratchCards(prev => prev.map(card =>
      card.id === selectedCard.id
        ? { ...card, status: 'scratched', scratchedAt: new Date() }
        : card
    ));

    setTimeout(() => {
      setIsScratching(false);
    }, 1000);
  };

  const redeemCard = () => {
    if (!selectedCard || selectedCard.status !== 'scratched') {
      alert('⚠️ Card must be scratched before redemption!');
      return;
    }

    setScratchCards(prev => prev.map(card =>
      card.id === selectedCard.id
        ? { ...card, status: 'redeemed', redeemedAt: new Date() }
        : card
    ));

    setShowScratchModal(false);
    alert('🎉 Reward redeemed successfully!');
  };

  const deleteCard = (cardId) => {
    if (window.confirm('Are you sure you want to delete this scratch card?')) {
      setScratchCards(prev => prev.filter(card => card.id !== cardId));
      alert('✅ Scratch card deleted successfully!');
    }
  };

  const getRewardTypeInfo = (type) => {
    return rewardTypes.find(t => t.value === type) || rewardTypes[0];
  };

  const getStatusInfo = (status) => {
    return cardStatuses.find(s => s.value === status) || cardStatuses[0];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRewardDisplay = (card) => {
    const typeInfo = getRewardTypeInfo(card.rewardType);
    
    if (card.rewardType === 'bonus') {
      return `${card.rewardValue} Points`;
    } else if (card.rewardType === 'cash') {
      return `$${card.rewardValue}`;
    } else if (card.rewardType === 'leave') {
      return `${card.rewardValue} Day${card.rewardValue > 1 ? 's' : ''}`;
    } else if (card.rewardType === 'discount') {
      return `${card.rewardValue}% Off`;
    } else {
      return `$${card.rewardValue} Value`;
    }
  };

  const getStats = () => {
    const totalCards = scratchCards.length;
    const activeCards = scratchCards.filter(c => c.status === 'active').length;
    const scratchedCards = scratchCards.filter(c => c.status === 'scratched').length;
    const redeemedCards = scratchCards.filter(c => c.status === 'redeemed').length;
    const totalValue = scratchCards
      .filter(c => c.status === 'redeemed' && c.rewardType === 'cash')
      .reduce((sum, c) => sum + c.rewardValue, 0);

    return {
      totalCards,
      activeCards,
      scratchedCards,
      redeemedCards,
      totalValue
    };
  };

  const stats = getStats();

  return (
    <div className="scratch-cards">
      {/* Header */}
      <div className="scratch-header">
        <div className="scratch-header-left">
          <h2>
            <i className="fas fa-ticket-alt"></i>
            Scratch Cards
          </h2>
          <p>Gamified rewards and employee engagement</p>
        </div>
        <div className="scratch-header-right">
          <button className="btn-primary" onClick={handleCreateCard}>
            <i className="fas fa-plus"></i>
            Create Scratch Card
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="scratch-stats-grid">
        <div className="scratch-stat-card total">
          <div className="scratch-stat-icon">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <div className="scratch-stat-content">
            <div className="scratch-stat-value">{stats.totalCards}</div>
            <div className="scratch-stat-label">Total Cards</div>
          </div>
        </div>

        <div className="scratch-stat-card active">
          <div className="scratch-stat-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="scratch-stat-content">
            <div className="scratch-stat-value">{stats.activeCards}</div>
            <div className="scratch-stat-label">Active</div>
          </div>
        </div>

        <div className="scratch-stat-card scratched">
          <div className="scratch-stat-icon">
            <i className="fas fa-hand-pointer"></i>
          </div>
          <div className="scratch-stat-content">
            <div className="scratch-stat-value">{stats.scratchedCards}</div>
            <div className="scratch-stat-label">Scratched</div>
          </div>
        </div>

        <div className="scratch-stat-card redeemed">
          <div className="scratch-stat-icon">
            <i className="fas fa-gift"></i>
          </div>
          <div className="scratch-stat-content">
            <div className="scratch-stat-value">{stats.redeemedCards}</div>
            <div className="scratch-stat-label">Redeemed</div>
          </div>
        </div>

        <div className="scratch-stat-card value">
          <div className="scratch-stat-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="scratch-stat-content">
            <div className="scratch-stat-value">${stats.totalValue}</div>
            <div className="scratch-stat-label">Total Value Redeemed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="scratch-filters">
        <input
          type="text"
          placeholder="Search cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-scratch"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select-scratch"
        >
          <option value="all">All Status</option>
          {cardStatuses.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select-scratch"
        >
          <option value="all">All Types</option>
          {rewardTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="scratch-cards-grid">
        {filteredCards.length === 0 ? (
          <div className="empty-state-scratch">
            <i className="fas fa-ticket-alt"></i>
            <p>No scratch cards found</p>
            <button className="btn-primary" onClick={handleCreateCard}>
              <i className="fas fa-plus"></i>
              Create First Card
            </button>
          </div>
        ) : (
          filteredCards.map(card => {
            const typeInfo = getRewardTypeInfo(card.rewardType);
            const statusInfo = getStatusInfo(card.status);

            return (
              <div
                key={card.id}
                className={`scratch-card-item ${card.status}`}
                onClick={() => card.status === 'active' && openScratchModal(card)}
              >
                <div className="scratch-card-header">
                  <span
                    className="reward-type-badge"
                    style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}
                  >
                    <i className={`fas ${typeInfo.icon}`}></i>
                    {typeInfo.label}
                  </span>
                  <span
                    className="status-badge-scratch"
                    style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                  >
                    <i className={`fas ${statusInfo.icon}`}></i>
                    {statusInfo.label}
                  </span>
                </div>

                <div className="scratch-card-visual">
                  {card.status === 'active' ? (
                    <div className="scratch-surface">
                      <div className="scratch-pattern"></div>
                      <div className="scratch-instruction">
                        <i className="fas fa-hand-pointer"></i>
                        <span>Click to Scratch!</span>
                      </div>
                    </div>
                  ) : (
                    <div className="reward-revealed" style={{ background: `${typeInfo.color}20` }}>
                      <i className={`fas ${typeInfo.icon}`} style={{ color: typeInfo.color }}></i>
                      <div className="reward-value" style={{ color: typeInfo.color }}>
                        {getRewardDisplay(card)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="scratch-card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                  
                  <div className="card-meta">
                    <div className="meta-item-scratch">
                      <i className="far fa-user"></i>
                      {card.employeeName}
                    </div>
                    <div className="meta-item-scratch">
                      <i className="far fa-calendar"></i>
                      Valid until {formatDate(card.validUntil)}
                    </div>
                  </div>
                </div>

                <div className="scratch-card-footer">
                  {card.status === 'scratched' && (
                    <button
                      className="card-action-btn redeem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCard(card);
                        setShowScratchModal(true);
                      }}
                    >
                      <i className="fas fa-gift"></i>
                      Redeem Now
                    </button>
                  )}
                  <button
                    className="card-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCard(card.id);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Card Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-plus"></i>
                Create Scratch Card
              </h3>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={createCard}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>
                      Card Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={cardForm.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Performance Bonus, Holiday Gift"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Description <span className="required">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={cardForm.description}
                      onChange={handleInputChange}
                      placeholder="Add a motivational message or reason for this reward..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Reward Type <span className="required">*</span>
                    </label>
                    <select
                      name="rewardType"
                      value={cardForm.rewardType}
                      onChange={handleInputChange}
                      required
                    >
                      {rewardTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Reward Value <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      name="rewardValue"
                      value={cardForm.rewardValue}
                      onChange={handleInputChange}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Valid Until <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={cardForm.validUntil}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Redemptions</label>
                    <input
                      type="number"
                      name="maxRedemptions"
                      value={cardForm.maxRedemptions}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="info-box">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    After creating the card, you'll be able to assign it to specific employees.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-arrow-right"></i>
                  Next: Assign Employees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employees Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-users"></i>
                Assign to Employees
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAssignModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="card-preview-box">
                <h4>Card Details:</h4>
                <div className="preview-content">
                  <div><strong>Title:</strong> {cardForm.title}</div>
                  <div><strong>Reward:</strong> {getRewardTypeInfo(cardForm.rewardType).label}</div>
                  <div><strong>Value:</strong> {cardForm.rewardValue}</div>
                </div>
              </div>

              <div className="assign-controls">
                <button className="btn-select-all" onClick={selectAllEmployees}>
                  {assignForm.employeeIds.length === employees.length ? (
                    <>
                      <i className="fas fa-times"></i>
                      Deselect All
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-double"></i>
                      Select All
                    </>
                  )}
                </button>
                <span className="selection-count">
                  {assignForm.employeeIds.length} employee(s) selected
                </span>
              </div>

              <div className="employees-grid-assign">
                {employees.map(employee => (
                  <div
                    key={employee._id}
                    className={`employee-card-assign ${
                      assignForm.employeeIds.includes(employee._id) ? 'selected' : ''
                    }`}
                    onClick={() => toggleEmployeeSelection(employee._id)}
                  >
                    <div className="employee-avatar-assign">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="employee-name-assign">{employee.name}</div>
                    {assignForm.employeeIds.includes(employee._id) && (
                      <div className="selected-check">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={assignCards}
              >
                <i className="fas fa-check"></i>
                Assign Cards ({assignForm.employeeIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scratch Modal */}
      {showScratchModal && selectedCard && (
        <div className="modal-overlay scratch-overlay" onClick={() => setShowScratchModal(false)}>
          <div className="modal-container modal-scratch" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header scratch-modal-header">
              <h3>
                <i className="fas fa-gift"></i>
                {selectedCard.title}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowScratchModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body scratch-modal-body">
              <div className="scratch-interactive-area">
                {selectedCard.status === 'active' && scratchProgress === 0 && (
                  <div className="scratch-ready">
                    <div className="scratch-surface-large">
                      <div className="scratch-pattern-large"></div>
                    </div>
                    <button className="btn-scratch-now" onClick={startScratching}>
                      <i className="fas fa-hand-pointer"></i>
                      Scratch Now!
                    </button>
                  </div>
                )}

                {isScratching && scratchProgress < 100 && (
                  <div className="scratch-progress-area">
                    <div className="scratch-animation">
                      <i className="fas fa-hand-pointer scratching"></i>
                    </div>
                    <div className="progress-bar-scratch">
                      <div
                        className="progress-fill-scratch"
                        style={{ width: `${scratchProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{scratchProgress}%</div>
                  </div>
                )}

                {(scratchProgress === 100 || selectedCard.status !== 'active') && (
                  <div className="reward-revealed-large">
                    <div className="confetti">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <div
                      className="reward-icon-large"
                      style={{ color: getRewardTypeInfo(selectedCard.rewardType).color }}
                    >
                      <i className={`fas ${getRewardTypeInfo(selectedCard.rewardType).icon}`}></i>
                    </div>
                    <div className="reward-title">Congratulations!</div>
                    <div
                      className="reward-value-large"
                      style={{ color: getRewardTypeInfo(selectedCard.rewardType).color }}
                    >
                      {getRewardDisplay(selectedCard)}
                    </div>
                    <div className="reward-description">{selectedCard.description}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {selectedCard.status === 'scratched' && (
                <button className="btn-primary btn-redeem-large" onClick={redeemCard}>
                  <i className="fas fa-gift"></i>
                  Redeem Reward
                </button>
              )}
              {selectedCard.status === 'redeemed' && (
                <div className="redeemed-message">
                  <i className="fas fa-check-circle"></i>
                  This reward has been redeemed on {formatDate(selectedCard.redeemedAt)}
                </div>
              )}
              {selectedCard.status === 'active' && scratchProgress === 0 && (
                <button className="btn-secondary" onClick={() => setShowScratchModal(false)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchCards;