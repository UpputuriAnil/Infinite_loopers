import React, { useState } from 'react';
import { 
  Settings, Lock, Bell, Globe, Moon, Sun, Mail, 
  Shield, Key, Trash2, Save, Eye, EyeOff 
} from 'lucide-react';
import './AccountSettings.css';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('preferences');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Preferences State
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dailyGoal: 120,
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      courseUpdates: true,
      assignmentReminders: true,
      forumReplies: true
    }
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePreferenceChange = (category, field, value) => {
    if (category) {
      setPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      setMessage('Preferences saved successfully!');
    } catch (error) {
      setMessage('Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage('New passwords do not match!');
      return;
    }

    if (securityData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In production: await axios.put('/api/auth/change-password', securityData)
      setMessage('Password changed successfully!');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion would be processed here.');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your account preferences and security</p>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="settings-content">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Settings size={20} />
            Preferences
          </button>
          <button
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            Notifications
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={20} />
            Security
          </button>
          <button
            className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={20} />
            Privacy
          </button>
        </div>

        {/* Settings Panel */}
        <div className="settings-panel">
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>General Preferences</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <Globe size={20} />
                  <div>
                    <h3>Language</h3>
                    <p>Choose your preferred language</p>
                  </div>
                </div>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange(null, 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <Globe size={20} />
                  <div>
                    <h3>Timezone</h3>
                    <p>Select your timezone</p>
                  </div>
                </div>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange(null, 'timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="IST">India Standard Time (IST)</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  {preferences.theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                  <div>
                    <h3>Theme</h3>
                    <p>Choose light or dark theme</p>
                  </div>
                </div>
                <div className="theme-toggle">
                  <button
                    className={preferences.theme === 'light' ? 'active' : ''}
                    onClick={() => handlePreferenceChange(null, 'theme', 'light')}
                  >
                    <Sun size={16} />
                    Light
                  </button>
                  <button
                    className={preferences.theme === 'dark' ? 'active' : ''}
                    onClick={() => handlePreferenceChange(null, 'theme', 'dark')}
                  >
                    <Moon size={16} />
                    Dark
                  </button>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <Settings size={20} />
                  <div>
                    <h3>Daily Learning Goal</h3>
                    <p>Minutes per day: {preferences.dailyGoal}</p>
                  </div>
                </div>
                <input
                  type="range"
                  min="30"
                  max="480"
                  step="30"
                  value={preferences.dailyGoal}
                  onChange={(e) => handlePreferenceChange(null, 'dailyGoal', parseInt(e.target.value))}
                  className="range-slider"
                />
              </div>

              <button onClick={handleSavePreferences} className="save-button" disabled={loading}>
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              
              <div className="toggle-item">
                <div className="toggle-label">
                  <Mail size={20} />
                  <div>
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <Bell size={20} />
                  <div>
                    <h3>Push Notifications</h3>
                    <p>Receive browser push notifications</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <Settings size={20} />
                  <div>
                    <h3>Course Updates</h3>
                    <p>Get notified about course changes</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.courseUpdates}
                    onChange={(e) => handlePreferenceChange('notifications', 'courseUpdates', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <Bell size={20} />
                  <div>
                    <h3>Assignment Reminders</h3>
                    <p>Reminders for upcoming deadlines</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.assignmentReminders}
                    onChange={(e) => handlePreferenceChange('notifications', 'assignmentReminders', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-label">
                  <Mail size={20} />
                  <div>
                    <h3>Forum Replies</h3>
                    <p>Notifications for forum responses</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.forumReplies}
                    onChange={(e) => handlePreferenceChange('notifications', 'forumReplies', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <button onClick={handleSavePreferences} className="save-button" disabled={loading}>
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <form onSubmit={handleChangePassword} className="security-form">
                <div className="form-group">
                  <label>
                    <Key size={16} />
                    Current Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={16} />
                    New Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={16} />
                    Confirm New Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="save-button" disabled={loading}>
                  <Lock size={16} />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Data</h2>
              
              <div className="info-box">
                <Shield size={24} />
                <div>
                  <h3>Your Data is Protected</h3>
                  <p>We take your privacy seriously and use industry-standard encryption to protect your data.</p>
                </div>
              </div>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <div className="danger-item">
                  <div>
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                  </div>
                  <button onClick={handleDeleteAccount} className="danger-button">
                    <Trash2 size={16} />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
