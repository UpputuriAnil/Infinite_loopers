import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, BookOpen, FileText, X, MessageCircle, FolderOpen } from 'lucide-react';
import './FloatingAction.css';

const FloatingActionButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Hide FAB on login/register pages
  useEffect(() => {
    const hiddenPaths = ['/login', '/register'];
    setIsVisible(!hiddenPaths.includes(location.pathname));
  }, [location.pathname]);

  if (!user || !isVisible) return null;

  const teacherActions = [
    {
      icon: BookOpen,
      label: 'Create Course',
      action: () => navigate('/create-course'),
      color: '#667eea'
    },
    {
      icon: FileText,
      label: 'Create Assignment',
      action: () => navigate('/create-assignment'),
      color: '#8b5cf6'
    },
    {
      icon: MessageCircle,
      label: 'View Discussions',
      action: () => navigate('/courses'),
      color: '#10b981'
    }
  ];

  const studentActions = [
    {
      icon: BookOpen,
      label: 'Browse Courses',
      action: () => navigate('/courses'),
      color: '#667eea'
    },
    {
      icon: FileText,
      label: 'View Assignments',
      action: () => navigate('/assignments'),
      color: '#8b5cf6'
    },
    {
      icon: FolderOpen,
      label: 'Course Materials',
      action: () => navigate('/courses'),
      color: '#f59e0b'
    }
  ];

  const actions = user.role === 'teacher' ? teacherActions : studentActions;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (actionFn) => {
    actionFn();
    setIsOpen(false);
  };

  return (
    <div className={`fab-container ${isOpen ? 'open' : ''}`}>
      {/* Action Items */}
      <div className="fab-actions">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <div
              key={index}
              className="fab-action"
              style={{
                '--delay': `${index * 0.1}s`,
                '--color': action.color
              }}
              onClick={() => handleAction(action.action)}
            >
              <div className="fab-action-button">
                <IconComponent size={20} />
              </div>
              <span className="fab-action-label">{action.label}</span>
            </div>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button className="fab-main" onClick={toggleMenu}>
        <div className="fab-icon">
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </div>
        <div className="fab-ripple"></div>
      </button>

      {/* Backdrop */}
      {isOpen && <div className="fab-backdrop" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default FloatingActionButton;
