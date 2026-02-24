import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const NewDesignationsCard = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Fetch roles from the roles endpoint
        const response = await api.get('/roles/');
        // Sort by newest first (assuming 'created_at' field)
        const sorted = response.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRoles(sorted.slice(0, 4)); // take the 4 most recent
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleViewAll = () => {
    navigate('/admin/roles');
  };

  if (loading) return <div className="admin-card">Loading...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <div className="admin-card col-span-1">
      <div className="d-flex space-between align-center mb-4">
        <h3 className="card-title">New Roles</h3>
        <button className="btn btn-sm btn-light" onClick={handleViewAll}>
          View All
        </button>
      </div>
      <div className="timeline-block pb-2">
        {roles.map((role, index) => (
          <div key={role.id} className="d-flex mb-3">
            <div
              style={{
                width: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: '15px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#3e97ff',
                  marginTop: '5px',
                  boxShadow: '0 0 0 3px #3e97ff20',
                }}
              ></div>
              {index < roles.length - 1 && (
                <div
                  style={{
                    width: '2px',
                    height: '100%',
                    background: '#eff2f5',
                    marginTop: '5px',
                  }}
                ></div>
              )}
            </div>
            <div className="flex-grow-1">
              <div className="d-flex space-between align-center">
                <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  {role.name}
                </span>
                <span className="text-muted small">
                  {new Date(role.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-muted small mt-1">
                {role.company_name || 'No company'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewDesignationsCard;