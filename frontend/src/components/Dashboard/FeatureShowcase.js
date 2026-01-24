import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  FileText, 
  MessageCircle, 
  FolderOpen, 
  Award, 
  Users,
  Bell,
  Upload,
  CheckCircle,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import './Dashboard.css';

const FeatureShowcase = () => {
  const { user } = useAuth();

  const teacherFeatures = [
    {
      icon: BookOpen,
      title: 'Course Management',
      description: 'Create and manage courses with detailed descriptions and enrollment tracking',
      link: '/courses',
      color: 'blue',
      stats: 'Create unlimited courses'
    },
    {
      icon: FileText,
      title: 'Assignment System',
      description: 'Create assignments, track submissions, and provide detailed feedback',
      link: '/assignments',
      color: 'purple',
      stats: 'Grade with ease'
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Track student enrollment, progress, and performance across all courses',
      link: '/courses',
      color: 'green',
      stats: 'Monitor progress'
    },
    {
      icon: MessageCircle,
      title: 'Discussion Forums',
      description: 'Foster collaboration with course-specific discussion forums',
      link: '/courses',
      color: 'orange',
      stats: 'Engage students'
    },
    {
      icon: FolderOpen,
      title: 'Course Materials',
      description: 'Upload and share PDFs, presentations, videos, and other resources',
      link: '/courses',
      color: 'indigo',
      stats: 'Share resources'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay updated with assignment submissions and student activities',
      link: '#',
      color: 'red',
      stats: 'Real-time updates'
    }
  ];

  const studentFeatures = [
    {
      icon: BookOpen,
      title: 'Course Enrollment',
      description: 'Browse and enroll in available courses to start your learning journey',
      link: '/courses',
      color: 'blue',
      stats: 'Unlimited access'
    },
    {
      icon: FileText,
      title: 'Assignment Submission',
      description: 'Submit assignments with file attachments and track your progress',
      link: '/assignments',
      color: 'purple',
      stats: 'Easy submissions'
    },
    {
      icon: Award,
      title: 'Grade Tracking',
      description: 'View your grades, feedback, and overall academic performance',
      link: '/grades',
      color: 'green',
      stats: 'Track progress'
    },
    {
      icon: MessageCircle,
      title: 'Discussion Forums',
      description: 'Participate in course discussions and collaborate with peers',
      link: '/courses',
      color: 'orange',
      stats: 'Join discussions'
    },
    {
      icon: FolderOpen,
      title: 'Course Materials',
      description: 'Access and download course materials, presentations, and resources',
      link: '/courses',
      color: 'indigo',
      stats: 'Download resources'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Get notified about new assignments, grades, and course updates',
      link: '#',
      color: 'red',
      stats: 'Stay informed'
    }
  ];

  const features = user?.role === 'teacher' ? teacherFeatures : studentFeatures;

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="feature-showcase">
      <div className="showcase-header">
        <h2>
          {user?.role === 'teacher' ? '🎓 Teacher Dashboard' : '📚 Student Dashboard'}
        </h2>
        <p>
          {user?.role === 'teacher' 
            ? 'Manage your courses, assignments, and students with powerful tools'
            : 'Access your courses, submit assignments, and track your academic progress'
          }
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Link
              key={index}
              to={feature.link}
              className="feature-card animated-card fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-header">
                <div className={`feature-icon ${feature.color}`}>
                  <IconComponent size={24} />
                </div>
                <div className="feature-badge">
                  <Star size={12} />
                  <span>{feature.stats}</span>
                </div>
              </div>
              
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              
              <div className="feature-action">
                <span>Explore →</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="showcase-footer">
        <div className="quick-stats">
          <div className="quick-stat">
            <TrendingUp size={20} />
            <div>
              <span className="stat-number">100%</span>
              <span className="stat-label">Feature Complete</span>
            </div>
          </div>
          <div className="quick-stat">
            <CheckCircle size={20} />
            <div>
              <span className="stat-number">6+</span>
              <span className="stat-label">Core Features</span>
            </div>
          </div>
          <div className="quick-stat">
            <Calendar size={20} />
            <div>
              <span className="stat-number">24/7</span>
              <span className="stat-label">Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
