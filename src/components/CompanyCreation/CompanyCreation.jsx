import { useState, useEffect } from 'react';
import api from '../../api';

const CompanyCreation = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [shops, setShops] = useState([]);

  // New item forms
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newShop, setNewShop] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLocations = async (companyId) => {
    try {
      const res = await api.get(`/locations/?company=${companyId}`);
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShops = async (locationId) => {
    try {
      const res = await api.get(`/shops/?location=${locationId}`);
      setShops(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setSelectedLocation(null);
    fetchLocations(company.id);
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    fetchShops(location.id);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    try {
      await api.post('/companies/', { name: newCompany });
      setNewCompany('');
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.trim() || !selectedCompany) return;
    try {
      await api.post('/locations/', {
        name: newLocation,
        company: selectedCompany.id,
      });
      setNewLocation('');
      fetchLocations(selectedCompany.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShop.trim() || !selectedLocation) return;
    try {
      await api.post('/shops/', {
        name: newShop,
        location: selectedLocation.id,
      });
      setNewShop('');
      fetchShops(selectedLocation.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Company Creation
      </h2>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        {/* Companies Column */}
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Companies</h3>
          </div>
          <form onSubmit={handleCreateCompany} className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="search-input"
              placeholder="New company"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
          <div className="list-group">
            {companies.map(company => (
              <div
                key={company.id}
                className={`list-item ${selectedCompany?.id === company.id ? 'active' : ''}`}
                onClick={() => handleCompanyClick(company)}
                style={{
                  padding: '10px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedCompany?.id === company.id ? '#eef4ff' : 'transparent',
                  border: '1px solid #eef0f5',
                }}
              >
                <div className="fw-bold">{company.name}</div>
                <div className="text-muted small">{company.locations_count} locations</div>
              </div>
            ))}
          </div>
        </div>

        {/* Locations Column (visible when a company is selected) */}
        {selectedCompany && (
          <div className="admin-card">
            <div className="card-header">
              <h3 className="card-title">Locations of {selectedCompany.name}</h3>
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
            <div className="list-group">
              {locations.map(location => (
                <div
                  key={location.id}
                  className={`list-item ${selectedLocation?.id === location.id ? 'active' : ''}`}
                  onClick={() => handleLocationClick(location)}
                  style={{
                    padding: '10px',
                    marginBottom: '4px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedLocation?.id === location.id ? '#eef4ff' : 'transparent',
                    border: '1px solid #eef0f5',
                  }}
                >
                  <div className="fw-bold">{location.name}</div>
                  <div className="text-muted small">{location.shops_count} shops</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shops Column (visible when a location is selected) */}
        {selectedLocation && (
          <div className="admin-card">
            <div className="card-header">
              <h3 className="card-title">Shops in {selectedLocation.name}</h3>
            </div>
            <form onSubmit={handleCreateShop} className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="search-input"
                placeholder="New shop"
                value={newShop}
                onChange={(e) => setNewShop(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </form>
            <div className="list-group">
              {shops.map(shop => (
                <div
                  key={shop.id}
                  className="list-item"
                  style={{
                    padding: '10px',
                    marginBottom: '4px',
                    borderRadius: '8px',
                    border: '1px solid #eef0f5',
                  }}
                >
                  <div className="fw-bold">{shop.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCreation;