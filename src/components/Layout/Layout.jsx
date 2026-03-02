import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Memoize toggle function to prevent unnecessary re-renders
  // const toggleSidebar = useCallback(() => {
  //   setSidebarOpen(prev => !prev);
  // }, []);

  const toggleSidebar = () => {
  console.log('Toggle clicked, current state:', sidebarOpen);
  setSidebarOpen(!sidebarOpen);
};

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Overlay for mobile – clicking closes the sidebar */}
      <div className="sidebar-overlay" onClick={closeSidebar} />

      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="admin-main">
        <Header onMenuClick={toggleSidebar} />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;