import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaSearch, FaPlus, FaUserTie, FaClock, FaEdit, FaTrash, FaEye, 
  FaList, FaTh, FaSpinner, FaFilter, FaTimes, 
  FaExclamationCircle, FaMapMarkerAlt, FaEnvelope, FaPhone, 
  FaMoneyBillWave, FaBuilding, FaChartLine
} from 'react-icons/fa';

const ManagerManagement = () => {
  // --- STATE ---
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
  // Modal State
  const [modalType, setModalType] = useState(null); // 'view', 'form', 'delete', null
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [selectedManager, setSelectedManager] = useState(null);

  // Form State
  const initialForm = {
    name: '', branch: '', email: '', phone: '', 
    salary: '', experience: '', joinDate: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState(initialForm);

  // Dropdown Options
  const branches = ['Downtown HQ', 'North Station', 'Westside Mall', 'Eastside Plaza', 'Airport Branch'];

  // API Config
  const API_URL = 'http://localhost:5000/api/managers';

  // --- EFFECTS ---
  useEffect(() => {
    fetchManagers();
  }, []);

  // --- LOGIC ---
  const fetchManagers = async () => {
    setLoading(true);
    try {
      // --- MOCK DATA ---
      setTimeout(() => {
        setManagers([
          { _id: '1', name: 'Alice Johnson', branch: 'Downtown HQ', email: 'alice.j@store.com', phone: '555-0101', salary: '85000', experience: '5 Years', joinDate: '2020-03-15' },
          { _id: '2', name: 'Robert Smith', branch: 'Westside Mall', email: 'bob.smith@store.com', phone: '555-0202', salary: '72000', experience: '3 Years', joinDate: '2021-06-10' },
          { _id: '3', name: 'Charlie Davis', branch: 'North Station', email: 'charlie.d@store.com', phone: '555-0303', salary: '95000', experience: '8 Years', joinDate: '2018-11-05' },
          { _id: '4', name: 'Diana Prince', branch: 'Airport Branch', email: 'diana.p@store.com', phone: '555-0404', salary: '68000', experience: '1 Year', joinDate: '2023-01-20' },
        ]);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setLoading(false);
    }
  };

  const filteredManagers = managers.filter(mgr =>
    mgr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mgr.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mgr.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormMode('add');
    setFormData(initialForm);
    setModalType('form');
  };

  const openEditModal = (mgr) => {
    setFormMode('edit');
    setSelectedManager(mgr);
    setFormData({ ...mgr });
    setModalType('form');
  };

  const openViewModal = (mgr) => {
    setSelectedManager(mgr);
    setModalType('view');
  };

  const openDeleteModal = (mgr) => {
    setSelectedManager(mgr);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedManager(null);
  };

  // --- CRUD ACTIONS ---
  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Save
    setTimeout(() => {
      if (formMode === 'add') {
        const newMgr = { ...formData, _id: Date.now().toString() };
        setManagers([newMgr, ...managers]);
      } else {
        setManagers(managers.map(m => m._id === selectedManager._id ? { ...formData, _id: m._id } : m));
      }
      setLoading(false);
      closeModal();
    }, 600);
  };

  const handleDelete = () => {
    setManagers(managers.filter(m => m._id !== selectedManager._id));
    closeModal();
  };

  // --- STATS CALCULATION ---
  const stats = {
    total: managers.length,
    totalSalary: managers.reduce((acc, curr) => acc + Number(curr.salary), 0),
    avgSalary: managers.length > 0 ? Math.round(managers.reduce((acc, curr) => acc + Number(curr.salary), 0) / managers.length) : 0,
    branches: new Set(managers.map(m => m.branch)).size
  };

  // --- RENDER ---
  return (
    <div className="mgr-wrapper">
      <style>{`
        .mgr-wrapper {
          --primary: #165d3c;
          --primary-hover: #145335;
          --bg-light: #f8fafc;
          --text-dark: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --radius: 12px;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 24px;
          background: var(--bg-light);
          min-height: 100vh;
        }

        /* HEADER & STATS */
        .mgr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .mgr-title { font-size: 24px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 12px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: white; padding: 20px; border-radius: var(--radius); border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .stat-info h4 { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-dark); }
        .stat-info p { margin: 0; font-size: 13px; color: var(--text-muted); }

        /* TOOLBAR */
        .toolbar { background: white; padding: 16px; border-radius: var(--radius); border: 1px solid var(--border); display: flex; gap: 16px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
        .search-wrap { position: relative; flex: 1; min-width: 250px; }
        .search-input { width: 100%; padding: 10px 10px 10px 36px; border: 1px solid var(--border); border-radius: 8px; outline: none; }
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); }
        .view-btn { padding: 8px 12px; border: 1px solid var(--border); background: white; cursor: pointer; border-radius: 6px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .view-btn.active { background: #dcfce7; color: var(--primary); border-color: var(--primary); }

        /* GRID VIEW */
        .grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .mgr-card { background: white; border-radius: 16px; border: 1px solid var(--border); padding: 24px; transition: 0.2s; display: flex; flex-direction: column; animation: fadeIn 0.3s ease; }
        .mgr-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .avatar { width: 40px; height: 40px; background: #f1f5f9; border-radius: 50%; display:flex; align-items:center; justifyContent:center; color: var(--text-muted); font-weight: 700; }

        .card-body h3 { font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: var(--text-dark); }
        .salary-badge { display: inline-flex; align-items: center; gap: 6px; background: #dcfce7; color: #165d3c; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 600; width: fit-content; }
        
        .card-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
        
        /* ICON BUTTONS */
        .icon-btn { 
          width: 32px; height: 32px; border-radius: 8px; 
          border: 1px solid transparent; 
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; transition: 0.2s; background: transparent; 
          color: var(--text-muted); 
          font-size: 14px;
        }
        .icon-btn:hover { background: #f1f5f9; color: var(--text-dark); }
        .icon-btn.view:hover { color: #2563eb; background: #dbeafe; }
        .icon-btn.edit:hover { color: var(--primary); background: #dcfce7; }
        .icon-btn.delete:hover { color: #dc2626; background: #fee2e2; }

        /* TABLE VIEW */
        .table-container { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
        .mgr-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .mgr-table th { background: #f8fafc; padding: 16px; text-align: left; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border); }
        .mgr-table td { padding: 16px; border-bottom: 1px solid var(--border); color: var(--text-dark); }
        .mgr-table tr:last-child td { border-bottom: none; }
        .mgr-table tr:hover { background: #fdfdfd; }
        
        /* MODALS */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal-content { background: white; width: 500px; max-width: 90%; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: zoomIn 0.2s; }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .modal-body { padding: 24px; max-height: 70vh; overflow-y: auto; }
        .modal-footer { padding: 20px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }

        /* FORM ELEMENTS */
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-dark); }
        .form-control { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; }
        .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(22, 93, 60, 0.1); }
        .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-secondary { background: white; border: 1px solid var(--border); color: var(--text-dark); }
        .btn-danger { background: #dc2626; color: white; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* HEADER */}
      <div className="mgr-header">
        <div className="mgr-title">
          <FaUserTie style={{ color: 'var(--primary)' }} /> Manager Management
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><FaUserTie /></div>
          <div className="stat-info"><h4>{stats.total}</h4><p>Total Managers</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#165d3c' }}><FaMoneyBillWave /></div>
          <div className="stat-info"><h4>{formatCurrency(stats.totalSalary)}</h4><p>Total Payroll</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FaChartLine /></div>
          <div className="stat-info"><h4>{formatCurrency(stats.avgSalary)}</h4><p>Avg Salary</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><FaBuilding /></div>
          <div className="stat-info"><h4>{stats.branches}</h4><p>Unique Branches</p></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-wrap">
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            className="search-input" 
            placeholder="Search manager, branch, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
            <FaTh /> 
          </button>
          <button className={`view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
            <FaList /> 
          </button>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FaPlus /> Add Manager
        </button>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <FaSpinner className="spin" style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
          <p>Loading Managers...</p>
        </div>
      ) : filteredManagers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <FaFilter style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '16px' }} />
          <h3>No Managers Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or add a new manager.</p>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid-view">
              {filteredManagers.map(mgr => (
                <div key={mgr._id} className="mgr-card">
                  <div className="card-header">
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div className="avatar">{mgr.name.charAt(0)}</div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{mgr.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mgr.experience}</div>
                        </div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mgr.joinDate}</span>
                  </div>
                  
                  <div className="card-body">
                    <p style={{ margin:'0 0 12px', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <FaMapMarkerAlt style={{ color: 'var(--primary)' }} /> {mgr.branch}
                    </p>
                    
                    <div style={{ marginTop: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ margin:0, fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <FaEnvelope style={{ fontSize: '12px' }} /> {mgr.email}
                        </p>
                        <p style={{ margin:0, fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <FaPhone style={{ fontSize: '12px' }} /> {mgr.phone}
                        </p>
                    </div>

                    <div className="salary-badge">
                       <FaMoneyBillWave style={{ fontSize: '12px' }} /> {formatCurrency(mgr.salary)}
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="icon-btn view" onClick={() => openViewModal(mgr)} title="View"><FaEye /></button>
                    <button className="icon-btn edit" onClick={() => openEditModal(mgr)} title="Edit"><FaEdit /></button>
                    <button className="icon-btn delete" onClick={() => openDeleteModal(mgr)} title="Delete"><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="table-container">
              <table className="mgr-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>Contact</th>
                    <th>Experience</th>
                    <th>Join Date</th>
                    <th>Salary</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.map(mgr => (
                    <tr key={mgr._id}>
                      <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>{mgr.name.charAt(0)}</div>
                              {mgr.name}
                          </div>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <FaMapMarkerAlt style={{ color: '#94a3b8' }} /> {mgr.branch}
                        </span>
                      </td>
                      <td>
                          <div style={{ display:'flex', flexDirection:'column', fontSize:'12px' }}>
                              <span>{mgr.email}</span>
                              <span style={{ color:'#94a3b8' }}>{mgr.phone}</span>
                          </div>
                      </td>
                      <td>{mgr.experience}</td>
                      <td>{mgr.joinDate}</td>
                      <td>
                          <span style={{ fontWeight: 600, color: '#165d3c' }}>{formatCurrency(mgr.salary)}</span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="icon-btn view" onClick={() => openViewModal(mgr)} title="View"><FaEye /></button>
                        <button className="icon-btn edit" onClick={() => openEditModal(mgr)} title="Edit"><FaEdit /></button>
                        <button className="icon-btn delete" onClick={() => openDeleteModal(mgr)} title="Delete"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* --- MODALS --- */}

      {/* FORM MODAL (ADD/EDIT) */}
      {modalType === 'form' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{formMode === 'add' ? 'Add New Manager' : 'Edit Manager'}</h3>
              <button onClick={closeModal} style={{ border:'none', background:'none', cursor:'pointer' }}><FaTimes /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input required className="form-control" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. John Doe" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Branch</label>
                    <select className="form-control" name="branch" value={formData.branch} onChange={handleInputChange}>
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience</label>
                    <input className="form-control" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 5 Years" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Join Date</label>
                    <input type="date" className="form-control" name="joinDate" value={formData.joinDate} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Salary ($)</label>
                    <input type="number" className="form-control" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="e.g. 75000" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Manager</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modalType === 'view' && selectedManager && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Manager Profile</h3>
              <button onClick={closeModal} style={{ border:'none', background:'none', cursor:'pointer' }}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign:'center', marginBottom: '20px' }}>
                  <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '24px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 auto 12px' }}>
                      {selectedManager.name.charAt(0)}
                  </div>
                  <h2 style={{ fontSize: '20px', color: 'var(--text-dark)', margin: '0 0 4px 0' }}>{selectedManager.name}</h2>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedManager.experience} Experience</span>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaMapMarkerAlt style={{ color: 'var(--primary)' }} /> {selectedManager.branch}
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaEnvelope style={{ color: 'var(--text-muted)' }} /> {selectedManager.email}
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaPhone style={{ color: 'var(--text-muted)' }} /> {selectedManager.phone}
                </p>
                 <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaClock style={{ color: 'var(--text-muted)' }} /> Joined: {selectedManager.joinDate}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaMoneyBillWave style={{ color: '#165d3c' }} /> <strong>{formatCurrency(selectedManager.salary)}</strong>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modalType === 'delete' && selectedManager && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '40px 24px 24px' }}>
              <div style={{ width: '60px', height: '60px', background: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
                <FaExclamationCircle />
              </div>
              <h3 style={{ margin: '0 0 8px' }}>Delete Manager?</h3>
              <p style={{ margin: 0, color: '#64748b' }}>Are you sure you want to delete <strong>{selectedManager.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerManagement;