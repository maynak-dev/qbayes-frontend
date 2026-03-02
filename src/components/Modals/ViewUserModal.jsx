import './NewUserModal.css';

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">User Profile</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ padding: '24px' }}>
          <div className="d-flex align-center mb-4">
            <div className="avatar-circle" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div style={{ marginLeft: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name || user.username}</h3>
              <p className="text-muted" style={{ margin: 0 }}>{user.email}</p>
            </div>
          </div>

          <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="info-item">
              <label className="text-muted small">Username</label>
              <div className="fw-bold">{user.username}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Status</label>
              <div>
                <span className={`badge ${user.profile?.status === 'Approved' ? 'badge-success' : user.profile?.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                  {user.profile?.status || 'Pending'}
                </span>
              </div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Role</label>
              <div className="fw-bold">{user.role_details?.name || 'Not assigned'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Company</label>
              <div className="fw-bold">{user.profile?.company || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Location</label>
              <div className="fw-bold">{user.profile?.location || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Shop</label>
              <div className="fw-bold">{user.profile?.shop || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Phone</label>
              <div className="fw-bold">{user.profile?.phone || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Steps</label>
              <div className="fw-bold">{user.profile?.steps || 0}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Created</label>
              <div className="fw-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</div>
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-light" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;