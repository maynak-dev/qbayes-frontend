import { useState, useEffect } from 'react';
import api from '../../api';
import './NewUserModal.css';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',           // role id (integer)
    company: '',        // company name (string)
    location: '',       // location name (string)
    shop: '',           // shop name (string)
    status: 'Pending',
    steps: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        username: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        company: '',
        location: '',
        shop: '',
        status: 'Pending',
        steps: 0,
      });
      setLocations([]);
      setShops([]);
      setError('');
    }
  }, [isOpen]);

  // Fetch base options when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const [rolesRes, companiesRes] = await Promise.all([
          api.get('/roles/'),
          api.get('/companies/'),
        ]);
        setRoles(rolesRes.data);
        setCompanies(companiesRes.data);
      } catch (err) {
        console.error('Failed to load options', err);
        setError('Failed to load form options. Please refresh.');
      }
    };
    fetchOptions();
  }, [isOpen]);

  // Populate form when user changes (modal opens with a user)
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',           // role id
        company: user.company || '',      // company name
        location: user.location || '',    // location name
        shop: user.shop || '',            // shop name
        status: user.status || 'Pending',
        steps: user.steps || 0,
      });
    }
  }, [user]);

  // Fetch locations when company changes
  useEffect(() => {
    if (!formData.company) {
      setLocations([]);
      setFormData(prev => ({ ...prev, location: '', shop: '' }));
      return;
    }

    const selectedCompany = companies.find(c => c.name === formData.company);
    if (!selectedCompany) return;

    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const res = await api.get(`/locations/?company=${selectedCompany.id}`);
        setLocations(res.data);
        // Reset location if current selection not in new list
        if (res.data.length > 0 && !res.data.some(loc => loc.name === formData.location)) {
          setFormData(prev => ({ ...prev, location: '', shop: '' }));
        }
      } catch (err) {
        console.error('Failed to load locations', err);
        setError('Failed to load locations. Please try again.');
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

    const selectedLocation = locations.find(l => l.name === formData.location);
    if (!selectedLocation) return;

    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const res = await api.get(`/shops/?location=${selectedLocation.id}`);
        setShops(res.data);
      } catch (err) {
        console.error('Failed to load shops', err);
        setError('Failed to load shops. Please try again.');
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, [formData.location, locations]);

  const statuses = ['Pending', 'Approved', 'Rejected'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      username: formData.username,
      email: formData.email,
      first_name: formData.name,
      phone: formData.phone,
      role: formData.role ? parseInt(formData.role) : null,   // send as integer ID
      company: formData.company,    // send as string (matches Profile.company field)
      location: formData.location,  // send as string
      shop: formData.shop,          // send as string
      status: formData.status,
      steps: parseInt(formData.steps),
      // created_at is read‑only; include only if backend requires it
      created_at: user?.created_at,
    };

    try {
      await api.put(`/users/${user.id}/`, payload);
      onUserUpdated();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Update failed. ';
      if (typeof data === 'object') {
        const errors = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ');
        msg += errors;
      } else {
        msg += 'Please try again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit User</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          {/* Username */}
          <div className="input-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              className="login-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Full Name */}
          <div className="input-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="login-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="login-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="login-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Role Dropdown */}
          <div className="input-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              className="login-input"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          {/* Company Dropdown */}
          <div className="input-group">
            <label htmlFor="company">Company *</label>
            <select
              id="company"
              name="company"
              className="login-input"
              value={formData.company}
              onChange={handleChange}
              required
            >
              <option value="">Select company</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.name}>{comp.name}</option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="input-group">
            <label htmlFor="location">Location *</label>
            <select
              id="location"
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
                  ? 'Loading locations...'
                  : 'Select location'}
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Shop Dropdown */}
          <div className="input-group">
            <label htmlFor="shop">Shop</label>
            <select
              id="shop"
              name="shop"
              className="login-input"
              value={formData.shop}
              onChange={handleChange}
              disabled={!formData.location || loadingShops}
            >
              <option value="">
                {!formData.location
                  ? 'Select a location first'
                  : loadingShops
                  ? 'Loading shops...'
                  : 'Select shop (optional)'}
              </option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.name}>{shop.name}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="input-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="login-input"
              value={formData.status}
              onChange={handleChange}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Steps */}
          <div className="input-group">
            <label htmlFor="steps">Steps</label>
            <input
              type="number"
              id="steps"
              name="steps"
              className="login-input"
              value={formData.steps}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-light" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;