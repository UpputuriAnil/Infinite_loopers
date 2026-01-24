const express = require('express');
const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateGradeCreation, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/grades
// @desc    Get grades with filtering
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-gradedAt';
    const courseId = req.query.courseId;
    const assignmentId = req.query.assignmentId;
    const studentId = req.query.studentId;
    
    let query = {};
    
    if (courseId) {
      query.course = courseId;
    }
    
    if (assignmentId) {
      query.assignment = assignmentId;
    }
    
    if (studentId) {
      query.student = studentId;
    }
    
    // Filter based on user role
    if (req.user.role === 'student') {
      // Students only see their own grades
      query.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers see grades for assignments they created
      const teacherAssignments = await Assignment.find({ instructor: req.user._id }).select('_id');
      const assignmentIds = teacherAssignments.map(a => a._id);
      query.assignment = { $in: assignmentIds };
    }
    
    const grades = await Grade.find(query)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade')
      .populate('course', 'title')
      .populate('submission', 'submittedAt')
      .populate('gradedBy', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Grade.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        grades,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grades'
    });
  }
});

// @route   GET /api/grades/:id
// @desc    Get grade by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title description maxGrade')
      .populate('course', 'title')
      .populate('submission', 'submittedAt content files')
      .populate('gradedBy', 'name avatar');
    
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }
    
    // Check access permissions
    const isStudent = grade.student._id.toString() === req.user._id.toString();
    const isInstructor = req.user.role === 'teacher'; // Will be verified by assignment ownership
    
    if (!isStudent && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // If teacher, verify they own the assignment
    if (req.user.role === 'teacher') {
      const assignment = await Assignment.findById(grade.assignment._id);
      if (assignment.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    res.json({
      success: true,
      data: { grade }
    });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching grade'
    });
  }
});

// @route   POST /api/grades
// @desc    Create new grade (Teachers only)
// @access  Private (Teacher)
router.post('/', authenticate, authorize('teacher', 'admin'), validateGradeCreation, async (req, res) => {
  try {
    const { student, assignment, submission, scores, letterGrade, feedback } = req.body;
    
    // Verify assignment exists and teacher owns it
    const assignmentDoc = await Assignment.findById(assignment);
    if (!assignmentDoc) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    if (assignmentDoc.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only grade assignments you created.'
      });
    }
    
    // Verify submission exists and belongs to the student
    const submissionDoc = await Submission.findById(submission);
    if (!submissionDoc) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    if (submissionDoc.student.toString() !== student) {
      return res.status(400).json({
        success: false,
        message: 'Submission does not belong to the specified student'
      });
    }
    
    // Check if grade already exists
    const existingGrade = await Grade.findOne({ student, assignment, submission });
    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'Grade already exists for this submission'
      });
    }
    
    const gradeData = {
      student,
      assignment,
      submission,
      course: assignmentDoc.course,
      scores,
      letterGrade,
      feedback,
      gradedBy: req.user._id,
      gradedAt: new Date()
    };
    
    const grade = new Grade(gradeData);
    await grade.save();
    
    // Update submission status
    submissionDoc.status = 'graded';
    submissionDoc.grade = grade._id;
    await submissionDoc.save();
    
    // Update assignment statistics
    assignmentDoc.statistics.totalGraded += 1;
    const allGrades = await Grade.find({ assignment }).select('scores.percentage');
    const averageGrade = allGrades.reduce((sum, g) => sum + g.scores.percentage, 0) / allGrades.length;
    assignmentDoc.statistics.averageGrade = Math.round(averageGrade * 100) / 100;
    await assignmentDoc.save();
    
    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade')
      .populate('course', 'title')
      .populate('submission', 'submittedAt')
      .populate('gradedBy', 'name avatar');
    
    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: { grade: populatedGrade }
    });
  } catch (error) {
    console.error('Create grade error:', error);
    
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
      message: 'Server error while creating grade'
    });
  }
});

// @route   PUT /api/grades/:id
// @desc    Update grade (Grade creator only)
// @access  Private (Teacher)
router.put('/:id', authenticate, authorize('teacher', 'admin'), validateMongoId('id'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id).populate('assignment', 'instructor');
    
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }
    
    // Check if user can update this grade
    if (grade.assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update grades for your assignments.'
      });
    }
    
    const { scores, letterGrade, feedback } = req.body;
    
    // Update grade fields
    if (scores) grade.scores = { ...grade.scores, ...scores };
    if (letterGrade) grade.letterGrade = letterGrade;
    if (feedback) grade.feedback = { ...grade.feedback, ...feedback };
    
    grade.gradedAt = new Date();
    grade.gradedBy = req.user._id;
    
    await grade.save();
    
    // Update assignment statistics
    const assignment = await Assignment.findById(grade.assignment._id);
    const allGrades = await Grade.find({ assignment: grade.assignment }).select('scores.percentage');
    const averageGrade = allGrades.reduce((sum, g) => sum + g.scores.percentage, 0) / allGrades.length;
    assignment.statistics.averageGrade = Math.round(averageGrade * 100) / 100;
    await assignment.save();
    
    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade')
      .populate('course', 'title')
      .populate('submission', 'submittedAt')
      .populate('gradedBy', 'name avatar');
    
    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: { grade: populatedGrade }
    });
  } catch (error) {
    console.error('Update grade error:', error);
    
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
      message: 'Server error while updating grade'
    });
  }
});

