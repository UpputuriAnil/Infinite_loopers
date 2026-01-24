import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Calendar,
  User,
  BookOpen,
  Send,
  RefreshCw
} from 'lucide-react';
import './AssignmentSubmission.css';

const AssignmentSubmission = () => {
  const { getAssignmentsForUser, refreshData } = useData();
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

  // Load assignments from DataContext
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = () => {
    const userAssignments = getAssignmentsForUser();
    console.log('Loading assignments for student:', userAssignments);
    
    // Convert to format expected by component
    const formattedAssignments = userAssignments.map(assignment => ({
      id: assignment._id,
      title: assignment.title,
      description: assignment.description || 'No description provided',
      course: assignment.courseName || 'Course',
      instructor: assignment.teacherName || 'Instructor',
      dueDate: assignment.dueDate || new Date().toISOString(),
      maxGrade: assignment.maxGrade || 100,
      status: assignment.status || 'pending',
      submittedAt: assignment.submittedAt || null,
      grade: assignment.grade || null,
      feedback: assignment.feedback || null,
      attachments: assignment.attachments || [],
      allowedFormats: assignment.allowedFormats || ['.pdf', '.doc', '.docx', '.zip']
    }));
    
    setAssignments(formattedAssignments);
  };

  // Fallback to mock data if no real assignments
  useEffect(() => {
    const userAssignments = getAssignmentsForUser();
    if (userAssignments.length === 0 && assignments.length === 0) {
      // Use mock data if no assignments from teacher
      const mockAssignments = [
        {
          id: 1,
          title: 'React Components Project',
          description: 'Create a functional React application with multiple components, props, and state management.',
          course: 'Web Development',
          instructor: 'Dr. Smith',
          dueDate: '2024-10-25T23:59:00Z',
          maxGrade: 100,
          status: 'pending',
          submittedAt: null,
        grade: null,
        feedback: null,
        attachments: ['project-requirements.pdf'],
        allowedFormats: ['.js', '.jsx', '.zip', '.pdf']
      },
      {
        id: 2,
        title: 'Database Design Assignment',
        description: 'Design a normalized database schema for an e-commerce application.',
        course: 'Backend Development',
        instructor: 'Prof. Johnson',
        dueDate: '2024-10-20T23:59:00Z',
        maxGrade: 100,
        status: 'submitted',
        submittedAt: '2024-10-18T14:30:00Z',
        grade: null,
        feedback: null,
        attachments: ['database-schema.sql'],
        allowedFormats: ['.sql', '.pdf', '.docx']
      },
      {
        id: 3,
        title: 'API Integration Task',
        description: 'Integrate a third-party API into your React application.',
        course: 'Web Development',
        instructor: 'Dr. Smith',
        dueDate: '2024-10-15T23:59:00Z',
        maxGrade: 100,
        status: 'graded',
        submittedAt: '2024-10-14T16:20:00Z',
        grade: 92,
        feedback: 'Excellent work! Great API integration and error handling.',
        attachments: ['api-project.zip'],
        allowedFormats: ['.js', '.jsx', '.zip']
      },
      {
        id: 4,
        title: 'Mobile App Wireframes',
        description: 'Create wireframes for a mobile application using design tools.',
        course: 'UI/UX Design',
        instructor: 'Ms. Davis',
        dueDate: '2024-11-01T23:59:00Z',
        maxGrade: 100,
        status: 'pending',
        submittedAt: null,
        grade: null,
        feedback: null,
        attachments: ['wireframe-guidelines.pdf'],
        allowedFormats: ['.fig', '.pdf', '.png', '.jpg']
      }
    ];
      setAssignments(mockAssignments);
    }
  }, [getAssignmentsForUser, assignments.length]);

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmission = async (assignmentId) => {
    setSubmittingId(assignmentId);
    
    // Simulate submission process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { 
              ...assignment, 
              status: 'submitted',
              submittedAt: new Date().toISOString()
            }
          : assignment
      )
    );
    
    setSelectedFile(null);
    setSubmissionText('');
    setSubmittingId(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="status-icon pending" />;
      case 'submitted':
        return <CheckCircle size={20} className="status-icon submitted" />;
      case 'graded':
        return <CheckCircle size={20} className="status-icon graded" />;
      default:
        return <AlertCircle size={20} className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'submitted': return 'submitted';
      case 'graded': return 'graded';
      default: return 'pending';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'excellent';
    if (grade >= 80) return 'good';
    if (grade >= 70) return 'average';
    return 'poor';
  };

  return (
    <div className="assignment-submission">
      <div className="submission-header">
        <div className="header-content">
          <h2>My Assignments</h2>
          <p>Submit your assignments and track your progress</p>
        </div>
        
        <div className="submission-filters">
          <button 
            onClick={() => {
              refreshData();
              loadAssignments();
              alert('Assignments refreshed! New assignments from teachers should now appear.');
            }}
            className="refresh-btn"
            style={{ marginRight: '12px', padding: '8px 16px', background: '#A4C2A5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            🔄 Refresh Assignments
          </button>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      <div className="assignment-stats">
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{assignments.filter(a => a.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon submitted">
            <Upload size={24} />
          </div>
          <div className="stat-content">
            <h3>{assignments.filter(a => a.status === 'submitted').length}</h3>
            <p>Submitted</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon graded">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{assignments.filter(a => a.status === 'graded').length}</h3>
            <p>Graded</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon average">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>
              {assignments.filter(a => a.grade).length > 0 
                ? Math.round(assignments.filter(a => a.grade).reduce((acc, a) => acc + a.grade, 0) / assignments.filter(a => a.grade).length)
                : 0}%
            </h3>
            <p>Average Grade</p>
          </div>
        </div>
      </div>

      <div className="assignments-list">
        {filteredAssignments.map(assignment => (
          <div key={assignment.id} className={`assignment-card ${assignment.status}`}>
            <div className="assignment-header">
              <div className="assignment-info">
                <div className="assignment-title">
                  <h3>{assignment.title}</h3>
                  {getStatusIcon(assignment.status)}
                </div>
                <div className="assignment-meta">
                  <span className="course">
                    <BookOpen size={16} />
                    {assignment.course}
                  </span>
                  <span className="instructor">
                    <User size={16} />
                    {assignment.instructor}
                  </span>
                  <span className={`due-date ${isOverdue(assignment.dueDate) && assignment.status === 'pending' ? 'overdue' : ''}`}>
                    <Calendar size={16} />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    {assignment.status === 'pending' && (
                      <span className="days-left">
                        ({getDaysUntilDue(assignment.dueDate)} days left)
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              {assignment.grade && (
                <div className={`grade-display ${getGradeColor(assignment.grade)}`}>
                  <span className="grade">{assignment.grade}/{assignment.maxGrade}</span>
                  <span className="percentage">({Math.round((assignment.grade / assignment.maxGrade) * 100)}%)</span>
                </div>
              )}
            </div>
            
            <div className="assignment-description">
              <p>{assignment.description}</p>
            </div>
            
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="assignment-attachments">
                <h4>Course Materials:</h4>
                <div className="attachments-list">
                  {assignment.attachments.map((attachment, index) => (
                    <button key={index} className="attachment-item">
                      <Download size={16} />
                      {attachment}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {assignment.feedback && (
              <div className="assignment-feedback">
                <h4>Instructor Feedback:</h4>
                <p>{assignment.feedback}</p>
              </div>
            )}
            
            {assignment.status === 'submitted' && !assignment.grade && (
              <div className="submission-status">
                <CheckCircle size={20} />
                <span>Submitted on {new Date(assignment.submittedAt).toLocaleDateString()}</span>
                <span className="waiting">Waiting for grade...</span>
              </div>
            )}
            
            {assignment.status === 'pending' && (
              <div className="submission-form">
                <h4>Submit Assignment</h4>
                <div className="form-group">
                  <label>Upload File</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept={assignment.allowedFormats.join(',')}
                      id={`file-${assignment.id}`}
                    />
                    <label htmlFor={`file-${assignment.id}`} className="file-upload-label">
                      <Upload size={20} />
                      {selectedFile ? selectedFile.name : 'Choose file...'}
                    </label>
                  </div>
                  <small>Allowed formats: {assignment.allowedFormats.join(', ')}</small>
                </div>
                
                <div className="form-group">
                  <label>Additional Comments (Optional)</label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Add any comments about your submission..."
                    rows={3}
                  />
                </div>
                
                <button
                  onClick={() => handleSubmission(assignment.id)}
                  disabled={!selectedFile || submittingId === assignment.id}
                  className="submit-btn"
                >
                  {submittingId === assignment.id ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Assignment
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredAssignments.length === 0 && (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No assignments found</h3>
          <p>No assignments match your current filter.</p>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmission;
