const express = require('express');
const ForumPost = require('../models/ForumPost');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateForumPostCreation, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/forum
// @desc    Get forum posts with filtering
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const courseId = req.query.courseId;
    const category = req.query.category;
    const search = req.query.search;
    
    let query = { isActive: true };
    
    if (courseId) {
      query.course = courseId;
      
      // Verify user has access to this course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
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
    } else {
      // If no specific course, show posts from courses user has access to
      if (req.user.role === 'student') {
        const user = await User.findById(req.user._id).populate('enrolledCourses.course');
        const enrolledCourseIds = user.enrolledCourses.map(ec => ec.course._id);
        query.course = { $in: enrolledCourseIds };
      } else if (req.user.role === 'teacher') {
        const teachingCourses = await Course.find({ instructor: req.user._id }).select('_id');
        const teachingCourseIds = teachingCourses.map(c => c._id);
        query.course = { $in: teachingCourseIds };
      }
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar role')
      .populate('course', 'title')
      .populate('replies.author', 'name avatar role')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await ForumPost.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching forum posts'
    });
  }
});

// @route   GET /api/forum/:id
// @desc    Get forum post by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name avatar role bio')
      .populate('course', 'title instructor')
      .populate('replies.author', 'name avatar role')
      .populate('likes.user', 'name avatar');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    // Check if user has access to this course
    const course = await Course.findById(post.course._id);
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
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching forum post'
    });
  }
});

// @route   POST /api/forum
// @desc    Create new forum post
// @access  Private
router.post('/', authenticate, validateForumPostCreation, async (req, res) => {
  try {
    const { course: courseId, title, content, category, tags } = req.body;
    
    // Verify user has access to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course to post.'
      });
    }
    
    const postData = {
      title,
      content,
      category,
      tags: tags || [],
      author: req.user._id,
      course: courseId
    };
    
    const post = new ForumPost(postData);
    await post.save();
    
    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name avatar role')
      .populate('course', 'title');
    
    res.status(201).json({
      success: true,
      message: 'Forum post created successfully',
      data: { post: populatedPost }
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    
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
      message: 'Server error while creating forum post'
    });
  }
});

// @route   PUT /api/forum/:id
// @desc    Update forum post (Author only)
// @access  Private
router.put('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    // Check if user can update this post
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own posts.'
      });
    }
    
    const { title, content, category, tags } = req.body;
    
    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    
    post.updatedAt = new Date();
    
    await post.save();
    
    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name avatar role')
      .populate('course', 'title');
    
    res.json({
      success: true,
      message: 'Forum post updated successfully',
      data: { post: populatedPost }
    });
  } catch (error) {
    console.error('Update forum post error:', error);
    
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
      message: 'Server error while updating forum post'
    });
  }
});

// @route   DELETE /api/forum/:id
// @desc    Delete forum post (Author or course instructor)
// @access  Private
router.delete('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('course', 'instructor');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    // Check if user can delete this post
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isInstructor = post.course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own posts or posts in your courses.'
      });
    }
    
    // Soft delete - deactivate post
    post.isActive = false;
    await post.save();
    
    res.json({
      success: true,
      message: 'Forum post deleted successfully'
    });
  } catch (error) {
    console.error('Delete forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting forum post'
    });
  }
});

// @route   POST /api/forum/:id/reply
// @desc    Add reply to forum post
// @access  Private
router.post('/:id/reply', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    const post = await ForumPost.findById(req.params.id).populate('course', 'instructor enrolledStudents');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    // Check if user has access to this course
    const isInstructor = post.course.instructor.toString() === req.user._id.toString();
    const isEnrolled = post.course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course to reply.'
      });
    }
    
    const reply = {
      content: content.trim(),
      author: req.user._id,
      createdAt: new Date()
    };
    
    post.replies.push(reply);
    await post.save();
    
    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name avatar role')
      .populate('course', 'title')
      .populate('replies.author', 'name avatar role');
    
    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: { 
        post: populatedPost,
        newReply: populatedPost.replies[populatedPost.replies.length - 1]
      }
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reply'
    });
  }
});

