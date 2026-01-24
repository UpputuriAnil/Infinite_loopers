import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText, Award } from 'lucide-react';
import './Assignments.css';

const SubmissionList = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      // TEMPORARY: Mock data for frontend testing
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const mockAssignments = JSON.parse(localStorage.getItem('mockAssignments') || '[]');
      const assignment = mockAssignments.find(a => a._id === assignmentId);
      
      if (assignment) {
        setAssignment(assignment);
        
        // Mock submissions data
        const mockSubmissions = [
          {
            _id: 'sub_1',
            student: { name: 'John Doe', email: 'john@example.com' },
            content: 'Here is my completed assignment. I have implemented all the required features including component state management and props handling.',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            attachments: [
              { filename: 'assignment.zip', url: '#' },
              { filename: 'screenshots.pdf', url: '#' }
            ],
            grade: 85,
            feedback: 'Great work! Your component structure is clean and well-organized.'
          },
          {
            _id: 'sub_2',
            student: { name: 'Jane Smith', email: 'jane@example.com' },
            content: 'My submission includes the React components with proper state management. I also added some extra styling.',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            attachments: [
              { filename: 'project.zip', url: '#' }
            ]
          },
          {
            _id: 'sub_3',
            student: { name: 'Mike Johnson', email: 'mike@example.com' },
            content: 'Completed the assignment with all requirements. Added unit tests as well.',
            submittedAt: new Date().toISOString(),
            attachments: [
              { filename: 'solution.zip', url: '#' },
              { filename: 'tests.js', url: '#' }
            ],
            grade: 92,
            feedback: 'Excellent work! The addition of unit tests shows great attention to quality.'
          }
        ];
        
        setSubmissions(mockSubmissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      // TEMPORARY: Mock grading for frontend testing
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
      
      // Update the submission in state
      setSubmissions(prev => prev.map(sub => 
        sub._id === submissionId 
          ? { ...sub, grade: parseFloat(grade), feedback }
          : sub
      ));
      
      console.log('Grade saved:', { submissionId, grade, feedback });
    } catch (error) {
      console.error('Failed to grade submission:', error);
      alert('Failed to save grade');
    }
  };

  if (loading) {
    return (
      <div className="assignments-container">
        <div className="loading">Loading submissions...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="assignments-container">
        <div className="empty-state">
          <h2>Assignment not found</h2>
          <button onClick={() => navigate('/assignments')} className="btn btn-primary">
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-container">
      <div className="submissions-header">
        <button 
          onClick={() => navigate('/assignments')} 
          className="btn btn-outline"
        >
          <ArrowLeft size={20} />
          Back to Assignments
        </button>
        
        <div className="assignment-info">
          <h1>{assignment.title} - Submissions</h1>
          <p>{assignment.description}</p>
          <div className="assignment-meta">
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            <span>Max Points: {assignment.maxPoints}</span>
            <span>Submissions: {submissions.length}</span>
          </div>
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="submissions-list">
          {submissions.map((submission) => (
            <SubmissionCard 
              key={submission._id} 
              submission={submission}
              assignment={assignment}
              onGrade={handleGrade}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={64} />
          <h2>No submissions yet</h2>
          <p>Students haven't submitted their assignments yet.</p>
        </div>
      )}
    </div>
  );
};

const SubmissionCard = ({ submission, assignment, onGrade }) => {
  const [isGrading, setIsGrading] = useState(false);
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleSaveGrade = async () => {
    if (grade < 0 || grade > assignment.maxPoints) {
      alert(`Grade must be between 0 and ${assignment.maxPoints}`);
      return;
    }
    
    await onGrade(submission._id, grade, feedback);
    setIsGrading(false);
  };

  return (
    <div className="submission-card">
      <div className="submission-header">
        <div className="student-info">
          <User size={20} />
          <div>
            <h3>{submission.student?.name}</h3>
            <p>{submission.student?.email}</p>
          </div>
        </div>
        <div className="submission-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
          {submission.grade !== undefined && (
            <div className="grade-display">
              <Award size={16} />
              <span>{submission.grade}/{assignment.maxPoints}</span>
            </div>
          )}
        </div>
      </div>

      <div className="submission-content">
        <h4>Submission:</h4>
        <p>{submission.content}</p>
        
        {submission.attachments && submission.attachments.length > 0 && (
          <div className="attachments">
            <h5>Attachments:</h5>
            {submission.attachments.map((attachment, index) => (
              <a 
                key={index} 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="attachment-link"
              >
                {attachment.filename}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="grading-section">
        {isGrading ? (
          <div className="grading-form">
            <div className="form-group">
              <label>Grade (out of {assignment.maxPoints})</label>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                min="0"
                max={assignment.maxPoints}
                placeholder="Enter grade"
              />
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the student"
                rows="3"
              />
            </div>
            <div className="grading-actions">
              <button 
                onClick={() => setIsGrading(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGrade}
                className="btn btn-primary"
              >
                Save Grade
              </button>
            </div>
          </div>
        ) : (
          <div className="grade-summary">
            {submission.grade !== undefined ? (
              <div className="existing-grade">
                <p><strong>Grade:</strong> {submission.grade}/{assignment.maxPoints}</p>
                {submission.feedback && (
                  <p><strong>Feedback:</strong> {submission.feedback}</p>
                )}
                <button 
                  onClick={() => setIsGrading(true)}
                  className="btn btn-outline"
                >
                  Edit Grade
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsGrading(true)}
                className="btn btn-primary"
              >
                Grade Submission
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionList;
