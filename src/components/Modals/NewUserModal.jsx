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
        console.error(err);
        setError('Failed to load options');
      }
    };
    fetchOptions();
  }, [isOpen]);

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
        if (res.data.length > 0 && !res.data.some(loc => loc.name === formData.location)) {
          setFormData(prev => ({ ...prev, location: '', shop: '' }));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load locations');
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, [formData.company, companies]);

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
        console.error(err);
        setError('Failed to load shops');
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, [formData.location, locations]);

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
      setFormData({ username: '', name: '', email: '', phone: '', role: '', company: '', location: '', shop: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Creation failed');
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
          <button className="modal-close-btn" onClick={onClose}>✖</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}
          {/* Username, Name, Email, Phone fields (same as before) */}
          <div className="input-group">
            <label>Username *</label>
            <input type="text" name="username" className="login-input" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Full Name *</label>
            <input type="text" name="name" className="login-input" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Email *</label>
            <input type="email" name="email" className="login-input" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Phone</label>
            <input type="tel" name="phone" className="login-input" value={formData.phone} onChange={handleChange} />
          </div>
          {/* Role dropdown */}
          <div className="input-group">
            <label>Role *</label>
            <select name="role" className="login-input" value={formData.role} onChange={handleChange} required>
              <option value="">Select role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {/* Company dropdown */}
          <div className="input-group">
            <label>Company *</label>
            <select name="company" className="login-input" value={formData.company} onChange={handleChange} required>
              <option value="">Select company</option>
              {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          {/* Location dropdown */}
          <div className="input-group">
            <label>Location *</label>
            <select name="location" className="login-input" value={formData.location} onChange={handleChange} required disabled={!formData.company || loadingLocations}>
              <option value="">{!formData.company ? 'Select company first' : loadingLocations ? 'Loading...' : 'Select location'}</option>
              {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          {/* Shop dropdown */}
          <div className="input-group">
            <label>Shop</label>
            <select name="shop" className="login-input" value={formData.shop} onChange={handleChange} disabled={!formData.location || loadingShops}>
              <option value="">{!formData.location ? 'Select location first' : loadingShops ? 'Loading...' : 'Select shop (optional)'}</option>
              {shops.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewUserModal;