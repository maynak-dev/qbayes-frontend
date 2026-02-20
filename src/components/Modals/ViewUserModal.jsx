import './NewUserModal.css';

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">User Profile</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>
        <div className="modal-form" style={{ padding: '24px' }}>
          {/* Avatar + Name + Email */}
          <div className="d-flex align-center mb-4">
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: '#fff8dd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#ffc700',
                marginRight: '15px',
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name || user.username}</h3>
              <p className="text-muted" style={{ margin: 0 }}>{user.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="info-item">
              <label className="text-muted small">Username</label>
              <div className="fw-bold">{user.username}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Status</label>
              <div>
                <span className={`badge ${user.status === 'Approved' ? 'badge-success' : user.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                  {user.status || 'Pending'}
                </span>
              </div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Role</label>
              <div className="fw-bold">{user.role || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Designation</label>
              <div className="fw-bold">{user.designation || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Company</label>
              <div className="fw-bold">{user.company || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Location</label>
              <div className="fw-bold">{user.location || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Shop</label>
              <div className="fw-bold">{user.shop || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Phone</label>
              <div className="fw-bold">{user.phone || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Steps</label>
              <div className="fw-bold">{user.steps || 0}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Created</label>
              <div className="fw-bold">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</div>
            </div>
          </div>

          {/* Close Button */}
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