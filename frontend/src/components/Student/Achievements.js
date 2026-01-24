import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Trophy, 
  Award, 
  Star, 
  Target,
  BookOpen,
  Flame,
  Calendar,
  CheckCircle
} from 'lucide-react';

const Achievements = () => {
  const { user } = useAuth();
  const { getLearningStats, getOverallProgress } = useData();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'student') {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = () => {
    try {
      const learningStats = getLearningStats();
      const overallProgress = getOverallProgress();
      
      setStats({ ...learningStats, ...overallProgress });
      setAchievements(learningStats?.achievements || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const allPossibleAchievements = [
    {
      type: 'first_completion',
      title: 'First Course Completed!',
      icon: '🎉',
      description: 'Complete your first course',
      requirement: 'Complete 1 course',
      earned: achievements.some(a => a.type === 'first_completion')
    },
    {
      type: 'triple_completion',
      title: 'Course Master',
      icon: '🏆',
      description: 'Complete 3 or more courses',
      requirement: 'Complete 3 courses',
      earned: achievements.some(a => a.type === 'triple_completion')
    },
    {
      type: 'halfway_hero',
      title: 'Halfway Hero',
      icon: '⭐',
      description: 'Reach 50% average progress',
      requirement: '50% average progress',
      earned: achievements.some(a => a.type === 'halfway_hero')
    },
    {
      type: 'week_streak',
      title: 'Week Warrior',
      icon: '🔥',
      description: 'Maintain a 7-day learning streak',
      requirement: '7-day streak',
      earned: achievements.some(a => a.type === 'week_streak')
    },
    {
      type: 'course_collector',
      title: 'Course Collector',
      icon: '📚',
      description: 'Enroll in 5 or more courses',
      requirement: 'Enroll in 5 courses',
      earned: achievements.some(a => a.type === 'course_collector')
    }
  ];

  const earnedAchievements = allPossibleAchievements.filter(a => a.earned);
  const lockedAchievements = allPossibleAchievements.filter(a => !a.earned);

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <div className="header-content">
          <Trophy size={32} />
          <div>
            <h1>Achievements</h1>
            <p>Track your learning milestones and accomplishments</p>
          </div>
        </div>
        <div className="achievement-stats">
          <div className="stat-item">
            <Award size={20} />
            <span>{earnedAchievements.length} / {allPossibleAchievements.length} Earned</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {stats && (
        <div className="progress-summary">
          <h2>Your Progress</h2>
          <div className="progress-cards">
            <div className="progress-card">
              <BookOpen size={24} />
              <div className="progress-info">
                <div className="progress-number">{stats.completedCourses || 0}</div>
                <div className="progress-label">Courses Completed</div>
              </div>
            </div>
            <div className="progress-card">
              <Target size={24} />
              <div className="progress-info">
                <div className="progress-number">{stats.averageProgress || 0}%</div>
                <div className="progress-label">Average Progress</div>
              </div>
            </div>
            <div className="progress-card">
              <Flame size={24} />
              <div className="progress-info">
                <div className="progress-number">{stats.currentStreak || 0}</div>
                <div className="progress-label">Day Streak</div>
              </div>
            </div>
            <div className="progress-card">
              <Calendar size={24} />
              <div className="progress-info">
                <div className="progress-number">{stats.totalActiveDays || 0}</div>
                <div className="progress-label">Active Days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="achievements-section">
          <h2>Earned Achievements ({earnedAchievements.length})</h2>
          <div className="achievements-grid">
            {earnedAchievements.map((achievement, index) => (
              <div key={index} className="achievement-card earned">
                <div className="achievement-icon earned-icon">
                  {achievement.icon}
                </div>
                <div className="achievement-content">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-requirement">
                    <CheckCircle size={16} />
                    <span>{achievement.requirement}</span>
                  </div>
                </div>
                <div className="earned-badge">
                  <Trophy size={16} />
                  <span>Earned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="achievements-section">
          <h2>Locked Achievements ({lockedAchievements.length})</h2>
          <div className="achievements-grid">
            {lockedAchievements.map((achievement, index) => (
              <div key={index} className="achievement-card locked">
                <div className="achievement-icon locked-icon">
                  {achievement.icon}
                </div>
                <div className="achievement-content">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-requirement">
                    <Target size={16} />
                    <span>{achievement.requirement}</span>
                  </div>
                </div>
                <div className="locked-badge">
                  <span>Locked</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnedAchievements.length === 0 && (
        <div className="no-achievements">
          <Trophy size={64} />
          <h3>No Achievements Yet</h3>
          <p>Start learning and completing courses to earn your first achievement!</p>
        </div>
      )}
    </div>
  );
};

export default Achievements;
