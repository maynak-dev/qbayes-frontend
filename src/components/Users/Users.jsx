import { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import NewUserModal from '../Modals/NewUserModal';
import ViewUserModal from '../Modals/ViewUserModal';
import EditUserModal from '../Modals/EditUserModal';
import DeleteUserModal from '../Modals/DeleteUserModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users/', {
        params: { _t: Date.now() }
      });
      console.log('Fetched users:', response.data);
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setUsers(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      console.error('Failed to fetch user details', err);
      setError('Failed to load user details.');
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
      const payload = {
        profile: {
          status: newStatus,
        },
      };
      await api.patch(`/users/${user.id}/`, payload);
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, profile: { ...u.profile, status: newStatus } }
            : u
        )
      );
    } catch (err) {
      console.error('Failed to update status', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Please try again.';
      setError(`Status update failed: ${errorMsg}`);
    } finally {
      setUpdatingStatus(null);
      fetchUsers();
    }
  };

  const getUserField = (user, field) => {
    if (user[field] !== undefined && user[field] !== null && user[field] !== '') return user[field];
    if (user.profile && user.profile[field] !== undefined && user.profile[field] !== null && user.profile[field] !== '') return user.profile[field];
    return '-';
  };

  const getBadgeClass = (status) => {
    if (status === 'Approved') return 'badge-success';
    if (status === 'Rejected') return 'badge-danger';
    return 'badge-warning';
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

  // Helper to get status background color
  const getStatusBg = (status) => {
    if (status === 'Approved') return '#ecfdf3';
    if (status === 'Rejected') return '#fef2f2';
    return '#fffbeb';
  };

  // Helper to get status border color
  const getStatusBorder = (status) => {
    if (status === 'Approved') return '#abefc6';
    if (status === 'Rejected') return '#fecaca';
    return '#fed7aa';
  };

  if (loading) return <div className="admin-card">Loading users...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <>
      <div className="fade-in" style={{ padding: '24px 0' }}>
        {/* Header - now with same left/right padding as filter card */}
        <div className="d-flex flex-wrap gap-3 align-center justify-content-between mb-4" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '4px', color: '#0b1b33' }}>
              User Management
            </h2>
            <p className="text-muted" style={{ fontSize: '0.95rem', color: '#5e6f8d' }}>
              Manage your organization's users ({totalUsers} total)
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light" title="Refresh" onClick={fetchUsers} style={{ borderRadius: '12px', padding: '10px', border: '1px solid #e6edf4', background: '#fff' }}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2rem" width="1.2rem">
                <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"></path>
              </svg>
            </button>
            <button className="btn btn-primary" onClick={() => setIsNewModalOpen(true)} style={{ borderRadius: '12px', padding: '10px 20px', background: '#2469f5', border: 'none', fontWeight: 500 }}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '6px' }}>
                <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
              </svg>
              Create User
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="admin-card" style={{ padding: '20px 24px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div className="d-flex flex-wrap gap-3 align-center justify-content-between">
            <div className="d-flex flex-wrap gap-3 align-center">
              <div className="search-input-wrapper" style={{ minWidth: '280px', flex: '1 1 auto', position: 'relative' }}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="search-icon" height="1em" width="1em" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a0b3cc' }}>
                  <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
                </svg>
                <input
                  className="form-control search-input"
                  placeholder="Search by name or email..."
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  style={{ padding: '12px 20px 12px 44px', borderRadius: '40px', border: '1px solid #e6edf4', fontSize: '0.95rem', background: '#fff', boxShadow: 'none' }}
                />
              </div>
              <select
                className="form-control form-select-sm"
                style={{ width: '160px', padding: '12px 16px', borderRadius: '40px', borderColor: '#e6edf4', fontSize: '0.95rem', background: '#fff', color: '#1e293b' }}
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
              <button className="btn btn-light btn-sm" style={{ padding: '10px 20px', borderRadius: '40px', border: '1px solid #e6edf4', background: '#fff', fontSize: '0.95rem', fontWeight: 500, color: '#1e293b' }}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" style={{ marginRight: '6px' }}>
                  <path d="M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z"></path>
                </svg>
                Filter
              </button>
              <button className="btn btn-light btn-sm" style={{ padding: '10px 20px', borderRadius: '40px', border: '1px solid #e6edf4', background: '#fff', fontSize: '0.95rem', fontWeight: 500, color: '#1e293b' }}>Export</button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginTop: '20px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: '1200px', width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead style={{ background: '#f9fcff' }}>
                <tr>
                  <th style={{ padding: '20px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Profile</th>
                  <th style={{ padding: '20px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Name <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" style={{ marginLeft: '4px', verticalAlign: 'middle' }} height="14" width="14"><path d="M7 20h2V8h3L8 4 4 8h3zm13-4h-3V4h-2v12h-3l4 4z"></path></svg>
                  </th>
                  <th style={{ padding: '20px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</th>
                  <th style={{ padding: '20px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Role</th>
                  <th style={{ padding: '20px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Company</th>
                  <th style={{ padding: '20px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Location</th>
                  <th style={{ padding: '20px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Shop</th>
                  <th style={{ padding: '20px 20px', fontSize: '0.8rem', fontWeight: 600, color: '#5e6f8d', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => {
                    const currentStatus = user.profile?.status || 'Pending';
                    return (
                      <tr key={user.id} className="table-row-hover" style={{ background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', borderRadius: '20px', transition: 'all 0.2s', cursor: 'pointer' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '16px',
                              background: getInitialsBg(user.name || user.username),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              fontWeight: '600',
                              color: getInitialsColor(currentStatus),
                            }}
                          >
                            {getInitials(user.name || user.username)}
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div className="d-flex" style={{ flexDirection: 'column' }}>
                            <span className="fw-bold" style={{ fontSize: '1rem', color: '#0b1b33' }}>
                              {user.name || user.username}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px', color: '#5e6f8d' }}>
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <select
                              className="form-control form-select-sm"
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(user, e.target.value)}
                              disabled={updatingStatus === user.id}
                              style={{
                                padding: '8px 32px 8px 16px',
                                borderRadius: '40px',
                                border: `1px solid ${getStatusBorder(currentStatus)}`,
                                backgroundColor: getStatusBg(currentStatus),
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                color: getInitialsColor(currentStatus),
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
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
                            {updatingStatus === user.id && (
                              <span className="small text-muted" style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', color: '#5e6f8d', whiteSpace: 'nowrap' }}>Updating...</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.95rem' }}>
                          {user.role_details?.name || 'Not assigned'}
                        </td>
                        <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.95rem' }}>
                          {getUserField(user, 'company')}
                        </td>
                        <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.95rem' }}>
                          {getUserField(user, 'location')}
                        </td>
                        <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.95rem' }}>
                          {getUserField(user, 'shop')}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-icon btn-light btn-sm" title="View" onClick={() => handleView(user)} style={{ padding: '8px', borderRadius: '12px', border: '1px solid #e6edf4', background: '#fff', color: '#5e6f8d', transition: 'all 0.2s' }}>
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                              </svg>
                            </button>
                            <button className="btn btn-icon btn-light btn-sm" title="Edit" onClick={() => handleEdit(user)} style={{ padding: '8px', borderRadius: '12px', border: '1px solid #e6edf4', background: '#fff', color: '#5e6f8d', transition: 'all 0.2s' }}>
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                              </svg>
                            </button>
                            <button className="btn btn-icon btn-light btn-sm" title="Delete" onClick={() => handleDelete(user)} style={{ padding: '8px', borderRadius: '12px', border: '1px solid #e6edf4', background: '#fff', color: '#5e6f8d', transition: 'all 0.2s' }}>
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted" style={{ fontSize: '1rem', color: '#5e6f8d' }}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex flex-wrap gap-3 align-center justify-content-between" style={{ padding: '20px 24px', borderTop: '1px solid #eff2f5' }}>
            <div className="d-flex align-center">
              <span className="text-muted" style={{ marginRight: '12px', color: '#5e6f8d' }}>Show</span>
              <select
                className="form-control form-select-sm"
                style={{ width: '70px', padding: '8px 12px', borderRadius: '40px', borderColor: '#e6edf4', background: '#fff', color: '#1e293b', fontSize: '0.9rem' }}
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-muted" style={{ marginLeft: '12px', color: '#5e6f8d' }}>
                of {totalUsers} users
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ padding: '8px 20px', borderRadius: '40px', border: '1px solid #e6edf4', background: '#fff', color: '#1e293b', fontWeight: 500 }}
              >
                Previous
              </button>
              <span className="btn btn-sm btn-primary" style={{ padding: '8px 20px', borderRadius: '40px', background: '#2469f5', color: '#fff', border: 'none', fontWeight: 500 }}>
                {currentPage}
              </span>
              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ padding: '8px 20px', borderRadius: '40px', border: '1px solid #e6edf4', background: '#fff', color: '#1e293b', fontWeight: 500 }}
              >
                Next
              </button>
            </div>
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
    </>
  );
};

export default Users;