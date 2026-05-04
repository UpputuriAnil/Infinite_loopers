import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, BookOpen, Briefcase } from 'lucide-react';
import './Auth.css';

const TeacherLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password, 'teacher');
    
    if (result.success) {
      navigate('/teacher/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container teacher-theme">
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

      {/* Left Side - Teacher Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="logo-section">
            <div className="logo-icon teacher-theme">
              <BookOpen size={48} />
            </div>
            <h1>Teacher Portal</h1>
            <p className="tagline">Empower Minds, Shape Futures</p>
          </div>
          
          <div className="features-preview">
            <div className="feature-item">
              <BookOpen size={24} />
              <div>
                <h4>Create Courses</h4>
                <p>Design and manage engaging courses</p>
              </div>
            </div>
            <div className="feature-item">
              <Briefcase size={24} />
              <div>
                <h4>Track Progress</h4>
                <p>Monitor student performance</p>
              </div>
            </div>
          </div>
          
          <div className="stats-section">
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Educators</span>
            </div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-section">
        <div className="auth-card teacher-card">
          <div className="auth-header">
            <h2>Teacher Login</h2>
            <p>Sign in to manage your courses</p>
          </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className={focusedField === 'email' ? 'focused' : ''}>
              Institutional Email
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
                placeholder="Enter your institutional email"
                required
              />
              <div className="input-highlight"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className={focusedField === 'password' ? 'focused' : ''}>
              Password
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
                placeholder="Enter your password"
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

          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>
          </div>

          <button type="submit" className={`auth-button teacher-button ${loading ? 'loading' : ''}`} disabled={loading}>
            <span className="button-content">
              <LogIn size={20} />
              {loading ? 'Signing In...' : 'Sign In as Teacher'}
            </span>
            <div className="button-glow"></div>
            {loading && <div className="loading-spinner"></div>}
          </button>
        </form>

          <div className="auth-footer">
            <p>
              New educator?{' '}
              <Link to="/signup/teacher" className="auth-link">
                Apply for teacher account
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

export default TeacherLogin;
