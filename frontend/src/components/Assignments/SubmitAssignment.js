import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload, FileText, Send, AlertCircle } from 'lucide-react';
import './Assignments.css';

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState({
    content: '',
    attachments: []
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const mockAssignments = JSON.parse(localStorage.getItem('mockAssignments') || '[]');
      const foundAssignment = mockAssignments.find(a => a._id === assignmentId);
      
      if (foundAssignment) {
        setAssignment(foundAssignment);
        
        // Check if already submitted
        const submissions = JSON.parse(localStorage.getItem('mockSubmissions') || '[]');
        const existingSubmission = submissions.find(s => 
          s.assignmentId === assignmentId && s.studentId === user._id
        );
        
        if (existingSubmission) {
          setSubmission(existingSubmission);
        }
      }
    } catch (error) {
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (e) => {
    setSubmission({
      ...submission,
      content: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file) // Mock URL for demo
    }));
    
    setSubmission({
      ...submission,
      attachments: [...submission.attachments, ...newAttachments]
    });
  };

  const removeAttachment = (index) => {
    const newAttachments = submission.attachments.filter((_, i) => i !== index);
    setSubmission({
      ...submission,
      attachments: newAttachments
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submission.content.trim() && submission.attachments.length === 0) {
      setError('Please provide content or attach files');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const submissions = JSON.parse(localStorage.getItem('mockSubmissions') || '[]');
      const newSubmission = {
        _id: 'submission_' + Date.now(),
        assignmentId: assignmentId,
        studentId: user._id,
        student: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        content: submission.content,
        attachments: submission.attachments,
        submittedAt: new Date().toISOString(),
        grade: null,
        feedback: ''
      };
      
      // Remove existing submission if any
      const filteredSubmissions = submissions.filter(s => 
        !(s.assignmentId === assignmentId && s.studentId === user._id)
      );
      
      filteredSubmissions.push(newSubmission);
      localStorage.setItem('mockSubmissions', JSON.stringify(filteredSubmissions));
      
      // Update assignment status
      const assignments = JSON.parse(localStorage.getItem('mockAssignments') || '[]');
      const updatedAssignments = assignments.map(a => 
        a._id === assignmentId ? { ...a, submitted: true } : a
      );
      localStorage.setItem('mockAssignments', JSON.stringify(updatedAssignments));
      
      setSuccess('Assignment submitted successfully!');
      setTimeout(() => navigate('/assignments'), 2000);
      
    } catch (error) {
      setError('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = assignment && new Date(assignment.dueDate) < new Date();
  const isSubmitted = submission._id;

  if (loading) {
    return (
      <div className="assignments-container">
        <div className="loading">Loading assignment...</div>
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
      <div className="form-container">
        <div className="form-header">
          <button 
            onClick={() => navigate('/assignments')} 
            className="btn btn-outline"
            style={{ marginBottom: '16px' }}
          >
            <ArrowLeft size={20} />
            Back to Assignments
          </button>
          <h1>{assignment.title}</h1>
          <p>{assignment.description}</p>
          
          <div className="assignment-details">
            <div className="detail-item">
              <strong>Course:</strong> {assignment.course?.title}
            </div>
            <div className="detail-item">
              <strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}
            </div>
            <div className="detail-item">
              <strong>Max Points:</strong> {assignment.maxPoints}
            </div>
            {isOverdue && (
              <div className="detail-item overdue">
                <AlertCircle size={16} />
                <strong>This assignment is overdue</strong>
              </div>
            )}
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="content">Your Submission</label>
            <textarea
              id="content"
              value={submission.content}
              onChange={handleContentChange}
              placeholder="Enter your assignment submission here..."
              rows="8"
              disabled={isSubmitted && !isOverdue}
            />
          </div>

          <div className="form-group">
            <label>Attachments</label>
            <div className="file-upload-area">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
                disabled={isSubmitted && !isOverdue}
              />
              <label htmlFor="file-upload" className="file-upload-button">
                <Upload size={20} />
                Upload Files
              </label>
              <p className="file-upload-hint">
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB each)
              </p>
            </div>

            {submission.attachments.length > 0 && (
              <div className="attachments-list">
                {submission.attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <FileText size={16} />
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    {!isSubmitted && (
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="remove-attachment"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isSubmitted ? (
            <div className="submission-status">
              <div className="status-card submitted">
                <h3>✅ Assignment Submitted</h3>
                <p>Submitted on: {new Date(submission.submittedAt).toLocaleString()}</p>
                {submission.grade !== null && (
                  <div className="grade-info">
                    <strong>Grade: {submission.grade}/{assignment.maxPoints}</strong>
                    {submission.feedback && (
                      <p className="feedback">Feedback: {submission.feedback}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/assignments')}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || (isOverdue && !isSubmitted)}
              >
                <Send size={20} />
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubmitAssignment;
