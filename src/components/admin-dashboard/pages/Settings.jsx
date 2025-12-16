import React, { useState } from 'react';
import { 
  FaCog, FaUsers, FaBell, FaSave, FaShieldAlt, FaEnvelope, FaMoneyBillWave 
} from 'react-icons/fa';

const Settings = ({ data }) => {
  // --- State for Interactivity ---
  const [notifications, setNotifications] = useState({
    email: true,
    salary: true,
    performance: false
  });

  const [config, setConfig] = useState({
    companyName: 'Retail Corp',
    timezone: 'UTC-5',
    defaultStore: 'All Stores'
  });

  // --- Handlers ---
  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="settings-wrapper">
      <style>{`
        * { box-sizing: border-box; }
        
        .settings-wrapper {
          /* --- Color System (Clean White/Gray with Green Accents) --- */
          --primary: #16a34a;        /* Green 600 */
          --primary-hover: #15803d;  /* Green 700 */
          
          --bg-light: #f8fafc;       /* Neutral Slate-50 (Was Green Tint) */
          --bg-card: #ffffff;
          
          --text-dark: #1e293b;      /* Slate-800 */
          --text-muted: #64748b;     /* Slate-500 */
          
          --border: #e2e8f0;         /* Neutral Gray Border (Was Green Border) */
          --radius: 12px;
          --shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Neutral Shadow (Was Green Shadow) */
          
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: var(--bg-light);
          min-height: 100vh;
        }

        /* --- Header --- */
        .page-header { margin-bottom: 24px; }
        .page-title { 
          font-size: 26px; font-weight: 700; color: var(--text-dark); margin: 0 0 6px 0; letter-spacing: -0.5px;
        }
        .page-subtitle { 
          font-size: 15px; color: var(--text-muted); margin: 0; 
        }

        /* --- Grid Layout --- */
        .settings-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        /* --- Cards --- */
        .card {
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
          background: #ffffff;
        }
        .card-title {
          font-size: 16px; font-weight: 600; color: var(--text-dark); margin: 0;
        }
        .card-icon { color: var(--primary); font-size: 18px; }
        .card-body { padding: 24px; }

        /* --- Table Styling --- */
        .table-container { overflow-x: auto; }
        .role-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 500px; }
        
        .role-table th {
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          background: #f8fafc;
          border-bottom: 1px solid var(--border);
        }
        
        .role-table td {
          padding: 16px;
          font-size: 14px;
          color: var(--text-dark);
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        
        /* Actions Alignment */
        .role-table th:last-child,
        .role-table td:last-child {
          text-align: right;
        }
        
        .role-table tr:last-child td { border-bottom: none; }
        
        /* --- Manage Button (Green Accent) --- */
        .btn-manage {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--primary);      
          background: white;
          border: 1px solid var(--primary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-manage:hover {
          background: var(--primary);
          color: white;
          box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
        }

        /* --- Badges --- */
        .role-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        .badge-full { background: #dcfce7; color: #15803d; }
        .badge-high { background: #ccfbf1; color: #0f766e; }
        .badge-medium { background: #f1f5f9; color: #475569; }
        .badge-basic { background: white; color: var(--text-muted); border: 1px solid #e2e8f0; }

        /* --- Toggles & Forms --- */
        .setting-item { 
          display: flex; justify-content: space-between; align-items: center; 
          padding: 16px 0; border-bottom: 1px solid var(--border);
        }
        .setting-item:last-child { border-bottom: none; }
        
        .toggle-switch { 
          position: relative; width: 48px; height: 26px; 
          background: #cbd5e1; border-radius: 13px; cursor: pointer; transition: 0.3s; 
        }
        .toggle-switch.active { background: var(--primary); }
        .toggle-knob { 
          position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; 
          background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
        }
        .toggle-switch.active .toggle-knob { left: 25px; }

        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }
        .form-input {
          width: 100%; padding: 10px 14px; border-radius: 8px; 
          border: 1px solid #e2e8f0; font-size: 14px; color: var(--text-dark); transition: 0.2s;
        }
        .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }

        .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 14px;
          cursor: pointer; transition: 0.2s; border: none;
        }
        .btn-primary { background: var(--primary); color: white; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2); }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
        
        .btn-outline {
          background: white; border: 1px solid #e2e8f0; color: var(--text-dark);
          padding: 6px 12px; font-size: 13px; width: 100%; justify-content: flex-start;
        }
        .btn-outline:hover { background: #f8fafc; border-color: var(--primary); color: var(--primary); }

        @media (max-width: 968px) {
          .settings-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HEADER */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage system configuration, user roles, and preferences</p>
      </div>

      <div className="settings-grid">
        
        {/* LEFT COLUMN */}
        <div className="left-column">
          
          {/* USER ROLES SECTION */}
          <div className="card">
            <div className="card-header">
              <FaUsers className="card-icon" />
              <h3 className="card-title">User Roles & Permissions</h3>
            </div>
            <div className="table-container">
              <table className="role-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Access Level</th>
                    <th>Users</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Administrator</strong></td>
                    <td><span className="role-badge badge-full">Full Access</span></td>
                    <td>3</td>
                    <td><button className="btn-manage">Manage</button></td>
                  </tr>
                  <tr>
                    <td><strong>HR Manager</strong></td>
                    <td><span className="role-badge badge-high">High Access</span></td>
                    <td>5</td>
                    <td><button className="btn-manage">Manage</button></td>
                  </tr>
                  <tr>
                    <td><strong>Store Manager</strong></td>
                    <td><span className="role-badge badge-medium">Medium Access</span></td>
                    <td>12</td>
                    <td><button className="btn-manage">Manage</button></td>
                  </tr>
                  <tr>
                    <td><strong>Employee</strong></td>
                    <td><span className="role-badge badge-basic">Basic Access</span></td>
                    <td>156</td>
                    <td><button className="btn-manage">Manage</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SYSTEM CONFIGURATION */}
          <div className="card">
            <div className="card-header">
              <FaCog className="card-icon" />
              <h3 className="card-title">System Configuration</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input 
                  type="text" 
                  name="companyName"
                  className="form-input" 
                  value={config.companyName}
                  onChange={handleConfigChange}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Time Zone</label>
                  <select 
                    className="form-input" 
                    name="timezone"
                    value={config.timezone} 
                    onChange={handleConfigChange}
                  >
                    <option value="UTC-5">UTC-5 (Eastern Time)</option>
                    <option value="UTC-6">UTC-6 (Central Time)</option>
                    <option value="UTC-8">UTC-8 (Pacific Time)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Default Store</label>
                  <select 
                    className="form-input"
                    name="defaultStore"
                    value={config.defaultStore}
                    onChange={handleConfigChange}
                  >
                    <option value="All Stores">All Stores</option>
                    {data?.stores?.map(store => (
                      <option key={store.id} value={store.name}>{store.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '10px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary">
                  <FaSave /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <div className="card">
            <div className="card-header">
              <FaBell className="card-icon" />
              <h3 className="card-title">Notifications</h3>
            </div>
            <div style={{ padding: '0 24px' }}>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Alerts</h4>
                  <p>Security & updates</p>
                </div>
                <div 
                  className={`toggle-switch ${notifications.email ? 'active' : ''}`}
                  onClick={() => toggleNotification('email')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Salary Requests</h4>
                  <p>Approval notifications</p>
                </div>
                <div 
                  className={`toggle-switch ${notifications.salary ? 'active' : ''}`}
                  onClick={() => toggleNotification('salary')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Reports</h4>
                  <p>Weekly summaries</p>
                </div>
                <div 
                  className={`toggle-switch ${notifications.performance ? 'active' : ''}`}
                  onClick={() => toggleNotification('performance')}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>
            
            <div className="card-body" style={{ background: '#f8fafc', borderTop: '1px solid var(--border)', padding: '20px' }}>
               <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                 Quick Actions
               </div>
               <button className="btn btn-outline" style={{ marginBottom: '8px' }}>
                 <FaShieldAlt style={{ color: '#64748b' }} /> Change Password
               </button>
               <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fff' }}>
                 <FaCog style={{ color: '#dc2626' }} /> Reset System
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;