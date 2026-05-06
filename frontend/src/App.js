import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth/Auth';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import LandingPage from './components/Auth/LandingPage';
import StudentLogin from './components/Auth/StudentLogin';
import TeacherLogin from './components/Auth/TeacherLogin';
import AdminLogin from './components/Auth/AdminLogin';
import StudentSignup from './components/Auth/StudentSignup';
import TeacherSignup from './components/Auth/TeacherSignup';
import AdminSignup from './components/Auth/AdminSignup';
import Dashboard from './components/Dashboard/Dashboard';
import CourseList from './components/Courses/CourseList';
import CourseDetail from './components/Courses/CourseDetail';
import Achievements from './components/Student/Achievements';
import Profile from './components/Student/Profile';
import AccountSettings from './components/Student/AccountSettings';
import Forums from './components/Student/Forums';
import HelpSupport from './components/Student/HelpSupport';
import CreateCourse from './components/Courses/CreateCourse';
import AssignmentList from './components/Assignments/AssignmentList';
import CreateAssignment from './components/Assignments/CreateAssignment';
import SubmissionList from './components/Assignments/SubmissionList';
import SubmitAssignment from './components/Assignments/SubmitAssignment';
import GradesList from './components/Grades/GradesList';
import DiscussionForum from './components/Forum/DiscussionForum';
import CourseMaterials from './components/Materials/CourseMaterials';
import FloatingActionButton from './components/UI/FloatingActionButton';
import ScrollToTop from './components/UI/ScrollToTop';
import Navbar from './components/Layout/Navbar';
import './App.css';

// All routes are now public - no authentication required
function PublicRoute({ children }) {
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Role-based Login Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/login/student" element={
            <PublicRoute>
              <StudentLogin />
            </PublicRoute>
          } />
          <Route path="/login/teacher" element={
            <PublicRoute>
              <TeacherLogin />
            </PublicRoute>
          } />
          <Route path="/login/admin" element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          } />
          
          {/* Role-based Signup Routes */}
          <Route path="/signup" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/signup/student" element={
            <PublicRoute>
              <StudentSignup />
            </PublicRoute>
          } />
          <Route path="/signup/teacher" element={
            <PublicRoute>
              <TeacherSignup />
            </PublicRoute>
          } />
          <Route path="/signup/admin" element={
            <PublicRoute>
              <AdminSignup />
            </PublicRoute>
          } />
          
          {/* Legacy Routes */}
          <Route path="/register" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/assignments" element={<AssignmentList />} />
          <Route path="/create-assignment" element={<CreateAssignment />} />
          <Route path="/submissions/:assignmentId" element={<SubmissionList />} />
          <Route path="/submit/:assignmentId" element={<SubmitAssignment />} />
          <Route path="/forum/:courseId" element={<DiscussionForum />} />
          <Route path="/materials/:courseId" element={<CourseMaterials />} />
          <Route path="/grades" element={<GradesList />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/progress" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2>Learning Progress</h2>
              <p>Detailed progress tracking page coming soon!</p>
            </div>
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/certificates" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2>My Certificates</h2>
              <p>Certificates page coming soon!</p>
            </div>
          } />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/analytics" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2>Teaching Analytics</h2>
              <p>Analytics page coming soon!</p>
            </div>
          } />
          <Route path="/manage-courses" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2>Course Management</h2>
              <p>Course management page coming soon!</p>
            </div>
          } />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </main>
      
      {/* Interactive UI Components */}
      <FloatingActionButton />
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
