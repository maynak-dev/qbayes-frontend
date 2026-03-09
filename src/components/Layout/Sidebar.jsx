import { NavLink } from 'react-router-dom';

// Icons
const DashboardIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm5 2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm1-6h4v4h-4V5zM3 20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6zm2-5h4v4H5v-4zm8 5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6zm2-5h4v4h-4v-4z"></path>
  </svg>
);

const UsersIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"></path>
  </svg>
);

const RoleIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M4.035 15.479A3.976 3.976 0 0 0 4 16c0 2.378 2.138 4.284 4.521 3.964C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.036C17.857 20.284 20 18.378 20 16c0-.173-.012-.347-.035-.521C21.198 14.786 22 13.465 22 12s-.802-2.786-2.035-3.479C19.988 8.347 20 8.173 20 8c0-2.378-2.143-4.288-4.521-3.964C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.036C6.138 3.712 4 5.622 4 8c0 .173.012.347.035.521C2.802 9.214 2 10.535 2 12s.802 2.786 2.035 3.479zm1.442-5.403 1.102-.293-.434-1.053A1.932 1.932 0 0 1 6 8c0-1.103.897-2 2-2 .247 0 .499.05.73.145l1.054.434.293-1.102a1.99 1.99 0 0 1 3.846 0l.293 1.102 1.054-.434C15.501 6.05 15.753 6 16 6c1.103 0 2 .897 2 2 0 .247-.05.5-.145.73l-.434 1.053 1.102.293a1.993 1.993 0 0 1 0 3.848l-1.102.293.434 1.053c.095.23.145.483.145.73 0 1.103-.897 2-2 2-.247 0-.499-.05-.73-.145l-1.054-.434-.293 1.102a1.99 1.99 0 0 1-3.846 0l-.293-1.102-1.054.434A1.935 1.935 0 0 1 8 18c-1.103 0-2-.897-2-2 0-.247.05-.5.145-.73l.434-1.053-1.102-.293a1.993 1.993 0 0 1 0-3.848z"></path>
    <path d="m15.742 10.71-1.408-1.42-3.331 3.299-1.296-1.296-1.414 1.414 2.704 2.704z"></path>
  </svg>
);

const CompanyIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM8 8h12v3H4V8h4zM4 19v-6h6v2h4v-2h6l.001 6H4z"></path>
  </svg>
);

const JewelleryIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.5L19.5 9 12 12.5 4.5 9 12 4.5zM4 9.5l7 3.5v6L4 15.5v-6zm9 10v-6l7-3.5v6L13 19.5z"></path>
  </svg>
);

const RFIDIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM8 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
  </svg>
);

const MapIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path>
  </svg>
);

const ScanIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4zM3 4h18v2H3zm0 12h18v2H3z"></path>
  </svg>
);

const Sidebar = ({ open, onClose }) => {
  // All secondary items (to be nested under Dashboard)
  const subMenuItems = [
    { name: 'Users', icon: UsersIcon, path: '/admin/users' },
    { name: 'Designation', icon: RoleIcon, path: '/admin/roles' },
    { name: 'Company Creation', icon: CompanyIcon, path: '/admin/company-creation' },
    { name: 'Jewellery', icon: JewelleryIcon, path: '/admin/jewellery' },
    { name: 'RFID', icon: RFIDIcon, path: '/admin/rfid' },
    { name: 'Jewellery-RFID Map', icon: MapIcon, path: '/admin/rfid-jewellery-map' },
    { name: 'RFID Scans', icon: ScanIcon, path: '/admin/rfid-scans' },
  ];

  return (
    <div className={`admin-sidebar ${open ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <div className="brand-logo">
          <span>QBayes</span>
        </div>
        {/* Close button removed – now handled by header toggle */}
      </div>
      <div className="admin-sidebar-menu">
        {/* Dashboard – main item */}
        <NavLink
          to="/admin"
          className={({ isActive }) => `admin-sidebar-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className="admin-sidebar-icon">
            <DashboardIcon />
          </span>
          <span>Dashboard</span>
        </NavLink>

        {/* Nested items under Dashboard with indentation */}
        <div className="admin-sidebar-submenu">
          {subMenuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `admin-sidebar-item admin-sidebar-subitem ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="admin-sidebar-icon">
                <item.icon />
              </span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;