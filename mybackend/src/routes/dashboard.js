const express = require('express');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Grade = require('../models/Grade');
const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
const Material = require('../models/Material');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics for current user
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'teacher') {
      // Teacher dashboard statistics
      const teachingCourses = await Course.find({ 
        instructor: req.user._id, 
        isActive: true 
      }).select('_id');
      const courseIds = teachingCourses.map(c => c._id);

      // Basic counts
      const totalCourses = courseIds.length;
      const totalStudents = await Course.aggregate([
        { $match: { instructor: req.user._id, isActive: true } },
        { $project: { studentCount: { $size: '$enrolledStudents' } } },
        { $group: { _id: null, total: { $sum: '$studentCount' } } }
      ]).then(result => result[0]?.total || 0);

      const totalAssignments = await Assignment.countDocuments({ 
        instructor: req.user._id, 
        isActive: true 
      });

      const totalSubmissions = await Submission.countDocuments({ 
        assignment: { $in: await Assignment.find({ instructor: req.user._id }).select('_id').then(assignments => assignments.map(a => a._id)) }
      });

      const totalGrades = await Grade.countDocuments({ 
        gradedBy: req.user._id 
      });

      // Recent activity
      const recentAssignments = await Assignment.find({ 
        instructor: req.user._id, 
        isActive: true 
      })
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(5)
      .select('title dueDate course createdAt');

      const recentSubmissions = await Submission.find({ 
        assignment: { $in: await Assignment.find({ instructor: req.user._id }).select('_id').then(assignments => assignments.map(a => a._id)) }
      })
      .populate('student', 'name avatar')
      .populate('assignment', 'title')
      .sort('-submittedAt')
      .limit(5)
      .select('student assignment submittedAt status');

      // Course performance
      const coursePerformance = await Course.aggregate([
        { $match: { instructor: req.user._id, isActive: true } },
        {
          $lookup: {
            from: 'grades',
            localField: '_id',
            foreignField: 'course',
            as: 'grades'
          }
        },
        {
          $project: {
            title: 1,
            studentCount: { $size: '$enrolledStudents' },
            averageGrade: {
              $cond: {
                if: { $gt: [{ $size: '$grades' }, 0] },
                then: { $avg: '$grades.scores.percentage' },
                else: 0
              }
            }
          }
        }
      ]);

      stats = {
        totalCourses,
        totalStudents,
        totalAssignments,
        totalSubmissions,
        totalGrades,
        recentAssignments,
        recentSubmissions,
        coursePerformance
      };

    } else if (req.user.role === 'student') {
      // Student dashboard statistics
      const user = await User.findById(req.user._id).populate('enrolledCourses.course');
      const enrolledCourseIds = user.enrolledCourses.map(ec => ec.course._id);

      const totalCourses = enrolledCourseIds.length;
      
      const totalAssignments = await Assignment.countDocuments({ 
        course: { $in: enrolledCourseIds }, 
        isPublished: true, 
        isActive: true 
      });

      const totalSubmissions = await Submission.countDocuments({ 
        student: req.user._id 
      });

      const totalGrades = await Grade.countDocuments({ 
        student: req.user._id 
      });

      // Calculate average grade
      const averageGrade = await Grade.aggregate([
        { $match: { student: req.user._id } },
        { $group: { _id: null, avg: { $avg: '$scores.percentage' } } }
      ]).then(result => result[0]?.avg || 0);

      // Recent assignments
      const recentAssignments = await Assignment.find({ 
        course: { $in: enrolledCourseIds }, 
        isPublished: true, 
        isActive: true 
      })
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(5)
      .select('title dueDate course createdAt');

      // Recent grades
      const recentGrades = await Grade.find({ 
        student: req.user._id 
      })
      .populate('assignment', 'title')
      .populate('course', 'title')
      .sort('-gradedAt')
      .limit(5)
      .select('assignment course scores letterGrade gradedAt');

      // Course progress
      const courseProgress = user.enrolledCourses.map(ec => ({
        course: ec.course,
        progress: ec.progress,
        enrolledAt: ec.enrolledAt
      }));

      // Upcoming assignments
      const upcomingAssignments = await Assignment.find({ 
        course: { $in: enrolledCourseIds }, 
        isPublished: true, 
        isActive: true,
        dueDate: { $gte: new Date() }
      })
      .populate('course', 'title')
      .sort('dueDate')
      .limit(5)
      .select('title dueDate course');

      stats = {
        totalCourses,
        totalAssignments,
        totalSubmissions,
        totalGrades,
        averageGrade: Math.round(averageGrade * 100) / 100,
        recentAssignments,
        recentGrades,
        courseProgress,
        upcomingAssignments
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics for teachers
// @access  Private (Teacher)
router.get('/analytics', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { timeframe = '30d', courseId } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let courseFilter = { instructor: req.user._id, isActive: true };
    if (courseId) {
      courseFilter._id = courseId;
    }

    // Student enrollment trends
    const enrollmentTrends = await Course.aggregate([
      { $match: courseFilter },
      { $unwind: '$enrolledStudents' },
      {
        $match: {
          'enrolledStudents.enrolledAt': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrolledStudents.enrolledAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Assignment submission trends
    const submissionTrends = await Submission.aggregate([
      {
        $lookup: {
          from: 'assignments',
          localField: 'assignment',
          foreignField: '_id',
          as: 'assignmentInfo'
        }
      },
      {
        $match: {
          'assignmentInfo.instructor': req.user._id,
          submittedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$submittedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Grade distribution
    const gradeDistribution = await Grade.aggregate([
      { $match: { gradedBy: req.user._id } },
      {
        $group: {
          _id: '$letterGrade',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course performance comparison
    const coursePerformance = await Course.aggregate([
      { $match: courseFilter },
      {
        $lookup: {
          from: 'grades',
          localField: '_id',
          foreignField: 'course',
          as: 'grades'
        }
      },
      {
        $project: {
          title: 1,
          studentCount: { $size: '$enrolledStudents' },
          averageGrade: {
            $cond: {
              if: { $gt: [{ $size: '$grades' }, 0] },
              then: { $avg: '$grades.scores.percentage' },
              else: 0
            }
          },
          totalAssignments: {
            $size: {
              $filter: {
                input: '$assignments',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeframe,
        enrollmentTrends,
        submissionTrends,
        gradeDistribution,
        coursePerformance
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get recent activity feed
// @access  Private
router.get('/activity', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    let activities = [];

    if (req.user.role === 'teacher') {
      // Teacher activity feed
      const courseIds = await Course.find({ 
        instructor: req.user._id, 
        isActive: true 
      }).select('_id').then(courses => courses.map(c => c._id));

      const assignmentIds = await Assignment.find({ 
        instructor: req.user._id, 
        isActive: true 
      }).select('_id').then(assignments => assignments.map(a => a._id));

      // Recent submissions
      const recentSubmissions = await Submission.find({ 
        assignment: { $in: assignmentIds }
      })
      .populate('student', 'name avatar')
      .populate('assignment', 'title')
      .populate('course', 'title')
      .sort('-submittedAt')
      .limit(limit)
      .select('student assignment course submittedAt status');

      activities = recentSubmissions.map(sub => ({
        type: 'submission',
        message: `${sub.student.name} submitted ${sub.assignment.title}`,
        timestamp: sub.submittedAt,
        user: sub.student,
        course: sub.course
      }));

    } else if (req.user.role === 'student') {
      // Student activity feed
      const user = await User.findById(req.user._id).populate('enrolledCourses.course');
      const enrolledCourseIds = user.enrolledCourses.map(ec => ec.course._id);

      // Recent grades
      const recentGrades = await Grade.find({ 
        student: req.user._id 
      })
      .populate('assignment', 'title')
      .populate('course', 'title')
      .populate('gradedBy', 'name avatar')
      .sort('-gradedAt')
      .limit(limit)
      .select('assignment course gradedBy gradedAt scores letterGrade');

      activities = recentGrades.map(grade => ({
        type: 'grade',
        message: `You received a ${grade.letterGrade} on ${grade.assignment.title}`,
        timestamp: grade.gradedAt,
        user: grade.gradedBy,
        course: grade.course,
        grade: grade.letterGrade
      }));
    }

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity feed'
    });
  }
});

// @route   GET /api/dashboard/overview
// @desc    Get system overview (Admin only)
// @access  Private (Admin)
router.get('/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalCourses = await Course.countDocuments({ isActive: true });
    const totalAssignments = await Assignment.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();
    const totalGrades = await Grade.countDocuments();
    const totalForumPosts = await ForumPost.countDocuments({ isActive: true });
    const totalMaterials = await Material.countDocuments({ isActive: true });

    // Recent registrations
    const recentUsers = await User.find({ isActive: true })
      .sort('-createdAt')
      .limit(10)
      .select('name email role createdAt avatar');

    // Most active courses
    const activeCourses = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'assignments',
          localField: '_id',
          foreignField: 'course',
          as: 'assignments'
        }
      },
      {
        $lookup: {
          from: 'forumposts',
          localField: '_id',
          foreignField: 'course',
          as: 'forumPosts'
        }
      },
      {
        $project: {
          title: 1,
          studentCount: { $size: '$enrolledStudents' },
          assignmentCount: { $size: '$assignments' },
          forumPostCount: { $size: '$forumPosts' },
          activity: {
            $add: [
              { $size: '$enrolledStudents' },
              { $size: '$assignments' },
              { $size: '$forumPosts' }
            ]
          }
        }
      },
      { $sort: { activity: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          teachers: totalTeachers,
          students: totalStudents,
          courses: totalCourses,
          assignments: totalAssignments,
          submissions: totalSubmissions,
          grades: totalGrades,
          forumPosts: totalForumPosts,
          materials: totalMaterials
        },
        recentUsers,
        activeCourses
      }
    });
  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system overview'
    });
  }
});

module.exports = router;
