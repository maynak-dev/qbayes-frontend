import { useState, useEffect } from 'react';
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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debug: log the user data structure
  useEffect(() => {
    if (users.length > 0) {
      console.log('User data from API:', users[0]);
    }
  }, [users]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
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
    setIsNewModalOpen(false);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
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

  // Enhanced helper to safely get field from user (handles flat, nested, and missing data)
  const getUserField = (user, field) => {
    // Directly on user object
    if (user[field] !== undefined && user[field] !== null && user[field] !== '') {
      return user[field];
    }
    // Inside a nested profile object
    if (user.profile && user.profile[field] !== undefined && user.profile[field] !== null && user.profile[field] !== '') {
      return user.profile[field];
    }
    // Fallback
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
    const colors = ['#fff8dd', '#e8ffb3', '#ffe0f0', '#d9f0ff', '#f0e6ff'];
    return colors[hash % colors.length];
  };

  const getInitialsColor = (status) => {
    if (status === 'Approved') return '#50cd89';
    if (status === 'Rejected') return '#f1416c';
    return '#ffc700';
  };

  if (loading) return <div className="admin-card">Loading users...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <>
      <div className="fade-in">
        {/* Header */}
        <div className="d-flex flex-wrap gap-3 align-center justify-content-between mb-4">
          <div>
            <h2 className="card-title" style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '4px' }}>
              User Management
            </h2>
            <p className="text-muted" style={{ fontSize: '0.95rem' }}>
              Manage your organization's users ({totalUsers} total)
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light" title="Refresh" onClick={fetchUsers}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2rem" width="1.2rem">
                <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"></path>
              </svg>
            </button>
            <button className="btn btn-primary" onClick={() => setIsNewModalOpen(true)}>
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '6px' }}>
                <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
              </svg>
              Create User
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="admin-card" style={{ padding: '20px 24px' }}>
          <div className="d-flex flex-wrap gap-3 align-center justify-content-between">
            <div className="d-flex flex-wrap gap-3 align-center">
              <div className="search-input-wrapper" style={{ minWidth: '280px', flex: '1 1 auto' }}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="search-icon" height="1em" width="1em">
                  <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
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
                className="form-control form-select-sm"
                style={{ width: '160px', padding: '10px 12px', borderRadius: '30px', borderColor: '#e2e8f0' }}
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
              <button className="btn btn-light btn-sm" style={{ padding: '8px 16px', borderRadius: '30px' }}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" style={{ marginRight: '6px' }}>
                  <path d="M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z"></path>
                </svg>
                Filter
              </button>
              <button className="btn btn-light btn-sm" style={{ padding: '8px 16px', borderRadius: '30px' }}>Export</button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginTop: '20px' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: '1000px', width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead style={{ background: '#f9fafc' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profile</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Name <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" style={{ marginLeft: '4px', verticalAlign: 'middle' }} height="14" width="14"><path d="M7 20h2V8h3L8 4 4 8h3zm13-4h-3V4h-2v12h-3l4 4z"></path></svg>
                  </th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Designation</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="table-row-hover" style={{ background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', borderRadius: '16px', transition: 'all 0.2s', cursor: 'pointer' }}>
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
                            color: getInitialsColor(user.status),
                          }}
                        >
                          {getInitials(user.name || user.username)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div className="d-flex" style={{ flexDirection: 'column' }}>
                          <span className="fw-bold" style={{ fontSize: '1rem', color: '#0f172a' }}>
                            {user.name || user.username}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span className={`badge ${getBadgeClass(user.status)}`} style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 500, borderRadius: '30px' }}>
                          {user.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.9rem' }}>
                        {getUserField(user, 'role')}
                      </td>
                      <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.9rem' }}>
                        {getUserField(user, 'designation')}
                      </td>
                      <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.9rem' }}>
                        {getUserField(user, 'company')}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-icon btn-light btn-sm" title="View" onClick={() => handleView(user)} style={{ padding: '8px', borderRadius: '12px' }}>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                            </svg>
                          </button>
                          <button className="btn btn-icon btn-light btn-sm" title="Edit" onClick={() => handleEdit(user)} style={{ padding: '8px', borderRadius: '12px' }}>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                            </svg>
                          </button>
                          <button className="btn btn-icon btn-light btn-sm" title="Delete" onClick={() => handleDelete(user)} style={{ padding: '8px', borderRadius: '12px' }}>
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted" style={{ fontSize: '1rem' }}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex flex-wrap gap-3 align-center justify-content-between" style={{ padding: '20px 24px', borderTop: '1px solid #eff2f5' }}>
            <div className="d-flex align-center">
              <span className="text-muted" style={{ marginRight: '12px' }}>Show</span>
              <select
                className="form-control form-select-sm"
                style={{ width: '70px', padding: '6px 8px', borderRadius: '20px', borderColor: '#e2e8f0' }}
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-muted" style={{ marginLeft: '12px' }}>
                of {totalUsers} users
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ padding: '8px 16px', borderRadius: '30px' }}
              >
                Previous
              </button>
              <span className="btn btn-sm btn-primary" style={{ padding: '8px 16px', borderRadius: '30px', background: '#3e97ff', color: '#fff' }}>
                {currentPage}
              </span>
              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ padding: '8px 16px', borderRadius: '30px' }}
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