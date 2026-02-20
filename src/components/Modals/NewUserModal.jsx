import { useState, useEffect } from 'react';
import api from '../../api';
import './NewUserModal.css';

const NewUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shops, setShops] = useState([]); // optional

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    company: '',
    location: '',
    designation: '',
    shop: '', // optional
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all dropdown options when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const [rolesRes, companiesRes, locationsRes, designationsRes, shopsRes] = await Promise.all([
          api.get('/roles/'),
          api.get('/companies/'),
          api.get('/locations/'),
          api.get('/designations/'),
          api.get('/shops/').catch(() => []), // ignore if endpoint doesn't exist
        ]);
        setRoles(rolesRes.data);
        setCompanies(companiesRes.data);
        setLocations(locationsRes.data);
        setDesignations(designationsRes.data);
        if (shopsRes?.data) setShops(shopsRes.data);
      } catch (err) {
        console.error('Failed to load options', err);
        setError('Failed to load form options. Please refresh.');
      }
    };
    fetchOptions();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const extractError = (err) => {
    if (!err.response) return 'Network error. Please check your connection.';
    const { data, status } = err.response;
    console.error('Full error response:', data);

    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      const fieldErrors = Object.entries(data)
        .filter(([key, value]) => Array.isArray(value) || typeof value === 'string')
        .map(([key, value]) => {
          const fieldName = key === 'non_field_errors' ? 'General' : key;
          const message = Array.isArray(value) ? value.join(', ') : value;
          return `${fieldName}: ${message}`;
        })
        .join('; ');
      if (fieldErrors) return fieldErrors;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
    }
    return `Server error (status ${status}). Please try again.`;
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
      role: formData.role,
      company: formData.company,
      location: formData.location,
      designation: formData.designation,
      shop: formData.shop, // optional
    };

    console.log('Sending payload:', payload);

    try {
      const response = await api.post('/users/', payload);
      const newUser = {
        name: response.data.first_name || response.data.username,
        role: response.data.role || 'New User',
        emoji: '👤',
        time_added: response.data.created_at || new Date().toISOString(),
      };
      onUserCreated(newUser);
      onClose();
      setFormData({
        username: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        company: '',
        location: '',
        designation: '',
        shop: '',
      });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New User</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Username */}
          <div className="input-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              className="login-input"
              placeholder="Choose a username"
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
              placeholder="Enter full name"
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
              placeholder="user@example.com"
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
              placeholder="+1 234 567 890"
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
                <option key={role.id} value={role.name}>{role.name}</option>
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
              {companies.map((company) => (
                <option key={company.id} value={company.name}>{company.name}</option>
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
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Designation Dropdown (from Designation model) */}
          <div className="input-group">
            <label htmlFor="designation">Designation *</label>
            <select
              id="designation"
              name="designation"
              className="login-input"
              value={formData.designation}
              onChange={handleChange}
              required
            >
              <option value="">Select designation</option>
              {designations.map((des) => (
                <option key={des.id} value={des.title}>{des.title}</option>
              ))}
            </select>
          </div>

          {/* Shop Dropdown (optional) */}
          {shops.length > 0 && (
            <div className="input-group">
              <label htmlFor="shop">Shop</label>
              <select
                id="shop"
                name="shop"
                className="login-input"
                value={formData.shop}
                onChange={handleChange}
              >
                <option value="">Select shop (optional)</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.name}>{shop.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-light" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewUserModal;