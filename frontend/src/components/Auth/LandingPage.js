import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Shield, ArrowRight, Users, Award, BarChart3, Lock } from 'lucide-react';
import './Auth.css';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const userTypes = [
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      description: 'Access courses, submit assignments, and track your learning progress',
      features: ['Browse and enroll in courses', 'Submit assignments', 'View grades and feedback', 'Track progress'],
      color: 'student-theme',
      loginPath: '/login/student',
      signupPath: '/signup/student'
    },
    {
      id: 'teacher',
      title: 'Teacher/Educator',
      icon: BookOpen,
      description: 'Create courses, manage assignments, and monitor student performance',
      features: ['Create and manage courses', 'Grade assignments', 'Track student progress', 'Share materials'],
      color: 'teacher-theme',
      loginPath: '/login/teacher',
      signupPath: '/signup/teacher'
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: Shield,
      description: 'Manage the entire system, users, and platform settings',
      features: ['User management', 'System configuration', 'Analytics and reports', 'Platform oversight'],
      color: 'admin-theme',
      loginPath: '/login/admin',
      signupPath: '/signup/admin'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = (role) => {
    navigate(role.loginPath);
  };

  const handleSignup = (role) => {
    navigate(role.signupPath);
  };

  return (
    <div className="landing-container">
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

      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <GraduationCap size={40} />
            </div>
            <h1>Infinite Loopers</h1>
          </div>
          <div className="header-nav">
            <Link to="/login" className="nav-link">Quick Login</Link>
            <Link to="/signup" className="nav-link">Quick Signup</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">Infinite Loopers</span>
          </h1>
          <p className="hero-subtitle">
            Choose your role to get started with our comprehensive Learning Management System
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <Users size={24} />
              <span>10,000+ Students</span>
            </div>
            <div className="stat-item">
              <BookOpen size={24} />
              <span>500+ Courses</span>
            </div>
            <div className="stat-item">
              <Award size={24} />
              <span>100+ Educators</span>
            </div>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="role-selection">
        <div className="role-grid">
          {userTypes.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''} ${role.color}`}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="role-header">
                  <div className="role-icon">
                    <Icon size={48} />
                  </div>
                  <h2>{role.title}</h2>
                  <p>{role.description}</p>
                </div>
                
                <div className="role-features">
                  <h3>What you can do:</h3>
                  <ul>
                    {role.features.map((feature, index) => (
                      <li key={index}>
                        <ArrowRight size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="role-actions">
                  <button
                    className="action-button primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogin(role);
                    }}
                  >
                    Login as {role.title}
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSignup(role);
                    }}
                  >
                    Sign up as {role.title}
                  </button>
                </div>

                {role.id === 'admin' && (
                  <div className="admin-notice">
                    <Lock size={16} />
                    <span>Admin accounts require authorization</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Overview */}
      <section className="features-overview">
        <div className="features-content">
          <h2>Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <BarChart3 size={32} />
              <h3>Analytics</h3>
              <p>Track progress and performance with detailed analytics</p>
            </div>
            <div className="feature-card">
              <Users size={32} />
              <h3>Collaboration</h3>
              <p>Connect with peers and instructors in real-time</p>
            </div>
            <div className="feature-card">
              <Shield size={32} />
              <h3>Security</h3>
              <p>Enterprise-grade security for all user data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>&copy; 2024 Infinite Loopers. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
