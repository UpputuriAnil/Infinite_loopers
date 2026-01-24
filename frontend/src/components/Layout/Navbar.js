import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Award, 
  Plus, 
  LogOut, 
  User,
  GraduationCap,
  Bell,
  Settings,
  Trophy,
  Target,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Edit,
  Shield,
  BarChart3
} from 'lucide-react';
import NotificationCenter from '../Notifications/NotificationCenter';
import './Layout.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const teacherLinks = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/create-course', icon: Plus, label: 'Create Course' },
    { path: '/assignments', icon: FileText, label: 'Assignments' },
    { path: '/create-assignment', icon: Plus, label: 'Create Assignment' },
  ];

  const studentLinks = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/assignments', icon: FileText, label: 'Assignments' },
    { path: '/grades', icon: Award, label: 'My Grades' },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  // User dropdown menu items
  const userMenuItems = [
    {
      icon: User,
      label: 'My Profile',
      action: () => navigate('/profile'),
      description: 'View and edit your profile'
    },
    {
      icon: Trophy,
      label: 'Achievements',
      action: () => navigate('/achievements'),
      description: 'View your earned achievements'
    },
    {
      icon: Target,
      label: 'Learning Progress',
      action: () => navigate('/progress'),
      description: 'Track your learning journey'
    },
    {
      icon: Settings,
      label: 'Account Settings',
      action: () => navigate('/settings'),
      description: 'Manage your account preferences'
    },
    ...(user?.role === 'teacher' ? [
      {
        icon: BarChart3,
        label: 'Analytics',
        action: () => navigate('/analytics'),
        description: 'View teaching analytics'
      },
      {
        icon: Shield,
        label: 'Course Management',
        action: () => navigate('/manage-courses'),
        description: 'Manage your courses'
      }
    ] : [
      {
        icon: MessageSquare,
        label: 'Discussion Forums',
        action: () => navigate('/forums'),
        description: 'Join course discussions'
      },
      {
        icon: Award,
        label: 'Certificates',
        action: () => navigate('/certificates'),
        description: 'View your certificates'
      }
    ]),
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => navigate('/help'),
      description: 'Get help and support'
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      action: handleLogout,
      description: 'Sign out of your account',
      className: 'logout-item'
    }
  ];

  const handleUserMenuClick = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifications(false); // Close notifications if open
  };

  const handleMenuItemClick = (action) => {
    action();
    setShowUserDropdown(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-dropdown-container')) {
      setShowUserDropdown(false);
    }
  };

  React.useEffect(() => {
    if (showUserDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserDropdown]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <GraduationCap size={32} />
          <span>EDUFLOW</span>
        </div>

        <div className="navbar-links">
          {links.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`navbar-link ${isActive(path) ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="notification-bell"
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          <div className="user-dropdown-container">
            <button 
              onClick={handleUserMenuClick}
              className={`user-info clickable ${showUserDropdown ? 'active' : ''}`}
            >
              <User size={20} />
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <ChevronDown 
                size={16} 
                className={`dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`}
              />
            </button>
            
            {showUserDropdown && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-avatar">
                    <User size={24} />
                  </div>
                  <div className="user-info-dropdown">
                    <div className="user-name-large">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                    <div className="user-role-badge">{user?.role}</div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <div className="dropdown-items">
                  {userMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleMenuItemClick(item.action)}
                        className={`dropdown-item ${item.className || ''}`}
                      >
                        <div className="item-icon">
                          <Icon size={18} />
                        </div>
                        <div className="item-content">
                          <div className="item-label">{item.label}</div>
                          <div className="item-description">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <NotificationCenter 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      </div>
    </nav>
  );
};

export default Navbar;
