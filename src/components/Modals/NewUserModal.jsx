import { useState, useEffect } from 'react';
import api from '../../api';
import './NewUserModal.css'; // We'll keep this for additional styles, but override with glass

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
        const [companiesRes] = await Promise.all([api.get('/companies/')]);
        setCompanies(companiesRes.data);
      } catch (err) {
        setError('Failed to load companies. Please refresh.');
      }
    };
    fetchOptions();
  }, [isOpen]);

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
      });
      setLocations([]);
      setShops([]);
      setRoles([]);
      setError('');
    }
  }, [isOpen]);

  // Fetch locations when company changes
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
        setError('Failed to load shops. Please try again.');
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, [formData.location, locations]);

  // Fetch roles when shop changes
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
      profile: {
        first_name: formData.name,
        phone: formData.phone,
        role: formData.role ? parseInt(formData.role) : null,
        company: formData.company,
        location: formData.location,
        shop: formData.shop,
        status: 'Pending', // default
        steps: 0,
      },
    };

    try {
      const response = await api.post('/users/', payload);
      onUserCreated(response.data);
      onClose();
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
      <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New User</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="modal-error">{error}</div>}

          <div className="input-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              className="modal-input"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="input-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              className="modal-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="input-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className="modal-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="user@example.com"
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="modal-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 890"
            />
          </div>

          <div className="input-group">
            <label>Company *</label>
            <select
              name="company"
              className="modal-input"
              value={formData.company}
              onChange={handleChange}
              required
            >
              <option value="">Select company</option>
              {companies.map(comp => (
                <option key={comp.id} value={comp.name}>{comp.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Location *</label>
            <select
              name="location"
              className="modal-input"
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
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Shop *</label>
            <select
              name="shop"
              className="modal-input"
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
              {shops.map(shop => (
                <option key={shop.id} value={shop.name}>{shop.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Role *</label>
            <select
              name="role"
              className="modal-input"
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
              {roles.map(role => (
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