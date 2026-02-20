import { useState, useEffect } from 'react';
import api from '../../api';

const ActiveAuthorsCard = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await api.get('/dashboard/active-authors/');
        setAuthors(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  if (loading) return <div className="admin-card">Loading...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <div className="admin-card col-span-1">
      <div className="d-flex space-between align-center mb-4">
        <h3 className="card-title">Active Authors</h3>
        <div className="d-flex align-center">
          <span
            className="d-flex align-center justify-center bg-light rounded-circle"
            style={{
              width: '25px',
              height: '25px',
              fontSize: '10px',
              marginRight: '-8px',
              border: '2px solid #fff',
              zIndex: 3,
            }}
          >
            +5
          </span>
          <div
            style={{
              width: '25px',
              height: '25px',
              background: '#ccc',
              borderRadius: '50%',
              border: '2px solid #fff',
              zIndex: 2,
            }}
          ></div>
          <div
            style={{
              width: '25px',
              height: '25px',
              background: '#aaa',
              borderRadius: '50%',
              border: '2px solid #fff',
              zIndex: 1,
              marginLeft: '-10px',
            }}
          ></div>
        </div>
      </div>
      <div className="text-muted small mb-4">Top contributing users stats</div>
      <div className="d-flex flex-column gap-3">
        {authors.map((author) => (
          <div key={author.name} className="d-flex space-between align-center">
            <div className="d-flex align-center">
              <div
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: '#f5f8fa',
                  marginRight: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {author.name.charAt(0)}
              </div>
              <div>
                <div className="fw-bold text-dark small">{author.name}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {author.role}
                </div>
              </div>
            </div>
            <div className="d-flex align-center">
              <span className="fw-bold text-dark me-2" style={{ marginRight: '8px' }}>
                {author.progress}%
              </span>
              {author.trend === 'up' ? (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  color="#50cd89"
                  height="1em"
                  width="1em"
                >
                  <path d="m10 10.414 4 4 5.707-5.707L22 11V5h-6l2.293 2.293L14 11.586l-4-4-7.707 7.707 1.414 1.414z"></path>
                </svg>
              ) : (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  color="#f1416c"
                  height="1em"
                  width="1em"
                  style={{ transform: 'scaleY(-1)' }}
                >
                  <path d="m10 10.414 4 4 5.707-5.707L22 11V5h-6l2.293 2.293L14 11.586l-4-4-7.707 7.707 1.414 1.414z"></path>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveAuthorsCard;