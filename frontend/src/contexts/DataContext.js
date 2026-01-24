import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading] = useState(false);

  // Use refs to store current values for beforeunload handler
  const currentDataRef = useRef({ courses: [], assignments: [], enrollments: [], progress: {} });
  
  // Update refs when state changes
  useEffect(() => {
    currentDataRef.current = { courses, assignments, enrollments, progress };
  }, [courses, assignments, enrollments, progress]);

  // Refresh data periodically to catch updates from other users/sessions
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // Reload data from localStorage to catch any updates
      const storedCourses = JSON.parse(localStorage.getItem('sharedCourses') || '[]');
      const storedAssignments = JSON.parse(localStorage.getItem('sharedAssignments') || '[]');
      
      // Only update if data has changed
      if (JSON.stringify(storedCourses) !== JSON.stringify(courses)) {
        console.log('📚 Refreshing courses data...');
        setCourses(storedCourses);
      }
      if (JSON.stringify(storedAssignments) !== JSON.stringify(assignments)) {
        console.log('📝 Refreshing assignments data...');
        setAssignments(storedAssignments);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(refreshInterval);
  }, [courses, assignments]);

  // Save data to localStorage
  const saveData = useCallback((type, data) => {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(type, jsonData);
      console.log(`Saved ${type}:`, data.length || Object.keys(data).length, 'items');
      
      // Verify the data was saved
      const verification = localStorage.getItem(type);
      if (verification) {
        console.log(`✅ ${type} successfully saved to localStorage`);
      } else {
        console.error(`❌ Failed to save ${type} to localStorage`);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  const loadData = useCallback(() => {
    try {
      const storedCourses = JSON.parse(localStorage.getItem('sharedCourses') || '[]');
      const storedAssignments = JSON.parse(localStorage.getItem('sharedAssignments') || '[]');
      const storedEnrollments = JSON.parse(localStorage.getItem('studentEnrollments') || '[]');
      const storedProgress = JSON.parse(localStorage.getItem('studentProgress') || '{}');

      console.log('Loading data from localStorage:');
      console.log('- Courses:', storedCourses.length);
      console.log('- Assignments:', storedAssignments.length);
      console.log('- Enrollments:', storedEnrollments.length);
      console.log('- Progress entries:', Object.keys(storedProgress).length);

      setCourses(storedCourses);
      setAssignments(storedAssignments);
      setEnrollments(storedEnrollments);
      setProgress(storedProgress);
      
      console.log('Data loaded successfully into context');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Initialize data from localStorage
  useEffect(() => {
    console.log('DataContext initializing...');
    loadData();
    
    // Add a small delay to ensure all data is loaded
    setTimeout(() => {
      console.log('DataContext initialization complete');
      const { courses: currentCourses, enrollments: currentEnrollments } = currentDataRef.current;
      console.log('Final state - Courses:', currentCourses.length, 'Enrollments:', currentEnrollments.length);
    }, 100);
    
    // Add beforeunload event to save data before page refresh/close
    const handleBeforeUnload = () => {
      console.log('Page unloading - saving current data...');
      // Force save current state to localStorage using ref values
      const { courses: currentCourses, assignments: currentAssignments, enrollments: currentEnrollments, progress: currentProgress } = currentDataRef.current;
      if (currentCourses.length > 0) saveData('sharedCourses', currentCourses);
      if (currentEnrollments.length > 0) saveData('studentEnrollments', currentEnrollments);
      if (currentAssignments.length > 0) saveData('sharedAssignments', currentAssignments);
      if (Object.keys(currentProgress).length > 0) saveData('studentProgress', currentProgress);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loadData, saveData]);

  // Course management functions
  const addCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      _id: `course_${Date.now()}`,
      teacherId: user?.id || user?._id,
      teacherName: user?.name,
      createdAt: new Date().toISOString(),
      enrolledStudents: [],
      published: true
    };

    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    saveData('sharedCourses', updatedCourses);
    return newCourse;
  };

  const updateCourse = (courseId, updates) => {
    const updatedCourses = courses.map(course =>
      course._id === courseId ? { ...course, ...updates } : course
    );
    setCourses(updatedCourses);
    saveData('sharedCourses', updatedCourses);
  };

  const deleteCourse = (courseId) => {
    const updatedCourses = courses.filter(course => course._id !== courseId);
    setCourses(updatedCourses);
    saveData('sharedCourses', updatedCourses);
  };

  // Assignment management functions
  const addAssignment = (assignmentData) => {
    const newAssignment = {
      ...assignmentData,
      _id: `assignment_${Date.now()}`,
      teacherId: user?.id || user?._id,
      teacherName: user?.name,
      createdAt: new Date().toISOString(),
      submissions: [],
      published: true
    };

    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    saveData('sharedAssignments', updatedAssignments);
    return newAssignment;
  };

  const updateAssignment = (assignmentId, updates) => {
    const updatedAssignments = assignments.map(assignment =>
      assignment._id === assignmentId ? { ...assignment, ...updates } : assignment
    );
    setAssignments(updatedAssignments);
    saveData('sharedAssignments', updatedAssignments);
  };

  const deleteAssignment = (assignmentId) => {
    const updatedAssignments = assignments.filter(assignment => assignment._id !== assignmentId);
    setAssignments(updatedAssignments);
    saveData('sharedAssignments', updatedAssignments);
  };

  // Student enrollment functions
  const enrollInCourse = (courseId) => {
    console.log('enrollInCourse called with:', { courseId, user });
    
    if (!user || user.role !== 'student') {
      console.log('Enrollment failed: Invalid user or not a student', { user });
      return false;
    }

    const studentId = user.id || user._id || user.email; // Try multiple ID fields
    console.log('Student ID:', studentId);
    
    const isAlreadyEnrolled = enrollments.some(
      enrollment => enrollment.studentId === studentId && enrollment.courseId === courseId
    );
    
    console.log('Already enrolled check:', { isAlreadyEnrolled, enrollments });

    if (isAlreadyEnrolled) {
      console.log('Already enrolled in this course');
      return false;
    }

    const newEnrollment = {
      _id: `enrollment_${Date.now()}`,
      studentId,
      studentName: user.name,
      studentEmail: user.email,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: 0,
      totalLessons: 0
    };

    const updatedEnrollments = [...enrollments, newEnrollment];
    console.log('Creating new enrollment:', newEnrollment);
    console.log('Updated enrollments:', updatedEnrollments);
    
    // Save to localStorage FIRST to ensure persistence
    saveData('studentEnrollments', updatedEnrollments);
    
    // Then update state
    setEnrollments(updatedEnrollments);

    // Update course enrolled students count
    const targetCourse = courses.find(c => c._id === courseId);
    console.log('Target course for enrollment:', targetCourse);
    
    if (targetCourse) {
      const updatedCourse = {
        ...targetCourse,
        enrolledStudents: [...(targetCourse.enrolledStudents || []), {
          studentId,
          studentName: user.name,
          enrolledAt: new Date().toISOString()
        }]
      };
      
      const updatedCourses = courses.map(c => 
        c._id === courseId ? updatedCourse : c
      );
      
      setCourses(updatedCourses);
      saveData('sharedCourses', updatedCourses);
    }

    console.log('Enrollment successful!');
    console.log('Data saved to localStorage - enrollments:', updatedEnrollments.length);
    
    // Force a state update to trigger re-renders
    setTimeout(() => {
      setEnrollments([...updatedEnrollments]);
    }, 50);
    
    return true;
  };

  const unenrollFromCourse = (courseId) => {
    if (!user || user.role !== 'student') return false;

    const studentId = user.id || user._id;
    const updatedEnrollments = enrollments.filter(
      enrollment => !(enrollment.studentId === studentId && enrollment.courseId === courseId)
    );

    setEnrollments(updatedEnrollments);
    saveData('studentEnrollments', updatedEnrollments);

    // Update course enrolled students count
    const course = courses.find(c => c._id === courseId);
    if (course) {
      updateCourse(courseId, {
        enrolledStudents: course.enrolledStudents.filter(s => s.studentId !== studentId)
      });
    }

    return true;
  };

  // Progress tracking functions
  const updateProgress = (courseId, progressData) => {
    if (!user || user.role !== 'student') {
      console.log('updateProgress failed: Invalid user or not a student', { user });
      return;
    }

    const studentId = user.id || user._id || user.email;
    const progressKey = `${studentId}_${courseId}`;

    console.log('updateProgress called:', { courseId, progressData, studentId, progressKey });

    const updatedProgress = {
      ...progress,
      [progressKey]: {
        ...progress[progressKey],
        ...progressData,
        lastUpdated: new Date().toISOString()
      }
    };

    console.log('Updated progress object:', updatedProgress);

    setProgress(updatedProgress);
    saveData('studentProgress', updatedProgress);

    // Update enrollment progress
    const updatedEnrollments = enrollments.map(enrollment => {
      if (enrollment.studentId === studentId && enrollment.courseId === courseId) {
        console.log('Updating enrollment progress:', enrollment._id);
        return { ...enrollment, ...progressData };
      }
      return enrollment;
    });

    console.log('Updated enrollments:', updatedEnrollments);

    setEnrollments(updatedEnrollments);
    saveData('studentEnrollments', updatedEnrollments);
  };

  const getStudentProgress = (courseId) => {
    if (!user || user.role !== 'student') return null;

    const studentId = user.id || user._id || user.email;
    const progressKey = `${studentId}_${courseId}`;
    return progress[progressKey] || { progress: 0, completedLessons: 0, totalLessons: 10 };
  };

  // Get overall learning progress across all enrolled courses
  const getOverallProgress = () => {
    if (user?.role !== 'student') return null;

    const enrolledCourses = getEnrolledCourses();
    if (enrolledCourses.length === 0) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        overallProgress: 0,
        totalLessons: 0,
        completedLessons: 0,
        averageProgress: 0,
        coursesProgress: []
      };
    }

    let totalLessons = 0;
    let completedLessons = 0;
    let completedCourses = 0;
    let inProgressCourses = 0;
    const coursesProgress = [];

    enrolledCourses.forEach(course => {
      const courseProgress = getStudentProgress(course._id);
      const progressPercent = Math.round((courseProgress.completedLessons / courseProgress.totalLessons) * 100) || 0;
      
      totalLessons += courseProgress.totalLessons;
      completedLessons += courseProgress.completedLessons;
      
      if (progressPercent >= 100) {
        completedCourses++;
      } else if (progressPercent > 0) {
        inProgressCourses++;
      }
      
      coursesProgress.push({
        courseId: course._id,
        courseTitle: course.title,
        progress: progressPercent,
        completedLessons: courseProgress.completedLessons,
        totalLessons: courseProgress.totalLessons,
        lastAccessed: courseProgress.lastAccessed || course.enrollment?.enrolledAt
      });
    });

    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const averageProgress = enrolledCourses.length > 0 ? 
      Math.round(coursesProgress.reduce((sum, cp) => sum + cp.progress, 0) / enrolledCourses.length) : 0;

    return {
      totalCourses: enrolledCourses.length,
      completedCourses,
      inProgressCourses,
      notStartedCourses: enrolledCourses.length - completedCourses - inProgressCourses,
      overallProgress,
      totalLessons,
      completedLessons,
      averageProgress,
      coursesProgress: coursesProgress.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    };
  };

  // Get learning streaks and achievements
  const getLearningStats = () => {
    if (user?.role !== 'student') return null;

    const overallProgress = getOverallProgress();
    
    // Calculate learning streak (days with progress updates)
    const progressEntries = Object.values(progress);
    const recentActivity = progressEntries
      .filter(p => p.lastAccessed)
      .map(p => new Date(p.lastAccessed).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));

    let currentStreak = 0;
    const today = new Date().toDateString();
    
    if (recentActivity.includes(today)) {
      currentStreak = 1;
      for (let i = 1; i < recentActivity.length; i++) {
        const prevDate = new Date(recentActivity[i-1]);
        const currDate = new Date(recentActivity[i]);
        const dayDiff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate achievements
    const achievements = [];
    if (overallProgress.completedCourses >= 1) {
      achievements.push({ type: 'first_completion', title: 'First Course Completed!', icon: '🎉' });
    }
    if (overallProgress.completedCourses >= 3) {
      achievements.push({ type: 'triple_completion', title: 'Course Master', icon: '🏆' });
    }
    if (overallProgress.averageProgress >= 50) {
      achievements.push({ type: 'halfway_hero', title: 'Halfway Hero', icon: '⭐' });
    }
    if (currentStreak >= 7) {
      achievements.push({ type: 'week_streak', title: 'Week Warrior', icon: '🔥' });
    }
    if (overallProgress.totalCourses >= 5) {
      achievements.push({ type: 'course_collector', title: 'Course Collector', icon: '📚' });
    }

    return {
      currentStreak,
      totalActiveDays: recentActivity.length,
      achievements,
      recentActivity: recentActivity.slice(0, 7), // Last 7 days
      ...overallProgress
    };
  };

  // Get filtered data based on user role
  const getCoursesForUser = () => {
    if (user?.role === 'teacher') {
      return courses.filter(course => course.teacherId === (user.id || user._id));
    } else if (user?.role === 'student') {
      return courses.filter(course => course.published);
    }
    return courses;
  };

  const getAssignmentsForUser = () => {
    if (user?.role === 'teacher') {
      return assignments.filter(assignment => assignment.teacherId === (user.id || user._id));
    } else if (user?.role === 'student') {
      const studentId = user.id || user._id || user.email;
      const enrolledCourseIds = enrollments
        .filter(enrollment => enrollment.studentId === studentId)
        .map(enrollment => enrollment.courseId);
      
      return assignments.filter(assignment => 
        assignment.published && enrolledCourseIds.includes(assignment.courseId)
      );
    }
    return assignments;
  };

  const getEnrolledCourses = () => {
    if (user?.role !== 'student') return [];

    const studentId = user.id || user._id || user.email;
    console.log('getEnrolledCourses - studentId:', studentId);
    console.log('getEnrolledCourses - enrollments:', enrollments);
    
    const studentEnrollments = enrollments.filter(enrollment => {
      const match = enrollment.studentId === studentId;
      console.log('Checking enrollment:', enrollment.studentId, '===', studentId, '?', match);
      return match;
    });
    
    console.log('Found student enrollments:', studentEnrollments);
    
    return studentEnrollments.map(enrollment => {
      const course = courses.find(c => c._id === enrollment.courseId);
      console.log('Mapping enrollment to course:', enrollment.courseId, '→', course?.title);
      return {
        ...course,
        enrollment,
        progress: getStudentProgress(enrollment.courseId)
      };
    }).filter(course => course._id); // Filter out courses that no longer exist
  };

  const isEnrolledInCourse = (courseId) => {
    if (user?.role !== 'student') return false;

    const studentId = user.id || user._id || user.email;
    const isEnrolled = enrollments.some(
      enrollment => enrollment.studentId === studentId && enrollment.courseId === courseId
    );
    console.log('isEnrolledInCourse check:', { courseId, studentId, isEnrolled, enrollments });
    return isEnrolled;
  };

  // Manual refresh function that can be called by components
  const refreshData = useCallback(() => {
    console.log('🔄 Manually refreshing all data...');
    loadData();
  }, [loadData]);

  const value = {
    // Data
    courses,
    assignments,
    enrollments,
    progress,
    loading,

    // Course functions
    addCourse,
    updateCourse,
    deleteCourse,
    getCoursesForUser,

    // Assignment functions
    addAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForUser,

    // Enrollment functions
    enrollInCourse,
    unenrollFromCourse,
    getEnrolledCourses,
    isEnrolledInCourse,

    // Progress functions
    updateProgress,
    getStudentProgress,
    getOverallProgress,
    getLearningStats,

    // Utility functions
    loadData,
    saveData,
    refreshData,
    
    // Force reload data (alias for compatibility)
    reloadData: () => {
      loadData();
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
