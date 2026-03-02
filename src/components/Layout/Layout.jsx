import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-overlay" onClick={closeSidebar} />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="admin-main">
        <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;