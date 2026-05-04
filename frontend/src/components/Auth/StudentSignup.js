import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Calendar, GraduationCap, Eye, EyeOff, UserCheck, Chrome, Facebook } from 'lucide-react';
import './Auth.css';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    studentId: '',
    grade: '',
    school: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { register } = useAuth();
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

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }

    setLoading(true);

    const registerData = { 
      ...formData,
      role: 'student',
      name: `${formData.firstName} ${formData.lastName}`
    };

    const result = await register(registerData);
    
    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleSignup = () => {
    // Google OAuth integration
    window.open('http://localhost:8000/api/auth/google/signup/student', '_self');
  };

  const handleFacebookSignup = () => {
    // Facebook OAuth integration
    window.open('http://localhost:8000/api/auth/facebook/signup/student', '_self');
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
            <h1>Join as Student</h1>
            <p className="tagline">Start Your Learning Journey Today</p>
          </div>
          
          <div className="features-preview">
            <div className="feature-item">
              <GraduationCap size={24} />
              <div>
                <h4>Access Courses</h4>
                <p>Learn from expert instructors</p>
              </div>
            </div>
            <div className="feature-item">
              <UserCheck size={24} />
              <div>
                <h4>Track Progress</h4>
                <p>Monitor your academic growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Student Account</h2>
            <p>Join our learning community</p>
          </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className={focusedField === 'firstName' ? 'focused' : ''}>
                First Name *
              </label>
              <div className={`input-group ${focusedField === 'firstName' ? 'focused' : ''} ${formData.firstName ? 'has-value' : ''}`}>
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField('')}
                  placeholder="First name"
                  required
                />
                <div className="input-highlight"></div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className={focusedField === 'lastName' ? 'focused' : ''}>
                Last Name *
              </label>
              <div className={`input-group ${focusedField === 'lastName' ? 'focused' : ''} ${formData.lastName ? 'has-value' : ''}`}>
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Last name"
                  required
                />
                <div className="input-highlight"></div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className={focusedField === 'email' ? 'focused' : ''}>
              Email Address *
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
                placeholder="Enter your email"
                required
              />
              <div className="input-highlight"></div>
            </div>
          </div>

          {/* Student Specific Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth" className={focusedField === 'dateOfBirth' ? 'focused' : ''}>
                Date of Birth *
              </label>
              <div className={`input-group ${focusedField === 'dateOfBirth' ? 'focused' : ''} ${formData.dateOfBirth ? 'has-value' : ''}`}>
                <Calendar className="input-icon" size={20} />
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('dateOfBirth')}
                  onBlur={() => setFocusedField('')}
                  required
                />
                <div className="input-highlight"></div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="studentId" className={focusedField === 'studentId' ? 'focused' : ''}>
                Student ID
              </label>
              <div className={`input-group ${focusedField === 'studentId' ? 'focused' : ''} ${formData.studentId ? 'has-value' : ''}`}>
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('studentId')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Student ID (optional)"
                />
                <div className="input-highlight"></div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="grade" className={focusedField === 'grade' ? 'focused' : ''}>
                Grade/Level
              </label>
              <div className={`input-group ${focusedField === 'grade' ? 'focused' : ''} ${formData.grade ? 'has-value' : ''}`}>
                <GraduationCap className="input-icon" size={20} />
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('grade')}
                  onBlur={() => setFocusedField('')}
                >
                  <option value="">Select Grade</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                </select>
                <div className="input-highlight"></div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="school" className={focusedField === 'school' ? 'focused' : ''}>
                School/Institution
              </label>
              <div className={`input-group ${focusedField === 'school' ? 'focused' : ''} ${formData.school ? 'has-value' : ''}`}>
                <GraduationCap className="input-icon" size={20} />
                <input
                  type="text"
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('school')}
                  onBlur={() => setFocusedField('')}
                  placeholder="School name (optional)"
                />
                <div className="input-highlight"></div>
              </div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="form-group">
            <label htmlFor="password" className={focusedField === 'password' ? 'focused' : ''}>
              Password *
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
                placeholder="Create a strong password"
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
            <label htmlFor="confirmPassword" className={focusedField === 'confirmPassword' ? 'focused' : ''}>
              Confirm Password *
            </label>
            <div className={`input-group ${focusedField === 'confirmPassword' ? 'focused' : ''} ${formData.confirmPassword ? 'has-value' : ''}`}>
              <Lock className="input-icon" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField('')}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="input-highlight"></div>
            </div>
          </div>

          <button type="submit" className={`auth-button ${loading ? 'loading' : ''}`} disabled={loading}>
            <span className="button-content">
              <UserCheck size={20} />
              {loading ? 'Creating Account...' : 'Create Student Account'}
            </span>
            <div className="button-glow"></div>
            {loading && <div className="loading-spinner"></div>}
          </button>
        </form>

        {/* Social Signup */}
        <div className="social-login">
          <div className="divider">
            <span>OR</span>
          </div>
          
          <div className="social-buttons">
            <button 
              type="button" 
              className="social-button google"
              onClick={handleGoogleSignup}
            >
              <Chrome size={20} />
              Sign up with Google
            </button>
            
            <button 
              type="button" 
              className="social-button facebook"
              onClick={handleFacebookSignup}
            >
              <Facebook size={20} />
              Sign up with Facebook
            </button>
          </div>
        </div>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login/student" className="auth-link">
                Sign in as student
              </Link>
            </p>
            <p className="auth-switch">
              Are you a teacher?{' '}
              <Link to="/signup/teacher" className="auth-link">
                Teacher signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;
