import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './Assignments.css';

const AssignmentList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, overdue

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      // TEMPORARY: Mock assignment fetching for frontend testing
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const mockAssignments = JSON.parse(localStorage.getItem('mockAssignments') || '[]');
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.submitted) return 'submitted';
    if (dueDate < now) return 'overdue';
    return 'pending';
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return getAssignmentStatus(assignment) === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="status-icon submitted" size={20} />;
      case 'overdue':
        return <AlertCircle className="status-icon overdue" size={20} />;
      default:
        return <Clock className="status-icon pending" size={20} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="assignments-container">
        <div className="loading">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <div className="header-content">
          <h1>Assignments</h1>
          <p>
            {user?.role === 'teacher' 
              ? 'Manage assignments and track student submissions'
              : 'View and submit your assignments'
            }
          </p>
        </div>
        {user?.role === 'teacher' && (
          <Link to="/create-assignment" className="create-button">
            <Plus size={20} />
            Create Assignment
          </Link>
        )}
      </div>

      {user?.role === 'student' && (
        <div className="assignments-filters">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({assignments.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({assignments.filter(a => getAssignmentStatus(a) === 'pending').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'submitted' ? 'active' : ''}`}
              onClick={() => setFilter('submitted')}
            >
              Submitted ({assignments.filter(a => getAssignmentStatus(a) === 'submitted').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
              onClick={() => setFilter('overdue')}
            >
              Overdue ({assignments.filter(a => getAssignmentStatus(a) === 'overdue').length})
            </button>
          </div>
        </div>
      )}

      {filteredAssignments.length > 0 ? (
        <div className="assignments-grid">
          {filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            return (
              <div key={assignment._id} className={`assignment-card ${status}`}>
                <div className="assignment-header">
                  <div className="assignment-icon">
                    <FileText size={24} />
                  </div>
                  <div className="assignment-status">
                    {getStatusIcon(status)}
                    <span>{getStatusText(status)}</span>
                  </div>
                </div>
                
                <div className="assignment-content">
                  <h3>{assignment.title}</h3>
                  <p className="assignment-description">{assignment.description}</p>
                  
                  <div className="assignment-meta">
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <FileText size={16} />
                      <span>Course: {assignment.course?.title}</span>
                    </div>
                    {user?.role === 'teacher' && (
                      <div className="meta-item">
                        <CheckCircle size={16} />
                        <span>{assignment.submissions?.length || 0} submissions</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="assignment-actions">
                  {user?.role === 'teacher' ? (
                    <>
                      <button 
                        onClick={() => navigate(`/submissions/${assignment._id}`)}
                        className="btn btn-outline"
                      >
                        View Submissions
                      </button>
                      <button className="btn btn-primary">
                        Edit Assignment
                      </button>
                    </>
                  ) : (
                    <Link 
                      to={`/submit/${assignment._id}`}
                      className={`btn ${status === 'submitted' ? 'btn-outline' : 'btn-primary'}`}
                      style={{ textDecoration: 'none', pointerEvents: status === 'overdue' && !assignment.submitted ? 'none' : 'auto', opacity: status === 'overdue' && !assignment.submitted ? 0.5 : 1 }}
                    >
                      {status === 'submitted' ? 'View Submission' : 'Submit Assignment'}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={64} />
          <h2>No assignments found</h2>
          <p>
            {user?.role === 'teacher' 
              ? "You haven't created any assignments yet."
              : filter === 'all' 
                ? "No assignments have been posted yet."
                : `No ${filter} assignments found.`
            }
          </p>
          {user?.role === 'teacher' && (
            <Link to="/create-assignment" className="btn btn-primary">
              <Plus size={20} />
              Create Your First Assignment
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
