import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login/', {
        username: username,
        password: password,
      });
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      navigate('/admin');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Decorative background shapes */}
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-brand">
            <span className="brand-name">QBayes</span>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Please login to your account</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-icon-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  fill="none"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="username"
                  type="text"
                  className="login-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  fill="none"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Options Row */}
            <div className="login-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                <span className="checkbox-label">Remember me</span>
              </label>
            </div>

            {/* Error Message */}
            {error && <div className="login-error">{error}</div>}

            {/* Submit Button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <svg
                    className="button-icon"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>

            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;