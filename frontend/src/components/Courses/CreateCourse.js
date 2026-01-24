import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import './Courses.css';

const CreateCourse = () => {
  const { user } = useAuth();
  const { addCourse } = useData();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    category: 'programming',
    level: 'beginner',
    maxStudents: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use DataContext to add course with proper format
      const newCourse = addCourse(formData);
      
      console.log('✓ Course created successfully:', newCourse);
      alert('✓ Course created successfully! Students can now see and enroll.');
      navigate('/courses');
    } catch (error) {
      setError('Failed to create course');
      console.error('Course creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="courses-container">
      <div className="form-container">
        <div className="form-header">
          <button 
            onClick={() => navigate('/courses')} 
            className="btn btn-outline"
            style={{ marginBottom: '16px' }}
          >
            <ArrowLeft size={20} />
            Back to Courses
          </button>
          <h1>Create New Course</h1>
          <p>Fill in the details to create a new course for your students.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Course Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Course Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what students will learn in this course"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 8 weeks, 3 months"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="data-science">Data Science</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="level">Difficulty Level</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="maxStudents">Maximum Students</label>
            <input
              type="number"
              id="maxStudents"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleChange}
              placeholder="e.g., 30"
              min="1"
              max="100"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/courses')}
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
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
