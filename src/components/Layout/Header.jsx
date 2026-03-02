import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setShowDropdown(false); // Close dropdown before navigating
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        {/* Mobile menu toggle – visible only on small screens */}
        {/* <button
          className="menu-toggle d-lg-none"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button> */}

        <button
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            marginRight: '10px',
            cursor: 'pointer',
            color: '#333',
          }}
        >
          ☰
        </button>

        {/* Breadcrumb */}
        <span className="breadcrumb">
          Dashboards &gt; <span className="breadcrumb-current">Default</span>
        </span>
      </div>

      <div className="header-right">
        {/* Search with keyboard shortcut hint */}
        <div className="search-wrapper">
          <svg className="search-icon" stroke="currentColor" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
          </svg>
          <input
            className="search-input"
            placeholder="Search shop..."
            type="text"
          />
          <span className="search-shortcut">⌘K</span>
        </div>

        {/* Notification bell */}
        <button className="icon-btn" aria-label="Notifications">
          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path d="M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z" />
          </svg>
        </button>

        {/* Message icon */}
        <button className="icon-btn" aria-label="Messages">
          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path d="M16 2H8C4.691 2 2 4.691 2 8v12a1 1 0 0 0 1 1h13c3.309 0 6-2.691 6-6V8c0-3.309-2.691-6-6-6zm4 13c0 2.206-1.794 4-4 4H4V8c0-2.206 1.794-4 4-4h8c2.206 0 4 1.794 4 4v7z" />
            <circle cx="9.5" cy="11.5" r="1.5" />
            <circle cx="14.5" cy="11.5" r="1.5" />
          </svg>
        </button>

        {/* App icon (or other) */}
        <button className="icon-btn" aria-label="Apps">
          <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path d="M15 3H4.984c-1.103 0-2 .897-2 2v14.016c0 1.103.897 2 2 2H19c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-4zm4 5h-3V5h3v3zM4.984 10h3v4.016h-3V10zm5 0H14v4.016H9.984V10zM16 10h3v4.016h-3V10zm-2-5v3H9.984V5H14zM7.984 5v3h-3V5h3zm-3 11.016h3v3h-3v-3zm5 3v-3H14v3H9.984zm6.016 0v-3h3.001v3H16z" />
          </svg>
        </button>

        {/* Profile dropdown */}
        <div className="profile-dropdown" ref={dropdownRef}>
          <img
            alt="Admin profile"
            src="https://ui-avatars.com/api/?name=Admin&background=random"
            className="profile-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;