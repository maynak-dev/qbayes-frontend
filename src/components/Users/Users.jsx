import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import NewUserModal from '../Modals/NewUserModal';
import ViewUserModal from '../Modals/ViewUserModal';
import EditUserModal from '../Modals/EditUserModal';
import DeleteUserModal from '../Modals/DeleteUserModal';

// Toast component (inline – can be moved to a separate file later)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const fetchUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/users/', { params: { _t: Date.now() } });
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setUsers(sorted);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (user.profile?.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleUserCreated = () => {
    fetchUsers();
    setCurrentPage(1);
    setIsNewModalOpen(false);
  };

  const handleView = async (user) => {
    try {
      const response = await api.get(`/users/${user.id}/`);
      setSelectedUser(response.data);
      setIsViewModalOpen(true);
    } catch (err) {
      showToast('Failed to load user details', 'error');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setIsEditModalOpen(false);
  };

  const handleUserDeleted = () => {
    fetchUsers();
    setIsDeleteModalOpen(false);
  };

  const handleStatusChange = async (user, newStatus) => {
    setUpdatingStatus(user.id);
    try {
      const payload = { profile: { status: newStatus } };
      await api.patch(`/users/${user.id}/`, payload);
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, profile: { ...u.profile, status: newStatus } }
            : u
        )
      );
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingStatus(null);
      fetchUsers(); // refresh to ensure consistency
    }
  };

  const getUserField = (user, field) => {
    if (user[field] !== undefined && user[field] !== null && user[field] !== '') return user[field];
    if (user.profile && user.profile[field] !== undefined && user.profile[field] !== null && user.profile[field] !== '') return user.profile[field];
    return '-';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getInitialsBg = (name) => {
    const hash = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const colors = ['#f2f0ff', '#e0f2fe', '#ffe4e6', '#f0fdf4', '#fff1e6'];
    return colors[hash % colors.length];
  };

  const getInitialsColor = (status) => {
    if (status === 'Approved') return '#059669';
    if (status === 'Rejected') return '#b91c1c';
    return '#b45309';
  };

  const getStatusStyles = (status) => {
    const styles = {
      Pending: { bg: '#fffbeb', border: '#fed7aa', color: '#b45309' },
      Approved: { bg: '#ecfdf3', border: '#abefc6', color: '#059669' },
      Rejected: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
    };
    return styles[status] || styles.Pending;
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="skeleton h-8 w-48 mb-4 pulse"></div>
        <div className="skeleton h-4 w-64 mb-4 pulse"></div>
        <div className="skeleton h-10 w-full mb-4 pulse"></div>
        <div className="admin-card">
          <div className="skeleton h-10 w-full mb-3 pulse"></div>
          <div className="skeleton h-10 w-full mb-3 pulse"></div>
          <div className="skeleton h-10 w-full mb-3 pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header with title, description, and actions */}
      <div className="admin-header-section">
        <div className="header-info">
          <h2 className="page-title">User Management</h2>
          <p className="page-description">Manage your organization's users ({totalUsers} total)</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-light icon-btn"
            onClick={fetchUsers}
            disabled={refreshing}
            title="Refresh"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              viewBox="0 0 24 24"
              height="1.2rem"
              width="1.2rem"
              className={refreshing ? 'spinner' : ''}
            >
              <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z" />
            </svg>
          </button>
          <button className="btn btn-primary" onClick={() => setIsNewModalOpen(true)}>
            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '8px' }}>
              <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
            Create User
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="admin-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-3 align-center justify-content-between">
          <div className="d-flex flex-wrap gap-3 align-center">
            <div className="search-input-wrapper" style={{ minWidth: '280px' }}>
              <svg
                stroke="currentColor"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="search-icon"
                height="1em"
                width="1em"
              >
                <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
              </svg>
              <input
                className="form-control search-input"
                placeholder="Search by name or email..."
                type="text"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <select
              className="rows-select"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm" style={{ padding: '8px 20px', borderRadius: '40px' }}>
              <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em" style={{ marginRight: '6px' }}>
                <path d="M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z" />
              </svg>
              Filter
            </button>
            <button className="btn btn-light btn-sm" style={{ padding: '8px 20px', borderRadius: '40px' }}>Export</button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table table-row-hover" style={{ minWidth: '1200px' }}>
            <thead style={{ background: '#f9fafc' }}>
              <tr>
                <th style={{ padding: '16px 20px' }}>Profile</th>
                <th style={{ padding: '16px 12px' }}>Name</th>
                <th style={{ padding: '16px 12px' }}>Status</th>
                <th style={{ padding: '16px 12px' }}>Role</th>
                <th style={{ padding: '16px 12px' }}>Company</th>
                <th style={{ padding: '16px 12px' }}>Location</th>
                <th style={{ padding: '16px 12px' }}>Shop</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const currentStatus = user.profile?.status || 'Pending';
                  const statusStyles = getStatusStyles(currentStatus);
                  return (
                    <tr key={user.id} className="table-row-hover">
                      <td style={{ padding: '16px 20px' }}>
                        <div
                          className="avatar-circle"
                          style={{
                            background: getInitialsBg(user.name || user.username),
                            color: getInitialsColor(currentStatus),
                          }}
                        >
                          {getInitials(user.name || user.username)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div className="d-flex" style={{ flexDirection: 'column' }}>
                          <span className="fw-bold" style={{ fontSize: '1rem' }}>
                            {user.name || user.username}
                          </span>
                          <span className="text-muted small" style={{ marginTop: '4px' }}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <select
                            className="form-select-sm"
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(user, e.target.value)}
                            disabled={updatingStatus === user.id}
                            style={{
                              padding: '8px 32px 8px 16px',
                              borderRadius: '40px',
                              border: `1px solid ${statusStyles.border}`,
                              backgroundColor: statusStyles.bg,
                              fontWeight: 500,
                              fontSize: '0.9rem',
                              color: statusStyles.color,
                              outline: 'none',
                              cursor: 'pointer',
                              appearance: 'none',
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235e6f8d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 12px center',
                              backgroundSize: '14px',
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                        {updatingStatus === user.id && (
                          <div className="small text-muted" style={{ marginTop: '4px', fontSize: '0.75rem', textAlign: 'center' }}>
                            Updating...
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        {user.role_details?.name || 'Not assigned'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>{getUserField(user, 'company')}</td>
                      <td style={{ padding: '16px 12px' }}>{getUserField(user, 'location')}</td>
                      <td style={{ padding: '16px 12px' }}>{getUserField(user, 'shop')}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div className="action-buttons">
                          <button
                            className="btn-icon-action"
                            onClick={() => handleView(user)}
                            title="View"
                          >
                            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon-action"
                            onClick={() => handleEdit(user)}
                            title="Edit"
                          >
                            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon-action delete"
                            onClick={() => handleDelete(user)}
                            title="Delete"
                          >
                            <svg stroke="currentColor" fill="currentColor" viewBox="0 0 24 24" height="18" width="18">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-footer">
          <div className="d-flex align-center">
            <span className="text-muted">Show</span>
            <select
              className="rows-select"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-muted">of {totalUsers} entries</span>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="pagination-current">{currentPage}</span>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewUserModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onUserCreated={handleUserCreated} />
      {selectedUser && (
        <>
          <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser} />
          <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={selectedUser} onUserUpdated={handleUserUpdated} />
          <DeleteUserModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} user={selectedUser} onUserDeleted={handleUserDeleted} />
        </>
      )}
    </div>
  );
};

export default Users;