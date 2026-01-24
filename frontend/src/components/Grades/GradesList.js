import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import './Grades.css';

const GradesList = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    gradedAssignments: 0,
    averageGrade: 0,
    totalPoints: 0,
    earnedPoints: 0
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get('/api/grades');
      const gradesData = response.data.grades || [];
      setGrades(gradesData);
      
      // Calculate statistics
      const totalAssignments = gradesData.length;
      const gradedAssignments = gradesData.filter(g => g.grade !== undefined).length;
      const totalPoints = gradesData.reduce((sum, g) => sum + (g.assignment?.maxPoints || 0), 0);
      const earnedPoints = gradesData.reduce((sum, g) => sum + (g.grade || 0), 0);
      const averageGrade = gradedAssignments > 0 ? (earnedPoints / gradedAssignments) : 0;
      
      setStats({
        totalAssignments,
        gradedAssignments,
        averageGrade: Math.round(averageGrade * 100) / 100,
        totalPoints,
        earnedPoints
      });
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradePercentage = (grade, maxPoints) => {
    if (!grade || !maxPoints) return 0;
    return Math.round((grade / maxPoints) * 100);
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 70) return 'average';
    if (percentage >= 60) return 'below-average';
    return 'poor';
  };

  if (loading) {
    return (
      <div className="grades-container">
        <div className="loading">Loading grades...</div>
      </div>
    );
  }

  return (
    <div className="grades-container">
      <div className="grades-header">
        <h1>My Grades</h1>
        <p>Track your academic performance across all courses</p>
      </div>

      <div className="grades-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAssignments}</h3>
            <p>Total Assignments</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.gradedAssignments}</h3>
            <p>Graded</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.averageGrade}</h3>
            <p>Average Grade</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.earnedPoints}/{stats.totalPoints}</h3>
            <p>Total Points</p>
          </div>
        </div>
      </div>

      {grades.length > 0 ? (
        <div className="grades-list">
          <div className="grades-table">
            <div className="table-header">
              <div className="header-cell">Assignment</div>
              <div className="header-cell">Course</div>
              <div className="header-cell">Due Date</div>
              <div className="header-cell">Grade</div>
              <div className="header-cell">Percentage</div>
              <div className="header-cell">Letter</div>
            </div>
            
            {grades.map((gradeItem) => {
              const percentage = getGradePercentage(gradeItem.grade, gradeItem.assignment?.maxPoints);
              const letter = getGradeLetter(percentage);
              const colorClass = getGradeColor(percentage);
              
              return (
                <div key={gradeItem._id} className="table-row">
                  <div className="table-cell">
                    <div className="assignment-info">
                      <h4>{gradeItem.assignment?.title}</h4>
                      {gradeItem.feedback && (
                        <p className="feedback">{gradeItem.feedback}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    <span className="course-name">
                      {gradeItem.assignment?.course?.title}
                    </span>
                  </div>
                  
                  <div className="table-cell">
                    <div className="date-info">
                      <Calendar size={16} />
                      <span>
                        {new Date(gradeItem.assignment?.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="table-cell">
                    {gradeItem.grade !== undefined ? (
                      <span className="grade-points">
                        {gradeItem.grade}/{gradeItem.assignment?.maxPoints}
                      </span>
                    ) : (
                      <span className="not-graded">Not graded</span>
                    )}
                  </div>
                  
                  <div className="table-cell">
                    {gradeItem.grade !== undefined ? (
                      <div className={`percentage ${colorClass}`}>
                        {percentage}%
                      </div>
                    ) : (
                      <span className="not-graded">-</span>
                    )}
                  </div>
                  
                  <div className="table-cell">
                    {gradeItem.grade !== undefined ? (
                      <div className={`letter-grade ${colorClass}`}>
                        {letter}
                      </div>
                    ) : (
                      <span className="not-graded">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <Award size={64} />
          <h2>No grades available</h2>
          <p>Your grades will appear here once assignments are graded by your instructors.</p>
        </div>
      )}
    </div>
  );
};

export default GradesList;
