import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, [location]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsLoggedIn(true);
        setUserName(payload.name || 'User');
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserName('');
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon">🏥</div>
          <span className="brand-text">MedVault</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop-menu">
          {isLoggedIn ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActivePath('/dashboard') ? 'active' : ''}`}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              <Link 
                to="/upload" 
                className={`nav-link ${isActivePath('/upload') ? 'active' : ''}`}
              >
                <span className="nav-icon">📁</span>
                Upload Records
              </Link>
              <Link 
                to="/appointments" 
                className={`nav-link ${isActivePath('/appointments') ? 'active' : ''}`}
              >
                <span className="nav-icon">📅</span>
                Appointments
              </Link>
              <div className="user-section">
                <span className="welcome-text">Hi, {userName}!</span>
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  <span className="nav-icon">🚪</span>
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link login-link ${isActivePath('/login') ? 'active' : ''}`}
              >
                <span className="nav-icon">🔐</span>
                Log In
              </Link>
              <Link 
                to="/register" 
                className={`nav-link register-link ${isActivePath('/register') ? 'active' : ''}`}
              >
                <span className="nav-icon">👤</span>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {isLoggedIn ? (
              <>
                <div className="mobile-user-info">
                  <div className="user-avatar">👤</div>
                  <span className="user-name">Welcome, {userName}!</span>
                </div>
                <Link 
                  to="/dashboard" 
                  className={`mobile-nav-link ${isActivePath('/dashboard') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">📊</span>
                  Dashboard
                </Link>
                <Link 
                  to="/upload" 
                  className={`mobile-nav-link ${isActivePath('/upload') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">📁</span>
                  Upload Records
                </Link>
                <Link 
                  to="/appointments" 
                  className={`mobile-nav-link ${isActivePath('/appointments') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">📅</span>
                  Appointments
                </Link>
                <button 
                  onClick={handleLogout}
                  className="mobile-logout-btn"
                >
                  <span className="nav-icon">🚪</span>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`mobile-nav-link login-link ${isActivePath('/login') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">🔐</span>
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className={`mobile-nav-link register-link ${isActivePath('/register') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <span className="nav-icon">👤</span>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={closeMobileMenu}
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

