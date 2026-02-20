import { useState, useEffect } from 'react';
import api from '../../api';

const Designations = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles/');
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;
    try {
      await api.post('/roles/', newRole);
      setNewRole({ name: '', description: '' });
      fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/roles/${id}/`);
      fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (role) => {
    setEditingId(role.id);
    setEditForm({ name: role.name, description: role.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const handleUpdate = async (id) => {
    if (!editForm.name.trim()) return;
    try {
      await api.put(`/roles/${id}/`, editForm);
      setEditingId(null);
      fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Designations (Role Management)
      </h2>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">All Designations</h3>
          </div>

          {/* Add new role form */}
          <form onSubmit={handleCreate} className="d-flex gap-2 mb-4">
            <input
              type="text"
              className="search-input"
              placeholder="Role name"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              style={{ flex: 2 }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Description (optional)"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              style={{ flex: 3 }}
            />
            <button type="submit" className="btn btn-primary">Add Role</button>
          </form>

          {/* Roles table */}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}>
                    {editingId === role.id ? (
                      // Edit row
                      <>
                        <td>
                          <input
                            type="text"
                            className="search-input"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="search-input"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                        </td>
                        <td>{new Date(role.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-success btn-sm" onClick={() => handleUpdate(role.id)}>Save</button>
                            <button className="btn btn-light btn-sm" onClick={cancelEdit}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Normal row
                      <>
                        <td>{role.name}</td>
                        <td>{role.description || '-'}</td>
                        <td>{new Date(role.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-icon btn-light btn-sm" onClick={() => startEdit(role)} title="Edit">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                              </svg>
                            </button>
                            <button className="btn btn-icon btn-light btn-sm" onClick={() => handleDelete(role.id)} title="Delete">
                              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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

export default Designations;