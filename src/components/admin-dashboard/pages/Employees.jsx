import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, 
  FaSpinner, FaUser, FaBriefcase, FaMapMarkerAlt, FaDollarSign, FaChartLine, 
  FaTimes, FaEnvelope, FaPhone, FaCheckCircle
} from 'react-icons/fa';

const Employees = ({ data }) => {
  // --- State ---
  const [employees, setEmployees] = useState(data.employees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStore, setFilterStore] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  // Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // --- Filtering Logic ---
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = filterStore === 'all' || emp.store === filterStore;
    return matchesSearch && matchesStore;
  });

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  // --- Handlers ---
  const handleView = (emp) => {
    setSelectedEmployee(emp);
    setShowViewModal(true);
  };

  const handleEdit = (emp) => {
    setSelectedEmployee(emp);
    setShowEditModal(true);
  };

  const handleClose = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '40px', color: '#165d3c' }} />
      </div>
    );
  }

  return (
    <div className="employees-wrapper">
      <style>{`
        /* --- GLOBAL & UTILS --- */
        .employees-wrapper { font-family: sans-serif; box-sizing: border-box; }
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: 24px; font-weight: 700; color: #1a252f; margin: 0 0 4px 0; }
        .page-subtitle { font-size: 14px; color: #64748b; margin: 0; }
        
        /* --- FILTERS BAR --- */
        .filters-bar { 
          background: white; 
          padding: 16px; 
          border-radius: 12px; 
          margin-bottom: 24px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.04); 
          border: 1px solid #e2e8f0; 
          display: flex; 
          gap: 16px; 
          flex-wrap: wrap; 
          align-items: center; 
        }
        
        .search-group { flex: 1; position: relative; min-width: 250px; }
        .select-group { position: relative; width: 200px; }

        /* Shared Input Styles */
        .filter-input, .filter-select { 
          width: 100%; 
          height: 42px; 
          padding: 0 16px 0 40px; 
          border: 1px solid #cbd5e1; 
          border-radius: 8px; 
          font-size: 14px; 
          outline: none; 
          transition: 0.2s; 
          box-sizing: border-box;
        }
        
        .filter-input:focus, .filter-select:focus { 
          border-color: #165d3c; 
          box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); 
        }

        .filter-select { background: white; cursor: pointer; appearance: none; }

        /* ABSOLUTE CENTER ICONS */
        .search-icon, .filter-icon { 
          position: absolute; 
          left: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: #94a3b8; 
          pointer-events: none;
        }

        /* --- TABLE STYLES --- */
        .table-container { 
          background: white; 
          border-radius: 16px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
          border: 1px solid #e2e8f0; 
          overflow-x: auto; 
          animation: fadeIn 0.3s ease-out; 
        }
        .data-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .data-table thead { background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
        .data-table th { padding: 16px; text-align: left; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
        .data-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; vertical-align: middle; }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover { background: #f8fafc; }

        /* Employee Cell Info */
        .emp-cell { display: flex; align-items: center; gap: 12px; }
        .emp-avatar { width: 32px; height: 32px; border-radius: 50%; background: #dcfce7; color: #165d3c; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .emp-name { font-weight: 600; color: #1a252f; }
        
        /* Performance Bar */
        .perf-wrapper { display: flex; align-items: center; gap: 8px; }
        .perf-bar-bg { width: 80px; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
        .perf-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
        .perf-text { font-size: 12px; font-weight: 600; width: 30px; text-align: right; }

        /* Status Badges */
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.leave { background: #fef3c7; color: #92400e; }
        .status-badge.terminated { background: #fee2e2; color: #991b1b; }

        /* Actions */
        .action-cell { display: flex; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; font-size: 14px; background: transparent; }
        .btn-view { color: #0ea5e9; background: #e0f2fe; }
        .btn-view:hover { background: #bae6fd; border-color: #7dd3fc; }
        .btn-edit { color: #64748b; background: #f1f5f9; }
        .btn-edit:hover { background: #e2e8f0; color: #1a252f; border-color: #cbd5e1; }
        .btn-del { color: #ef4444; background: #fee2e2; }
        .btn-del:hover { background: #fecaca; border-color: #fca5a5; }

        /* --- PAGINATION --- */
        .pagination-container { 
          display: flex; 
          justify-content: flex-end; 
          align-items: center; 
          gap: 6px; 
          margin-top: 24px; 
          padding-bottom: 24px;
        }
        .page-btn { 
          min-width: 36px; 
          height: 36px; 
          border-radius: 8px; 
          border: 1px solid #e2e8f0; 
          background: white; 
          color: #64748b; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
          transition: all 0.2s; 
          font-size: 14px; 
          font-weight: 500;
          user-select: none;
        }
        .page-btn:hover:not(:disabled) { border-color: #165d3c; color: #165d3c; background: #f0fdf4; }
        .page-btn.active { background: #165d3c; color: white; border-color: #165d3c; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* --- MODALS --- */
        .modal-overlay { 
          position: fixed; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(0, 0, 0, 0.6); 
          backdrop-filter: blur(4px); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 9999; 
          animation: fadeIn 0.2s; 
        }
        .modal-content { 
          background: white; 
          border-radius: 16px; 
          width: 500px; 
          max-width: 90%; 
          max-height: 90vh; 
          display: flex; 
          flex-direction: column; 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
        }
        .modal-header { 
          padding: 20px 24px; 
          border-bottom: 1px solid #f1f5f9; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          background: white; 
          border-radius: 16px 16px 0 0; 
        }
        .modal-title { font-size: 18px; font-weight: 700; color: #1a252f; display: flex; align-items: center; gap: 10px; }
        .close-btn { 
          background: transparent; 
          border: none; 
          color: #94a3b8; 
          font-size: 18px; 
          cursor: pointer; 
          padding: 8px; 
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: 0.2s; 
        }
        .close-btn:hover { color: #ef4444; background: #fee2e2; }
        .modal-body { padding: 24px; overflow-y: auto; }
        .modal-footer { 
          padding: 16px 24px; 
          background: #f8fafc; 
          border-top: 1px solid #e2e8f0; 
          border-radius: 0 0 16px 16px; 
          display: flex; 
          justify-content: flex-end; 
          gap: 12px; 
        }

        /* Profile View Styles */
        .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
        .profile-avatar-lg { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #165d3c 0%, #bdf59a 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; box-shadow: 0 4px 12px rgba(22, 93, 60, 0.2); }
        .profile-info h3 { margin: 0; font-size: 18px; color: #1a252f; }
        .profile-info p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
        
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .info-item label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; }
        .info-item div { font-size: 14px; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 8px; word-break: break-all; }

        /* Form Styles */
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #1a252f; margin-bottom: 6px; }
        .input-wrapper { position: relative; }
        .form-input { 
          width: 100%; 
          /* Updated padding for better spacing (was 66px) */
          padding: 10px 10px 10px 40px; 
          border: 1.5px solid #e2e8f0; 
          border-radius: 8px; 
          font-size: 14px; 
          transition: 0.2s; 
          box-sizing: border-box; 
          height: 42px; 
        }
        .form-input:focus { border-color: #165d3c; box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); outline: none; }
        .input-icon { 
          position: absolute; 
          left: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: #94a3b8; 
          font-size: 14px; 
          pointer-events: none;
        }
        
        .btn-primary { background: #165d3c; color: white; padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: #145335; }
        .btn-secondary { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-secondary:hover { background: #f8fafc; color: #1a252f; border-color: #cbd5e1; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">All Employees</h2>
        <p className="page-subtitle">Manage employee roster, performance, and details.</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-group">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Search by name or role..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="select-group">
          <FaFilter className="filter-icon" />
          <select className="filter-select" value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
            <option value="all">All Locations</option>
            {data.stores.map(store => (<option key={store.id} value={store.name}>{store.name}</option>))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role</th>
              <th>Location</th>
              <th>Salary</th>
              <th>Performance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.length > 0 ? (
              currentEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="emp-cell">
                      <div className="emp-avatar">{emp.name.charAt(0)}</div>
                      <span className="emp-name">{emp.name}</span>
                    </div>
                  </td>
                  <td>{emp.role}</td>
                  <td>{emp.store}</td>
                  <td>${emp.salary.toLocaleString()}</td>
                  <td>
                    <div className="perf-wrapper">
                      <div className="perf-bar-bg">
                        <div 
                          className="perf-fill" 
                          style={{ 
                            width: `${emp.performance}%`, 
                            background: emp.performance > 80 ? '#165d3c' : emp.performance > 50 ? '#eab308' : '#ef4444' 
                          }}
                        ></div>
                      </div>
                      <span className="perf-text" style={{ color: emp.performance > 80 ? '#165d3c' : '#64748b' }}>{emp.performance}%</span>
                    </div>
                  </td>
                  <td><span className={`status-badge ${emp.status}`}>{emp.status}</span></td>
                  <td>
                    <div className="action-cell">
                      <button className="icon-btn btn-view" onClick={() => handleView(emp)} title="View Details">
                        <FaEye />
                      </button>
                      <button className="icon-btn btn-edit" onClick={() => handleEdit(emp)} title="Edit Employee">
                        <FaEdit />
                      </button>
                      <button className="icon-btn btn-del" title="Remove Employee">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No employees found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <FaChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>
              {i + 1}
            </button>
          ))}
          <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* --- VIEW MODAL --- */}
      {showViewModal && selectedEmployee && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title"><FaUser style={{ color: '#165d3c' }}/> Employee Profile</span>
              <button className="close-btn" onClick={handleClose}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="profile-header">
                <div className="profile-avatar-lg">{selectedEmployee.name.charAt(0)}</div>
                <div className="profile-info">
                  <h3>{selectedEmployee.name}</h3>
                  <p>{selectedEmployee.role}</p>
                  <span className={`status-badge ${selectedEmployee.status}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                    {selectedEmployee.status}
                  </span>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Store Location</label>
                  <div><FaMapMarkerAlt style={{ color: '#64748b' }}/> {selectedEmployee.store}</div>
                </div>
                <div className="info-item">
                  <label>Annual Salary</label>
                  <div><FaDollarSign style={{ color: '#64748b' }}/> ${selectedEmployee.salary.toLocaleString()}</div>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <div><FaEnvelope style={{ color: '#64748b' }}/> {selectedEmployee.name.toLowerCase().replace(' ', '.')}@company.com</div>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <div><FaPhone style={{ color: '#64748b' }}/> +1 (555) 000-0000</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="info-item">
                  <label style={{ marginBottom: '8px' }}>Performance Rating</label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#165d3c' }}>{selectedEmployee.performance}/100</span>
                    <FaChartLine style={{ color: '#165d3c', fontSize: '20px' }} />
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedEmployee.performance}%`, height: '100%', background: '#165d3c' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleClose}>Close</button>
              <button className="btn-primary" onClick={() => { handleClose(); handleEdit(selectedEmployee); }}>Edit Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {/* Added gap here for Modal Title Icon spacing */}
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaEdit style={{ color: '#165d3c' }}/> Edit Employee
              </span>
              <button className="close-btn" onClick={handleClose}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                
                  <input type="text" className="form-input" defaultValue={selectedEmployee.name} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <div className="input-wrapper">
                    <input type="text" className="form-input" defaultValue={selectedEmployee.role} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <div className="input-wrapper">
                    <select className="form-input" defaultValue={selectedEmployee.store} style={{ appearance: 'none' }}>
                      {data.stores.map(store => <option key={store.id}>{store.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Salary ($)</label>
                  <div className="input-wrapper">
                    <input type="number" className="form-input" defaultValue={selectedEmployee.salary} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div className="input-wrapper">
                    <select className="form-input" defaultValue={selectedEmployee.status} style={{ appearance: 'none' }}>
                      <option value="active">Active</option>
                      <option value="leave">On Leave</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleClose}>Cancel</button>
              <button className="btn-primary" onClick={handleClose}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;