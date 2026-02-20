import { useState, useEffect } from 'react';
import api from '../../api';
import './CompanyCreation.css'; // optional, reuse global styles

const CompanyCreation = () => {
  // State for locations
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');

  // State for companies
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({ name: '', location: '' });

  // State for shops
  const [shops, setShops] = useState([]);
  const [newShop, setNewShop] = useState({ name: '', company: '', location: '' });

  // Fetch initial data
  useEffect(() => {
    fetchLocations();
    fetchCompanies();
    fetchShops();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations/');
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShops = async () => {
    try {
      const res = await api.get('/shops/');
      setShops(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Create location
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    try {
      await api.post('/locations/', { name: newLocation });
      setNewLocation('');
      fetchLocations();
    } catch (err) {
      console.error(err);
    }
  };

  // Create company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.location) return;
    try {
      await api.post('/companies/', {
        name: newCompany.name,
        location: parseInt(newCompany.location),
      });
      setNewCompany({ name: '', location: '' });
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  // Create shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShop.name || !newShop.company || !newShop.location) return;
    try {
      await api.post('/shops/', {
        name: newShop.name,
        company: parseInt(newShop.company),
        location: parseInt(newShop.location),
      });
      setNewShop({ name: '', company: '', location: '' });
      fetchShops();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Company Creation
      </h2>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {/* Locations Card */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Locations</h3>
          </div>
          <form onSubmit={handleCreateLocation} className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="search-input"
              placeholder="New location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(loc => (
                  <tr key={loc.id}>
                    <td>{loc.name}</td>
                    <td>
                      <button className="btn btn-icon btn-light btn-sm">✏️</button>
                      <button className="btn btn-icon btn-light btn-sm">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Companies Card */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Companies</h3>
          </div>
          <form onSubmit={handleCreateCompany} className="d-flex flex-column gap-2 mb-3">
            <input
              type="text"
              className="search-input"
              placeholder="Company name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
            />
            <select
              className="search-input"
              value={newCompany.location}
              onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
            >
              <option value="">Select location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Add Company</button>
          </form>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Shops</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(comp => (
                  <tr key={comp.id}>
                    <td>{comp.name}</td>
                    <td>{comp.location_name || '-'}</td>
                    <td>{comp.shops_count || 0}</td>
                    <td>
                      <button className="btn btn-icon btn-light btn-sm">✏️</button>
                      <button className="btn btn-icon btn-light btn-sm">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shops Card */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Shops</h3>
          </div>
          <form onSubmit={handleCreateShop} className="d-flex flex-column gap-2 mb-3">
            <input
              type="text"
              className="search-input"
              placeholder="Shop name"
              value={newShop.name}
              onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
            />
            <select
              className="search-input"
              value={newShop.company}
              onChange={(e) => setNewShop({ ...newShop, company: e.target.value })}
            >
              <option value="">Select company</option>
              {companies.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
            <select
              className="search-input"
              value={newShop.location}
              onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
            >
              <option value="">Select location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Add Shop</button>
          </form>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map(shop => (
                  <tr key={shop.id}>
                    <td>{shop.name}</td>
                    <td>{shop.company_name || '-'}</td>
                    <td>{shop.location_name || '-'}</td>
                    <td>
                      <button className="btn btn-icon btn-light btn-sm">✏️</button>
                      <button className="btn btn-icon btn-light btn-sm">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreation;