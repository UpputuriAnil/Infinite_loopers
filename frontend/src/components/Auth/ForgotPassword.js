import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email
      });

      if (response.data.success) {
        setIsSuccess(true);
        setMessage(response.data.message);
        
        // In development, show the reset token
        if (response.data.resetToken) {
          setMessage(prev => prev + ` Reset token (for development): ${response.data.resetToken}`);
        }
      } else {
        setError(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Forgot Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password</p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button type="submit" className={`auth-button ${loading ? 'loading' : ''}`} disabled={loading}>
                <span className="button-content">
                  <Mail size={20} />
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </span>
                {loading && <div className="loading-spinner"></div>}
              </button>
            </form>
          ) : (
            <div className="success-message">
              <CheckCircle size={48} />
              <h3>Check Your Email</h3>
              <p>{message}</p>
            </div>
          )}

          <div className="auth-footer">
            <Link to="/login" className="auth-link">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
