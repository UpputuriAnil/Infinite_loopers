const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
        console.log('Optional auth token error:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Check if user is course instructor
const isCourseInstructor = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId || req.query.courseId;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required.'
      });
    }
    
    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not the instructor of this course.'
      });
    }
    
    req.course = course;
    next();
  } catch (error) {
    console.error('Course instructor check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check.'
    });
  }
};

// Check if user is enrolled in course
const isEnrolledInCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId || req.query.courseId;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required.'
      });
    }
    
    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    
    // Check if user is enrolled, is instructor, or is admin
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isEnrolled && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not enrolled in this course.'
      });
    }
    
    req.course = course;
    req.isInstructor = isInstructor;
    req.isEnrolled = isEnrolled;
    next();
  } catch (error) {
    console.error('Course enrollment check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during enrollment check.'
    });
  }
};

// Check if user owns resource or is admin
const isOwnerOrAdmin = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required.'
        });
      }
      
      const Model = require(`../models/${resourceModel}`);
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceModel} not found.`
        });
      }
      
      // Check ownership (different models have different owner fields)
      let isOwner = false;
      if (resource.author) {
        isOwner = resource.author.toString() === req.user._id.toString();
      } else if (resource.instructor) {
        isOwner = resource.instructor.toString() === req.user._id.toString();
      } else if (resource.student) {
        isOwner = resource.student.toString() === req.user._id.toString();
      } else if (resource._id) {
        isOwner = resource._id.toString() === req.user._id.toString();
      }
      
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during ownership check.'
      });
    }
  };
};

// Rate limiting middleware
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }
    
    const currentRequests = requests.get(key) || [];
    
    if (currentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    currentRequests.push(now);
    requests.set(key, currentRequests);
    
    next();
  };
};

// Validate API key (for external integrations)
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required.'
      });
    }
    
    // In a real application, you would validate against a database
    const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];
    
    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }
    
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during API key validation.'
    });
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isCourseInstructor,
  isEnrolledInCourse,
  isOwnerOrAdmin,
  rateLimit,
  validateApiKey
};
