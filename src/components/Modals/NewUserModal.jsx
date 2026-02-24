import { useState, useEffect } from 'react';
import api from '../../api';
import './NewUserModal.css';

const NewUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    company: '',
    location: '',
    shop: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const [companiesRes] = await Promise.all([
          api.get('/companies/'),
        ]);
        setCompanies(companiesRes.data);
      } catch (err) {
        console.error('Failed to load options', err);
        setError('Failed to load form options. Please refresh.');
      }
    };
    fetchOptions();
  }, [isOpen]);

  useEffect(() => {
    if (!formData.company) {
      setLocations([]);
      setFormData(prev => ({ ...prev, location: '', shop: '', role: '' }));
      setShops([]);
      setRoles([]);
      return;
    }

    const selectedCompany = companies.find(c => c.name === formData.company);
    if (!selectedCompany) return;

    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const res = await api.get(`/locations/?company=${selectedCompany.id}`);
        setLocations(res.data);
        if (res.data.length > 0 && !res.data.some(loc => loc.name === formData.location)) {
          setFormData(prev => ({ ...prev, location: '', shop: '', role: '' }));
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

  useEffect(() => {
    if (!formData.location) {
      setShops([]);
      setFormData(prev => ({ ...prev, shop: '', role: '' }));
      setRoles([]);
      return;
    }

    const selectedLocation = locations.find(l => l.name === formData.location);
    if (!selectedLocation) return;

    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const res = await api.get(`/shops/?location=${selectedLocation.id}`);
        setShops(res.data);
        if (res.data.length > 0 && !res.data.some(s => s.name === formData.shop)) {
          setFormData(prev => ({ ...prev, shop: '', role: '' }));
        }
      } catch (err) {
        console.error('Failed to load shops', err);
        setError('Failed to load shops. Please try again.');
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, [formData.location, locations]);

  useEffect(() => {
    if (!formData.shop) {
      setRoles([]);
      setFormData(prev => ({ ...prev, role: '' }));
      return;
    }

    const selectedShop = shops.find(s => s.name === formData.shop);
    if (!selectedShop) return;

    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await api.get(`/roles/?shop=${selectedShop.id}`);
        setRoles(res.data);
        if (res.data.length > 0 && !res.data.some(r => r.id === parseInt(formData.role))) {
          setFormData(prev => ({ ...prev, role: '' }));
        }
      } catch (err) {
        console.error('Failed to load roles', err);
        setError('Failed to load roles. Please try again.');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, [formData.shop, shops]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      role: formData.role ? parseInt(formData.role) : null,
      company: formData.company,
      location: formData.location,
      shop: formData.shop,
    };

    try {
      const response = await api.post('/users/', payload);
      onUserCreated(response.data);
      onClose();
      setFormData({
        username: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        company: '',
        location: '',
        shop: '',
      });
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Creation failed. ';
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
          <h3 className="modal-title">Add New User</h3>
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
            <label htmlFor="shop">Shop *</label>
            <select
              id="shop"
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
                  ? 'Loading shops...'
                  : 'Select shop'}
              </option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.name}>{shop.name}</option>
              ))}
            </select>
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
              disabled={!formData.shop || loadingRoles}
            >
              <option value="">
                {!formData.shop
                  ? 'Select a shop first'
                  : loadingRoles
                  ? 'Loading roles...'
                  : 'Select role'}
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
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