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
    // Send PATCH request to update only the status
    await api.patch(`/users/${user.id}/`, payload);
    
    // Optimistically update the local state so the dropdown shows the new status immediately
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
    // Refresh the full list to ensure consistency with the server (optional)
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
    const colors = ['#fff8dd', '#e8ffb3', '#ffe0f0', '#d9f0ff', '#f0e6ff'];
    return colors[hash % colors.length];
  };

  const getInitialsColor = (status) => {
    if (status === 'Approved') return '#50cd89';
    if (status === 'Rejected') return '#f1416c';
    return '#ffc700';
  };

  if (loading) return <div className="card card-custom"><div className="card-body">Loading users...</div></div>;
  if (error) return <div className="card card-custom"><div className="card-body">Error: {error}</div></div>;

  return (
    <>
      <div className="card card-custom">
        {/* Header */}
        <div className="card-header flex-wrap border-0 pt-6 pb-0">
          <div className="card-title">
            <h3 className="card-label">
              User Management
              <span className="d-block text-muted pt-2 font-size-sm">Manage your organization's users ({totalUsers} total)</span>
            </h3>
          </div>
          <div className="card-toolbar">
            <button className="btn btn-light-primary font-weight-bolder mr-2" onClick={fetchUsers}>
              <span className="svg-icon svg-icon-md">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24">
                  <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"></path>
                </svg>
              </span>
              Refresh
            </button>
            <button className="btn btn-primary font-weight-bolder" onClick={() => setIsNewModalOpen(true)}>
              <span className="svg-icon svg-icon-md">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24">
                  <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                </svg>
              </span>
              Create User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-lg-9 col-xl-8">
              <div className="row align-items-center">
                <div className="col-md-4 my-2 my-md-0">
                  <div className="input-icon">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    <span>
                      <span className="svg-icon svg-icon-md svg-icon-primary">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24">
                          <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
                        </svg>
                      </span>
                    </span>
                  </div>
                </div>
                <div className="col-md-3 my-2 my-md-0">
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-xl-4 d-flex justify-content-end">
              <button className="btn btn-light-primary font-weight-bolder btn-sm">
                <span className="svg-icon svg-icon-sm">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24">
                    <path d="M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z"></path>
                  </svg>
                </span>
                Filter
              </button>
              <button className="btn btn-light-primary font-weight-bolder btn-sm ml-2">Export</button>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive mt-6">
            <table className="table table-head-custom table-separate table-checkable">
              <thead>
                <tr>
                  <th className="text-center">Profile</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Shop</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="text-center">
                        <div
                          className="symbol symbol-40 symbol-light"
                          style={{
                            background: getInitialsBg(user.name || user.username),
                            color: getInitialsColor(user.profile?.status),
                          }}
                        >
                          <span className="symbol-label font-weight-bolder">
                            {getInitials(user.name || user.username)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="text-dark-75 font-weight-bolder text-hover-primary mb-1 font-size-lg">
                            {user.name || user.username}
                          </span>
                          <span className="text-muted font-weight-bold text-hover-primary">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <select
                          className="form-control form-control-sm"
                          value={user.profile?.status || 'Pending'}
                          onChange={(e) => handleStatusChange(user, e.target.value)}
                          disabled={updatingStatus === user.id}
                          style={{
                            fontWeight: 500,
                            color: user.profile?.status === 'Approved' ? '#1d874b' : user.profile?.status === 'Rejected' ? '#b42318' : '#b45b0e',
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        {updatingStatus === user.id && (
                          <span className="text-muted ml-2">Updating...</span>
                        )}
                      </td>
                      <td>
                        <span className="text-dark-75 font-weight-bold">
                          {user.role_details?.name || 'Not assigned'}
                        </span>
                      </td>
                      <td>
                        <span className="text-dark-75 font-weight-bold">
                          {getUserField(user, 'company')}
                        </span>
                      </td>
                      <td>
                        <span className="text-dark-75 font-weight-bold">
                          {getUserField(user, 'location')}
                        </span>
                      </td>
                      <td>
                        <span className="text-dark-75 font-weight-bold">
                          {getUserField(user, 'shop')}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-icon btn-light btn-sm mx-1"
                            onClick={() => handleView(user)}
                          >
                            <span className="svg-icon svg-icon-md">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                              </svg>
                            </span>
                          </button>
                          <button
                            className="btn btn-icon btn-light btn-sm mx-1"
                            onClick={() => handleEdit(user)}
                          >
                            <span className="svg-icon svg-icon-md">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                              </svg>
                            </span>
                          </button>
                          <button
                            className="btn btn-icon btn-light btn-sm mx-1"
                            onClick={() => handleDelete(user)}
                          >
                            <span className="svg-icon svg-icon-md">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                              </svg>
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center flex-wrap mt-8">
            <div className="d-flex align-items-center">
              <span className="text-muted mr-2">Show</span>
              <select
                className="form-control form-control-sm font-weight-bold mr-2"
                style={{ width: '70px' }}
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-muted">of {totalUsers} users</span>
            </div>
            <div className="d-flex">
              <button
                className="btn btn-light-primary font-weight-bolder btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span className="btn btn-primary font-weight-bolder btn-sm mx-2">
                {currentPage}
              </span>
              <button
                className="btn btn-light-primary font-weight-bolder btn-sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
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