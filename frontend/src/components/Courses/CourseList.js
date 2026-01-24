import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Plus, 
  Search,
  Filter
} from 'lucide-react';
import './Courses.css';

const CourseList = () => {
  const { user } = useAuth();
  const { 
    getCoursesForUser, 
    getEnrolledCourses, 
    enrollInCourse, 
    isEnrolledInCourse
  } = useData();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, enrolled, available

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Data is managed by DataContext, no need to set local state
      console.log('CourseList - Available courses:', getCoursesForUser().length);
      console.log('CourseList - Enrolled courses:', getEnrolledCourses().length);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      console.log('Enrolling in course:', courseId);
      const success = enrollInCourse(courseId);
      
      if (success) {
        alert('Successfully enrolled in course!');
        // Force component refresh
        setLoading(true);
        setTimeout(() => setLoading(false), 100);
      } else {
        alert('Already enrolled in this course or enrollment failed.');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course');
    }
  };

  // Get courses based on user role and filter
  const getFilteredCourses = () => {
    let coursesToShow = [];
    
    if (user?.role === 'teacher') {
      coursesToShow = getCoursesForUser(); // Teacher's own courses
    } else if (user?.role === 'student') {
      if (filter === 'enrolled') {
        coursesToShow = getEnrolledCourses(); // Only enrolled courses
      } else if (filter === 'available') {
        const allCourses = getCoursesForUser(); // All published courses
        const enrolledCourses = getEnrolledCourses();
        const enrolledIds = enrolledCourses.map(c => c._id);
        coursesToShow = allCourses.filter(course => !enrolledIds.includes(course._id));
      } else {
        // Show all courses with enrollment status
        coursesToShow = getCoursesForUser().map(course => ({
          ...course,
          isEnrolled: isEnrolledInCourse(course._id)
        }));
      }
    }
    
    // Apply search filter
    return coursesToShow.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };
  
  const filteredCourses = getFilteredCourses();

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-header">
        <div className="header-content">
          <h1>{user?.role === 'teacher' ? 'My Courses' : 'Available Courses'}</h1>
          <p>
            {user?.role === 'teacher' 
              ? 'Manage your courses and track student progress'
              : 'Discover and enroll in courses to enhance your learning'
            }
          </p>
        </div>
        {user?.role === 'teacher' && (
          <Link to="/create-course" className="create-course-button">
            <Plus size={20} />
            Create Course
          </Link>
        )}
      </div>

      <div className="courses-filters">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {user?.role === 'student' && (
          <div className="filter-dropdown">
            <Filter size={20} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Courses</option>
              <option value="enrolled">Enrolled</option>
              <option value="available">Available</option>
            </select>
          </div>
        )}
      </div>

      {filteredCourses.length > 0 ? (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <div className="course-icon">
                  <BookOpen size={24} />
                </div>
                {(course.isEnrolled || (user?.role === 'student' && isEnrolledInCourse(course._id))) && (
                  <span className="enrolled-badge">Enrolled</span>
                )}
              </div>
              
              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                
                <div className="course-meta">
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{course.enrolledStudents?.length || 0} students</span>
                  </div>
                </div>
                
                <div className="course-teacher">
                  <span>Instructor: {course.teacherName || course.teacher?.name || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="course-actions">
                {user?.role === 'student' ? (
                  (course.isEnrolled || isEnrolledInCourse(course._id)) ? (
                    <Link to={`/courses/${course._id}`} className="btn btn-primary">
                      View Course
                    </Link>
                  ) : (
                    <button 
                      onClick={() => handleEnroll(course._id)}
                      className="btn btn-outline"
                    >
                      Enroll Now
                    </button>
                  )
                ) : (
                  <Link to={`/courses/${course._id}`} className="btn btn-primary">
                    Manage Course
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BookOpen size={64} />
          <h2>No courses found</h2>
          <p>
            {user?.role === 'teacher' 
              ? "You haven't created any courses yet. Start by creating your first course!"
              : searchTerm || filter !== 'all'
                ? "No courses match your search criteria. Try adjusting your filters."
                : "No courses are available at the moment. Check back later!"
            }
          </p>
          {user?.role === 'teacher' && (
            <Link to="/create-course" className="btn btn-primary">
              <Plus size={20} />
              Create Your First Course
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseList;
