import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Award,
  BarChart3,
  Download
} from 'lucide-react';
import './StudentAnalytics.css';

const StudentAnalytics = () => {
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    // Mock student analytics data
    const mockStudents = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john@example.com',
        course: 'Web Development',
        enrolledDate: '2024-09-01',
        lastActive: '2024-10-16',
        completedAssignments: 8,
        totalAssignments: 10,
        averageGrade: 85,
        timeSpent: 45, // hours
        progress: 80,
        status: 'active'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        course: 'Backend Development',
        enrolledDate: '2024-09-15',
        lastActive: '2024-10-15',
        completedAssignments: 6,
        totalAssignments: 8,
        averageGrade: 92,
        timeSpent: 38,
        progress: 75,
        status: 'active'
      },
      {
        id: 3,
        name: 'Mike Davis',
        email: 'mike@example.com',
        course: 'Web Development',
        enrolledDate: '2024-08-20',
        lastActive: '2024-10-10',
        completedAssignments: 12,
        totalAssignments: 15,
        averageGrade: 78,
        timeSpent: 62,
        progress: 85,
        status: 'at-risk'
      },
      {
        id: 4,
        name: 'Emily Brown',
        email: 'emily@example.com',
        course: 'Database Design',
        enrolledDate: '2024-09-10',
        lastActive: '2024-10-16',
        completedAssignments: 5,
        totalAssignments: 6,
        averageGrade: 95,
        timeSpent: 28,
        progress: 90,
        status: 'excellent'
      }
    ];
    setStudents(mockStudents);
  }, []);

  const filteredStudents = students.filter(student => 
    selectedCourse === 'all' || student.course === selectedCourse
  );

  const courses = [...new Set(students.map(s => s.course))];

  const getOverallStats = () => {
    const totalStudents = filteredStudents.length;
    const activeStudents = filteredStudents.filter(s => s.status === 'active' || s.status === 'excellent').length;
    const atRiskStudents = filteredStudents.filter(s => s.status === 'at-risk').length;
    const avgGrade = filteredStudents.reduce((acc, s) => acc + s.averageGrade, 0) / totalStudents || 0;
    const avgProgress = filteredStudents.reduce((acc, s) => acc + s.progress, 0) / totalStudents || 0;

    return {
      totalStudents,
      activeStudents,
      atRiskStudents,
      avgGrade: Math.round(avgGrade),
      avgProgress: Math.round(avgProgress)
    };
  };

  const stats = getOverallStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'excellent';
      case 'active': return 'active';
      case 'at-risk': return 'at-risk';
      default: return 'active';
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'excellent';
    if (grade >= 80) return 'good';
    if (grade >= 70) return 'average';
    return 'poor';
  };

  const handleExportReport = () => {
    // Prepare CSV data
    const headers = ['Student Name', 'Email', 'Course', 'Enrolled Date', 'Last Active', 'Progress (%)', 'Completed Assignments', 'Total Assignments', 'Average Grade (%)', 'Time Spent (hours)', 'Status'];
    
    const rows = filteredStudents.map(student => [
      student.name,
      student.email,
      student.course,
      student.enrolledDate,
      student.lastActive,
      student.progress,
      student.completedAssignments,
      student.totalAssignments,
      student.averageGrade,
      student.timeSpent,
      student.status
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `student_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="student-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h2>Student Analytics</h2>
          <p>Monitor student performance and engagement</p>
        </div>
        
        <div className="analytics-actions">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
          </select>
          
          <button className="export-btn" onClick={handleExportReport}>
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      <div className="analytics-filters">
        <select 
          value={selectedCourse} 
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="course-filter"
        >
          <option value="all">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      <div className="analytics-overview">
        <div className="overview-card">
          <div className="overview-icon total">
            <Users size={24} />
          </div>
          <div className="overview-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-icon active">
            <TrendingUp size={24} />
          </div>
          <div className="overview-content">
            <h3>{stats.activeStudents}</h3>
            <p>Active Students</p>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-icon at-risk">
            <TrendingDown size={24} />
          </div>
          <div className="overview-content">
            <h3>{stats.atRiskStudents}</h3>
            <p>At Risk</p>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-icon grade">
            <Award size={24} />
          </div>
          <div className="overview-content">
            <h3>{stats.avgGrade}%</h3>
            <p>Average Grade</p>
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-icon progress">
            <BarChart3 size={24} />
          </div>
          <div className="overview-content">
            <h3>{stats.avgProgress}%</h3>
            <p>Average Progress</p>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Performance Distribution</h3>
          <div className="performance-chart">
            <div className="performance-bar excellent" style={{height: '80%'}}>
              <span>90-100%</span>
              <div className="bar-value">
                {filteredStudents.filter(s => s.averageGrade >= 90).length}
              </div>
            </div>
            <div className="performance-bar good" style={{height: '60%'}}>
              <span>80-89%</span>
              <div className="bar-value">
                {filteredStudents.filter(s => s.averageGrade >= 80 && s.averageGrade < 90).length}
              </div>
            </div>
            <div className="performance-bar average" style={{height: '40%'}}>
              <span>70-79%</span>
              <div className="bar-value">
                {filteredStudents.filter(s => s.averageGrade >= 70 && s.averageGrade < 80).length}
              </div>
            </div>
            <div className="performance-bar poor" style={{height: '20%'}}>
              <span>Below 70%</span>
              <div className="bar-value">
                {filteredStudents.filter(s => s.averageGrade < 70).length}
              </div>
            </div>
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Engagement Levels</h3>
          <div className="engagement-chart">
            <div className="engagement-item">
              <div className="engagement-label">High Engagement</div>
              <div className="engagement-bar">
                <div 
                  className="engagement-fill high" 
                  style={{width: `${(filteredStudents.filter(s => s.timeSpent > 40).length / filteredStudents.length) * 100}%`}}
                ></div>
              </div>
              <span>{filteredStudents.filter(s => s.timeSpent > 40).length}</span>
            </div>
            <div className="engagement-item">
              <div className="engagement-label">Medium Engagement</div>
              <div className="engagement-bar">
                <div 
                  className="engagement-fill medium" 
                  style={{width: `${(filteredStudents.filter(s => s.timeSpent >= 20 && s.timeSpent <= 40).length / filteredStudents.length) * 100}%`}}
                ></div>
              </div>
              <span>{filteredStudents.filter(s => s.timeSpent >= 20 && s.timeSpent <= 40).length}</span>
            </div>
            <div className="engagement-item">
              <div className="engagement-label">Low Engagement</div>
              <div className="engagement-bar">
                <div 
                  className="engagement-fill low" 
                  style={{width: `${(filteredStudents.filter(s => s.timeSpent < 20).length / filteredStudents.length) * 100}%`}}
                ></div>
              </div>
              <span>{filteredStudents.filter(s => s.timeSpent < 20).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="students-table">
        <h3>Student Details</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Assignments</th>
                <th>Avg Grade</th>
                <th>Time Spent</th>
                <th>Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="student-name">{student.name}</div>
                        <div className="student-email">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{student.course}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${student.progress}%`}}
                        ></div>
                      </div>
                      <span>{student.progress}%</span>
                    </div>
                  </td>
                  <td>{student.completedAssignments}/{student.totalAssignments}</td>
                  <td>
                    <span className={`grade-badge ${getGradeColor(student.averageGrade)}`}>
                      {student.averageGrade}%
                    </span>
                  </td>
                  <td>{student.timeSpent}h</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(student.status)}`}>
                      {student.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td>{new Date(student.lastActive).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
