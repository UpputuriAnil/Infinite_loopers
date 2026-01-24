const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateSubmissionCreation, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/submissions');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|mp4|avi|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: images, documents, videos, archives'));
    }
  }
});

// @route   GET /api/submissions
// @desc    Get submissions with filtering
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-submittedAt';
    const assignmentId = req.query.assignmentId;
    const courseId = req.query.courseId;
    const status = req.query.status;
    
    let query = {};
    
    if (assignmentId) {
      query.assignment = assignmentId;
    }
    
    if (courseId) {
      query.course = courseId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Filter based on user role
    if (req.user.role === 'student') {
      // Students only see their own submissions
      query.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers see submissions for assignments they created
      const teacherAssignments = await Assignment.find({ instructor: req.user._id }).select('_id');
      const assignmentIds = teacherAssignments.map(a => a._id);
      query.assignment = { $in: assignmentIds };
    }
    
    const submissions = await Submission.find(query)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade dueDate')
      .populate('course', 'title')
      .populate('gradedBy', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Submission.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get submission by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title description maxGrade dueDate')
      .populate('course', 'title')
      .populate('gradedBy', 'name avatar');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check access permissions
    const isStudent = submission.student._id.toString() === req.user._id.toString();
    const isInstructor = req.user.role === 'teacher'; // Will be verified by assignment ownership
    
    if (!isStudent && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // If teacher, verify they own the assignment
    if (req.user.role === 'teacher') {
      const assignment = await Assignment.findById(submission.assignment._id);
      if (assignment.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission'
    });
  }
});

// @route   POST /api/submissions
// @desc    Create new submission (Students only)
// @access  Private (Student)
router.post('/', authenticate, authorize('student'), upload.array('files', 5), validateSubmissionCreation, async (req, res) => {
  try {
    const { assignment: assignmentId, course: courseId, content } = req.body;
    
    // Verify assignment exists and is published
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    if (!assignment.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Assignment is not published yet'
      });
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findById(courseId);
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to submit assignments'
      });
    }
    
    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });
    
    if (existingSubmission && !assignment.attempts.allowMultiple) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }
    
    // Check due date
    const now = new Date();
    const isLate = now > assignment.dueDate;
    
    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    })) : [];
    
    const submissionData = {
      student: req.user._id,
      assignment: assignmentId,
      course: courseId,
      content: JSON.parse(content || '{}'),
      files,
      isLate,
      submittedAt: now
    };
    
    const submission = new Submission(submissionData);
    await submission.save();
    
    // Update assignment submission count
    assignment.statistics.totalSubmissions += 1;
    await assignment.save();
    
    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade')
      .populate('course', 'title');
    
    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: { submission: populatedSubmission }
    });
  } catch (error) {
    console.error('Create submission error:', error);
    
    // Clean up uploaded files if submission failed
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
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
      message: 'Server error while creating submission'
    });
  }
});

// @route   PUT /api/submissions/:id
// @desc    Update submission (Student owner only, before grading)
// @access  Private (Student)
router.put('/:id', authenticate, validateMongoId('id'), upload.array('files', 5), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check if user owns this submission
    if (submission.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own submissions.'
      });
    }
    
    // Check if submission has been graded
    if (submission.status === 'graded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a graded submission'
      });
    }
    
    // Check assignment settings
    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment.attempts.allowMultiple) {
      return res.status(400).json({
        success: false,
        message: 'This assignment does not allow resubmissions'
      });
    }
    
    // Process new files if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old files
      submission.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      });
      
      // Add new files
      submission.files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }
    
    // Update content if provided
    if (req.body.content) {
      submission.content = JSON.parse(req.body.content);
    }
    
    submission.submittedAt = new Date();
    submission.version += 1;
    
    await submission.save();
    
    const populatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade')
      .populate('course', 'title');
    
    res.json({
      success: true,
      message: 'Submission updated successfully',
      data: { submission: populatedSubmission }
    });
  } catch (error) {
    console.error('Update submission error:', error);
    
    // Clean up uploaded files if update failed
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating submission'
    });
  }
});

// @route   DELETE /api/submissions/:id
// @desc    Delete submission (Student owner only, before grading)
// @access  Private (Student)
router.delete('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check if user owns this submission
    if (submission.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own submissions.'
      });
    }
    
    // Check if submission has been graded
    if (submission.status === 'graded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a graded submission'
      });
    }
    
    // Delete associated files
    submission.files.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
    
    await Submission.findByIdAndDelete(req.params.id);
    
    // Update assignment submission count
    const assignment = await Assignment.findById(submission.assignment);
    assignment.statistics.totalSubmissions = Math.max(0, assignment.statistics.totalSubmissions - 1);
    await assignment.save();
    
    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting submission'
    });
  }
});

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get submissions for a specific assignment (Teachers only)
// @access  Private (Assignment Creator)
router.get('/assignment/:assignmentId', authenticate, authorize('teacher', 'admin'), validateMongoId('assignmentId'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if user owns this assignment
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view submissions for your assignments.'
      });
    }
    
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email avatar')
      .populate('gradedBy', 'name avatar')
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
      message: 'Server error while fetching assignment submissions'
    });
  }
});

// @route   GET /api/submissions/my/submitted
// @desc    Get submissions by current user (Students only)
// @access  Private (Student)
router.get('/my/submitted', authenticate, authorize('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title maxGrade dueDate')
      .populate('course', 'title')
      .populate('gradedBy', 'name avatar')
      .sort('-submittedAt');
    
    res.json({
      success: true,
      data: { submissions }
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions'
    });
  }
});

// @route   GET /api/submissions/download/:id
// @desc    Download submission file
// @access  Private (Student owner or assignment creator)
router.get('/download/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const { fileIndex } = req.query;
    
    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'instructor');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check access permissions
    const isStudent = submission.student.toString() === req.user._id.toString();
    const isInstructor = submission.assignment.instructor.toString() === req.user._id.toString();
    
    if (!isStudent && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const fileIdx = parseInt(fileIndex) || 0;
    const file = submission.files[fileIdx];
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    res.download(file.path, file.originalName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading file'
    });
  }
});

module.exports = router;
