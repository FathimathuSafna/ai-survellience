import { useState } from 'react';
import './HRDashboard.css';

// Import pages
import DashboardHome from './pages/DashboardHome';
import LiveAttendance from './pages/LiveAttendance';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceReports from './pages/AttendanceReports';
import ShiftManagement from './pages/ShiftManagement';
import LeaveManagement from './pages/LeaveManagement';
import BonusPoints from './pages/BonusPoints';
import ScratchCards from './pages/ScratchCards';
import ManagerScoring from './pages/ManagerScoring';
import SalaryManagement from './pages/SalaryManagement';
import BreakSettings from './pages/BreakSettings';
import HelpIssues from './pages/HelpIssues';
import UnknownPersons from './pages/UnknownPersons';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Manager from './pages/Manager'

const HRDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: 'fa-th-large', 
      label: 'Dashboard',
      section: 'main'
    },
    { 
      id: 'live-attendance', 
      icon: 'fa-users-cog', 
      label: 'Live Attendance',
      badge: 3,
      section: 'main'
    },
    { 
      id: 'employees', 
      icon: 'fa-id-card', 
      label: 'Employees',
      section: 'main'
    },
    { 
      id: 'manager', 
      icon: 'fa-user-tie',
      label: 'Manager',
      section: 'main'
    },
    { 
      id: 'reports', 
      icon: 'fa-chart-line', 
      label: 'Reports',
      section: 'main'
    },
    { 
      id: 'shifts', 
      icon: 'fa-clock', 
      label: 'Shifts',
      section: 'main'
    },
    { 
      id: 'leaves', 
      icon: 'fa-calendar-alt', 
      label: 'Leaves',
      badge: 2,
      section: 'main'
    },
    { 
      id: 'bonus', 
      icon: 'fa-star', 
      label: 'Bonus Points',
      section: 'rewards'
    },
    { 
      id: 'scratch', 
      icon: 'fa-gift', 
      label: 'Scratch Cards',
      badge: 1,
      section: 'rewards'
    },
    { 
      id: 'manager-scoring', 
      icon: 'fa-trophy', 
      label: 'Manager Scoring',
      section: 'management'
    },
    { 
      id: 'salary', 
      icon: 'fa-money-bill-wave', 
      label: 'Salary',
      section: 'management'
    },
    { 
      id: 'breaks', 
      icon: 'fa-coffee', 
      label: 'Break Schedule',
      section: 'settings'
    },
    { 
      id: 'help', 
      icon: 'fa-question-circle', 
      label: 'Help & Issues',
      badge: 4,
      section: 'settings'
    },
    { 
      id: 'unknown', 
      icon: 'fa-user-secret', 
      label: 'Unknown Persons',
      badge: 7,
      section: 'security'
    },
    { 
      id: 'notifications', 
      icon: 'fa-bell', 
      label: 'Notifications',
      badge: 5,
      section: 'settings'
    },
    { 
      id: 'settings', 
      icon: 'fa-cog', 
      label: 'Settings',
      section: 'settings'
    }
  ];

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <DashboardHome />;
      case 'live-attendance': return <LiveAttendance />;
      case 'employees': return <EmployeeManagement />;
      case 'manager':return<Manager/>;
      case 'reports': return <AttendanceReports />;
      case 'shifts': return <ShiftManagement />;
      case 'leaves': return <LeaveManagement />;
      case 'bonus': return <BonusPoints />;
      case 'scratch': return <ScratchCards />;
      case 'manager-scoring': return <ManagerScoring />;
      case 'salary': return <SalaryManagement />;
      case 'breaks': return <BreakSettings />;
      case 'help': return <HelpIssues />;
      case 'unknown': return <UnknownPersons />;
      case 'notifications': return <Notifications />;
      case 'settings': return <Settings />;
      default: return <DashboardHome />;
    }
  };

  const mainMenuItems = menuItems.filter(item => 
    item.section === 'main' || item.section === 'rewards'
  );
  
  const settingsMenuItems = menuItems.filter(item => 
    item.section === 'management' || item.section === 'settings' || item.section === 'security'
  );

  return (
    <div className="hr-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <i className="fas fa-building"></i>
            </div>
            {!sidebarCollapsed && <span className="logo-text">HR Portal</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main Menu */}
          <div className="nav-section">
            {!sidebarCollapsed && <div className="nav-section-title">MENU</div>}
            {mainMenuItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
                title={sidebarCollapsed ? item.label : ''}
              >
                <i className={`fas ${item.icon}`}></i>
                {!sidebarCollapsed && <span>{item.label}</span>}
                {item.badge && (
                  sidebarCollapsed ? (
                    <span className="badge-dot"></span>
                  ) : (
                    <span className="badge">{item.badge}</span>
                  )
                )}
              </button>
            ))}
          </div>

          {/* Settings Menu */}
          <div className="nav-section">
            {!sidebarCollapsed && <div className="nav-section-title">SETTINGS</div>}
            {settingsMenuItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
                title={sidebarCollapsed ? item.label : ''}
              >
                <i className={`fas ${item.icon}`}></i>
                {!sidebarCollapsed && <span>{item.label}</span>}
                {item.badge && (
                  sidebarCollapsed ? (
                    <span className="badge-dot"></span>
                  ) : (
                    <span className="badge">{item.badge}</span>
                  )
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              <i className="fas fa-user-shield"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <div className="user-name">HR Admin</div>
                <div className="user-role">Human Resources</div>
              </div>
            )}
          </div>
          <button className="logout-btn" title="Logout">
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1>{menuItems.find(item => item.id === activePage)?.label || 'Dashboard'}</h1>
            <div className="breadcrumb">
              <i className="fas fa-home"></i>
              <span>HR Dashboard</span>
              <i className="fas fa-chevron-right"></i>
              <span>{menuItems.find(item => item.id === activePage)?.label}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search..." />
            </div>
            
            <button className="header-btn" title="Calendar">
              <i className="far fa-calendar-alt"></i>
            </button>
            
            <button className="header-btn" title="Notifications">
              <i className="far fa-bell"></i>
              <span className="notification-dot">5</span>
            </button>
            
            <div className="store-selector">
              <i className="fas fa-store"></i>
              <select>
                <option>Main Store</option>
                <option>Branch 1</option>
                <option>Branch 2</option>
                <option>Branch 3</option>
              </select>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;