import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get user type display with appropriate styling
  const getUserTypeInfo = (userType) => {
    const types = {
      admin: { label: 'Administrator', icon: '👑', color: '#ff6b6b' },
      doctor: { label: 'Doctor', icon: '👨‍⚕️', color: '#4facfe' },
      patient: { label: 'Patient', icon: '👤', color: '#48bb78' }
    };
    return types[userType] || { label: 'User', icon: '👤', color: '#718096' };
  };

  // Get page title based on current route
  const getPageTitle = (pathname) => {
    const routes = {
      '/dashboard': 'Dashboard',
      '/patients': 'Patient Management',
      '/doctors': 'Doctor Management',
      '/reports': 'Reports & Analytics',
      '/my-patients': 'My Patients',
      '/appointments': 'Appointments',
      '/my-records': 'Medical Records',
      '/book-appointment': 'Book Appointment'
    };
    return routes[pathname] || 'Hospital CMS';
  };

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const userTypeInfo = getUserTypeInfo(user?.userType);
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className={`main-header ${isLoading ? 'loading' : ''}`}>
      {/* Logo and page title section */}
      <div className="header-left">
        <div className="logo">
          <h2>Hospital CMS</h2>
        </div>
        <div className="page-breadcrumb">
          <span className="breadcrumb-separator">|</span>
          <span className="page-title">{pageTitle}</span>
        </div>
      </div>

      {/* Center section with time/date (optional) */}
      <div className="header-center">
        <div className="datetime-display">
          <div className="time">{formatTime(currentTime)}</div>
          <div className="date">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* User info and actions */}
      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar" style={{ '--user-color': userTypeInfo.color }}>
            <span className="avatar-icon" role="img" aria-label={userTypeInfo.label}>
              {userTypeInfo.icon}
            </span>
            <span className="avatar-text">
              {user?.fullName?.split(' ').map(name => name[0]).join('') || 'U'}
            </span>
          </div>
          
          <div className="user-details">
            <div className="user-greeting">
              <span className="greeting-text">Welcome,</span>
              <span className="user-name">{user?.fullName || 'User'}</span>
            </div>
            <div className="user-role">
              <span className="role-badge" style={{ '--role-color': userTypeInfo.color }}>
                {userTypeInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="header-actions">
          {/* Notifications (optional) */}
          <button className="action-btn notification-btn" title="Notifications">
            <span className="btn-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>

          {/* Settings (optional) */}
          <button className="action-btn settings-btn" title="Settings">
            <span className="btn-icon">⚙️</span>
          </button>

          {/* Logout button */}
          <button 
            onClick={handleLogout} 
            className="logout-button"
            disabled={isLoading}
            title="Logout"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Logging out...
              </>
            ) : (
              <>
                <span className="btn-text">Logout</span>
                <span className="btn-icon"></span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu toggle (if needed) */}
      <div className="mobile-header-toggle">
        <button className="mobile-menu-btn" title="Toggle Menu">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </header>
  );
}

export default Header;