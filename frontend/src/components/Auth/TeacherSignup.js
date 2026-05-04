import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Briefcase, BookOpen, Eye, EyeOff, UserCheck, FileText, Award } from 'lucide-react';
import './Auth.css';

const TeacherSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    institution: '',
    department: '',
    subject: '',
    experience: '',
    qualification: '',
    employeeId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [termsAccepted, setTermsAccepted] = useState(false);
  
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

    if (!formData.institution || !formData.subject || !formData.qualification) {
      setError('Please fill in professional information');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    const registerData = { 
      ...formData,
      role: 'teacher',
      name: `${formData.firstName} ${formData.lastName}`,
      status: 'pending' // Teachers need verification
    };

    const result = await register(registerData);
    
    if (result.success) {
      navigate('/teacher/verification-pending');
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
            <h1>Become an Educator</h1>
            <p className="tagline">Share Your Knowledge with the World</p>
          </div>
          
          <div className="features-preview">
            <div className="feature-item">
              <BookOpen size={24} />
              <div>
                <h4>Create Courses</h4>
                <p>Design engaging learning experiences</p>
              </div>
            </div>
            <div className="feature-item">
              <Award size={24} />
              <div>
                <h4>Get Verified</h4>
                <p>Build trust with students</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="auth-form-section">
        <div className="auth-card teacher-card">
          <div className="auth-header">
            <h2>Teacher Application</h2>
            <p>Join our community of educators</p>
          </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
            
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className={focusedField === 'email' ? 'focused' : ''}>
                  Institutional Email *
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
                    placeholder="your@institution.edu"
                    required
                  />
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber" className={focusedField === 'phoneNumber' ? 'focused' : ''}>
                  Phone Number
                </label>
                <div className={`input-group ${focusedField === 'phoneNumber' ? 'focused' : ''} ${formData.phoneNumber ? 'has-value' : ''}`}>
                  <User className="input-icon" size={20} />
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('phoneNumber')}
                    onBlur={() => setFocusedField('')}
                    placeholder="+1 (555) 123-4567"
                  />
                  <div className="input-highlight"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="form-section">
            <h3>Professional Information</h3>
            
            <div className="form-group">
              <label htmlFor="institution" className={focusedField === 'institution' ? 'focused' : ''}>
                Institution/Organization *
              </label>
              <div className={`input-group ${focusedField === 'institution' ? 'focused' : ''} ${formData.institution ? 'has-value' : ''}`}>
                <Briefcase className="input-icon" size={20} />
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('institution')}
                  onBlur={() => setFocusedField('')}
                  placeholder="University/School name"
                  required
                />
                <div className="input-highlight"></div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department" className={focusedField === 'department' ? 'focused' : ''}>
                  Department
                </label>
                <div className={`input-group ${focusedField === 'department' ? 'focused' : ''} ${formData.department ? 'has-value' : ''}`}>
                  <BookOpen className="input-icon" size={20} />
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('department')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Computer Science, Mathematics, etc."
                  />
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject" className={focusedField === 'subject' ? 'focused' : ''}>
                  Primary Subject *
                </label>
                <div className={`input-group ${focusedField === 'subject' ? 'focused' : ''} ${formData.subject ? 'has-value' : ''}`}>
                  <BookOpen className="input-icon" size={20} />
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField('')}
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business</option>
                    <option value="arts">Arts & Design</option>
                    <option value="languages">Languages</option>
                    <option value="social-sciences">Social Sciences</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="input-highlight"></div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience" className={focusedField === 'experience' ? 'focused' : ''}>
                  Years of Experience
                </label>
                <div className={`input-group ${focusedField === 'experience' ? 'focused' : ''} ${formData.experience ? 'has-value' : ''}`}>
                  <Award className="input-icon" size={20} />
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('experience')}
                    onBlur={() => setFocusedField('')}
                  >
                    <option value="">Select Experience</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="11-15">11-15 years</option>
                    <option value="15+">15+ years</option>
                  </select>
                  <div className="input-highlight"></div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="qualification" className={focusedField === 'qualification' ? 'focused' : ''}>
                  Highest Qualification *
                </label>
                <div className={`input-group ${focusedField === 'qualification' ? 'focused' : ''} ${formData.qualification ? 'has-value' : ''}`}>
                  <Award className="input-icon" size={20} />
                  <select
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('qualification')}
                    onBlur={() => setFocusedField('')}
                    required
                  >
                    <option value="">Select Qualification</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD/Doctorate</option>
                    <option value="postdoc">Post-Doctorate</option>
                  </select>
                  <div className="input-highlight"></div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="employeeId" className={focusedField === 'employeeId' ? 'focused' : ''}>
                Employee ID (Optional)
              </label>
              <div className={`input-group ${focusedField === 'employeeId' ? 'focused' : ''} ${formData.employeeId ? 'has-value' : ''}`}>
                <FileText className="input-icon" size={20} />
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('employeeId')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Institution employee ID"
                />
                <div className="input-highlight"></div>
              </div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="form-section">
            <h3>Account Security</h3>
            
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
          </div>

          {/* Terms and Conditions */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              I agree to the <Link to="/terms" className="auth-link">Terms of Service</Link> and <Link to="/privacy" className="auth-link">Privacy Policy</Link>. I understand that my account will be subject to verification.
            </label>
          </div>

          <button type="submit" className={`auth-button teacher-button ${loading ? 'loading' : ''}`} disabled={loading}>
            <span className="button-content">
              <UserCheck size={20} />
              {loading ? 'Submitting Application...' : 'Submit Teacher Application'}
            </span>
            <div className="button-glow"></div>
            {loading && <div className="loading-spinner"></div>}
          </button>
        </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login/teacher" className="auth-link">
                Sign in as teacher
              </Link>
            </p>
            <p className="auth-switch">
              Are you a student?{' '}
              <Link to="/signup/student" className="auth-link">
                Student signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSignup;
