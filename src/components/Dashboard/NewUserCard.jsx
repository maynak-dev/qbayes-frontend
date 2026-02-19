import { useState, useEffect } from 'react';
import api from '../../api';
import NewUserModal from '../Modals/NewUserModal';

const NewUserCard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/dashboard/new-users/');
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = (newUser) => {
    // Add the new user to the top of the list and keep only 4 items
    setUsers((prev) => [newUser, ...prev.slice(0, 3)]);
  };

  // Helper to format time safely
  const formatTimeAdded = (timeAdded) => {
    if (!timeAdded) return 'Just now';
    try {
      const date = new Date(timeAdded);
      if (isNaN(date.getTime())) return 'Just now';
      
      // Show relative time (e.g., "2 mins", "1 hr")
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''}`;
      if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''}`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch (e) {
      return 'Just now';
    }
  };

  if (loading) return <div className="admin-card">Loading...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <>
      <div className="admin-card col-span-1">
        <div className="d-flex space-between align-center mb-4">
          <h3 className="card-title">New User</h3>
          <button className="btn btn-sm btn-light-primary" onClick={() => setIsModalOpen(true)}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              style={{ marginRight: '5px' }}
            >
              <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM4 8a3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4 3.91 3.91 0 0 0-4 4zm6 0a1.91 1.91 0 0 1-2 2 1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2zM4 18a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2v-1a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v1h2z"></path>
            </svg>
            Add User
          </button>
        </div>
        <div className="d-flex flex-column gap-3">
          {users.map((user, index) => (
            <div
              key={index}
              className="d-flex align-center p-2 rounded hover-bg-light"
              style={{ transition: '0.2s' }}
            >
              <div
                style={{
                  width: '45px',
                  height: '45px',
                  background: '#fff8dd',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  marginRight: '15px',
                }}
              >
                {user.emoji || '👤'}
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  {user.name}
                </div>
                <div className="text-muted small">{user.role || 'New User'}</div>
              </div>
              <span className="badge badge-light" style={{ fontSize: '0.75rem' }}>
                {formatTimeAdded(user.time_added)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <NewUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </>
  );
};

export default NewUserCard;