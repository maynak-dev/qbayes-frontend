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
    role: '',
    company: '',
    location: '',
    shop: '',
    status: 'Pending',
    steps: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const statuses = ['Pending', 'Approved', 'Rejected'];

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
        status: 'Pending',
        steps: 0,
      });
      setLocations([]);
      setShops([]);
      setRoles([]);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || user.profile?.phone || '',
        role: user.role || user.profile?.role || '',
        company: user.company || user.profile?.company || '',
        location: user.location || user.profile?.location || '',
        shop: user.shop || user.profile?.shop || '',
        status: user.status || user.profile?.status || 'Pending',
        steps: user.steps || user.profile?.steps || 0,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!formData.company) {
      setLocations([]);
      return;
    }
    const selectedCompany = companies.find(c => c.name === formData.company);
    if (!selectedCompany) return;
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const res = await api.get(`/locations/?company=${selectedCompany.id}`);
        setLocations(res.data);
      } catch (err) {
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
      return;
    }
    const selectedShop = shops.find(s => s.name === formData.shop);
    if (!selectedShop) return;
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await api.get(`/roles/?shop=${selectedShop.id}`);
        setRoles(res.data);
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
      first_name: formData.name,
      profile: {
        phone: formData.phone,
        role: formData.role ? parseInt(formData.role) : null,
        company: formData.company,
        location: formData.location,
        shop: formData.shop,
        status: formData.status,
        steps: parseInt(formData.steps),
      },
    };

    try {
      const response = await api.put(`/users/${user.id}/`, payload);
      onUserUpdated(response.data);
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
      <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit User</h3>
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
              {formData.company && !companies.some(c => c.name === formData.company) && (
                <option value={formData.company} disabled>
                  {formData.company} (invalid)
                </option>
              )}
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
              {formData.location && !locations.some(l => l.name === formData.location) && (
                <option value={formData.location} disabled>
                  {formData.location} (invalid)
                </option>
              )}
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
              {formData.shop && !shops.some(s => s.name === formData.shop) && (
                <option value={formData.shop} disabled>
                  {formData.shop} (invalid)
                </option>
              )}
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
              {formData.role && !roles.some(r => r.id === parseInt(formData.role)) && (
                <option value={formData.role} disabled>
                  {roles.find(r => r.id === parseInt(formData.role))?.name || 'Unknown'} (invalid)
                </option>
              )}
            </select>
          </div>

          <div className="input-group">
            <label>Status</label>
            <select
              name="status"
              className="modal-input"
              value={formData.status}
              onChange={handleChange}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Steps</label>
            <input
              type="number"
              name="steps"
              className="modal-input"
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