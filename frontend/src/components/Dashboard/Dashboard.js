import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  BookOpen, 
  Users, 
  FileText, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import AdvancedSearch from '../UI/AdvancedSearch';
import GradeManagement from '../Teacher/GradeManagement';
import StudentAnalytics from '../Teacher/StudentAnalytics';
import TeacherAssignments from '../Teacher/TeacherAssignments';
import AssignmentSubmission from '../Student/AssignmentSubmission';
import StudentCourseList from '../Student/StudentCourseList';
import LearningProgress from '../Student/LearningProgress';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { getCoursesForUser, getAssignmentsForUser, getEnrolledCourses, addCourse } = useData();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    assignments: 0,
    submissions: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize some default courses if none exist
      const userCourses = getCoursesForUser();
      if (userCourses.length === 0 && user?.role === 'teacher') {
        // Add default courses for teachers
        const defaultCourses = [
          {
            title: 'Web Development Fundamentals',
            description: 'Learn HTML, CSS, JavaScript and React from scratch',
            category: 'programming',
            level: 'beginner',
            duration: '8 weeks',
            maxStudents: 30
          },
          {
            title: 'Advanced JavaScript',
            description: 'Master ES6+, async programming, and modern JavaScript patterns',
            category: 'programming',
            level: 'advanced',
            duration: '6 weeks',
            maxStudents: 25
          }
        ];
        
        defaultCourses.forEach(course => addCourse(course));
      }
      
      // Get updated data after potential course creation
      const courses = getCoursesForUser();
      const assignments = getAssignmentsForUser();
      
      if (user?.role === 'teacher') {
        setRecentCourses(courses.slice(0, 3));
        setStats({
          courses: courses.length,
          students: courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0),
          assignments: assignments.length,
          submissions: assignments.reduce((acc, assignment) => acc + (assignment.submissions?.length || 0), 0)
        });
      } else if (user?.role === 'student') {
        const enrolledCourses = getEnrolledCourses();
        const studentAssignments = getAssignmentsForUser();
        
        // Get learning progress stats
        const { getOverallProgress } = require('../../contexts/DataContext');
        let progressStats = { completedCourses: 0, overallProgress: 0 };
        try {
          const overallProgress = getOverallProgress?.() || {};
          progressStats = {
            completedCourses: overallProgress.completedCourses || 0,
            overallProgress: overallProgress.overallProgress || 0
          };
        } catch (error) {
          console.log('Progress stats not available yet');
        }
        
        setRecentCourses(enrolledCourses.slice(0, 3));
        setStats({
          courses: enrolledCourses.length,
          assignments: studentAssignments.length,
          completed: progressStats.completedCourses,
          progress: progressStats.overallProgress
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role, getCoursesForUser, getAssignmentsForUser, getEnrolledCourses, addCourse]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const teacherStats = [
    { icon: BookOpen, label: 'Courses', value: stats.courses, color: 'blue' },
    { icon: Users, label: 'Students', value: stats.students, color: 'green' },
    { icon: FileText, label: 'Assignments', value: stats.assignments, color: 'purple' },
    { icon: CheckCircle, label: 'Submissions', value: stats.submissions, color: 'orange' }
  ];

  const studentStats = [
    { icon: BookOpen, label: 'Enrolled Courses', value: stats.courses, color: 'blue' },
    { icon: CheckCircle, label: 'Completed Courses', value: stats.completed, color: 'green' },
    { icon: FileText, label: 'Assignments', value: stats.assignments, color: 'purple' },
    { icon: TrendingUp, label: 'Overall Progress', value: `${stats.progress || 0}%`, color: 'orange' }
  ];

  const statsToShow = user?.role === 'teacher' ? teacherStats : studentStats;

  const handleSearch = (searchData) => {
    console.log('Search:', searchData);
    // Implement search functionality
  };


  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what's happening with your {user?.role === 'teacher' ? 'teaching' : 'learning'} today.</p>
        </div>
        
        <div className="dashboard-search">
          <AdvancedSearch onSearch={handleSearch} />
        </div>
      </div>

      <div className="stats-grid">
        {statsToShow.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {user?.role === 'teacher' ? (
          <>
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Courses</h2>
                <Link to="/courses" className="view-all-link">
                  View All
                </Link>
              </div>
              <TeacherAssignments />
            </div>
            
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Grade Management</h2>
                <Link to="/grades" className="view-all-link">
                  View All
                </Link>
              </div>
              <GradeManagement />
            </div>
            
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Student Analytics</h2>
                <Link to="/analytics" className="view-all-link">
                  View Full Report
                </Link>
              </div>
              <StudentAnalytics />
            </div>
          </>
        ) : (
          <>
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Learning Progress</h2>
              </div>
              <LearningProgress />
            </div>
            
            <div className="dashboard-section">
              <div className="section-header">
                <h2>My Courses</h2>
                <Link to="/courses" className="view-all-link">
                  View All
                </Link>
              </div>
              <StudentCourseList />
            </div>
            
            <div className="dashboard-section">
              <div className="section-header">
                <h2>My Assignments</h2>
                <Link to="/assignments" className="view-all-link">
                  View All
                </Link>
              </div>
              <AssignmentSubmission />
            </div>
          </>
        )}
      </div>
        
    </div>
  );
};

export default Dashboard;
