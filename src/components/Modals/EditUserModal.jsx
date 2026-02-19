import { useState, useEffect } from 'react';
import api from '../../api';
import './NewUserModal.css';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    designation: '',
    status: 'Pending',
    steps: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        location: user.location || '',
        designation: user.designation || '',
        status: user.status || 'Pending',
        steps: user.steps || 0,
      });
    }
  }, [user]);

  const companies = ['Triton Tech', 'Optitax Inc', 'Global Services', 'Finance Corp', 'Acme Ltd'];
  const locations = ['New York', 'London', 'Paris', 'Tokyo', 'Berlin', 'Sydney'];
  const designations = ['HR Manager', 'Developer', 'Designer', 'Sales', 'QA Lead', 'Product Owner', 'Senior Director', 'Compliance'];
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
      ...formData,
      first_name: formData.name,
      created_at: user.created_at, // include original created_at
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