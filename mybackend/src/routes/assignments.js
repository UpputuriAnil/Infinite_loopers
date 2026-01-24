const express = require('express');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { authenticate, authorize, isCourseInstructor, isEnrolledInCourse } = require('../middleware/auth');
const { validateAssignmentCreation, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments with filtering
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const courseId = req.query.courseId;
    const status = req.query.status;
    
    let query = { isActive: true };
    
    if (courseId) {
      query.course = courseId;
    }
    
    if (status) {
      const now = new Date();
      switch (status) {
        case 'upcoming':
          query.dueDate = { $gt: now };
          break;
        case 'overdue':
          query.dueDate = { $lt: now };
          break;
        case 'published':
          query.isPublished = true;
          break;
        case 'draft':
          query.isPublished = false;
          break;
      }
    }
    
    // Filter based on user role
    if (req.user.role === 'student') {
      // Students only see assignments from courses they're enrolled in
      const user = await User.findById(req.user._id).populate('enrolledCourses.course');
      const enrolledCourseIds = user.enrolledCourses.map(ec => ec.course._id);
      query.course = { $in: enrolledCourseIds };
      query.isPublished = true;
    } else if (req.user.role === 'teacher') {
      // Teachers see assignments from courses they teach
      if (!courseId) {
        const teachingCourses = await Course.find({ instructor: req.user._id }).select('_id');
        const teachingCourseIds = teachingCourses.map(c => c._id);
        query.course = { $in: teachingCourseIds };
      }
    }
    
    const assignments = await Assignment.find(query)
      .populate('course', 'title')
      .populate('instructor', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Assignment.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignments'
    });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title instructor')
      .populate('instructor', 'name avatar')
      .populate('submissions.student', 'name avatar');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check access permissions
    const isInstructor = assignment.instructor._id.toString() === req.user._id.toString();
    const isEnrolledStudent = req.user.role === 'student' && 
      assignment.course.instructor.toString() === req.user._id.toString();
    
    if (!isInstructor && !isEnrolledStudent && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Students only see published assignments
    if (req.user.role === 'student' && !assignment.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    res.json({
      success: true,
      data: { assignment }
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignment'
    });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment (Teachers only)
// @access  Private (Teacher)
router.post('/', authenticate, authorize('teacher', 'admin'), validateAssignmentCreation, async (req, res) => {
  try {
    // Verify teacher owns the course
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create assignments for your courses.'
      });
    }
    
    const assignmentData = {
      ...req.body,
      instructor: req.user._id
    };
    
    const assignment = new Assignment(assignmentData);
    await assignment.save();
    
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title')
      .populate('instructor', 'name avatar');
    
    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment: populatedAssignment }
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating assignment'
    });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment (Assignment creator only)
// @access  Private (Assignment Creator)
router.put('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if user can update this assignment
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own assignments.'
      });
    }
    
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('course', 'title')
    .populate('instructor', 'name avatar');
    
    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: { assignment: updatedAssignment }
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating assignment'
    });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment (Assignment creator only)
// @access  Private (Assignment Creator)
router.delete('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if user can delete this assignment
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own assignments.'
      });
    }
    
    // Soft delete - deactivate assignment
    assignment.isActive = false;
    await assignment.save();
    
    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting assignment'
    });
  }
});

// @route   POST /api/assignments/:id/publish
// @desc    Publish assignment (Assignment creator only)
// @access  Private (Assignment Creator)
router.post('/:id/publish', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if user can publish this assignment
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only publish your own assignments.'
      });
    }
    
    assignment.isPublished = true;
    assignment.publishedAt = new Date();
    await assignment.save();
    
    res.json({
      success: true,
      message: 'Assignment published successfully',
      data: { assignment }
    });
  } catch (error) {
    console.error('Publish assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while publishing assignment'
    });
  }
});

// @route   GET /api/assignments/:id/submissions
// @desc    Get assignment submissions (Assignment creator only)
// @access  Private (Assignment Creator)
router.get('/:id/submissions', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if user can view submissions
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view submissions for your assignments.'
      });
    }
    
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade')
      .sort('-submittedAt');
    
    res.json({
      success: true,
      data: {
        assignmentTitle: assignment.title,
        submissions
      }
    });
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

// @route   GET /api/assignments/course/:courseId
// @desc    Get assignments for a specific course
// @access  Private (Enrolled students or course instructor)
router.get('/course/:courseId', authenticate, validateMongoId('courseId'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check access permissions
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course.'
      });
    }
    
    let query = { course: req.params.courseId, isActive: true };
    
    // Students only see published assignments
    if (req.user.role === 'student') {
      query.isPublished = true;
    }
    
    const assignments = await Assignment.find(query)
      .populate('instructor', 'name avatar')
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        assignments
      }
    });
  } catch (error) {
    console.error('Get course assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course assignments'
    });
  }
});

// @route   GET /api/assignments/my/created
// @desc    Get assignments created by current user (Teachers only)
// @access  Private (Teacher)
router.get('/my/created', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      instructor: req.user._id,
      isActive: true 
    })
    .populate('course', 'title')
    .sort('-createdAt');
    
    res.json({
      success: true,
      data: { assignments }
    });
  } catch (error) {
    console.error('Get created assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching created assignments'
    });
  }
});

// @route   GET /api/assignments/my/assigned
// @desc    Get assignments assigned to current user (Students only)
// @access  Private (Student)
router.get('/my/assigned', authenticate, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses.course');
    const enrolledCourseIds = user.enrolledCourses.map(ec => ec.course._id);
    
    const assignments = await Assignment.find({
      course: { $in: enrolledCourseIds },
      isPublished: true,
      isActive: true
    })
    .populate('course', 'title')
    .populate('instructor', 'name avatar')
    .sort('-createdAt');
    
    // Get submission status for each assignment
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment: assignment._id,
          student: req.user._id
        });
        
        return {
          ...assignment.toObject(),
          submissionStatus: submission ? 'submitted' : 'pending',
          submittedAt: submission?.submittedAt,
          grade: submission?.grade
        };
      })
    );
    
    res.json({
      success: true,
      data: { assignments: assignmentsWithStatus }
    });
  } catch (error) {
    console.error('Get assigned assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assigned assignments'
    });
  }
});

module.exports = router;
