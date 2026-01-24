import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  Star,
  TrendingUp,
  Download,
  Filter,
  Search
} from 'lucide-react';
import './GradeManagement.css';

const GradeManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    // Mock submissions data
    const mockSubmissions = [
      {
        id: 1,
        studentName: 'John Smith',
        studentId: 'ST001',
        assignment: 'React Components Project',
        course: 'Web Development',
        submittedAt: '2024-10-15T10:30:00Z',
        status: 'pending',
        grade: null,
        maxGrade: 100
      },
      {
        id: 2,
        studentName: 'Sarah Johnson',
        studentId: 'ST002',
        assignment: 'Database Design',
        course: 'Backend Development',
        submittedAt: '2024-10-14T14:20:00Z',
        status: 'graded',
        grade: 85,
        maxGrade: 100
      },
      {
        id: 3,
        studentName: 'Mike Davis',
        studentId: 'ST003',
        assignment: 'API Integration',
        course: 'Web Development',
        submittedAt: '2024-10-13T09:15:00Z',
        status: 'graded',
        grade: 92,
        maxGrade: 100
      },
      {
        id: 4,
        studentName: 'Emily Brown',
        studentId: 'ST004',
        assignment: 'React Components Project',
        course: 'Web Development',
        submittedAt: '2024-10-16T16:45:00Z',
        status: 'pending',
        grade: null,
        maxGrade: 100
      }
    ];
    setSubmissions(mockSubmissions);
  }, []);

  const handleGradeSubmit = (submissionId, grade) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, grade: parseInt(grade), status: 'graded' }
          : sub
      )
    );
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.status === filter;
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.assignment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || submission.course === selectedCourse;
    
    return matchesFilter && matchesSearch && matchesCourse;
  });

  const getGradeColor = (grade, maxGrade) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 70) return 'average';
    return 'poor';
  };

  const courses = [...new Set(submissions.map(sub => sub.course))];

  return (
    <div className="grade-management">
      <div className="grade-header">
        <div className="header-content">
          <h2>Grade Management</h2>
          <p>Review and grade student submissions</p>
        </div>
        
        <div className="grade-actions">
          <button className="export-btn">
            <Download size={20} />
            Export Grades
          </button>
        </div>
      </div>

      <div className="grade-filters">
        <div className="filter-group">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search students or assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="graded">Graded</option>
          </select>
          
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
        </div>
      </div>

      <div className="grade-stats">
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{submissions.filter(s => s.status === 'pending').length}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon graded">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{submissions.filter(s => s.status === 'graded').length}</h3>
            <p>Graded</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon average">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>
              {submissions.filter(s => s.grade).length > 0 
                ? Math.round(submissions.filter(s => s.grade).reduce((acc, s) => acc + s.grade, 0) / submissions.filter(s => s.grade).length)
                : 0}%
            </h3>
            <p>Average Grade</p>
          </div>
        </div>
      </div>

      <div className="submissions-list">
        {filteredSubmissions.map(submission => (
          <div key={submission.id} className="submission-card">
            <div className="submission-header">
              <div className="student-info">
                <h3>{submission.studentName}</h3>
                <span className="student-id">{submission.studentId}</span>
              </div>
              <div className={`status-badge ${submission.status}`}>
                {submission.status === 'pending' ? (
                  <>
                    <Clock size={16} />
                    Pending Review
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Graded
                  </>
                )}
              </div>
            </div>
            
            <div className="submission-details">
              <div className="assignment-info">
                <h4>{submission.assignment}</h4>
                <p className="course-name">{submission.course}</p>
                <p className="submitted-date">
                  Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="grading-section">
                {submission.status === 'pending' ? (
                  <div className="grade-input">
                    <label>Grade (out of {submission.maxGrade})</label>
                    <div className="grade-controls">
                      <input
                        type="number"
                        min="0"
                        max={submission.maxGrade}
                        placeholder="Enter grade"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleGradeSubmit(submission.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value) {
                            handleGradeSubmit(submission.id, input.value);
                            input.value = '';
                          }
                        }}
                        className="grade-submit-btn"
                      >
                        Submit Grade
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grade-display">
                    <div className={`grade-score ${getGradeColor(submission.grade, submission.maxGrade)}`}>
                      <Star size={20} />
                      <span>{submission.grade}/{submission.maxGrade}</span>
                      <span className="percentage">
                        ({Math.round((submission.grade / submission.maxGrade) * 100)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredSubmissions.length === 0 && (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No submissions found</h3>
          <p>No submissions match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default GradeManagement;
