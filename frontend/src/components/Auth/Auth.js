import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles, GraduationCap, BookOpen, Users, User, UserPlus } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { login, register } = useAuth();
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

    if (isLogin) {
      // Login logic
      const email = formData.email;
      const password = formData.password;
      
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      
      // Don't pass role - let backend determine user's role from database
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } else {
      // Register logic - validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      
      // Check password requirements
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must contain at least one lowercase letter, one uppercase letter, and one number');
        setLoading(false);
        return;
      }
      
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    });
  };


  return (
    <div className="auth-container">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        <div 
          className="cursor-glow" 
          style={{
            left: mousePosition.x - 100,
            top: mousePosition.y - 100
          }}
        ></div>
      </div>

      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="logo-section">
            <div className="logo-icon">
              <GraduationCap size={48} />
            </div>
            <h1>EduFlow</h1>
            <p className="tagline">Empowering Education Through Technology</p>
          </div>
          
          <div className="features-preview">
            <div className="feature-item">
              <BookOpen size={24} />
              <div>
                <h4>Interactive Courses</h4>
                <p>Engage with dynamic course content</p>
              </div>
            </div>
            <div className="feature-item">
              <Users size={24} />
              <div>
                <h4>Collaborative Learning</h4>
                <p>Connect with peers and instructors</p>
              </div>
            </div>
            <div className="feature-item">
              <Sparkles size={24} />
              <div>
                <h4>Smart Analytics</h4>
                <p>Track your learning progress</p>
              </div>
            </div>
          </div>
          
          <div className="stats-section">
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Courses</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Instructors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Sign in to continue your learning journey' : 'Join our learning community today'}</p>
          </div>
        
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
            {/* Name field for registration */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name" className={focusedField === 'name' ? 'focused' : ''}>
                  Full Name
                </label>
                <div className={`input-group ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'has-value' : ''}`}>
                  <User className="input-icon" size={18} strokeWidth={2} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className={focusedField === 'email' ? 'focused' : ''}>
                Email Address
              </label>
              <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                <Mail className="input-icon" size={18} strokeWidth={2} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className={focusedField === 'password' ? 'focused' : ''}>
                Password
              </label>
              <div className={`input-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'has-value' : ''}`}>
                <Lock className="input-icon" size={18} strokeWidth={2} />
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
              {!isLogin && (
                <div className="password-requirements">
                  <small>Password must contain at least one lowercase letter, one uppercase letter, and one number</small>
                </div>
              )}
            </div>

            {/* Confirm Password field for registration */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className={focusedField === 'confirmPassword' ? 'focused' : ''}>
                  Confirm Password
                </label>
                <div className={`input-group ${focusedField === 'confirmPassword' ? 'focused' : ''} ${formData.confirmPassword ? 'has-value' : ''}`}>
                  <Lock className="input-icon" size={18} strokeWidth={2} />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Re-enter your password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Role selection for registration */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="role">I am a</label>
                <div className="role-selection">
                  <label className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleChange}
                    />
                    <Users size={20} />
                    <span>Student</span>
                  </label>
                  <label className={`role-option ${formData.role === 'teacher' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={formData.role === 'teacher'}
                      onChange={handleChange}
                    />
                    <GraduationCap size={20} />
                    <span>Teacher</span>
                  </label>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>
              </div>
            )}

            <button type="submit" className={`auth-button ${loading ? 'loading' : ''}`} disabled={loading}>
              <span className="button-content">
                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                {loading ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
              </span>
              <div className="button-glow"></div>
              {loading && <div className="loading-spinner"></div>}
            </button>
          </form>


          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button type="button" onClick={switchMode} className="auth-link">
                {isLogin ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
