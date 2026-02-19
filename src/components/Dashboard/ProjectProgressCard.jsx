import { useState, useEffect } from 'react';
import api from '../../api';

const ProjectProgressCard = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get('/dashboard/project-progress/');
        setProject(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, []);

  if (loading) return <div className="admin-card">Loading...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;
  if (!project) return <div className="admin-card">No project data</div>;

  // Safely access tasks
  const tasks = project.tasks || [];

  // Compute strokeDashoffset only if progress is a number
  const strokeDashoffset = project.progress != null
    ? 251.2 * (1 - project.progress / 100)
    : 251.2; // fallback to full circle if progress undefined

  return (
    <div className="admin-card col-span-1">
      <div className="d-flex space-between align-center mb-4">
        <h3 className="card-title">Project Progress</h3>
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 24 24"
          className="text-muted"
          height="20"
          width="20"
        >
          <path d="M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM8 8h12v3H4V8h4zM4 19v-6h6v2h4v-2h6l.001 6H4z"></path>
        </svg>
      </div>
      <div className="d-flex align-center mb-4">
        <div
          style={{
            width: '60px',
            height: '60px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="60" height="60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#eff2f5" strokeWidth="10" fill="none" />
            {project.progress != null && (
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#50cd89"
                strokeWidth="10"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
              />
            )}
          </svg>
          <span className="fw-bold text-dark" style={{ position: 'absolute', fontSize: '0.9rem' }}>
            {project.progress != null ? `${project.progress}%` : '?'}
          </span>
        </div>
        <div className="d-flex flex-column ms-3" style={{ marginLeft: '15px' }}>
          <span className="fw-bold text-dark">{project.name}</span>
          <span className="text-muted small">Due in {project.due_days} days</span>
        </div>
      </div>
      <div className="d-flex flex-column gap-3">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div key={index} className="d-flex space-between align-center">
              <div className="d-flex align-center">
                <div
                  style={{
                    padding: '6px',
                    background: '#f5f8fa',
                    borderRadius: '6px',
                    marginRight: '10px',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{task.icon}</span>
                </div>
                <span className="text-dark fw-bold small">{task.name}</span>
              </div>
              <span
                className={`badge ${
                  task.status === 'Done' ? 'badge-light-success text-success' : 'badge-light-warning text-warning'
                }`}
              >
                {task.status}
              </span>
            </div>
          ))
        ) : (
          <div className="text-muted small">No tasks available</div>
        )}
      </div>
    </div>
  );
};

export default ProjectProgressCard;