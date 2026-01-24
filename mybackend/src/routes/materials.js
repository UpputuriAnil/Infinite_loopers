const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateMaterialCreation, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/materials');
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
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow various file types for educational materials
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar|mp4|avi|mov|mp3|wav|html|css|js|json|xml/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('application/') || file.mimetype.startsWith('text/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload educational materials only.'));
    }
  }
});

// @route   GET /api/materials
// @desc    Get materials with filtering
// @access  Private
router.get('/', authenticate, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const courseId = req.query.courseId;
    const type = req.query.type;
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
      // If no specific course, show materials from courses user has access to
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
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const materials = await Material.find(query)
      .populate('uploadedBy', 'name avatar role')
      .populate('course', 'title')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Material.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching materials'
    });
  }
});

// @route   GET /api/materials/:id
// @desc    Get material by ID
// @access  Private
router.get('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'name avatar role bio')
      .populate('course', 'title instructor');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Check if user has access to this course
    const course = await Course.findById(material.course._id);
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
    
    // Increment download count
    material.downloadCount += 1;
    await material.save();
    
    res.json({
      success: true,
      data: { material }
    });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching material'
    });
  }
});

// @route   POST /api/materials
// @desc    Upload new material (Teachers only)
// @access  Private (Teacher)
router.post('/', authenticate, authorize('teacher', 'admin'), upload.single('file'), validateMaterialCreation, async (req, res) => {
  try {
    const { course: courseId, title, description, type, category, tags } = req.body;
    
    // Verify user has access to this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only upload materials to your courses.'
      });
    }
    
    let materialData = {
      title,
      description,
      type,
      category,
      tags: tags ? JSON.parse(tags) : [],
      course: courseId,
      uploadedBy: req.user._id
    };
    
    // Handle file upload
    if (req.file) {
      materialData.file = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    } else if (type === 'file') {
      return res.status(400).json({
        success: false,
        message: 'File is required for file type materials'
      });
    }
    
    // Handle URL or text content
    if (req.body.url) {
      materialData.url = req.body.url;
    }
    
    if (req.body.content) {
      materialData.content = req.body.content;
    }
    
    const material = new Material(materialData);
    await material.save();
    
    const populatedMaterial = await Material.findById(material._id)
      .populate('uploadedBy', 'name avatar role')
      .populate('course', 'title');
    
    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      data: { material: populatedMaterial }
    });
  } catch (error) {
    console.error('Upload material error:', error);
    
    // Clean up uploaded file if material creation failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
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
      message: 'Server error while uploading material'
    });
  }
});

// @route   PUT /api/materials/:id
// @desc    Update material (Uploader only)
// @access  Private
router.put('/:id', authenticate, validateMongoId('id'), upload.single('file'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Check if user can update this material
    if (material.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own materials.'
      });
    }
    
    const { title, description, type, category, tags, url, content } = req.body;
    
    // Update fields
    if (title) material.title = title;
    if (description) material.description = description;
    if (type) material.type = type;
    if (category) material.category = category;
    if (tags) material.tags = JSON.parse(tags);
    if (url) material.url = url;
    if (content) material.content = content;
    
    // Handle file replacement
    if (req.file) {
      // Delete old file if exists
      if (material.file && material.file.path) {
        fs.unlink(material.file.path, (err) => {
          if (err) console.error('Error deleting old file:', err);
        });
      }
      
      // Add new file
      material.file = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }
    
    material.updatedAt = new Date();
    
    await material.save();
    
    const populatedMaterial = await Material.findById(material._id)
      .populate('uploadedBy', 'name avatar role')
      .populate('course', 'title');
    
    res.json({
      success: true,
      message: 'Material updated successfully',
      data: { material: populatedMaterial }
    });
  } catch (error) {
    console.error('Update material error:', error);
    
    // Clean up uploaded file if update failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
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
      message: 'Server error while updating material'
    });
  }
});

// @route   DELETE /api/materials/:id
// @desc    Delete material (Uploader or course instructor)
// @access  Private
router.delete('/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('course', 'instructor');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Check if user can delete this material
    const isUploader = material.uploadedBy.toString() === req.user._id.toString();
    const isInstructor = material.course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isUploader && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own materials or materials in your courses.'
      });
    }
    
    // Delete associated file
    if (material.file && material.file.path) {
      fs.unlink(material.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    // Soft delete - deactivate material
    material.isActive = false;
    await material.save();
    
    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting material'
    });
  }
});

// @route   GET /api/materials/download/:id
// @desc    Download material file
// @access  Private (Course members)
router.get('/download/:id', authenticate, validateMongoId('id'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('course', 'instructor enrolledStudents');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Check if user has access to this course
    const isInstructor = material.course.instructor.toString() === req.user._id.toString();
    const isEnrolled = material.course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course.'
      });
    }
    
    if (!material.file || !material.file.path) {
      return res.status(404).json({
        success: false,
        message: 'No file available for download'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(material.file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    // Increment download count
    material.downloadCount += 1;
    await material.save();
    
    res.download(material.file.path, material.file.originalName);
  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading material'
    });
  }
});

// @route   GET /api/materials/course/:courseId
// @desc    Get materials for a specific course
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
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const type = req.query.type;
    const category = req.query.category;
    
    let query = { course: req.params.courseId, isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    const materials = await Material.find(query)
      .populate('uploadedBy', 'name avatar role')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Material.countDocuments(query);
    
    // Get material statistics
    const statistics = {
      totalMaterials: total,
      totalDownloads: await Material.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } }
      ]).then(result => result[0]?.total || 0),
      typeDistribution: await Material.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      categoryDistribution: await Material.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };
    
    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        materials,
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
    console.error('Get course materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course materials'
    });
  }
});

// @route   GET /api/materials/my/uploaded
// @desc    Get materials uploaded by current user
// @access  Private (Teacher)
router.get('/my/uploaded', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const materials = await Material.find({ 
      uploadedBy: req.user._id,
      isActive: true 
    })
    .populate('course', 'title')
    .sort('-createdAt');
    
    res.json({
      success: true,
      data: { materials }
    });
  } catch (error) {
    console.error('Get uploaded materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching uploaded materials'
    });
  }
});

// @route   GET /api/materials/search
// @desc    Search materials
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, courseId, type, category } = req.query;
    
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
        { description: { $regex: q, $options: 'i' } },
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
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    const materials = await Material.find(query)
      .populate('uploadedBy', 'name avatar role')
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(20); // Limit search results
    
    res.json({
      success: true,
      data: {
        query: q,
        results: materials.length,
        materials
      }
    });
  } catch (error) {
    console.error('Search materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching materials'
    });
  }
});

module.exports = router;
