import './NewUserModal.css';

const ViewRoleModal = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Role Details</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>
        <div className="modal-form" style={{ padding: '24px' }}>
          {/* Role Name Header */}
          <div className="d-flex align-center mb-4">
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: '#3e97ff20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#3e97ff',
                marginRight: '15px',
              }}
            >
              {role.name ? role.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{role.name}</h3>
              <p className="text-muted" style={{ margin: 0 }}>ID: {role.id}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="info-item">
              <label className="text-muted small">Company</label>
              <div className="fw-bold">{role.company_name || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Location</label>
              <div className="fw-bold">{role.location_name || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Shop</label>
              <div className="fw-bold">{role.shop_name || '-'}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Created</label>
              <div className="fw-bold">{formatDate(role.created_at)}</div>
            </div>
            <div className="info-item">
              <label className="text-muted small">Users with this role</label>
              <div className="fw-bold">{role.users_count || 0}</div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="permissions-section mt-4">
            <h4 className="fw-bold mb-2">Role Management Permissions</h4>
            <div className="d-flex flex-wrap gap-4">
              <span className={`badge ${role.role_create ? 'badge-success' : 'badge-light'}`}>
                Create
              </span>
              <span className={`badge ${role.role_edit ? 'badge-success' : 'badge-light'}`}>
                Edit
              </span>
              <span className={`badge ${role.role_delete ? 'badge-success' : 'badge-light'}`}>
                Delete
              </span>
              <span className={`badge ${role.role_view ? 'badge-success' : 'badge-light'}`}>
                View
              </span>
            </div>

            <h4 className="fw-bold mb-2 mt-3">User Management Permissions</h4>
            <div className="d-flex flex-wrap gap-4">
              <span className={`badge ${role.user_create ? 'badge-success' : 'badge-light'}`}>
                Create
              </span>
              <span className={`badge ${role.user_edit ? 'badge-success' : 'badge-light'}`}>
                Edit
              </span>
              <span className={`badge ${role.user_delete ? 'badge-success' : 'badge-light'}`}>
                Delete
              </span>
              <span className={`badge ${role.user_view ? 'badge-success' : 'badge-light'}`}>
                View
              </span>
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

export default ViewRoleModal;