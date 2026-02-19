import { NavLink } from 'react-router-dom' // We'll use NavLink if we set up routing, but for now we'll just use anchor tags
// If you don't want to use react-router, you can replace with simple <a> tags

const Sidebar = ({ open, onClose }) => {
  // Icons as SVG components (simplified)
  const DashboardIcon = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em"><path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm5 2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1zm1-6h4v4h-4V5zM3 20a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6zm2-5h4v4H5v-4zm8 5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6zm2-5h4v4h-4v-4z"></path></svg>
  // ... other icons

  const menuItems = [
    { name: "User's Home", icon: DashboardIcon, path: '/' },
    { name: 'Dashboard', icon: DashboardIcon, path: '/admin', active: true },
    { name: 'Designation', icon: DashboardIcon, path: '/admin/roles' },
    { name: 'Users', icon: DashboardIcon, path: '/admin/users' },
    { name: 'Enquiries', icon: DashboardIcon, path: '/admin/enquiries' },
    { name: 'Subscribers', icon: DashboardIcon, path: '/admin/subscribers' },
    { name: 'Purchases', icon: DashboardIcon, path: '/admin/purchases' },
    { name: 'Services', icon: DashboardIcon, path: '/admin/services' },
    { name: 'Live Calls', icon: DashboardIcon, path: '/admin/live-calls' },
    { name: 'Coupons', icon: DashboardIcon, path: '/admin/coupons' }
  ]

  return (
    <div className={`admin-sidebar ${open ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <div className="brand-logo">
          <span>QBayes</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
        </button>
      </div>
      <div className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.path}
            className={`admin-sidebar-item ${item.active ? 'active' : ''}`}
          >
            <span className="admin-sidebar-icon"><item.icon /></span>
            <span>{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default Sidebar