const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['programming', 'design', 'business', 'science', 'mathematics', 'language', 'arts', 'other']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    default: null
  },
  images: [{
    url: String,
    caption: String
  }],
  duration: {
    hours: {
      type: Number,
      default: 0
    },
    minutes: {
      type: Number,
      default: 0
    }
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    order: {
      type: Number,
      required: true
    },
    lessons: [{
      title: {
        type: String,
        required: true
      },
      description: String,
      content: String,
      videoUrl: String,
      duration: {
        type: Number,
        default: 0 // in minutes
      },
      order: {
        type: Number,
        required: true
      },
      resources: [{
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'video', 'link', 'document', 'image']
        }
      }],
      isCompleted: {
        type: Boolean,
        default: false
      }
    }]
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  skillsGained: [{
    type: String,
    trim: true
  }],
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free'
    },
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  enrollment: {
    maxStudents: {
      type: Number,
      default: null // null means unlimited
    },
    currentEnrollment: {
      type: Number,
      default: 0
    },
    enrollmentDeadline: {
      type: Date,
      default: null
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  settings: {
    allowDiscussions: {
      type: Boolean,
      default: true
    },
    allowRatings: {
      type: Boolean,
      default: true
    },
    certificateEnabled: {
      type: Boolean,
      default: false
    },
    autoGrading: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    }
  },
  skillPoints: {
    type: Number,
    default: 100,
    min: 50,
    max: 500
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      moduleIndex: Number,
      lessonIndex: Number,
      completedAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateIssuedAt: Date
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total lessons count
courseSchema.virtual('totalLessons').get(function() {
  return this.modules.reduce((total, module) => total + module.lessons.length, 0);
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function() {
  const totalMinutes = this.modules.reduce((total, module) => {
    return total + module.lessons.reduce((lessonTotal, lesson) => {
      return lessonTotal + (lesson.duration || 0);
    }, 0);
  }, 0);
  
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    total: totalMinutes
  };
});

// Virtual for enrollment status
courseSchema.virtual('enrollmentStatus').get(function() {
  if (!this.enrollment.isOpen) return 'closed';
  if (this.enrollment.maxStudents && this.enrollment.currentEnrollment >= this.enrollment.maxStudents) {
    return 'full';
  }
  if (this.enrollment.enrollmentDeadline && new Date() > this.enrollment.enrollmentDeadline) {
    return 'expired';
  }
  return 'open';
});

// Pre-save middleware to update statistics
courseSchema.pre('save', function(next) {
  // Update completion rate
  if (this.enrolledStudents.length > 0) {
    const completedStudents = this.enrolledStudents.filter(student => student.progress === 100).length;
    this.statistics.completionRate = (completedStudents / this.enrolledStudents.length) * 100;
  }
  
  // Update current enrollment
  this.enrollment.currentEnrollment = this.enrolledStudents.length;
  
  // Update total enrollments
  this.statistics.totalEnrollments = this.enrolledStudents.length;
  
  // Update average rating
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.statistics.averageRating = totalRating / this.ratings.length;
    this.statistics.totalRatings = this.ratings.length;
  }
  
  next();
});

// Method to enroll a student
courseSchema.methods.enrollStudent = function(studentId) {
  // Check if student is already enrolled
  const isEnrolled = this.enrolledStudents.some(
    student => student.student.toString() === studentId.toString()
  );
  
  if (isEnrolled) {
    throw new Error('Student is already enrolled in this course');
  }
  
  // Check enrollment constraints
  if (this.enrollmentStatus !== 'open') {
    throw new Error('Course enrollment is not available');
  }
  
  // Add student to enrolled list
  this.enrolledStudents.push({
    student: studentId,
    progress: 0,
    completedLessons: []
  });
  
  return this;
};

// Method to update student progress
courseSchema.methods.updateStudentProgress = function(studentId, moduleIndex, lessonIndex) {
  const studentEnrollment = this.enrolledStudents.find(
    student => student.student.toString() === studentId.toString()
  );
  
  if (!studentEnrollment) {
    throw new Error('Student is not enrolled in this course');
  }
  
  // Check if lesson is already completed
  const isCompleted = studentEnrollment.completedLessons.some(
    lesson => lesson.moduleIndex === moduleIndex && lesson.lessonIndex === lessonIndex
  );
  
  if (!isCompleted) {
    // Add completed lesson
    studentEnrollment.completedLessons.push({
      moduleIndex,
      lessonIndex
    });
    
    // Calculate new progress
    const totalLessons = this.totalLessons;
    const completedLessons = studentEnrollment.completedLessons.length;
    studentEnrollment.progress = Math.round((completedLessons / totalLessons) * 100);
  }
  
  // Update last accessed
  studentEnrollment.lastAccessed = new Date();
  
  return this;
};

// Method to add rating
courseSchema.methods.addRating = function(userId, rating, review = '') {
  // Check if user already rated
  const existingRating = this.ratings.find(
    r => r.user.toString() === userId.toString()
  );
  
  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.review = review;
  } else {
    // Add new rating
    this.ratings.push({
      user: userId,
      rating,
      review
    });
  }
  
  return this;
};

// Indexes for better query performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ 'enrolledStudents.student': 1 });
courseSchema.index({ isPublished: 1, isActive: 1 });
courseSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ 'statistics.averageRating': -1 });

module.exports = mongoose.model('Course', courseSchema);