// @route   DELETE /api/grades/:id
// @desc    Delete grade (Grade creator only)
// @access  Private (Teacher)
router.delete('/:id', authenticate, authorize('teacher', 'admin'), validateMongoId('id'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id).populate('assignment', 'instructor');
    
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }
    
    // Check if user can delete this grade
    if (grade.assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete grades for your assignments.'
      });
    }
    
    // Update submission status
    await Submission.findByIdAndUpdate(grade.submission, {
      status: 'submitted',
      $unset: { grade: 1 }
    });
    
    // Update assignment statistics
    const assignment = await Assignment.findById(grade.assignment._id);
    assignment.statistics.totalGraded = Math.max(0, assignment.statistics.totalGraded - 1);
    
    if (assignment.statistics.totalGraded > 0) {
      const remainingGrades = await Grade.find({ 
        assignment: grade.assignment._id,
        _id: { $ne: grade._id }
      }).select('scores.percentage');
      
      const averageGrade = remainingGrades.reduce((sum, g) => sum + g.scores.percentage, 0) / remainingGrades.length;
      assignment.statistics.averageGrade = Math.round(averageGrade * 100) / 100;
    } else {
      assignment.statistics.averageGrade = 0;
    }
    
    await assignment.save();
    
    await Grade.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting grade'
    });
  }
});

// @route   GET /api/grades/assignment/:assignmentId
// @desc    Get grades for a specific assignment (Teachers only)
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
        message: 'Access denied. You can only view grades for your assignments.'
      });
    }
    
    const grades = await Grade.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email avatar')
      .populate('submission', 'submittedAt isLate')
      .populate('gradedBy', 'name avatar')
      .sort('student.name');
    
    // Calculate statistics
    const statistics = {
      totalGraded: grades.length,
      averageGrade: grades.length > 0 ? 
        Math.round(grades.reduce((sum, g) => sum + g.scores.percentage, 0) / grades.length * 100) / 100 : 0,
      highestGrade: grades.length > 0 ? Math.max(...grades.map(g => g.scores.percentage)) : 0,
      lowestGrade: grades.length > 0 ? Math.min(...grades.map(g => g.scores.percentage)) : 0,
      gradeDistribution: {
        'A': grades.filter(g => g.letterGrade === 'A' || g.letterGrade === 'A+' || g.letterGrade === 'A-').length,
        'B': grades.filter(g => g.letterGrade === 'B' || g.letterGrade === 'B+' || g.letterGrade === 'B-').length,
        'C': grades.filter(g => g.letterGrade === 'C' || g.letterGrade === 'C+' || g.letterGrade === 'C-').length,
        'D': grades.filter(g => g.letterGrade === 'D' || g.letterGrade === 'D+' || g.letterGrade === 'D-').length,
        'F': grades.filter(g => g.letterGrade === 'F').length
      }
    };
    
    res.json({
      success: true,
      data: {
        assignmentTitle: assignment.title,
        maxGrade: assignment.maxGrade,
        grades,
        statistics
      }
    });
  } catch (error) {
    console.error('Get assignment grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assignment grades'
    });
  }
});

// @route   GET /api/grades/student/:studentId
// @desc    Get grades for a specific student
// @access  Private (Student owner or their teachers)
router.get('/student/:studentId', authenticate, validateMongoId('studentId'), async (req, res) => {
  try {
    // Check access permissions
    const isOwnGrades = req.params.studentId === req.user._id.toString();
    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwnGrades && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    let query = { student: req.params.studentId };
    
    // If teacher, only show grades for assignments they created
    if (isTeacher && !isAdmin) {
      const teacherAssignments = await Assignment.find({ instructor: req.user._id }).select('_id');
      const assignmentIds = teacherAssignments.map(a => a._id);
      query.assignment = { $in: assignmentIds };
    }
    
    const grades = await Grade.find(query)
      .populate('assignment', 'title maxGrade dueDate')
      .populate('course', 'title')
      .populate('submission', 'submittedAt isLate')
      .populate('gradedBy', 'name avatar')
      .sort('-gradedAt');
    
    // Calculate student statistics
    const statistics = {
      totalGrades: grades.length,
      averageGrade: grades.length > 0 ? 
        Math.round(grades.reduce((sum, g) => sum + g.scores.percentage, 0) / grades.length * 100) / 100 : 0,
      highestGrade: grades.length > 0 ? Math.max(...grades.map(g => g.scores.percentage)) : 0,
      lowestGrade: grades.length > 0 ? Math.min(...grades.map(g => g.scores.percentage)) : 0,
      gradeDistribution: {
        'A': grades.filter(g => g.letterGrade === 'A' || g.letterGrade === 'A+' || g.letterGrade === 'A-').length,
        'B': grades.filter(g => g.letterGrade === 'B' || g.letterGrade === 'B+' || g.letterGrade === 'B-').length,
        'C': grades.filter(g => g.letterGrade === 'C' || g.letterGrade === 'C+' || g.letterGrade === 'C-').length,
        'D': grades.filter(g => g.letterGrade === 'D' || g.letterGrade === 'D+' || g.letterGrade === 'D-').length,
        'F': grades.filter(g => g.letterGrade === 'F').length
      }
    };
    
    const student = await User.findById(req.params.studentId).select('name email avatar');
    
    res.json({
      success: true,
      data: {
        student,
        grades,
        statistics
      }
    });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student grades'
    });
  }
});

