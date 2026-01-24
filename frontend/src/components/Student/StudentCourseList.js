import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  Clock,
  Plus,
  Star
} from 'lucide-react';

const StudentCourseList = () => {
  const { user } = useAuth();
  const { 
    getCoursesForUser, 
    getEnrolledCourses, 
    enrollInCourse, 
    isEnrolledInCourse,
    updateProgress,
    enrollments,
    reloadData,
    refreshData
  } = useData();
  const [loading, setLoading] = useState(true);

  // Remove demo course creation - only show teacher-created courses
  const initializeData = useCallback(() => {
    const allCourses = getCoursesForUser();
    console.log('Current available courses from teachers:', allCourses);
  }, [getCoursesForUser]);

  useEffect(() => {
    initializeData();
    setLoading(false);
  }, [initializeData]);

  const [localEnrollments, setLocalEnrollments] = useState([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  
  // Update local enrollments when context changes
  useEffect(() => {
    setLocalEnrollments([...enrollments]);
  }, [enrollments]);
  
  const availableCourses = getCoursesForUser(); // All published courses
  
  // Custom enrolled courses that includes local state
  const getEnrolledCoursesLocal = () => {
    const contextEnrolled = getEnrolledCourses();
    const studentId = user?.id || user?._id || user?.email;
    
    // Get courses from local enrollments that aren't in context yet
    const localEnrolledCourses = localEnrollments
      .filter(enrollment => enrollment.studentId === studentId)
      .map(enrollment => {
        const course = availableCourses.find(c => c._id === enrollment.courseId);
        return course ? {
          ...course,
          enrollment,
          progress: { progress: 0, completedLessons: 0, totalLessons: 10 }
        } : null;
      })
      .filter(course => course !== null);
    
    // Combine and deduplicate
    const allEnrolled = [...contextEnrolled];
    localEnrolledCourses.forEach(localCourse => {
      if (!allEnrolled.find(c => c._id === localCourse._id)) {
        allEnrolled.push(localCourse);
      }
    });
    
    return allEnrolled;
  };
  
  const enrolledCourses = getEnrolledCoursesLocal(); // Student's enrolled courses

  const handleEnroll = async (courseId) => {
    if (enrollingCourseId) return; // Prevent double-click
    
    setEnrollingCourseId(courseId);
    
    try {
      const success = enrollInCourse(courseId);
      
      if (success) {
        // Initialize progress
        updateProgress(courseId, {
          progress: 0,
          completedLessons: 0,
          totalLessons: 10,
          lastAccessed: new Date().toISOString()
        });
        
        // Update local state immediately
        const newEnrollment = {
          _id: `enrollment_${Date.now()}`,
          studentId: user.id || user._id || user.email,
          studentName: user.name,
          studentEmail: user.email,
          courseId,
          enrolledAt: new Date().toISOString(),
          progress: 0,
          completedLessons: 0,
          totalLessons: 10
        };
        
        setLocalEnrollments(prev => [...prev, newEnrollment]);
        alert('✓ Successfully enrolled in course!');
      } else {
        alert('Already enrolled in this course.');
      }
    } finally {
      setTimeout(() => setEnrollingCourseId(null), 500);
    }
  };

  const simulateProgress = (courseId) => {
    // Get the current enrolled course to check existing progress
    const enrolledCourse = enrolledCourses.find(course => course._id === courseId);
    const currentCompletedLessons = enrolledCourse?.progress?.completedLessons || 0;
    const totalLessons = enrolledCourse?.progress?.totalLessons || 10;
    
    // Add 1-3 more lessons to current progress
    const additionalLessons = Math.floor(Math.random() * 3) + 1;
    const newCompletedLessons = Math.min(totalLessons, currentCompletedLessons + additionalLessons);
    const newProgressPercent = Math.round((newCompletedLessons / totalLessons) * 100);
    
    console.log('Updating progress:', {
      courseId,
      currentCompletedLessons,
      additionalLessons,
      newCompletedLessons,
      totalLessons,
      newProgressPercent
    });
    
    updateProgress(courseId, {
      completedLessons: newCompletedLessons,
      totalLessons: totalLessons,
      progress: newProgressPercent,
      lastAccessed: new Date().toISOString()
    });
    
    // Progress updated - state will trigger re-render
    
    alert(`Progress updated! Completed ${newCompletedLessons} of ${totalLessons} lessons (${newProgressPercent}%).`);
  };

  const getProgressPercentage = (course) => {
    if (!course.progress) return 0;
    return Math.round((course.progress.completedLessons / course.progress.totalLessons) * 100) || 0;
  };

  // Custom enrollment check that includes local state
  const isEnrolledInCourseLocal = (courseId) => {
    const studentId = user?.id || user?._id || user?.email;
    
    // Check context enrollments
    const contextEnrolled = isEnrolledInCourse(courseId);
    
    // Check local enrollments
    const localEnrolled = localEnrollments.some(
      enrollment => enrollment.studentId === studentId && enrollment.courseId === courseId
    );
    
    console.log('Enrollment check for', courseId, ':', { contextEnrolled, localEnrolled });
    return contextEnrolled || localEnrolled;
  };

  const clearAllData = () => {
    localStorage.removeItem('sharedCourses');
    localStorage.removeItem('studentEnrollments');
    localStorage.removeItem('studentProgress');
    reloadData();
    alert('All data cleared! Refresh the page to see default courses.');
  };

  const debugEnrollments = () => {
    console.log('=== DEBUG ENROLLMENTS ===');
    console.log('Current user:', user);
    console.log('All enrollments:', enrollments);
    console.log('Available courses:', availableCourses);
    console.log('Enrolled courses:', enrolledCourses);
    console.log('localStorage enrollments:', JSON.parse(localStorage.getItem('studentEnrollments') || '[]'));
    console.log('localStorage courses:', JSON.parse(localStorage.getItem('sharedCourses') || '[]'));
    
    // Test data persistence
    const testData = {
      enrollments: enrollments.length,
      courses: availableCourses.length,
      enrolled: enrolledCourses.length,
      localStorage: {
        enrollments: JSON.parse(localStorage.getItem('studentEnrollments') || '[]').length,
        courses: JSON.parse(localStorage.getItem('sharedCourses') || '[]').length
      }
    };
    
    alert(`Data Status:\nContext Enrollments: ${testData.enrollments}\nEnrolled Courses: ${testData.enrolled}\nLocalStorage Enrollments: ${testData.localStorage.enrollments}\nLocalStorage Courses: ${testData.localStorage.courses}`);
  };

  if (loading) {
    return (
      <div className="student-courses-loading">
        <div className="loading">Loading courses...</div>
        <button onClick={clearAllData} style={{ marginTop: '10px' }}>Clear All Data (Test)</button>
      </div>
    );
  }

  return (
    <div className="student-courses" key={`student-courses-${enrolledCourses.length}`}>
      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <div className="enrolled-courses-section">
          <h3>My Enrolled Courses ({enrolledCourses.length})</h3>
          <div className="courses-grid">
            {enrolledCourses.map((course) => {
              const progressPercent = getProgressPercentage(course);
              return (
                <div key={course._id} className="course-card enrolled">
                  <div className="course-header">
                    <div className="course-icon">
                      <BookOpen size={24} />
                    </div>
                    <div className="course-status">
                      <span className="enrolled-badge">Enrolled</span>
                    </div>
                  </div>
                  
                  <div className="course-content">
                    <h4>{course.title}</h4>
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
                      <div className="meta-item">
                        <Star size={16} />
                        <span>{course.level}</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="progress-section">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="progress-details">
                        <span>
                          {course.progress?.completedLessons || 0} of {course.progress?.totalLessons || 10} lessons completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="course-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
                    <button 
                      onClick={() => simulateProgress(course._id)}
                      className="btn btn-outline"
                    >
                      Update Progress
                    </button>
                    <Link 
                      to={`/courses/${course._id}`}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Courses Section */}
      <div className="available-courses-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3>Available Courses</h3>
            <small style={{ color: '#6b7280' }}>
              Context: {enrollments.length} | Local: {localEnrollments.length} | Enrolled: {enrolledCourses.length}
            </small>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => {
                refreshData();
                alert('Courses refreshed! New courses from teachers should now appear.');
              }} 
              className="btn btn-primary" 
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              🔄 Refresh Courses
            </button>
            <button onClick={debugEnrollments} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 8px' }}>
              Debug Enrollments
            </button>
            <button onClick={clearAllData} className="btn btn-outline" style={{ fontSize: '12px', padding: '4px 8px' }}>
              Reset Data
            </button>
          </div>
        </div>
        {availableCourses.length > 0 ? (
          <div className="courses-grid">
            {availableCourses.map((course) => {
              const isEnrolled = isEnrolledInCourseLocal(course._id);
              return (
                <div key={course._id} className={`course-card ${isEnrolled ? 'enrolled-preview' : 'available'}`}>
                  <div className="course-header">
                    <div className="course-icon">
                      <BookOpen size={24} />
                    </div>
                    <div className="course-status">
                      {isEnrolled ? (
                        <span className="enrolled-badge">Enrolled</span>
                      ) : (
                        <span className="available-badge">Available</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="course-content">
                    <h4>{course.title}</h4>
                    <p className="course-description">{course.description}</p>
                    <p className="teacher-name">by {course.teacherName}</p>
                    
                    <div className="course-meta">
                      <div className="meta-item">
                        <Clock size={16} />
                        <span>{course.duration}</span>
                      </div>
                      <div className="meta-item">
                        <Users size={16} />
                        <span>{course.enrolledStudents?.length || 0} students</span>
                      </div>
                      <div className="meta-item">
                        <Star size={16} />
                        <span>{course.level}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="course-actions" style={{ width: '100%' }}>
                    {isEnrolled ? (
                      <button 
                        className="btn btn-success"
                        disabled
                        style={{ 
                          width: '100%',
                          background: '#dcfce7', 
                          color: '#166534', 
                          border: '2px solid #bbf7d0',
                          cursor: 'default',
                          fontWeight: '600'
                        }}
                      >
                        ✓ Enrolled
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course._id)}
                        className="btn btn-primary"
                        disabled={enrollingCourseId === course._id}
                        style={{ 
                          width: '100%',
                          opacity: enrollingCourseId === course._id ? 0.6 : 1,
                          cursor: enrollingCourseId === course._id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {enrollingCourseId === course._id ? (
                          '⏳ Enrolling...'
                        ) : (
                          <>
                            <Plus size={16} style={{ marginRight: '4px' }} />
                            Enroll Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No courses available</h3>
            <p>No courses have been published by teachers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseList;
