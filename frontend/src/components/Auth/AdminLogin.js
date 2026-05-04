import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import './Auth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password || !formData.adminCode) {
      setError('Please fill in all fields including admin code');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password, 'admin', formData.adminCode);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container admin-theme">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div 
          className="cursor-glow" 
          style={{
            left: mousePosition.x - 100,
            top: mousePosition.y - 100
          }}
        ></div>
      </div>

      {/* Left Side - Admin Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="logo-section">
            <div className="logo-icon admin-theme">
              <Shield size={48} />
            </div>
            <h1>Admin Portal</h1>
            <p className="tagline">System Control & Management</p>
          </div>
          
          <div className="security-notice">
            <div className="notice-item">
              <AlertTriangle size={20} className="warning-icon" />
              <div>
                <h4>Authorized Access Only</h4>
                <p>This portal is restricted to authorized administrators</p>
              </div>
            </div>
          </div>
          
          <div className="features-preview">
            <div className="feature-item">
              <Shield size={24} />
              <div>
                <h4>System Management</h4>
                <p>Manage users, courses, and settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-section">
        <div className="auth-card admin-card">
          <div className="auth-header">
            <h2>Administrator Login</h2>
            <p>Enter your admin credentials</p>
          </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message admin-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className={focusedField === 'email' ? 'focused' : ''}>
              Admin Email
            </label>
            <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter admin email"
                required
              />
              <div className="input-highlight"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className={focusedField === 'password' ? 'focused' : ''}>
              Admin Password
            </label>
            <div className={`input-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'has-value' : ''}`}>
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="input-highlight"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adminCode" className={focusedField === 'adminCode' ? 'focused' : ''}>
              Admin Code
            </label>
            <div className={`input-group ${focusedField === 'adminCode' ? 'focused' : ''} ${formData.adminCode ? 'has-value' : ''}`}>
              <Shield className="input-icon" size={20} />
              <input
                type="password"
                id="adminCode"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleChange}
                onFocus={() => setFocusedField('adminCode')}
                onBlur={() => setFocusedField('')}
                placeholder="Enter admin access code"
                required
              />
              <div className="input-highlight"></div>
            </div>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">Forgot admin credentials?</Link>
          </div>

          <button type="submit" className={`auth-button admin-button ${loading ? 'loading' : ''}`} disabled={loading}>
            <span className="button-content">
              <Shield size={20} />
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </span>
            <div className="button-glow"></div>
            {loading && <div className="loading-spinner"></div>}
          </button>
        </form>

          <div className="auth-footer">
            <p className="auth-switch">
              Are you a teacher?{' '}
              <Link to="/login/teacher" className="auth-link">
                Teacher login
              </Link>
            </p>
            <p className="auth-switch">
              Are you a student?{' '}
              <Link to="/login/student" className="auth-link">
                Student login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
