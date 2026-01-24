import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Target,
  CheckCircle,
  Trophy
} from 'lucide-react';

const LearningProgress = () => {
  const { user } = useAuth();
  const { getOverallProgress, getLearningStats } = useData();
  const [progressData, setProgressData] = useState(null);
  const [learningStats, setLearningStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role === 'student') {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = () => {
    try {
      const overall = getOverallProgress();
      const stats = getLearningStats();
      
      setProgressData(overall);
      setLearningStats(stats);
      
      console.log('Learning Progress Data:', overall);
      console.log('Learning Stats:', stats);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="learning-progress-loading">
        <div className="loading">Loading progress...</div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="learning-progress-empty">
        <BookOpen size={48} />
        <h3>Start Your Learning Journey</h3>
        <p>Enroll in courses to track your progress</p>
      </div>
    );
  }

  return (
    <div className="learning-progress">
      {/* Progress Header with Circular Progress */}
      <div className="progress-main-header">
        <div className="progress-info-section">
          <h2>Learning Progress</h2>
          <p>Track your academic journey</p>
        </div>
        <div className="circular-progress-container">
          <div className="circular-progress" style={{
            background: `conic-gradient(#f59e0b 0deg ${(progressData.overallProgress / 100) * 360}deg, #e5e7eb ${(progressData.overallProgress / 100) * 360}deg 360deg)`
          }}>
            <div className="progress-inner">
              <span className="progress-percentage">{progressData.overallProgress}%</span>
              <span className="progress-label">COMPLETE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="progress-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Target size={16} />
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={16} />
          Courses
        </button>
        <button 
          className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Trophy size={16} />
          Achievements
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Course Status Cards */}
            <div className="course-status-grid">
              <div className="status-card active-courses">
                <div className="status-icon">
                  <div className="icon-circle active">
                    <Target size={24} />
                  </div>
                </div>
                <div className="status-info">
                  <div className="status-number">{progressData.inProgressCourses}</div>
                  <div className="status-label">ACTIVE COURSES</div>
                </div>
              </div>
              
              <div className="status-card completed-courses">
                <div className="status-icon">
                  <div className="icon-circle completed">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <div className="status-info">
                  <div className="status-number">{progressData.completedCourses}</div>
                  <div className="status-label">COMPLETED</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-content">
            {progressData.coursesProgress.length > 0 ? (
              <div className="courses-list">
                {progressData.coursesProgress.map((course) => (
                  <div key={course.courseId} className={`course-item ${course.progress >= 100 ? 'completed' : course.progress > 0 ? 'active' : 'not-started'}`}>
                    <div className="course-icon-wrapper">
                      <div className={`course-icon ${course.progress >= 100 ? 'completed' : course.progress > 0 ? 'active' : 'not-started'}`}>
                        {course.progress >= 100 ? <CheckCircle size={20} /> : <BookOpen size={20} />}
                      </div>
                    </div>
                    <div className="course-details">
                      <h4>{course.courseTitle}</h4>
                      <div className="course-progress-bar">
                        <div className="progress-track">
                          <div 
                            className={`progress-fill ${course.progress >= 100 ? 'completed' : 'active'}`} 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{course.progress}%</span>
                      </div>
                      <div className="course-meta">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        {course.progress >= 100 && <span className="completed-badge">✓ Completed</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-courses">
                <BookOpen size={48} />
                <h3>No Courses Enrolled</h3>
                <p>Enroll in courses to track your progress here!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-content">
            {learningStats?.achievements?.length > 0 ? (
              <div className="achievements-grid">
                {learningStats.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card earned">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-title">{achievement.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-achievements">
                <Trophy size={48} />
                <h3>No Achievements Yet</h3>
                <p>Complete courses and maintain learning streaks to earn achievements!</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default LearningProgress;
