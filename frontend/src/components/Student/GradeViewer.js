import React, { useState, useEffect } from 'react';
import { 
  Award, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BookOpen,
  FileText,
  Star,
  BarChart3,
  Filter,
  Download
} from 'lucide-react';
import './GradeViewer.css';

const GradeViewer = () => {
  const [grades, setGrades] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    // Mock grades data
    const mockGrades = [
      {
        id: 1,
        assignment: 'React Components Project',
        course: 'Web Development',
        instructor: 'Dr. Smith',
        submittedAt: '2024-10-14T16:20:00Z',
        gradedAt: '2024-10-16T10:30:00Z',
        grade: 92,
        maxGrade: 100,
        feedback: 'Excellent work! Great component structure and clean code. Consider adding more error handling for edge cases.',
        rubric: [
          { criteria: 'Code Quality', points: 23, maxPoints: 25 },
          { criteria: 'Functionality', points: 25, maxPoints: 25 },
          { criteria: 'Design', points: 22, maxPoints: 25 },
          { criteria: 'Documentation', points: 22, maxPoints: 25 }
        ]
      },
      {
        id: 2,
        assignment: 'Database Design Assignment',
        course: 'Backend Development',
        instructor: 'Prof. Johnson',
        submittedAt: '2024-10-12T14:30:00Z',
        gradedAt: '2024-10-15T09:15:00Z',
        grade: 85,
        maxGrade: 100,
        feedback: 'Good database schema design. The normalization is well done, but could improve on indexing strategies.',
        rubric: [
          { criteria: 'Schema Design', points: 22, maxPoints: 25 },
          { criteria: 'Normalization', points: 23, maxPoints: 25 },
          { criteria: 'Queries', points: 20, maxPoints: 25 },
          { criteria: 'Documentation', points: 20, maxPoints: 25 }
        ]
      },
      {
        id: 3,
        assignment: 'UI/UX Wireframes',
        course: 'Design Fundamentals',
        instructor: 'Ms. Davis',
        submittedAt: '2024-10-10T11:45:00Z',
        gradedAt: '2024-10-13T15:20:00Z',
        grade: 78,
        maxGrade: 100,
        feedback: 'Creative design approach. The user flow is logical, but some wireframes lack detail. Consider adding more annotations.',
        rubric: [
          { criteria: 'Creativity', points: 20, maxPoints: 25 },
          { criteria: 'User Flow', points: 22, maxPoints: 25 },
          { criteria: 'Detail Level', points: 16, maxPoints: 25 },
          { criteria: 'Presentation', points: 20, maxPoints: 25 }
        ]
      },
      {
        id: 4,
        assignment: 'API Integration Task',
        course: 'Web Development',
        instructor: 'Dr. Smith',
        submittedAt: '2024-10-08T13:10:00Z',
        gradedAt: '2024-10-11T16:45:00Z',
        grade: 95,
        maxGrade: 100,
        feedback: 'Outstanding implementation! Excellent error handling and clean API integration. Great use of async/await.',
        rubric: [
          { criteria: 'Implementation', points: 25, maxPoints: 25 },
          { criteria: 'Error Handling', points: 24, maxPoints: 25 },
          { criteria: 'Code Style', points: 23, maxPoints: 25 },
          { criteria: 'Testing', points: 23, maxPoints: 25 }
        ]
      }
    ];
    setGrades(mockGrades);
  }, []);

  const filteredGrades = grades.filter(grade => {
    const courseMatch = selectedCourse === 'all' || grade.course === selectedCourse;
    const gradeMatch = filter === 'all' || 
      (filter === 'excellent' && grade.grade >= 90) ||
      (filter === 'good' && grade.grade >= 80 && grade.grade < 90) ||
      (filter === 'average' && grade.grade >= 70 && grade.grade < 80) ||
      (filter === 'poor' && grade.grade < 70);
    
    return courseMatch && gradeMatch;
  });

  const courses = [...new Set(grades.map(g => g.course))];

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'excellent';
    if (grade >= 80) return 'good';
    if (grade >= 70) return 'average';
    return 'poor';
  };

  const getGradeIcon = (grade) => {
    if (grade >= 90) return <TrendingUp size={20} />;
    if (grade >= 70) return <Award size={20} />;
    return <TrendingDown size={20} />;
  };

  const calculateOverallStats = () => {
    if (filteredGrades.length === 0) return { average: 0, highest: 0, lowest: 0, total: 0 };
    
    const scores = filteredGrades.map(g => g.grade);
    return {
      average: Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      total: filteredGrades.length
    };
  };

  const stats = calculateOverallStats();

  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
  };

  return (
    <div className="grade-viewer">
      <div className="viewer-header">
        <div className="header-content">
          <h2>My Grades</h2>
          <p>Track your academic performance and progress</p>
        </div>
        
        <div className="viewer-actions">
          <button className="export-btn">
            <Download size={20} />
            Export Transcript
          </button>
        </div>
      </div>

      <div className="grade-filters">
        <div className="filter-group">
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Grades</option>
            <option value="excellent">Excellent (90-100%)</option>
            <option value="good">Good (80-89%)</option>
            <option value="average">Average (70-79%)</option>
            <option value="poor">Below Average (&lt;70%)</option>
          </select>
        </div>
      </div>

      <div className="grade-stats">
        <div className="stat-card">
          <div className="stat-icon average">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.average}%</h3>
            <p>Overall Average</p>
            <span className="letter-grade">{getLetterGrade(stats.average)}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon highest">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.highest}%</h3>
            <p>Highest Grade</p>
            <span className="letter-grade">{getLetterGrade(stats.highest)}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon lowest">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.lowest}%</h3>
            <p>Lowest Grade</p>
            <span className="letter-grade">{getLetterGrade(stats.lowest)}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon total">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Assignments</p>
            <span className="completion">Graded</span>
          </div>
        </div>
      </div>

      <div className="grades-list">
        {filteredGrades.map(grade => (
          <div key={grade.id} className={`grade-card ${getGradeColor(grade.grade)}`}>
            <div className="grade-header">
              <div className="assignment-info">
                <h3>{grade.assignment}</h3>
                <div className="assignment-meta">
                  <span className="course">
                    <BookOpen size={16} />
                    {grade.course}
                  </span>
                  <span className="instructor">
                    {grade.instructor}
                  </span>
                  <span className="graded-date">
                    <Calendar size={16} />
                    Graded: {new Date(grade.gradedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="grade-display">
                <div className={`grade-score ${getGradeColor(grade.grade)}`}>
                  {getGradeIcon(grade.grade)}
                  <span className="score">{grade.grade}/{grade.maxGrade}</span>
                  <span className="percentage">({Math.round((grade.grade / grade.maxGrade) * 100)}%)</span>
                </div>
                <div className="letter-grade-display">
                  {getLetterGrade((grade.grade / grade.maxGrade) * 100)}
                </div>
              </div>
            </div>
            
            {grade.rubric && (
              <div className="rubric-breakdown">
                <h4>Grade Breakdown</h4>
                <div className="rubric-items">
                  {grade.rubric.map((item, index) => (
                    <div key={index} className="rubric-item">
                      <div className="rubric-info">
                        <span className="criteria">{item.criteria}</span>
                        <span className="points">{item.points}/{item.maxPoints}</span>
                      </div>
                      <div className="rubric-bar">
                        <div 
                          className="rubric-fill" 
                          style={{width: `${(item.points / item.maxPoints) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {grade.feedback && (
              <div className="grade-feedback">
                <h4>Instructor Feedback</h4>
                <p>{grade.feedback}</p>
              </div>
            )}
            
            <div className="submission-timeline">
              <div className="timeline-item">
                <span className="timeline-label">Submitted:</span>
                <span className="timeline-date">{new Date(grade.submittedAt).toLocaleDateString()}</span>
              </div>
              <div className="timeline-item">
                <span className="timeline-label">Graded:</span>
                <span className="timeline-date">{new Date(grade.gradedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredGrades.length === 0 && (
        <div className="empty-state">
          <Award size={48} />
          <h3>No grades found</h3>
          <p>No grades match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default GradeViewer;
