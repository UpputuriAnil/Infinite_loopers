const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\.\-']+$/)
    .withMessage('Name can only contain letters, spaces, periods, hyphens, and apostrophes'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Course validation rules
const validateCourseCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Course description must be between 10 and 2000 characters'),
  
  body('category')
    .optional()
    .isIn(['programming', 'design', 'business', 'science', 'mathematics', 'language', 'arts', 'other'])
    .withMessage('Invalid course category'),
  
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Course level must be beginner, intermediate, or advanced'),
  
  body('schedule.startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  
  body('schedule.endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.schedule.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('enrollment.maxStudents')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Maximum students must be between 1 and 1000'),
  
  handleValidationErrors
];

const validateCourseUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Course description must be between 10 and 2000 characters'),
  
  body('category')
    .optional()
    .isIn(['programming', 'design', 'business', 'science', 'mathematics', 'language', 'arts', 'other'])
    .withMessage('Invalid course category'),
  
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Course level must be beginner, intermediate, or advanced'),
  
  handleValidationErrors
];

// Assignment validation rules
const validateAssignmentCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Assignment title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Assignment description must be between 10 and 2000 characters'),
  
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  
  body('type')
    .optional()
    .isIn(['individual', 'group', 'quiz', 'project', 'essay', 'coding', 'presentation'])
    .withMessage('Invalid assignment type'),
  
  body('maxGrade')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Maximum grade must be between 1 and 1000'),
  
  body('dueDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid due date')
    .custom((dueDate) => {
      if (new Date(dueDate) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('attempts.allowed')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Allowed attempts must be between 1 and 10'),
  
  handleValidationErrors
];

// Submission validation rules
const validateSubmissionCreation = [
  body('assignment')
    .isMongoId()
    .withMessage('Please provide a valid assignment ID'),
  
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  
  body('content.text')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Text content cannot exceed 10000 characters'),
  
  handleValidationErrors
];

// Grade validation rules
const validateGradeCreation = [
  body('student')
    .isMongoId()
    .withMessage('Please provide a valid student ID'),
  
  body('assignment')
    .isMongoId()
    .withMessage('Please provide a valid assignment ID'),
  
  body('submission')
    .isMongoId()
    .withMessage('Please provide a valid submission ID'),
  
  body('scores.raw')
    .isFloat({ min: 0 })
    .withMessage('Raw score must be a positive number'),
  
  body('scores.points.earned')
    .isFloat({ min: 0 })
    .withMessage('Earned points must be a positive number'),
  
  body('scores.points.possible')
    .isFloat({ min: 1 })
    .withMessage('Possible points must be at least 1'),
  
  body('letterGrade')
    .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'])
    .withMessage('Invalid letter grade'),
  
  body('feedback.overall')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Overall feedback cannot exceed 2000 characters'),
  
  handleValidationErrors
];

// Forum validation rules
const validateForumCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Forum title must be between 3 and 200 characters'),
  
  body('content.text')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Forum content must be between 10 and 10000 characters'),
  
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  
  body('category')
    .optional()
    .isIn(['general', 'announcements', 'assignments', 'projects', 'q-and-a', 'study-groups', 'resources', 'off-topic'])
    .withMessage('Invalid forum category'),
  
  body('type')
    .optional()
    .isIn(['discussion', 'question', 'announcement', 'poll', 'resource'])
    .withMessage('Invalid forum type'),
  
  handleValidationErrors
];

// Material validation rules
const validateMaterialCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Material title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('course')
    .isMongoId()
    .withMessage('Please provide a valid course ID'),
  
  body('type')
    .isIn(['document', 'video', 'audio', 'image', 'link', 'presentation', 'spreadsheet', 'archive', 'code', 'other'])
    .withMessage('Invalid material type'),
  
  body('category')
    .optional()
    .isIn(['lecture', 'reading', 'assignment', 'reference', 'supplementary', 'example', 'template', 'solution'])
    .withMessage('Invalid material category'),
  
  handleValidationErrors
];

// Common parameter validations
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title', 'name', '-name'])
    .withMessage('Invalid sort parameter'),
  
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Email validation
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const file = req.file || (req.files && req.files[0]);
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      });
    }
    
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      });
    }
    
    next();
  };
};

// Forum post validation
const validateForumPostCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('course')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  
  body('category')
    .optional()
    .isIn(['general', 'question', 'announcement', 'discussion', 'help'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCourseCreation,
  validateCourseUpdate,
  validateAssignmentCreation,
  validateSubmissionCreation,
  validateGradeCreation,
  validateForumCreation,
  validateForumPostCreation,
  validateMaterialCreation,
  validateMongoId,
  validatePagination,
  validateSearch,
  validatePasswordChange,
  validateEmail,
  validateFileUpload
};
