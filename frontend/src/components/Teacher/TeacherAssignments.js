import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Users
} from 'lucide-react';

const TeacherAssignments = () => {
  const { getAssignmentsForUser, getCoursesForUser, addAssignment } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const teacherAssignments = getAssignmentsForUser();
      const teacherCourses = getCoursesForUser();
      
      // Add some default assignments if teacher has no assignments but has courses
      if (teacherAssignments.length === 0 && teacherCourses.length > 0) {
        const defaultAssignments = [
          {
            title: 'React Components Assignment',
            description: 'Create functional components with props and state',
            courseId: teacherCourses[0]._id,
            course: { _id: teacherCourses[0]._id, title: teacherCourses[0].title },
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maxPoints: 100,
            instructions: 'Complete the React components assignment with proper state management'
          },
          {
            title: 'JavaScript Fundamentals Quiz',
            description: 'Test your knowledge of JavaScript basics',
            courseId: teacherCourses[0]._id,
            course: { _id: teacherCourses[0]._id, title: teacherCourses[0].title },
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            maxPoints: 50,
            instructions: 'Complete the JavaScript quiz covering ES6+ features'
          }
        ];
        
        // Add default assignments using the data context
        defaultAssignments.forEach(assignment => addAssignment(assignment));
      }
    } catch (error) {
      console.error('Failed to initialize assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (!assignment.published) return 'draft';
    if (dueDate < now) return 'closed';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'closed': return 'orange';
      case 'draft': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'closed': return 'Closed';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="teacher-assignments-loading">
        <div className="loading">Loading assignments...</div>
      </div>
    );
  }

  // Get teacher's assignments and show only the most recent 3 for dashboard
  const teacherAssignments = getAssignmentsForUser();
  const recentAssignments = teacherAssignments.slice(0, 3);

  return (
    <div className="teacher-assignments">
      {recentAssignments.length > 0 ? (
        <div className="assignments-preview">
          {recentAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            return (
              <div key={assignment._id} className="assignment-preview-card">
                <div className="assignment-preview-header">
                  <div className="assignment-icon">
                    <FileText size={20} />
                  </div>
                  <div className="assignment-info">
                    <h4>{assignment.title}</h4>
                    <p className="course-name">{assignment.course?.title}</p>
                  </div>
                  <div className={`status-badge ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </div>
                </div>
                
                <div className="assignment-preview-stats">
                  <div className="stat-item">
                    <Users size={16} />
                    <span>{assignment.submissions?.length || 0} submissions</span>
                  </div>
                  <div className="stat-item">
                    <Calendar size={16} />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="assignment-preview-actions">
                  <Link 
                    to={`/submissions/${assignment._id}`}
                    className="btn btn-sm btn-outline"
                  >
                    View Submissions
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state-mini">
          <FileText size={48} />
          <h3>No assignments yet</h3>
          <p>Create your first assignment to get started</p>
          <Link to="/create-assignment" className="btn btn-primary">
            <Plus size={16} />
            Create Assignment
          </Link>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;
