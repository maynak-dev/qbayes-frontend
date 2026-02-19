import { useState } from 'react';
import api from '../../api';
import './NewUserModal.css';

const NewUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    designation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const companies = ['Triton Tech', 'Optitax Inc', 'Global Services', 'Finance Corp', 'Acme Ltd'];
  const locations = ['New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Sydney'];
  const designations = ['HR Manager', 'Developer', 'Designer', 'Sales', 'QA Lead', 'Product Owner', 'Senior Director', 'Compliance'];

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

    // Construct payload – adjust field names to match your Django backend
    const payload = {
      username: formData.username,
      email: formData.email,
      first_name: formData.name,
      phone: formData.phone,
      company: formData.company,
      location: formData.location,
      designation: formData.designation,
    };

    console.log('Sending payload:', payload);

    try {
      const response = await api.post('/users/', payload);
      // Assume response.data contains the created user with fields:
      // id, username, email, first_name, etc.
      // We'll map it to the format expected by NewUserCard
      const newUser = {
        name: response.data.first_name || response.data.username,
        role: response.data.designation || 'New User',
        emoji: '👤', // default emoji, can be dynamic
        time_added: response.data.created_at || new Date().toISOString(), // use server time if available
      };
      onUserCreated(newUser);
      onClose();
      setFormData({
        username: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        designation: '',
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
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

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
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

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
                <option key={des} value={des}>{des}</option>
              ))}
            </select>
          </div>

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