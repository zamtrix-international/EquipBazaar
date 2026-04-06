import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

// ========== PROFESSIONAL SVG ICONS (Same as yours) ==========
const Icons = {
  // Logo Icon - Heavy Equipment Theme
  Logo: () => (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFC107" strokeWidth="1.5" fill="#FFC107" fillOpacity="0.15"/>
      <path d="M2 17L12 22L22 17" stroke="#FFC107" strokeWidth="1.5" fill="none"/>
      <path d="M2 12L12 17L22 12" stroke="#FFC107" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="2.5" fill="#FFC107" stroke="none"/>
      <path d="M12 7V5M12 19V17" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 9L5 7M17 9L19 7" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // Become Vendor Icon - New
  BecomeVendor: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor"/>
      <path d="M12 8v4l2 2" stroke="#FFC107" strokeWidth="1.5"/>
    </svg>
  ),

  // Dashboard Icon
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" fill="none"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" fill="none"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" fill="none"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" fill="none"/>
    </svg>
  ),

  // My Equipment Icon
  MyEquipment: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" fill="none"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" fill="none"/>
      <circle cx="12" cy="13" r="2" fill="#FFC107" stroke="none"/>
      <path d="M8 11L6 9M16 11L18 9" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // Add Equipment Icon
  AddEquipment: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
      <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Earnings/Revenue Icon
  Earnings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" fill="none"/>
      <circle cx="18" cy="20" r="2" fill="#FFC107" stroke="none"/>
      <circle cx="6" cy="4" r="2" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  Settings: () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09c0 .66.39 1.25 1 1.51h0c.63.26 1.35.11 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.47.47-.59 1.17-.33 1.82v0c.26.63.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.25.39-1.51 1z" stroke="currentColor"/>
  </svg>
),

  // KYC/Verification Icon
  KYC: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" fill="none"/>
      <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" fill="none"/>
      <circle cx="12" cy="12" r="3" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Users Icon
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" fill="none"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" fill="none"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" fill="none"/>
    </svg>
  ),

  // Vendors/Truck Icon
  Vendors: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="1" y="3" width="15" height="13" rx="1.5" stroke="currentColor" fill="none"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" stroke="currentColor" fill="none"/>
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" fill="none"/>
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" fill="none"/>
      <circle cx="5.5" cy="18.5" r="1.5" fill="#FFC107" stroke="none"/>
      <circle cx="18.5" cy="18.5" r="1.5" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Commission/Percentage Icon
  Commission: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor"/>
      <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" fill="none"/>
      <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" fill="none"/>
      <circle cx="6.5" cy="6.5" r="1.5" fill="#FFC107" stroke="none"/>
      <circle cx="17.5" cy="17.5" r="1.5" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Analytics/Chart Icon
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor"/>
      <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor"/>
      <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor"/>
      <circle cx="18" cy="8" r="2" fill="#FFC107" stroke="none"/>
      <circle cx="12" cy="2" r="2" fill="#FFC107" stroke="none"/>
      <circle cx="6" cy="12" r="2" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Reports/Document Icon
  Reports: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" fill="none"/>
      <polyline points="14 2 14 8 20 8" stroke="currentColor" fill="none"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor"/>
      <path d="M10 9H9H8" stroke="currentColor" strokeLinecap="round"/>
      <circle cx="16" cy="21" r="2" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Browse Equipment/Search Icon
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"/>
      <circle cx="11" cy="11" r="3" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Bookings/Calendar Icon
  Bookings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" fill="none"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor"/>
      <circle cx="12" cy="15" r="2" fill="#FFC107" stroke="none"/>
      <circle cx="16" cy="15" r="2" fill="#FFC107" stroke="none"/>
      <circle cx="8" cy="15" r="2" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Support/Help Icon
  Support: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" fill="none"/>
      <circle cx="12" cy="12" r="3" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Profile/User Icon
  Profile: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" fill="none"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" fill="none"/>
      <circle cx="12" cy="7" r="2" fill="#FFC107" stroke="none"/>
    </svg>
  ),

  // Logout Icon
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" fill="none"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" fill="none"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor"/>
    </svg>
  ),

  // Arrow Dropdown
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" stroke="currentColor" fill="none"/>
    </svg>
  )
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          console.error('Error parsing user:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    loadUser();
    
    // Listen for storage changes
    const handleStorageChange = () => loadUser();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Become Vendor handler
  const handleBecomeVendor = () => {
    navigate('/signup?role=VENDOR');
  };

  const getMenuItems = () => {
    if (!user) return [];
    
    const role = user.role?.toUpperCase();
    
    if (role === 'ADMIN') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <Icons.Dashboard /> },
        { name: 'Users', path: '/admin/users', icon: <Icons.Users /> },
        { name: 'Vendors', path: '/admin/vendors', icon: <Icons.Vendors /> },
        { name: 'Payouts', path: '/admin/payouts', icon: <Icons.Earnings /> },
        { name: 'Commission', path: '/admin/commission', icon: <Icons.Commission /> },
        { name: 'Analytics', path: '/admin/analytics', icon: <Icons.Analytics /> },
        { name: 'Reports', path: '/admin/reports', icon: <Icons.Reports /> },
        { name: 'Support', path: '/admin/support', icon: <Icons.Support /> },
        { name: 'Settings', path: '/admin/settings', icon: <Icons.Settings /> }
      ];
    }
    
    if (role === 'VENDOR') {
      return [
        { name: 'Dashboard', path: '/vendor/dashboard', icon: <Icons.Dashboard /> },
        { name: 'My Equipment', path: '/vendor/my-equipment', icon: <Icons.MyEquipment /> },
        { name: 'Add Equipment', path: '/vendor/add-equipment', icon: <Icons.AddEquipment /> },
        { name: 'Earnings', path: '/vendor/earnings', icon: <Icons.Earnings /> },
        { name: 'KYC', path: '/vendor/kyc', icon: <Icons.KYC /> }
      ];
    }
    
    if (role === 'CUSTOMER') {
      return [
        { name: 'Dashboard', path: '/customer/dashboard', icon: <Icons.Dashboard /> },
        { name: 'Browse Equipment', path: '/equipment', icon: <Icons.Search /> },
        { name: 'My Bookings', path: '/customer/bookings', icon: <Icons.Bookings /> },
        { name: 'Support', path: '/customer/support', icon: <Icons.Support /> }
      ];
    }
    
    return [];
  };

  const menuItems = getMenuItems();

  const isPublicPage = () => {
    const publicPaths = ['/', '/login', '/signup'];
    return publicPaths.includes(location.pathname) || location.pathname.startsWith('/equipment');
  };

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // Public page navbar (when user is not logged in)
  if (!user && isPublicPage()) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon"><Icons.Logo /></span>
            <span className="logo-text">EquipBazzar</span>
          </Link>
          <div className="navbar-auth">
            <Link to="/login" className="auth-btn login-btn">Sign In</Link>
            <button onClick={handleBecomeVendor} className="auth-btn become-vendor-nav-btn">
              <Icons.BecomeVendor />
              <span>Become a Vendor</span>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Icons.Logo /></span>
          <span className="logo-text">EquipBazzar</span>
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="menu-icon">☰</span>
        </button>

        {/* Navigation Menu */}
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            {menuItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* User Section */}
          <div className="navbar-user">
            <div className="user-profile">
              <span className="user-avatar">{getInitials()}</span>
              <div className="user-details">
                <span className="user-name">{user.name || user.email?.split('@')[0]}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <Icons.Logout />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;