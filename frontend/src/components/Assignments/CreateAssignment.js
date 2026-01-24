import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import './Assignments.css';

const CreateAssignment = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxPoints: 100
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCourses();
    // If courseId is passed from CourseDetail, set it
    if (location.state?.courseId) {
      setFormData(prev => ({ ...prev, courseId: location.state.courseId }));
    }
  }, [location.state]);

  const fetchCourses = async () => {
    try {
      // TEMPORARY: Mock course fetching for frontend testing
      const mockCourses = JSON.parse(localStorage.getItem('mockCourses') || '[]');
      setCourses(mockCourses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TEMPORARY: Mock assignment creation for frontend testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Store assignment in localStorage
      const existingAssignments = JSON.parse(localStorage.getItem('mockAssignments') || '[]');
      const selectedCourse = courses.find(c => c._id === formData.courseId);
      
      const newAssignment = {
        _id: 'assignment_' + Date.now(),
        ...formData,
        course: selectedCourse ? { _id: selectedCourse._id, title: selectedCourse.title } : null,
        submissions: [],
        submitted: false,
        createdAt: new Date().toISOString()
      };
      
      existingAssignments.push(newAssignment);
      localStorage.setItem('mockAssignments', JSON.stringify(existingAssignments));
      
      navigate('/assignments');
    } catch (error) {
      setError('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

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
          <h1>Create New Assignment</h1>
          <p>Create an assignment for your students to complete.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Assignment Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the assignment requirements and instructions"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="courseId">Course</label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxPoints">Maximum Points</label>
            <input
              type="number"
              id="maxPoints"
              name="maxPoints"
              value={formData.maxPoints}
              onChange={handleChange}
              min="1"
              max="1000"
              required
            />
          </div>

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
              disabled={loading}
            >
              <Save size={20} />
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
