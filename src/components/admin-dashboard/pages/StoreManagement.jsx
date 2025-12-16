import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaMapMarkerAlt, FaUsers, FaUserTie, FaEdit, FaEye, FaTimes, 
  FaChevronLeft, FaChevronRight, FaPhone, FaEnvelope, FaStore, 
  FaSpinner, FaCheckCircle, FaCalendarAlt, FaGlobe
} from 'react-icons/fa';

const StoreManagement = ({ data }) => {
  // --- State ---
  const [stores, setStores] = useState(data.stores);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true); 
  
  // Modal State
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const itemsPerPage = 6;

  // --- Simulate Loading ---
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStores = stores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(stores.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  // --- Handlers ---
  const handleView = (store) => {
    setSelectedStore(store);
    setShowViewModal(true);
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedStore(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setShowViewModal(false);
    setSelectedStore(null);
  };

  // --- Loading Spinner ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '40px', color: '#165d3c' }} />
      </div>
    );
  }

  return (
    <div className="store-management-wrapper">
      <style>{`
        /* --- GLOBAL LAYOUT --- */
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 16px; }
        .stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-bottom: 32px; animation: fadeIn 0.4s ease-out; }

        /* --- BUTTONS --- */
        .btn-primary { background: #165d3c; color: white; padding: 12px 24px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(22, 93, 60, 0.2); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(22, 93, 60, 0.3); }
        .btn-secondary { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { background: #f8fafc; color: #1a252f; border-color: #cbd5e1; }

        .action-btn { flex: 1; padding: 10px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .btn-view { background: #e0f2fe; color: #0284c7; }
        .btn-view:hover { background: #bae6fd; }
        .btn-edit { background: #f1f5f9; color: #64748b; }
        .btn-edit:hover { background: #e2e8f0; color: #1a252f; }

        /* --- CARDS --- */
        .store-card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #f0f4f0; transition: all 0.3s ease; position: relative; overflow: hidden; }
        .store-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(22, 93, 60, 0.1); border-color: #bdf59a; }
        .store-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; }
        .store-name { font-size: 18px; font-weight: 700; color: #1a252f; margin-bottom: 4px; }
        .store-location { font-size: 14px; color: #64748b; display: flex; align-items: center; gap: 6px; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.closed { background: #fee2e2; color: #991b1b; }
        .status-badge.maintenance { background: #fef3c7; color: #92400e; }
        .store-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; padding-top: 20px; border-top: 1px solid #f0f4f0; }
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-val { font-size: 18px; font-weight: 700; color: #2d3748; }
        .stat-lbl { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px; }
        .card-actions { display: flex; gap: 10px; margin-top: 20px; }

        /* --- PAGINATION --- */
        .pagination-container { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 20px; padding-bottom: 20px;}
        .page-btn { min-width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .page-btn.active { background: #165d3c; color: white; border-color: #165d3c; }

        /* --- MODAL STRUCTURE --- */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s; }
        .modal-content { background: white; border-radius: 20px; width: 550px; max-width: 90%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .modal-header { padding: 24px; border-bottom: 1px solid #f0f4f0; display: flex; justify-content: space-between; align-items: center; background: white; border-radius: 20px 20px 0 0; }
        .modal-title { font-size: 20px; font-weight: 700; color: #1a252f; display: flex; align-items: center; gap: 12px; }
        .close-btn { background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 8px; transition: 0.2s; }
        .close-btn:hover { color: #ef4444; background: #fee2e2; border-radius: 8px; }
        .modal-body { padding: 32px; overflow-y: auto; }
        .modal-footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 20px 20px; display: flex; justify-content: flex-end; gap: 12px; }

        /* --- PROFESSIONAL VIEW STYLES --- */
        .view-section { margin-bottom: 32px; }
        .view-section:last-child { margin-bottom: 0; }
        .section-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; display: block; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        
        .info-group { display: flex; flex-direction: column; gap: 6px; }
        .info-label { font-size: 13px; font-weight: 500; color: #64748b; }
        .info-value { font-size: 15px; font-weight: 600; color: #1a252f; display: flex; align-items: center; gap: 8px; }
        
        /* Stats Box inside View */
        .stats-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }
        .stat-highlight { text-align: center; }
        .stat-highlight h4 { font-size: 28px; font-weight: 700; color: #165d3c; margin: 0; }
        .stat-highlight span { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }

        /* Form Inputs (Kept Standard) */
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: #1a252f; margin-bottom: 8px; }
        .form-input { width: 100%; padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; box-sizing: border-box; }
        .form-input:focus { outline: none; border-color: #165d3c; box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); }
        .input-icon-wrapper { position: relative; }
        .input-icon { position: absolute; left: 12px; top: 14px; color: #94a3b8; }
        .form-input.has-icon { padding-left: 36px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a252f', margin: 0 }}>Store Management</h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Manage store locations, details, and status</p>
        </div>
        <button className="btn-primary" onClick={handleAddNew}>
          <FaPlus /> Add New Store
        </button>
      </div>

      {/* Grid */}
      <div className="stores-grid">
        {currentStores.map(store => (
          <div key={store.id} className="store-card">
            <div className="store-header">
              <div>
                <div className="store-name">{store.name}</div>
                <div className="store-location"><FaMapMarkerAlt style={{ color: '#64748b' }} /> {store.location}</div>
              </div>
              <span className={`status-badge ${store.status}`}>{store.status}</span>
            </div>
            <div className="store-stats">
              <div className="stat-item">
                <span className="stat-lbl"><FaUsers style={{ color: '#64748b' }}/> Employees</span>
                <span className="stat-val">{store.employees}</span>
              </div>
              <div className="stat-item">
                <span className="stat-lbl"><FaUserTie style={{ color: '#64748b' }}/> Managers</span>
                <span className="stat-val">{store.managers}</span>
              </div>
            </div>
            <div className="card-actions">
              <button className="action-btn btn-view" onClick={() => handleView(store)}>
                <FaEye /> View
              </button>
              <button className="action-btn btn-edit" onClick={() => handleEdit(store)}>
                <FaEdit /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><FaChevronLeft /></button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
        ))}
        <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><FaChevronRight /></button>
      </div>

      {/* --- PROFESSIONAL VIEW MODAL --- */}
      {showViewModal && selectedStore && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div className="modal-title">
                <FaStore style={{ color: '#165d3c' }} />
                <span>Store Details</span>
              </div>
              <button className="close-btn" onClick={handleClose}><FaTimes /></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Section 1: General Info */}
              <div className="view-section">
                <span className="section-label">General Information</span>
                <div className="info-grid">
                  <div className="info-group">
                    <span className="info-label">Store Name</span>
                    <span className="info-value">{selectedStore.name}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Status</span>
                    <span className="info-value">
                      <span className={`status-badge ${selectedStore.status}`}>{selectedStore.status}</span>
                    </span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Location</span>
                    <span className="info-value"><FaMapMarkerAlt style={{ color: '#94a3b8' }} /> {selectedStore.location}</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Date Opened</span>
                    <span className="info-value"><FaCalendarAlt style={{ color: '#94a3b8' }} /> Jan 12, 2023</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Staffing (KPI Style) */}
              <div className="view-section">
                <span className="section-label">Staffing Overview</span>
                <div className="stats-box">
                  <div className="stat-highlight">
                    <h4>{selectedStore.employees}</h4>
                    <span>Total Employees</span>
                  </div>
                  <div className="stat-highlight">
                    <h4>{selectedStore.managers}</h4>
                    <span>Active Managers</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact */}
              <div className="view-section">
                <span className="section-label">Contact Details</span>
                <div className="info-grid">
                  <div className="info-group">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value"><FaPhone style={{ color: '#94a3b8', fontSize: '12px' }} /> +1 (555) 123-4567</span>
                  </div>
                  <div className="info-group">
                    <span className="info-label">Email Address</span>
                    <span className="info-value"><FaEnvelope style={{ color: '#94a3b8', fontSize: '12px' }} /> store@{selectedStore.name.toLowerCase().replace(/\s/g, '')}.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
               <button className="btn-secondary" onClick={handleClose}>Close</button>
               <button className="btn-primary" onClick={() => { handleClose(); handleEdit(selectedStore); }}>
                 <FaEdit /> Edit Details
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT FORM MODAL --- */}
      {showForm && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selectedStore ? 'Edit Store' : 'Add New Store'}</span>
              <button className="close-btn" onClick={handleClose}><FaTimes /></button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <div className="input-icon-wrapper">
                  <input type="text" className="form-input has-icon" defaultValue={selectedStore?.name} placeholder="e.g. Downtown Branch" />
                  <FaStore className="input-icon" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <div className="input-icon-wrapper">
                  <input type="text" className="form-input has-icon" defaultValue={selectedStore?.location} placeholder="City, State" />
                  <FaMapMarkerAlt className="input-icon" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Employees</label>
                  <div className="input-icon-wrapper">
                    <input type="number" className="form-input has-icon" defaultValue={selectedStore?.employees} placeholder="0" />
                    <FaUsers className="input-icon" />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Managers</label>
                  <div className="input-icon-wrapper">
                    <input type="number" className="form-input has-icon" defaultValue={selectedStore?.managers} placeholder="0" />
                    <FaUserTie className="input-icon" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="input-icon-wrapper">
                  <select className="form-input has-icon" defaultValue={selectedStore?.status || 'active'}>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                  <FaCheckCircle className="input-icon" />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleClose}>Cancel</button>
              <button className="btn-primary" onClick={handleClose}>
                {selectedStore ? 'Update Store' : 'Create Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;