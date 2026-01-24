const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { authenticate, authorize, isOwnerOrAdmin } = require('../middleware/auth');
const { validateUserUpdate, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', authenticate, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search;
    const role = req.query.role;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('enrolledCourses.course', 'title')
      .populate('teachingCourses', 'title');
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses.course', 'title instructor')
      .populate('teachingCourses', 'title enrolledStudents')
      .populate('skillPoints.breakdown.course', 'title');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user can view this profile
    const canView = req.user._id.toString() === user._id.toString() || 
                   req.user.role === 'admin' ||
                   // Check if they share courses
                   user.enrolledCourses.some(ec => 
                     req.user.teachingCourses.includes(ec.course._id)
                   );
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Own profile or Admin)
router.put('/:id', authenticate, validateMongoId('id'), validateUserUpdate, async (req, res) => {
  try {
    // Check if user can update this profile
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }
    
    const allowedUpdates = ['name', 'bio', 'phone', 'address', 'dateOfBirth', 'preferences'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // Admin can update additional fields
    if (req.user.role === 'admin') {
      const adminUpdates = ['role', 'isActive', 'isVerified'];
      adminUpdates.forEach(key => {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), validateMongoId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Soft delete - deactivate user instead of removing
    user.isActive = false;
    await user.save();
    
    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/users/:id/courses
// @desc    Get user's courses
// @access  Private
router.get('/:id/courses', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'enrolledCourses.course',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .populate({
        path: 'teachingCourses',
        populate: {
          path: 'enrolledStudents.student',
          select: 'name avatar'
        }
      });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check access
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const courses = {
      enrolled: user.enrolledCourses,
      teaching: user.teachingCourses
    };
    
    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
});

// @route   POST /api/users/:id/enroll/:courseId
// @desc    Enroll user in course
// @access  Private
router.post('/:id/enroll/:courseId', authenticate, validateMongoId('id'), validateMongoId('courseId'), async (req, res) => {
  try {
    // Check if user can enroll (self or admin)
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const user = await User.findById(req.params.id);
    const course = await Course.findById(req.params.courseId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const isEnrolled = user.enrolledCourses.some(
      ec => ec.course.toString() === course._id.toString()
    );
    
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'User is already enrolled in this course'
      });
    }
    
    // Check course enrollment constraints
    if (course.enrollmentStatus !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Course enrollment is not available'
      });
    }
    
    // Enroll user
    user.enrolledCourses.push({
      course: course._id,
      progress: 0
    });
    
    course.enrollStudent(user._id);
    
    await Promise.all([user.save(), course.save()]);
    
    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        course: {
          _id: course._id,
          title: course.title,
          instructor: course.instructor
        }
      }
    });
  } catch (error) {
    console.error('Enroll user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while enrolling in course'
    });
  }
});

// @route   DELETE /api/users/:id/enroll/:courseId
// @desc    Unenroll user from course
// @access  Private
router.delete('/:id/enroll/:courseId', authenticate, validateMongoId('id'), validateMongoId('courseId'), async (req, res) => {
  try {
    // Check if user can unenroll (self or admin)
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const user = await User.findById(req.params.id);
    const course = await Course.findById(req.params.courseId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Remove from user's enrolled courses
    user.enrolledCourses = user.enrolledCourses.filter(
      ec => ec.course.toString() !== course._id.toString()
    );
    
    // Remove from course's enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      es => es.student.toString() !== user._id.toString()
    );
    
    await Promise.all([user.save(), course.save()]);
    
    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Unenroll user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unenrolling from course'
    });
  }
});

// @route   GET /api/users/:id/achievements
// @desc    Get user achievements
// @access  Private
router.get('/:id/achievements', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('achievements');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check access
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { achievements: user.achievements }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
});

// @route   POST /api/users/:id/skill-points
// @desc    Add skill points to user
// @access  Private (Admin or Course Instructor)
router.post('/:id/skill-points', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const { courseId, points, reason } = req.body;
    
    if (!courseId || !points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and positive points are required'
      });
    }
    
    const user = await User.findById(req.params.id);
    const course = await Course.findById(courseId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is instructor of the course or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not the instructor of this course.'
      });
    }
    
    // Add skill points
    user.addSkillPoints(courseId, points);
    
    // Add achievement if milestone reached
    const newLevel = Math.floor(user.skillPoints.total / 100) + 1;
    const oldLevel = Math.floor((user.skillPoints.total - points) / 100) + 1;
    
    if (newLevel > oldLevel) {
      user.addAchievement({
        title: `Level ${newLevel} Reached`,
        description: `Congratulations on reaching level ${newLevel}!`,
        icon: 'trophy',
        category: 'course'
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Skill points added successfully',
      data: {
        totalPoints: user.skillPoints.total,
        level: newLevel,
        pointsAdded: points
      }
    });
  } catch (error) {
    console.error('Add skill points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding skill points'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, role, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    let query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };
    
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query)
      .select('name email avatar role')
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

module.exports = router;
