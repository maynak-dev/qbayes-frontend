import { useState, useEffect } from 'react';
import api from '../../api';

const RFIDJewelleryMap = () => {
  const [maps, setMaps] = useState([]);
  const [jewelleryList, setJewelleryList] = useState([]);
  const [rfidList, setRfidList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    jewellery: '',
    rfid: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/rfid-jewellery-map/'),
      api.get('/jewellery/'),
      api.get('/rfid/')
    ]).then(([mapsRes, jewRes, rfidRes]) => {
      setMaps(mapsRes.data);
      setJewelleryList(jewRes.data);
      setRfidList(rfidRes.data);
    }).catch(err => setError('Failed to load data'));
  }, []);

  const filteredMaps = maps.filter(map =>
    map.jewellery_id_str?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    map.rfid_tag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filteredMaps.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ jewellery: '', rfid: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (map) => {
    setEditingId(map.id);
    setFormData({
      jewellery: map.jewellery,
      rfid: map.rfid,
      status: map.status,
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/rfid-jewellery-map/${editingId}/`, formData);
      } else {
        await api.post('/rfid-jewellery-map/', formData);
      }
      const res = await api.get('/rfid-jewellery-map/');
      setMaps(res.data);
      setModalOpen(false);
    } catch (err) {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/rfid-jewellery-map/${id}/`);
      setMaps(maps.filter(m => m.id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex align-center justify-content-between mb-4">
        <h2 className="card-title">RFID‑Jewellery Mapping</h2>
        <button className="btn btn-primary" onClick={openCreate}>Create Mapping</button>
      </div>

      {error && <div className="modal-error mb-3">{error}</div>}

      <div className="admin-card p-3 mb-4">
        <input className="search-input" placeholder="Search by jewellery ID or RFID tag..." value={searchTerm} onChange={handleSearch} />
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Jewellery ID</th>
              <th>RFID Tag</th>
              <th>Status</th>
              <th>Added By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(map => (
              <tr key={map.id}>
                <td>{map.jewellery_id_str}</td>
                <td>{map.rfid_tag}</td>
                <td><span className={`badge ${map.status === 'active' ? 'badge-success' : 'badge-light'}`}>{map.status}</span></td>
                <td>{map.added_by_username}</td>
                <td>
                  <button className="btn btn-icon btn-light btn-sm" onClick={() => openEdit(map)}>✏️</button>
                  <button className="btn btn-icon btn-light-danger btn-sm" onClick={() => handleDelete(map.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit' : 'Create'} Mapping</h3>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>✖</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="input-group">
                <label>Jewellery *</label>
                <select name="jewellery" value={formData.jewellery} onChange={handleChange} required>
                  <option value="">Select jewellery</option>
                  {jewelleryList.map(j => (
                    <option key={j.id} value={j.id}>{j.jewellery_id}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>RFID Tag *</label>
                <select name="rfid" value={formData.rfid} onChange={handleChange} required>
                  <option value="">Select RFID</option>
                  {rfidList.map(r => (
                    <option key={r.id} value={r.id}>{r.tag}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDJewelleryMap;