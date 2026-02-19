import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Header onMenuClick={toggleSidebar} />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout