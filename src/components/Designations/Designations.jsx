import { useState, useEffect } from 'react';
import api from '../../api';

const Designations = () => {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter roles based on search term
  useEffect(() => {
    const filtered = roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles/');
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/roles/${id}/`);
      fetchRoles();
    } catch (err) {
      console.error(err);
      setError('Failed to delete role');
    }
  };

  const handleView = (role) => {
    // For now, just show an alert – you can replace with a modal later
    alert(`Role: ${role.name}\nCompany: ${role.company_name}\nLocation: ${role.location_name}\nShop: ${role.shop_name}`);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const handleRoleSaved = () => {
    fetchRoles();
    handleModalClose();
  };

  if (loading) return <div className="admin-card">Loading roles...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex space-between align-center mb-3">
        <div>
          <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
            Role Management
          </h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Define roles and permissions ({roles.length} total)
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light" title="Refresh" onClick={fetchRoles}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" style={{ fontSize: '1.2rem' }}>
              <path d="M10 11H7.101l.001-.009a4.956 4.956 0 0 1 .752-1.787 5.054 5.054 0 0 1 2.2-1.811c.302-.128.617-.226.938-.291a5.078 5.078 0 0 1 2.018 0 4.978 4.978 0 0 1 2.525 1.361l1.416-1.412a7.036 7.036 0 0 0-2.224-1.501 6.921 6.921 0 0 0-1.315-.408 7.079 7.079 0 0 0-2.819 0 6.94 6.94 0 0 0-1.316.409 7.04 7.04 0 0 0-3.08 2.534 6.978 6.978 0 0 0-1.054 2.505c-.028.135-.043.273-.063.41H2l4 4 4-4zm4 2h2.899l-.001.008a4.976 4.976 0 0 1-2.103 3.138 4.943 4.943 0 0 1-1.787.752 5.073 5.073 0 0 1-2.017 0 4.956 4.956 0 0 1-1.787-.752 5.072 5.072 0 0 1-.74-.61L7.05 16.95a7.032 7.032 0 0 0 2.225 1.5c.424.18.867.317 1.315.408a7.07 7.07 0 0 0 2.818 0 7.031 7.031 0 0 0 4.395-2.945 6.974 6.974 0 0 0 1.053-2.503c.027-.135.043-.273.063-.41H22l-4-4-4 4z"></path>
            </svg>
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2rem" width="1.2rem" style={{ marginRight: '6px' }}>
              <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
            </svg>
            Create Role
          </button>
        </div>
      </div>

      {/* Filter and table card */}
      <div className="admin-card">
        <div className="d-flex space-between align-center mb-4 flex-wrap gap-3">
          <div className="search-input-wrapper">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="search-icon" height="1em" width="1em">
              <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
            </svg>
            <input
              className="form-control search-input"
              placeholder="Search role..."
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: '250px' }}
            />
          </div>
          <div className="d-flex align-center gap-2">
            <button className="btn btn-light btn-sm">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" style={{ marginRight: '5px' }}>
                <path d="M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z"></path>
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-row-hover align-middle">
            <thead>
              <tr style={{ borderBottom: '1px solid #eff2f5' }}>
                <th style={{ paddingLeft: '20px' }}>
                  Role Name{' '}
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-muted" height="1em" width="1em">
                    <path d="M7 20h2V8h3L8 4 4 8h3zm13-4h-3V4h-2v12h-3l4 4z"></path>
                  </svg>
                </th>
                <th>Users Count</th>
                <th className="text-right" style={{ paddingRight: '20px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id} style={{ borderBottom: '1px solid #eff2f5' }}>
                  <td style={{ paddingLeft: '20px' }}>
                    <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                      {role.name}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-light" style={{ color: '#7e8299' }}>
                      {role.users_count || 0} users
                    </span>
                  </td>
                  <td className="text-right" style={{ paddingRight: '20px' }}>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        className="btn btn-icon btn-light btn-sm"
                        title="Show"
                        onClick={() => handleView(role)}
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
                          <path d="M12 9a3.02 3.02 0 0 0-3 3c0 1.642 1.358 3 3 3 1.641 0 3-1.358 3-3 0-1.641-1.359-3-3-3z"></path>
                          <path d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316-.105-.316C21.927 11.617 19.633 5 12 5zm0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5-.504 1.158-2.578 5-7.926 5z"></path>
                        </svg>
                      </button>
                      <button
                        className="btn btn-icon btn-light btn-sm"
                        title="Edit"
                        onClick={() => handleEdit(role)}
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
                          <path d="M4 21a1 1 0 0 0 .24 0l4-1a1 1 0 0 0 .47-.26L21 7.41a2 2 0 0 0 0-2.82L19.42 3a2 2 0 0 0-2.83 0L4.3 15.29a1.06 1.06 0 0 0-.27.47l-1 4A1 1 0 0 0 3.76 21 1 1 0 0 0 4 21zM18 4.41 19.59 6 18 7.59 16.42 6zM5.91 16.51 15 7.41 16.59 9l-9.1 9.1-2.11.52z"></path>
                        </svg>
                      </button>
                      <button
                        className="btn btn-icon btn-light-danger btn-sm"
                        title="Delete"
                        onClick={() => handleDelete(role.id)}
                      >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
                          <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path>
                          <path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    No roles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Optional pagination – you can add if needed */}
        <div className="d-flex space-between align-center mt-4">
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Showing {filteredRoles.length} of {roles.length} entries
          </div>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-light disabled">Previous</button>
            <button className="btn btn-sm btn-primary">1</button>
            <button className="btn btn-sm btn-light disabled">Next</button>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit Role */}
      {showModal && (
        <RoleModal
          role={editingRole}
          onClose={handleModalClose}
          onSave={handleRoleSaved}
        />
      )}
    </div>
  );
};

// Separate modal component (you can place it in the same file or a separate one)
const RoleModal = ({ role, onClose, onSave }) => {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    location: '',
    shop: '',
    role_create: false,
    role_edit: false,
    role_delete: false,
    role_view: false,
    user_create: false,
    user_edit: false,
    user_delete: false,
    user_view: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);

  useEffect(() => {
    fetchCompanies();
    if (role) {
      setFormData({
        name: role.name || '',
        company: role.company || '',
        location: role.location || '',
        shop: role.shop || '',
        role_create: role.role_create || false,
        role_edit: role.role_edit || false,
        role_delete: role.role_delete || false,
        role_view: role.role_view || false,
        user_create: role.user_create || false,
        user_edit: role.user_edit || false,
        user_delete: role.user_delete || false,
        user_view: role.user_view || false,
      });
    }
  }, [role]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load companies');
    }
  };

  // Fetch locations when company changes
  useEffect(() => {
    if (!formData.company) {
      setLocations([]);
      setFormData(prev => ({ ...prev, location: '', shop: '' }));
      return;
    }

    const selectedCompany = companies.find(c => c.id === parseInt(formData.company));
    if (!selectedCompany) return;

    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const res = await api.get(`/locations/?company=${selectedCompany.id}`);
        setLocations(res.data);
        // Reset location if current selection not in new list
        if (res.data.length > 0 && !res.data.some(loc => loc.id === parseInt(formData.location))) {
          setFormData(prev => ({ ...prev, location: '', shop: '' }));
        }
      } catch (err) {
        console.error('Failed to load locations', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, [formData.company, companies]);

  // Fetch shops when location changes
  useEffect(() => {
    if (!formData.location) {
      setShops([]);
      setFormData(prev => ({ ...prev, shop: '' }));
      return;
    }

    const selectedLocation = locations.find(l => l.id === parseInt(formData.location));
    if (!selectedLocation) return;

    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const res = await api.get(`/shops/?location=${selectedLocation.id}`);
        setShops(res.data);
      } catch (err) {
        console.error('Failed to load shops', err);
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, [formData.location, locations]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: formData.name,
      company: parseInt(formData.company),
      location: parseInt(formData.location),
      shop: parseInt(formData.shop),
      role_create: formData.role_create,
      role_edit: formData.role_edit,
      role_delete: formData.role_delete,
      role_view: formData.role_view,
      user_create: formData.user_create,
      user_edit: formData.user_edit,
      user_delete: formData.user_delete,
      user_view: formData.user_view,
    };

    try {
      if (role?.id) {
        await api.put(`/roles/${role.id}/`, payload);
      } else {
        await api.post('/roles/', payload);
      }
      onSave();
    } catch (err) {
      console.error(err);
      setError('Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{role ? 'Edit Role' : 'Create Role'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          {/* Role Name */}
          <div className="input-group">
            <label>Role Name *</label>
            <input
              type="text"
              name="name"
              className="login-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Company */}
          <div className="input-group">
            <label>Company *</label>
            <select
              name="company"
              className="login-input"
              value={formData.company}
              onChange={handleChange}
              required
            >
              <option value="">Select company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="input-group">
            <label>Location *</label>
            <select
              name="location"
              className="login-input"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={!formData.company || loadingLocations}
            >
              <option value="">
                {!formData.company
                  ? 'Select a company first'
                  : loadingLocations
                  ? 'Loading...'
                  : 'Select location'}
              </option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Shop */}
          <div className="input-group">
            <label>Shop *</label>
            <select
              name="shop"
              className="login-input"
              value={formData.shop}
              onChange={handleChange}
              required
              disabled={!formData.location || loadingShops}
            >
              <option value="">
                {!formData.location
                  ? 'Select a location first'
                  : loadingShops
                  ? 'Loading...'
                  : 'Select shop'}
              </option>
              {shops.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Permissions */}
          <div className="permissions-section mt-4">
            <h4 className="fw-bold mb-2">Role Management Permissions</h4>
            <div className="d-flex flex-wrap gap-4">
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="role_create" checked={formData.role_create} onChange={handleChange} />
                Create
              </label>
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="role_edit" checked={formData.role_edit} onChange={handleChange} />
                Edit
              </label>
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="role_delete" checked={formData.role_delete} onChange={handleChange} />
                Delete
              </label>
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="role_view" checked={formData.role_view} onChange={handleChange} />
                View
              </label>
            </div>

            <h4 className="fw-bold mb-2 mt-3">User Management Permissions</h4>
            <div className="d-flex flex-wrap gap-4">
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="user_create" checked={formData.user_create} onChange={handleChange} />
                Create
              </label>
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="user_edit" checked={formData.user_edit} onChange={handleChange} />
                Edit
              </label>
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="user_delete" checked={formData.user_delete} onChange={handleChange} />
                Delete
              </label>
              <label className="d-flex align-center gap-2">
                <input type="checkbox" name="user_view" checked={formData.user_view} onChange={handleChange} />
                View
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (role ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Designations;