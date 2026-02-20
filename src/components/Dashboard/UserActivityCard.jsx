import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api';

const UserActivityCard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboard/user-activity/');
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

  return (
    <div className="admin-card col-span-2">
      <div className="d-flex space-between align-center mb-4">
        <div>
          <h3 className="card-title">User Activity Stats</h3>
          <span className="text-muted small">Comparison of Active vs New Users</span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-light active text-primary fw-bold">Month</button>
          <button className="btn btn-sm btn-light text-muted">Week</button>
          <button className="btn btn-sm btn-light text-muted">Day</button>
        </div>
      </div>
      <div style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="month" tick={{ fill: '#a1a5b7' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a1a5b7' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 0 20px rgba(0,0,0,0.05)',
              }}
            />
            <Bar dataKey="active_users" fill="#3E97FF" radius={[6, 6, 0, 0]} barSize={32} />
            <Bar dataKey="new_users" fill="#eff2f5" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserActivityCard;