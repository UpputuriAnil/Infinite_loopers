import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  FileText, 
  Plus,
  User,
  MessageCircle,
  FolderOpen
} from 'lucide-react';
import './Courses.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const [courseRes, assignmentsRes] = await Promise.all([
        axios.get(`/api/courses/${id}`),
        axios.get(`/api/courses/${id}/assignments`)
      ]);
      
      setCourse(courseRes.data.course);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="courses-container">
        <div className="empty-state">
          <h2>Course not found</h2>
          <p>The course you're looking for doesn't exist or you don't have access to it.</p>
          <button onClick={() => navigate('/courses')} className="btn btn-primary">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="course-detail-header">
        <button 
          onClick={() => navigate('/courses')} 
          className="btn btn-outline"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </button>
        
        <div className="course-detail-info">
          <h1>{course.title}</h1>
          <p className="course-description">{course.description}</p>
          
          <div className="course-stats">
            <div className="stat-item">
              <Clock size={20} />
              <span>{course.duration}</span>
            </div>
            <div className="stat-item">
              <Users size={20} />
              <span>{course.enrolledStudents?.length || 0} students</span>
            </div>
            <div className="stat-item">
              <User size={20} />
              <span>Instructor: {course.teacher?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="course-content">
        <div className="course-actions-bar">
          <Link 
            to={`/forum/${id}`}
            className="btn btn-outline"
          >
            <MessageCircle size={20} />
            Discussion Forum
          </Link>
          
          <Link 
            to={`/materials/${id}`}
            className="btn btn-outline"
          >
            <FolderOpen size={20} />
            Course Materials
          </Link>
        </div>
        
        <div className="course-section">
          <div className="section-header">
            <h2>Assignments</h2>
            {user?.role === 'teacher' && (
              <button 
                onClick={() => navigate('/create-assignment', { state: { courseId: id } })}
                className="btn btn-primary"
              >
                <Plus size={20} />
                Create Assignment
              </button>
            )}
          </div>
          
          {assignments.length > 0 ? (
            <div className="assignments-list">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="assignment-card">
                  <div className="assignment-info">
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                    <div className="assignment-meta">
                      <span className="due-date">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      {assignment.submitted && (
                        <span className="status submitted">Submitted</span>
                      )}
                      {user?.role === 'teacher' && (
                        <span className="submissions-count">
                          {assignment.submissions?.length || 0} submissions
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="assignment-actions">
                    {user?.role === 'teacher' ? (
                      <button 
                        onClick={() => navigate(`/submissions/${assignment._id}`)}
                        className="btn btn-outline"
                      >
                        View Submissions
                      </button>
                    ) : (
                      <button className="btn btn-primary">
                        {assignment.submitted ? 'View Submission' : 'Submit Assignment'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No assignments yet</h3>
              <p>
                {user?.role === 'teacher' 
                  ? 'Create your first assignment to get started.'
                  : 'No assignments have been posted for this course yet.'
                }
              </p>
            </div>
          )}
        </div>

        {user?.role === 'teacher' && (
          <div className="course-section">
            <h2>Enrolled Students</h2>
            {course.enrolledStudents?.length > 0 ? (
              <div className="students-list">
                {course.enrolledStudents.map((student) => (
                  <div key={student._id} className="student-card">
                    <div className="student-info">
                      <User size={20} />
                      <div>
                        <h4>{student.name}</h4>
                        <p>{student.email}</p>
                      </div>
                    </div>
                    <div className="student-stats">
                      <span>Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <h3>No students enrolled</h3>
                <p>Students will appear here once they enroll in your course.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
