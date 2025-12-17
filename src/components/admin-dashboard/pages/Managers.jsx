import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers, 
  FaChartLine, FaClock, FaTimes, FaEdit, FaUserTie,
  FaLinkedin, FaSpinner, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const Managers = ({ data }) => {
  // --- State ---
  const [managers, setManagers] = useState(data?.managers || []);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading State
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null); // Added this state

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- Logic ---
  const filteredManagers = managers.filter(manager => 
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentManagers = filteredManagers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);

  // --- Handlers ---
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  
  const handleView = (manager) => { 
    setSelectedManager(manager); 
    setShowViewModal(true); 
  };
  
  const handleClose = () => { 
    setShowViewModal(false); 
    setTimeout(() => setSelectedManager(null), 200); // Clear data after fade out
  };

  // --- Render Loading Screen ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column' }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '40px', color: '#165d3c', marginBottom: '16px' }} />
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="managers-wrapper">
      <style>{`
        /* --- VARIABLES --- */
        .managers-wrapper {
          --primary: #165d3c;
          --primary-hover: #145335;
          --bg-light: #f8fafc;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --radius: 12px;
          --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          
          /* NEW GRADIENT VARIABLE */
          --gradient-accent: linear-gradient(135deg, #bdf59a 0%, #d4f9b8 100%);
          
          font-family: 'Inter', system-ui, sans-serif;
          padding: 24px;
          background: var(--bg-light);
          min-height: 100vh;
        }

        /* --- TOOLBAR --- */
        .toolbar {
          background: white; padding: 12px 16px; border-radius: var(--radius);
          border: 1px solid var(--border); margin-bottom: 24px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: var(--shadow-sm);
        }
        .search-wrapper { position: relative; width: 300px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-input {
          width: 100%; height: 40px; padding-left: 36px; padding-right: 12px;
          border: 1px solid var(--border); border-radius: 6px; outline: none;
          font-size: 14px; box-sizing: border-box; transition: 0.2s;
        }
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); }

        /* --- GRID LAYOUT --- */
        .managers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          min-height: 400px;
        }

        /* --- CARD STYLES --- */
        .manager-card {
          background: white; border: 1px solid var(--border);
          border-radius: 16px; padding: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column;
          animation: fadeIn 0.4s ease-out;
        }
        .manager-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: #cbd5e1; }

        .card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: var(--primary); display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 700; border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .info h3 { margin: 0; font-size: 16px; color: var(--text-dark); font-weight: 700; }
        .info p { margin: 2px 0 0; font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }

        .stats-container { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .stat-box { background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid var(--border); }
        .stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .stat-value { font-size: 15px; font-weight: 600; color: var(--text-dark); }

        .perf-section { margin-bottom: 24px; }
        .perf-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
        .perf-track { height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .perf-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

        .card-actions { margin-top: auto; display: grid; grid-template-columns: 1fr; gap: 12px; }
        
        .btn { padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: 0.2s; text-align: center; }
        
        /* UPDATED VIEW BUTTON STYLE */
        .btn-view { 
          background: var(--gradient-accent); 
          color: var(--primary); /* Dark green text for contrast */
          border: none;
          box-shadow: 0 2px 5px rgba(189, 245, 154, 0.4);
        }
        .btn-view:hover { 
          filter: brightness(0.95); 
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(189, 245, 154, 0.6);
        }

        /* --- PAGINATION STYLES --- */
        .pagination-container {
          margin-top: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .page-info { font-size: 14px; color: var(--text-muted); }
        .pagination-controls { display: flex; gap: 8px; }
        
        .pg-btn {
          min-width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: white; border: 1px solid var(--border);
          border-radius: 8px; color: var(--text-muted);
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; padding: 0 12px;
        }
        .pg-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); background: #f0fdf4; }
        .pg-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
        .pg-btn:disabled { opacity: 0.5; cursor: default; background: #f1f5f9; }

        /* --- MODALS --- */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s; }
        .modal-content { background: white; width: 480px; max-width: 90%; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; }
        .modal-header { padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .modal-title { font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 10px; font-size: 18px; }
        .close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); padding: 4px; display: flex; }
        .modal-body { padding: 24px; }
        .modal-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }

        .profile-img-lg { width: 80px; height: 80px; background: #dcfce7; color: var(--primary); border-radius: 50%; font-size: 32px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .detail-label { color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
        .detail-val { font-weight: 600; color: var(--text-dark); }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* --- TOOLBAR --- */}
      <div className="toolbar">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search manager or store..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          Total Managers: <strong>{filteredManagers.length}</strong>
        </div>
      </div>

      {/* --- GRID (With Data Check) --- */}
      <div className="managers-grid">
        {currentManagers.length > 0 ? (
          currentManagers.map(manager => (
            <div key={manager.id} className="manager-card">
              {/* Header */}
              <div className="card-header">
                <div className="avatar">{manager.name.charAt(0)}</div>
                <div className="info">
                  <h3>{manager.name}</h3>
                  <p><FaMapMarkerAlt /> {manager.store}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="stats-container">
                <div className="stat-box">
                  <div className="stat-label"><FaUsers style={{ color: '#165d3c' }}/> Team Size</div>
                  <div className="stat-value">{manager.team} Members</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label"><FaClock style={{ color: '#eab308' }}/> Experience</div>
                  <div className="stat-value">{manager.experience}</div>
                </div>
              </div>

              {/* Performance */}
              <div className="perf-section">
                <div className="perf-header">
                  <span style={{ color: '#64748b' }}>Performance Score</span>
                  <span style={{ color: manager.performance > 80 ? '#165d3c' : '#eab308' }}>{manager.performance}%</span>
                </div>
                <div className="perf-track">
                  <div 
                    className="perf-fill" 
                    style={{ 
                      width: `${manager.performance}%`,
                      background: manager.performance > 80 ? '#165d3c' : manager.performance > 50 ? '#eab308' : '#ef4444'
                    }}
                  ></div>
                </div>
              </div>

              {/* Actions - UPDATED BUTTON CLASS */}
              <div className="card-actions">
                <button className="btn btn-view" onClick={() => handleView(manager)}>View Details</button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>No Managers Found</h3>
            <p style={{ margin: 0 }}>We couldn't find any managers matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="page-info">
            Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredManagers.length)}</strong> of <strong>{filteredManagers.length}</strong> entries
          </div>
          <div className="pagination-controls">
            <button 
              className="pg-btn" 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i} 
                className={`pg-btn ${currentPage === i + 1 ? 'active' : ''}`} 
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button 
              className="pg-btn" 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL RENDERING (Added this part) --- */}
      {showViewModal && selectedManager && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <FaUserTie style={{ color: '#165d3c' }} /> Manager Details
              </div>
              <button className="close-btn" onClick={handleClose}><FaTimes /></button>
            </div>
            
            <div className="modal-body">
              <div className="profile-img-lg">{selectedManager.name.charAt(0)}</div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px' }}>{selectedManager.name}</h2>
                <span style={{ background: '#dcfce7', color: '#165d3c', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Active Manager</span>
              </div>

              <div className="detail-row">
                <span className="detail-label"><FaMapMarkerAlt /> Store Location</span>
                <span className="detail-val">{selectedManager.store}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FaUsers /> Team Size</span>
                <span className="detail-val">{selectedManager.team} Members</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FaClock /> Experience</span>
                <span className="detail-val">{selectedManager.experience}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><FaChartLine /> Performance</span>
                <span className="detail-val" style={{ color: '#165d3c' }}>{selectedManager.performance}%</span>
              </div>
            </div>
            
            <div className="modal-footer">
               <button className="btn" style={{ background: '#f1f5f9', color: '#475569' }} onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;