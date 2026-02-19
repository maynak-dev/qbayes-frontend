import { useState } from 'react';
import api from '../../api';
import './NewUserModal.css';

const DeleteUserModal = ({ isOpen, onClose, user, onUserDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/users/${user.id}/`);
      onUserDeleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Confirm Delete</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>
        <div className="modal-form">
          {error && <div className="modal-error">{error}</div>}
          <p style={{ fontSize: '1rem', color: '#5e6278' }}>
            Are you sure you want to delete user <strong>{user?.name || user?.username}</strong>?
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-light" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
              style={{ backgroundColor: '#f1416c', color: '#fff', border: 'none' }}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;