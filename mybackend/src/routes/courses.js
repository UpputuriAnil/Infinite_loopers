const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize, isCourseInstructor, isEnrolledInCourse } = require('../middleware/auth');
const { validateCourseCreation, validateCourseUpdate, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const category = req.query.category;
    const level = req.query.level;
    const search = req.query.search;
    
    // Build query
    let query = { isPublished: true, isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // If user is a teacher, also show their unpublished courses
    if (req.user.role === 'teacher') {
      query = {
        $or: [
          { ...query },
          { instructor: req.user._id, isActive: true }
        ]
      };
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-enrolledStudents');
    
    const total = await Course.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('enrolledStudents.student', 'name avatar')
      .populate('ratings.user', 'name avatar');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user can view this course
    const canView = course.isPublished || 
                   course.instructor._id.toString() === req.user._id.toString() ||
                   req.user.role === 'admin';
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Increment view count
    course.statistics.totalViews += 1;
    await course.save();
    
    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course (Teachers only)
// @access  Private (Teacher)
router.post('/', authenticate, authorize('teacher', 'admin'), validateCourseCreation, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user._id
    };
    
    const course = new Course(courseData);
    await course.save();
    
    // Add course to instructor's teaching courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { teachingCourses: course._id } }
    );
    
    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name avatar');
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course: populatedCourse }
    });
  } catch (error) {
    console.error('Create course error:', error);
    
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
      message: 'Server error while creating course'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course (Course instructor only)
// @access  Private (Course Instructor)
router.put('/:id', authenticate, validateMongoId('id'), isCourseInstructor, validateCourseUpdate, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name avatar');
    
    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Update course error:', error);
    
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
      message: 'Server error while updating course'
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course (Course instructor only)
// @access  Private (Course Instructor)
router.delete('/:id', authenticate, validateMongoId('id'), isCourseInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    // Soft delete - deactivate course
    course.isActive = false;
    await course.save();
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course (Students only)
// @access  Private (Student)
router.post('/:id/enroll', authenticate, authorize('student'), validateMongoId('id'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }
    
    // Enroll student
    course.enrollStudent(req.user._id);
    await course.save();
    
    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(
      req.user._id,
      { 
        $push: { 
          enrolledCourses: {
            course: course._id,
            progress: 0
          }
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        courseId: course._id,
        courseTitle: course.title
      }
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while enrolling in course'
    });
  }
});

// @route   DELETE /api/courses/:id/enroll
// @desc    Unenroll from course (Students only)
// @access  Private (Student)
router.delete('/:id/enroll', authenticate, authorize('student'), validateMongoId('id'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Remove from course enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      student => student.student.toString() !== req.user._id.toString()
    );
    await course.save();
    
    // Remove from user's enrolled courses
    await User.findByIdAndUpdate(
      req.user._id,
      { 
        $pull: { 
          enrolledCourses: { course: course._id }
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unenrolling from course'
    });
  }
});

// @route   POST /api/courses/:id/rate
// @desc    Rate a course (Enrolled students only)
// @access  Private (Enrolled Student)
router.post('/:id/rate', authenticate, validateMongoId('id'), isEnrolledInCourse, async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const course = await Course.findById(req.params.id);
    
    course.addRating(req.user._id, rating, review);
    await course.save();
    
    res.json({
      success: true,
      message: 'Course rated successfully',
      data: {
        averageRating: course.statistics.averageRating,
        totalRatings: course.statistics.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rating course'
    });
  }
});

// @route   PUT /api/courses/:id/progress
// @desc    Update student progress in course
// @access  Private (Enrolled Student)
router.put('/:id/progress', authenticate, validateMongoId('id'), isEnrolledInCourse, async (req, res) => {
  try {
    const { moduleIndex, lessonIndex } = req.body;
    
    if (moduleIndex === undefined || lessonIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Module index and lesson index are required'
      });
    }
    
    const course = await Course.findById(req.params.id);
    
    course.updateStudentProgress(req.user._id, moduleIndex, lessonIndex);
    await course.save();
    
    // Update user's enrolled course progress
    const user = await User.findById(req.user._id);
    const enrolledCourse = user.enrolledCourses.find(
      ec => ec.course.toString() === course._id.toString()
    );
    
    if (enrolledCourse) {
      const studentEnrollment = course.enrolledStudents.find(
        student => student.student.toString() === req.user._id.toString()
      );
      enrolledCourse.progress = studentEnrollment.progress;
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        progress: course.enrolledStudents.find(
          student => student.student.toString() === req.user._id.toString()
        ).progress
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress'
    });
  }
});

// @route   GET /api/courses/:id/students
// @desc    Get enrolled students (Course instructor only)
// @access  Private (Course Instructor)
router.get('/:id/students', authenticate, validateMongoId('id'), isCourseInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.student', 'name email avatar createdAt')
      .select('enrolledStudents title');
    
    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        students: course.enrolledStudents
      }
    });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course students'
    });
  }
});

// @route   GET /api/courses/my/teaching
// @desc    Get courses taught by current user (Teachers only)
// @access  Private (Teacher)
router.get('/my/teaching', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const courses = await Course.find({ 
      instructor: req.user._id,
      isActive: true 
    })
    .populate('instructor', 'name avatar')
    .sort('-createdAt');
    
    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get teaching courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teaching courses'
    });
  }
});

// @route   GET /api/courses/my/enrolled
// @desc    Get courses enrolled by current user (Students only)
// @access  Private (Student)
router.get('/my/enrolled', authenticate, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      });
    
    res.json({
      success: true,
      data: { 
        enrolledCourses: user.enrolledCourses
      }
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching enrolled courses'
    });
  }
});

module.exports = router;
