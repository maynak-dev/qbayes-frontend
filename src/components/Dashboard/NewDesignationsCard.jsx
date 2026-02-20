import { useState, useEffect } from 'react';
import api from '../../api';

const NewDesignationsCard = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await api.get('/dashboard/new-designations/');
        setDesignations(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDesignations();
  }, []);

  if (loading) return <div className="admin-card">Loading...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <div className="admin-card col-span-1">
      <div className="d-flex space-between align-center mb-4">
        <h3 className="card-title">New Designations</h3>
        <button className="btn btn-sm btn-light">View All</button>
      </div>
      <div className="timeline-block pb-2">
        {designations.map((item, index) => (
          <div key={index} className="d-flex mb-3">
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
                  background: item.color,
                  marginTop: '5px',
                  boxShadow: `0 0 0 3px ${item.color}20`,
                }}
              ></div>
              {index < designations.length - 1 && (
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
                  {item.title}
                </span>
                <span className="text-muted small">{item.date}</span>
              </div>
              <div className="text-muted small mt-1">{item.company}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewDesignationsCard;