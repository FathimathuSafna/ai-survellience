import React, { useState } from 'react';
import { generateMockData } from './utils/MockData.js';
import './adminDashboard.css';

// 1. Import FontAwesome Icons from react-icons/fa
import { 
  FaTachometerAlt, 
  FaStore, 
  FaVideo, 
  FaUsers, 
  FaUserTie, 
  FaMoneyCheckAlt, 
  FaFileAlt, 
  FaCog, 
  FaShoppingCart, 
  FaBars, 
  FaSearch, 
  FaQuestionCircle, 
  FaBell 
} from 'react-icons/fa';

// Import Components
import DashboardHome from './pages/DashboardHome.jsx';
import StoreManagement from './pages/StoreManagement';
import CameraManagement from './pages/CameraManagement';
import AllEmployees from './pages/Employees';
import AllManagers from './pages/Managers';
import SalaryApprovals from './pages/SalaryApprovals';
import Settings from './pages/Settings';

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [data] = useState(generateMockData());

  // Main Content Renderer
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardHome data={data} />;
      case 'stores': return <StoreManagement data={data} />;
      case 'cameras': return <CameraManagement data={data} />;
      case 'employees': return <AllEmployees data={data} />;
      case 'managers': return <AllManagers data={data} />;
      case 'approvals': return <SalaryApprovals data={data} />;
      // case 'reports': return <SystemReports />;
      case 'settings': return <Settings data={data} />;
      default: return <DashboardHome data={data} />;
    }
  };

  // 2. Updated navItems with Icon Components
  const navItems = [
    { id: 'dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { id: 'stores', icon: <FaStore />, label: 'Store Management' },
    { id: 'cameras', icon: <FaVideo />, label: 'Camera Feeds' },
    { id: 'employees', icon: <FaUsers />, label: 'All Employees' },
    { id: 'managers', icon: <FaUserTie />, label: 'Managers' },
    { id: 'approvals', icon: <FaMoneyCheckAlt />, label: 'Salary Approvals', badge: data.salaryRequests.filter(r => r.status === 'pending').length },
    // { id: 'reports', icon: <FaFileAlt />, label: 'System Reports' },
    { id: 'settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${window.innerWidth <= 1024 && !sidebarCollapsed ? 'visible' : ''}`}>
        <div className="sidebar-header">
          {/* Logo Icon Replaced */}
          <div className="logo-icon"><FaShoppingCart /></div>
          <div className="app-title">Admin Portal</div>
        </div>

        <div className="nav-section">
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(item.id);
                if (window.innerWidth <= 1024) setSidebarCollapsed(true);
              }}
            >
              {/* Icon Rendered Here */}
              <span className="icon-wrapper">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </div>

        <div className="user-profile">
          <div className="user-avatar">JD</div>
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-role">Regional Manager</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Menu Toggle Replaced */}
            <button className="menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <FaBars />
            </button>
            
            {/* Welcome Message */}
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a252f', margin: 0 }}>Welcome to Admin Dashboard</h1>
              <p style={{ fontSize: '13px', color: '#5a6c7d', margin: 0 }}>Overview of store performance</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="search-bar">
              {/* Search Icon Replaced */}
              <span><FaSearch /></span>
              <input type="text" className="search-input" placeholder="Search anything..." />
            </div>

            <div className="top-actions">
              <button className="action-icon-btn">
                {/* Help Icon Replaced */}
                <FaQuestionCircle />
              </button>
              <button className="action-icon-btn">
                {/* Notification Icon Replaced */}
                <FaBell />
                <div className="notification-dot"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Render */}
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;