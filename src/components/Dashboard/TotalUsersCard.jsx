import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../api';

const TotalUsersCard = () => {
  const [data, setData] = useState({ total: 0, growth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/total-users/');
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="admin-card">Loading...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  // Sample weekly data (you can fetch this from a separate endpoint)
  const chartData = [
    { name: 'Mon', users: 10 },
    { name: 'Tue', users: 15 },
    { name: 'Wed', users: 20 },
    { name: 'Thu', users: 25 },
    { name: 'Fri', users: 30 },
    { name: 'Sat', users: 28 },
    { name: 'Sun', users: 32 }
  ];

  return (
    <div className="admin-card d-flex flex-column h-100 mb-0 col-span-1">
      <div className="d-flex space-between align-center mb-4">
        <h3 className="card-title">Total Users</h3>
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          className="text-muted cursor-pointer"
          height="20"
          width="20"
        >
          <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
        </svg>
      </div>
      <div className="d-flex align-center gap-2 mb-4">
        <button className="btn btn-sm btn-light active text-primary fw-bold" style={{ background: '#f5f8fa' }}>
          Weekly
        </button>
        <button className="btn btn-sm btn-link text-muted" style={{ textDecoration: 'none' }}>
          Monthly
        </button>
      </div>
      <div className="mb-4">
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#181c32', marginRight: '10px', lineHeight: 1 }}>
          {data.total}
        </span>
        <div className="mt-2">
          <span className="badge badge-success">+{data.growth}%</span>
          <span className="text-muted small ms-2" style={{ marginLeft: '8px' }}>
            Growth this week
          </span>
        </div>
      </div>
      <div style={{ height: '120px', marginTop: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3E97FF" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3E97FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="users" stroke="#3E97FF" strokeWidth={3} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TotalUsersCard;