// @route   GET /api/grades/course/:courseId
// @desc    Get grades for a specific course
// @access  Private (Course instructor or enrolled students)
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
        message: 'Access denied. You must be enrolled in this course or be the instructor.'
      });
    }
    
    let query = { course: req.params.courseId };
    
    // Students only see their own grades
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }
    
    const grades = await Grade.find(query)
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade dueDate')
      .populate('submission', 'submittedAt isLate')
      .populate('gradedBy', 'name avatar')
      .sort('-gradedAt');
    
    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        grades
      }
    });
  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course grades'
    });
  }
});

// @route   GET /api/grades/my/received
// @desc    Get grades received by current user (Students only)
// @access  Private (Student)
router.get('/my/received', authenticate, authorize('student'), async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.user._id })
      .populate('assignment', 'title maxGrade dueDate')
      .populate('course', 'title')
      .populate('submission', 'submittedAt isLate')
      .populate('gradedBy', 'name avatar')
      .sort('-gradedAt');
    
    // Calculate statistics
    const statistics = {
      totalGrades: grades.length,
      averageGrade: grades.length > 0 ? 
        Math.round(grades.reduce((sum, g) => sum + g.scores.percentage, 0) / grades.length * 100) / 100 : 0,
      highestGrade: grades.length > 0 ? Math.max(...grades.map(g => g.scores.percentage)) : 0,
      lowestGrade: grades.length > 0 ? Math.min(...grades.map(g => g.scores.percentage)) : 0,
      recentGrades: grades.slice(0, 5) // Last 5 grades
    };
    
    res.json({
      success: true,
      data: {
        grades,
        statistics
      }
    });
  } catch (error) {
    console.error('Get received grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching received grades'
    });
  }
});

// @route   GET /api/grades/my/given
// @desc    Get grades given by current user (Teachers only)
// @access  Private (Teacher)
router.get('/my/given', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const grades = await Grade.find({ gradedBy: req.user._id })
      .populate('student', 'name email avatar')
      .populate('assignment', 'title maxGrade')
      .populate('course', 'title')
      .populate('submission', 'submittedAt isLate')
      .sort('-gradedAt');
    
    res.json({
      success: true,
      data: { grades }
    });
  } catch (error) {
    console.error('Get given grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching given grades'
    });
  }
});

// @route   POST /api/grades/bulk
// @desc    Create multiple grades at once (Teachers only)
// @access  Private (Teacher)
router.post('/bulk', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { assignmentId, grades: gradeData } = req.body;
    
    if (!assignmentId || !gradeData || !Array.isArray(gradeData)) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and grades array are required'
      });
    }
    
    // Verify assignment exists and teacher owns it
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    if (assignment.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only grade assignments you created.'
      });
    }
    
    const createdGrades = [];
    const errors = [];
    
    for (let i = 0; i < gradeData.length; i++) {
      try {
        const { student, submission, scores, letterGrade, feedback } = gradeData[i];
        
        // Check if grade already exists
        const existingGrade = await Grade.findOne({ student, assignment: assignmentId, submission });
        if (existingGrade) {
          errors.push({ index: i, message: 'Grade already exists for this submission' });
          continue;
        }
        
        const grade = new Grade({
          student,
          assignment: assignmentId,
          submission,
          course: assignment.course,
          scores,
          letterGrade,
          feedback,
          gradedBy: req.user._id,
          gradedAt: new Date()
        });
        
        await grade.save();
        
        // Update submission status
        await Submission.findByIdAndUpdate(submission, {
          status: 'graded',
          grade: grade._id
        });
        
        createdGrades.push(grade);
      } catch (error) {
        errors.push({ index: i, message: error.message });
      }
    }
    
    // Update assignment statistics
    assignment.statistics.totalGraded = await Grade.countDocuments({ assignment: assignmentId });
    const allGrades = await Grade.find({ assignment: assignmentId }).select('scores.percentage');
    const averageGrade = allGrades.reduce((sum, g) => sum + g.scores.percentage, 0) / allGrades.length;
    assignment.statistics.averageGrade = Math.round(averageGrade * 100) / 100;
    await assignment.save();
    
    res.status(201).json({
      success: true,
      message: `${createdGrades.length} grades created successfully`,
      data: {
        createdGrades: createdGrades.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Bulk create grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bulk grades'
    });
  }
});

module.exports = router;