// @route   PUT /api/forum/:id/reply/:replyId
// @desc    Update reply (Reply author only)
// @access  Private
router.put('/:id/reply/:replyId', authenticate, validateMongoId('id'), validateMongoId('replyId'), async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    const reply = post.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user can update this reply
    if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own replies.'
      });
    }
    
    reply.content = content.trim();
    reply.updatedAt = new Date();
    
    await post.save();
    
    const populatedPost = await ForumPost.findById(post._id)
      .populate('replies.author', 'name avatar role');
    
    res.json({
      success: true,
      message: 'Reply updated successfully',
      data: { 
        updatedReply: populatedPost.replies.id(req.params.replyId)
      }
    });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating reply'
    });
  }
});

// @route   DELETE /api/forum/:id/reply/:replyId
// @desc    Delete reply (Reply author or course instructor)
// @access  Private
router.delete('/:id/reply/:replyId', authenticate, validateMongoId('id'), validateMongoId('replyId'), async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('course', 'instructor');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    const reply = post.replies.id(req.params.replyId);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user can delete this reply
    const isAuthor = reply.author.toString() === req.user._id.toString();
    const isInstructor = post.course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own replies or replies in your courses.'
      });
    }
    
    reply.remove();
    await post.save();
    
    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting reply'
    });
  }
});

// @route   POST /api/forum/:id/like
// @desc    Like/unlike forum post
// @access  Private
router.post('/:id/like', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('course', 'instructor enrolledStudents');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }
    
    // Check if user has access to this course
    const isInstructor = post.course.instructor.toString() === req.user._id.toString();
    const isEnrolled = post.course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course.'
      });
    }
    
    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );
    
    if (existingLike) {
      // Unlike - remove the like
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like - add the like
      post.likes.push({
        user: req.user._id,
        likedAt: new Date()
      });
    }
    
    await post.save();
    
    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      data: {
        liked: !existingLike,
        totalLikes: post.likes.length
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post'
    });
  }
});

// @route   GET /api/forum/course/:courseId
// @desc    Get forum posts for a specific course
// @access  Private (Course members)
router.get('/course/:courseId', authenticate, validateMongoId('courseId'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user has access to this course
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
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const category = req.query.category;
    
    let query = { course: req.params.courseId, isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar role')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await ForumPost.countDocuments(query);
    
    // Get forum statistics
    const statistics = {
      totalPosts: total,
      totalReplies: await ForumPost.aggregate([
        { $match: query },
        { $project: { replyCount: { $size: '$replies' } } },
        { $group: { _id: null, total: { $sum: '$replyCount' } } }
      ]).then(result => result[0]?.total || 0),
      categories: await ForumPost.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };
    
    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        posts,
        statistics,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get course forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course forum posts'
    });
  }
});

// @route   GET /api/forum/my/posts
// @desc    Get posts created by current user
// @access  Private
router.get('/my/posts', authenticate, async (req, res) => {
  try {
    const posts = await ForumPost.find({ 
      author: req.user._id,
      isActive: true 
    })
    .populate('course', 'title')
    .populate('replies.author', 'name avatar role')
    .sort('-createdAt');
    
    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user posts'
    });
  }
});

// @route   GET /api/forum/search
// @desc    Search forum posts
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, courseId, category, author } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    let query = {
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    
    if (courseId) {
      query.course = courseId;
    } else {
      // Filter by courses user has access to
      if (req.user.role === 'student') {
        const user = await User.findById(req.user._id).populate('enrolledCourses.course');
        const enrolledCourseIds = user.enrolledCourses.map(ec => ec.course._id);
        query.course = { $in: enrolledCourseIds };
      } else if (req.user.role === 'teacher') {
        const teachingCourses = await Course.find({ instructor: req.user._id }).select('_id');
        const teachingCourseIds = teachingCourses.map(c => c._id);
        query.course = { $in: teachingCourseIds };
      }
    }
    
    if (category) {
      query.category = category;
    }
    
    if (author) {
      query.author = author;
    }
    
    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar role')
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(20); // Limit search results
    
    res.json({
      success: true,
      data: {
        query: q,
        results: posts.length,
        posts
      }
    });
  } catch (error) {
    console.error('Search forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching forum posts'
    });
  }
});

module.exports = router;
