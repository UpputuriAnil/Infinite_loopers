import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Mail } from 'lucide-react';
import './Auth.css';

const AdminSignup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/contact-admin');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="auth-container admin-theme">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-card admin-card">
          <div className="auth-header">
            <div className="icon-wrapper">
              <Shield size={48} className="admin-icon" />
            </div>
            <h2>Admin Account Access</h2>
            <p>Administrator accounts are created by existing administrators only</p>
          </div>
          
          <div className="admin-notice">
            <div className="notice-item">
              <AlertCircle size={24} className="notice-icon" />
              <div>
                <h3>Restricted Access</h3>
                <p>For security reasons, administrator accounts cannot be created through public signup.</p>
              </div>
            </div>
          </div>

          <div className="contact-info">
            <h3>How to Get Admin Access</h3>
            <div className="contact-steps">
              <div className="step">
                <Mail size={20} />
                <span>Contact your system administrator</span>
              </div>
              <div className="step">
                <Shield size={20} />
                <span>Request admin privileges</span>
              </div>
              <div className="step">
                <AlertCircle size={20} />
                <span>Complete verification process</span>
              </div>
            </div>
          </div>

          <div className="redirect-notice">
            <p>You will be automatically redirected to the contact page in 5 seconds...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="auth-footer">
            <button 
              onClick={() => navigate('/login/admin')} 
              className="auth-link-button"
            >
              Back to Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
