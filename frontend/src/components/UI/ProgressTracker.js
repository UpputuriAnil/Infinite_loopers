import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Trophy, Target, TrendingUp } from 'lucide-react';
import './ProgressTracker.css';

const ProgressTracker = ({ 
  courses = [], 
  assignments = [], 
  overallProgress = 0,
  showDetailed = true 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 500);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  const calculateCourseProgress = (course) => {
    if (!course.totalLessons) return 0;
    return Math.round((course.completedLessons / course.totalLessons) * 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 60) return '#f59e0b';
    if (progress >= 40) return '#3b82f6';
    return '#ec4899';
  };

  const getProgressIcon = (progress) => {
    if (progress === 100) return CheckCircle;
    if (progress > 0) return Clock;
    return Circle;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'courses', label: 'Courses', icon: TrendingUp },
    { id: 'achievements', label: 'Achievements', icon: Trophy }
  ];

  const achievements = [
    { id: 1, title: 'First Course', description: 'Complete your first course', earned: true },
    { id: 2, title: 'Assignment Master', description: 'Submit 10 assignments', earned: true },
    { id: 3, title: 'Discussion Leader', description: 'Participate in 5 discussions', earned: false },
    { id: 4, title: 'Perfect Score', description: 'Get 100% on an assignment', earned: true },
    { id: 5, title: 'Consistent Learner', description: 'Study for 7 days straight', earned: false }
  ];

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <div className="progress-title">
          <h3>Learning Progress</h3>
          <p>Track your academic journey</p>
        </div>
        
        <div className="overall-progress">
          <div className="progress-circle">
            <svg viewBox="0 0 100 100" className="progress-ring">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-ring-background"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-ring-progress"
                style={{
                  strokeDasharray: `${animatedProgress * 2.827} 282.7`,
                  stroke: getProgressColor(animatedProgress)
                }}
              />
            </svg>
            <div className="progress-text">
              <span className="progress-number">{Math.round(animatedProgress)}%</span>
              <span className="progress-label">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {showDetailed && (
        <>
          <div className="progress-tabs">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`progress-tab ${selectedTab === tab.id ? 'active' : ''}`}
                  onClick={() => setSelectedTab(tab.id)}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="progress-content">
            {selectedTab === 'overview' && (
              <div className="overview-content">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-icon courses">
                      <Target size={20} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-number">{courses.length}</span>
                      <span className="stat-label">Active Courses</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon assignments">
                      <CheckCircle size={20} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-number">{assignments.filter(a => a.completed).length}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon pending">
                      <Clock size={20} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-number">{assignments.filter(a => !a.completed).length}</span>
                      <span className="stat-label">Pending</span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-icon achievements">
                      <Trophy size={20} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-number">{achievements.filter(a => a.earned).length}</span>
                      <span className="stat-label">Achievements</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'courses' && (
              <div className="courses-content">
                {courses.map(course => {
                  const progress = calculateCourseProgress(course);
                  const ProgressIcon = getProgressIcon(progress);
                  
                  return (
                    <div key={course.id} className="course-progress-item">
                      <div className="course-icon">
                        <ProgressIcon 
                          size={20} 
                          color={getProgressColor(progress)}
                        />
                      </div>
                      
                      <div className="course-details">
                        <h4>{course.title}</h4>
                        <p>{course.completedLessons} of {course.totalLessons} lessons completed</p>
                        
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: getProgressColor(progress)
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="course-progress-text">
                        {progress}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedTab === 'achievements' && (
              <div className="achievements-content">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`achievement-item ${achievement.earned ? 'earned' : 'locked'}`}
                  >
                    <div className="achievement-icon">
                      <Trophy 
                        size={24} 
                        color={achievement.earned ? '#f59e0b' : '#9ca3af'}
                      />
                    </div>
                    
                    <div className="achievement-details">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                    </div>
                    
                    {achievement.earned && (
                      <div className="achievement-badge">
                        <CheckCircle size={16} color="#10b981" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
    </div>
  );
};

export default ProgressTracker;
