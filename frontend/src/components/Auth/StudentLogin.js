import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, GraduationCap, Chrome, Facebook } from 'lucide-react';
import './Auth.css';

const StudentLogin = () => {
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

    const result = await login(formData.email, formData.password, 'student');
    
    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // Google OAuth integration
    window.open('http://localhost:8000/api/auth/google/student', '_self');
  };

  const handleFacebookLogin = () => {
    // Facebook OAuth integration
    window.open('http://localhost:8000/api/auth/facebook/student', '_self');
  };

  return (
    <div className="auth-container">
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

      {/* Left Side - Student Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="logo-section">
            <div className="logo-icon student-theme">
              <GraduationCap size={48} />
            </div>
            <h1>Student Portal</h1>
            <p className="tagline">Your Learning Journey Starts Here</p>
          </div>
          
          <div className="features-preview">
            <div className="feature-item">
              <GraduationCap size={24} />
              <div>
                <h4>Access Courses</h4>
                <p>Join and learn from expert instructors</p>
              </div>
            </div>
            <div className="feature-item">
              <Chrome size={24} />
              <div>
                <h4>Submit Assignments</h4>
                <p>Track your progress and grades</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Student Login</h2>
            <p>Sign in to access your courses</p>
          </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className={focusedField === 'email' ? 'focused' : ''}>
              Email Address
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
                placeholder="Enter your student email"
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

          <button type="submit" className={`auth-button ${loading ? 'loading' : ''}`} disabled={loading}>
            <span className="button-content">
              <LogIn size={20} />
              {loading ? 'Signing In...' : 'Sign In as Student'}
            </span>
            <div className="button-glow"></div>
            {loading && <div className="loading-spinner"></div>}
          </button>
        </form>

        {/* Social Login */}
        <div className="social-login">
          <div className="divider">
            <span>OR</span>
          </div>
          
          <div className="social-buttons">
            <button 
              type="button" 
              className="social-button google"
              onClick={handleGoogleLogin}
            >
              <Chrome size={20} />
              Continue with Google
            </button>
            
            <button 
              type="button" 
              className="social-button facebook"
              onClick={handleFacebookLogin}
            >
              <Facebook size={20} />
              Continue with Facebook
            </button>
          </div>
        </div>

          <div className="auth-footer">
            <p>
              New student?{' '}
              <Link to="/signup/student" className="auth-link">
                Create student account
              </Link>
            </p>
            <p className="auth-switch">
              Are you a teacher?{' '}
              <Link to="/login/teacher" className="auth-link">
                Teacher login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
