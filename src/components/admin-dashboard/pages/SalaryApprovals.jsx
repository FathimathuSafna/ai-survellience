import React, { useState, useEffect } from 'react';
import { 
  FaCheck, FaTimes, FaArrowRight, FaInbox, 
  FaChevronDown, FaChevronUp, FaRegCalendarAlt,
  FaSearch, FaFilter, FaDollarSign, FaSpinner
} from 'react-icons/fa';

// --- Utility Functions ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercent = (current, proposed) => {
  const percent = ((proposed - current) / current) * 100;
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

// --- Sub-Components ---
const StatusBadge = ({ status }) => {
  // Matching the professional palette
  const styles = {
    pending: { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5', icon: null }, // Orange/Amber
    approved: { bg: '#dcfce7', text: '#165d3c', border: '#bbf7d0', icon: <FaCheck size={10} /> }, // Green (Theme match)
    rejected: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', icon: <FaTimes size={10} /> }, // Red
  };
  const config = styles[status] || styles.pending;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      backgroundColor: config.bg,
      color: config.text,
      border: `1px solid ${config.border}`
    }}>
      {config.icon}
      <span>{status}</span>
    </span>
  );
};

// --- Main Component ---
const SalaryApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate API Call
  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests([
        {
          id: 1, employee: 'Sarah Johnson', designation: 'Senior Software Engineer',
          current: 95000, proposed: 110000, date: '2024-12-10', status: 'pending',
          reason: 'Outstanding performance in Q4 2024. Led the successful migration of our core platform to microservices architecture, resulting in 40% improved system performance.'
        },
        {
          id: 2, employee: 'Michael Chen', designation: 'Marketing Manager',
          current: 78000, proposed: 88000, date: '2024-12-08', status: 'pending',
          reason: 'Consistently exceeded quarterly targets and successfully launched two major campaigns that increased customer acquisition by 35%.'
        },
        {
          id: 3, employee: 'Emily Rodriguez', designation: 'Product Designer',
          current: 82000, proposed: 92000, date: '2024-12-05', status: 'pending',
          reason: 'Promoted to lead designer role. Redesigned user interface resulting in 25% increase in user engagement.'
        },
        {
          id: 4, employee: 'David Park', designation: 'Data Analyst',
          current: 70000, proposed: 75000, date: '2024-11-28', status: 'approved', actionDate: '2024-12-01',
          reason: 'Annual merit increase. Solid performer who has contributed valuable insights to multiple projects.'
        },
        {
          id: 5, employee: 'Jessica Williams', designation: 'HR Specialist',
          current: 65000, proposed: 80000, date: '2024-11-25', status: 'rejected', actionDate: '2024-11-27',
          reason: 'Request for market adjustment after receiving competing offer. Current salary is 18% below market rate.'
        }
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (id, newStatus, e) => {
    e.stopPropagation();
    const updated = requests.map(req => 
      req.id === id 
        ? { ...req, status: newStatus, actionDate: new Date().toLocaleDateString() } 
        : req
    );
    setRequests(updated);
    setExpandedId(null);
  };

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter Logic
  const visibleRequests = requests.filter(req => {
    const matchesTab = activeTab === 'pending' ? req.status === 'pending' : req.status !== 'pending';
    const matchesSearch = req.employee.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.designation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column' }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '40px', color: '#165d3c', marginBottom: '16px' }} />
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Loading Requests...</p>
      </div>
    );
  }

  return (
    <div className="approvals-wrapper">
      <style>{`
        /* --- Shared Design System Variables (Matching Managers Component) --- */
        .approvals-wrapper {
          --primary: #165d3c;
          --primary-hover: #145335;
          --bg-light: #f8fafc;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --radius: 12px;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 24px;
          background: var(--bg-light);
          min-height: 100vh;
        }

        /* --- Layout --- */
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--text-dark); margin: 0 0 4px 0; }
        .page-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }

        /* --- Toolbar --- */
        .toolbar {
          background: white; padding: 12px 16px; border-radius: var(--radius);
          border: 1px solid var(--border); margin-bottom: 24px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: var(--shadow-sm);
        }
        .search-group { display: flex; gap: 16px; align-items: center; flex: 1; }
        .search-wrapper { position: relative; width: 300px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-input {
          width: 100%; height: 40px; padding-left: 36px; padding-right: 12px;
          border: 1px solid var(--border); border-radius: 6px; outline: none;
          font-size: 14px; box-sizing: border-box; transition: 0.2s;
        }
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); }

        /* --- Tabs --- */
        .tabs-container { display: flex; gap: 8px; background: #f1f5f9; padding: 4px; border-radius: 8px; }
        .tab-btn {
          padding: 6px 16px; border-radius: 6px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .tab-btn.active { background: white; color: var(--primary); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .tab-btn.inactive { background: transparent; color: var(--text-muted); }
        .tab-btn:hover:not(.active) { color: var(--text-dark); }

        /* --- Table/List Styling --- */
        .data-card {
          background: white; border: 1px solid var(--border); border-radius: 16px;
          overflow: hidden; box-shadow: var(--shadow-sm);
        }
        .grid-header {
          display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 40px;
          padding: 16px 24px; background: #f8fafc; border-bottom: 1px solid var(--border);
          font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
        }
        .grid-row {
          display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 40px;
          padding: 16px 24px; align-items: center; border-bottom: 1px solid var(--border);
          cursor: pointer; transition: background 0.15s;
        }
        .grid-row:hover { background-color: #f8fafc; }
        .grid-row.expanded { background-color: #f0fdf4; } /* Subtle Green tint when open */
        .grid-row:last-child { border-bottom: none; }

        /* --- Expanded Details --- */
        .details-panel {
          padding: 0 24px 24px 24px; background: #f0fdf4; /* Matches expanded row */
          border-bottom: 1px solid var(--border); animation: slideDown 0.2s ease-out;
        }
        .details-inner {
          background: white; border: 1px solid var(--border); border-radius: 8px; padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        
        .comparison-section {
          display: flex; align-items: center; gap: 24px; padding: 16px;
          background: #f8fafc; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 20px;
        }
        .comp-item { display: flex; flex-direction: column; gap: 4px; }
        .comp-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .comp-value { font-size: 18px; font-weight: 700; color: var(--text-dark); }
        .comp-value.highlight { color: var(--primary); }
        
        .reason-text { font-size: 14px; line-height: 1.6; color: var(--text-dark); margin-bottom: 20px; }
        .reason-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; display: block; }

        /* --- Buttons --- */
        .action-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border); }
        .btn { padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .btn-outline { background: white; border-color: var(--border); color: var(--text-dark); }
        .btn-outline:hover { background: #fef2f2; border-color: #ef4444; color: #ef4444; } /* Red hover for reject */
        .btn-solid { background: var(--primary); color: white; }
        .btn-solid:hover { background: var(--primary-hover); }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* --- Mobile --- */
        @media (max-width: 900px) {
          .grid-header { display: none; }
          .grid-row { grid-template-columns: 1fr auto; gap: 12px; }
          .grid-row > div:nth-child(2), .grid-row > div:nth-child(3), .grid-row > div:nth-child(4), .grid-row > div:nth-child(5) { display: none; }
          .comparison-section { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Compensation Review</h2>
          <p className="page-subtitle">Manage salary adjustment requests and approvals.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="stat-pill" style={{ background: 'white', padding: '8px 16px', borderRadius: '50px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600', color: '#165d3c' }}>
            Total Budget Impact: $45,000
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-group">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search employee or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <FaFilter /> Filter
          </button>
        </div>

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </div>

      {/* DATA CARD (TABLE) */}
      <div className="data-card">
        <div className="grid-header">
          <div>Employee</div>
          <div>Designation</div>
          <div>Current</div>
          <div>Proposed</div>
          <div>Change</div>
          <div></div>
        </div>

        {visibleRequests.length > 0 ? (
          visibleRequests.map((req) => (
            <React.Fragment key={req.id}>
              {/* ROW */}
              <div 
                className={`grid-row ${expandedId === req.id ? 'expanded' : ''}`} 
                onClick={() => toggleRow(req.id)}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    {req.employee}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <FaRegCalendarAlt size={10} /> {req.date}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{req.designation}</div>
                <div style={{ fontSize: '14px', color: '#1e293b' }}>{formatCurrency(req.current)}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{formatCurrency(req.proposed)}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#165d3c' }}>
                  {formatPercent(req.current, req.proposed)}
                </div>
                <div style={{ justifySelf: 'end', color: '#94a3b8' }}>
                  {expandedId === req.id ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              {expandedId === req.id && (
                <div className="details-panel">
                  <div className="details-inner">
                    
                    <div className="comparison-section">
                      <div className="comp-item">
                        <span className="comp-label">Current Salary</span>
                        <span className="comp-value">{formatCurrency(req.current)}</span>
                      </div>
                      <div style={{ color: '#94a3b8' }}><FaArrowRight /></div>
                      <div className="comp-item">
                        <span className="comp-label">Proposed Salary</span>
                        <span className="comp-value highlight">{formatCurrency(req.proposed)}</span>
                      </div>
                      <div style={{ width: '1px', height: '40px', background: '#e2e8f0', margin: '0 16px' }}></div>
                      <div className="comp-item">
                        <span className="comp-label">Increase Amount</span>
                        <span className="comp-value" style={{ color: '#165d3c', fontSize: '16px' }}>
                          +{formatCurrency(req.proposed - req.current)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="reason-label">Justification</span>
                      <p className="reason-text">{req.reason}</p>
                    </div>

                    <div className="action-footer">
                      {req.status !== 'pending' ? (
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          <span style={{ fontSize:'13px', color:'#64748b' }}>Action taken on: <strong>{req.actionDate}</strong></span>
                          <StatusBadge status={req.status} />
                        </div>
                      ) : (
                        <>
                          <button className="btn btn-outline" onClick={(e) => handleAction(req.id, 'rejected', e)}>
                            <FaTimes /> Reject Request
                          </button>
                          <button className="btn btn-solid" onClick={(e) => handleAction(req.id, 'approved', e)}>
                            <FaCheck /> Approve Request
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <FaInbox size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#1e293b' }}>No requests found</h3>
            <p style={{ fontSize: '14px', margin: 0 }}>There are no {activeTab} salary requests matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryApprovals;