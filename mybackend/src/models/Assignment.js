const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  instructions: {
    type: String,
    maxlength: [5000, 'Instructions cannot exceed 5000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  type: {
    type: String,
    enum: ['individual', 'group', 'quiz', 'project', 'essay', 'coding', 'presentation'],
    default: 'individual'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  maxGrade: {
    type: Number,
    required: [true, 'Maximum grade is required'],
    min: [1, 'Maximum grade must be at least 1'],
    max: [1000, 'Maximum grade cannot exceed 1000'],
    default: 100
  },
  passingGrade: {
    type: Number,
    default: function() {
      return this.maxGrade * 0.6; // 60% by default
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date,
    default: function() {
      return this.dueDate;
    }
  },
  timeLimit: {
    enabled: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number, // in minutes
      default: 60
    }
  },
  attempts: {
    allowed: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    keepHighest: {
      type: Boolean,
      default: true
    }
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  allowedFormats: [{
    type: String,
    enum: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar', '.js', '.jsx', '.html', '.css', '.py', '.java', '.cpp', '.c']
  }],
  maxFileSize: {
    type: Number,
    default: 10485760 // 10MB in bytes
  },
  rubric: {
    enabled: {
      type: Boolean,
      default: false
    },
    criteria: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      maxPoints: {
        type: Number,
        required: true,
        min: 1
      },
      levels: [{
        name: String,
        description: String,
        points: Number
      }]
    }]
  },
  questions: [{
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'code', 'file-upload'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 1
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    explanation: String,
    codeTemplate: String, // For coding questions
    testCases: [{ // For coding questions
      input: String,
      expectedOutput: String,
      isHidden: {
        type: Boolean,
        default: false
      }
    }],
    order: {
      type: Number,
      required: true
    }
  }],
  settings: {
    autoGrade: {
      type: Boolean,
      default: false
    },
    showGradeImmediately: {
      type: Boolean,
      default: false
    },
    allowLateSubmission: {
      type: Boolean,
      default: true
    },
    latePenalty: {
      enabled: {
        type: Boolean,
        default: false
      },
      percentage: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
      },
      perDay: {
        type: Boolean,
        default: true
      }
    },
    plagiarismCheck: {
      enabled: {
        type: Boolean,
        default: false
      },
      threshold: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
      }
    },
    anonymousGrading: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    gradedSubmissions: {
      type: Number,
      default: 0
    },
    averageGrade: {
      type: Number,
      default: 0
    },
    highestGrade: {
      type: Number,
      default: 0
    },
    lowestGrade: {
      type: Number,
      default: 0
    },
    submissionRate: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0 // in minutes
    }
  },
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

// Virtual for assignment status
assignmentSchema.virtual('status').get(function() {
  const now = new Date();
  
  if (!this.isPublished) return 'draft';
  if (now < this.availableFrom) return 'scheduled';
  if (now > this.availableUntil) return 'closed';
  if (now > this.dueDate) return 'overdue';
  return 'active';
});

// Virtual for time remaining
assignmentSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.dueDate - now;
  
  if (timeDiff <= 0) return { expired: true };
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    expired: false,
    days,
    hours,
    minutes,
    total: timeDiff
  };
});

// Virtual for total points
assignmentSchema.virtual('totalPoints').get(function() {
  if (this.rubric.enabled && this.rubric.criteria.length > 0) {
    return this.rubric.criteria.reduce((total, criterion) => total + criterion.maxPoints, 0);
  }
  if (this.questions.length > 0) {
    return this.questions.reduce((total, question) => total + question.points, 0);
  }
  return this.maxGrade;
});

// Pre-save middleware
assignmentSchema.pre('save', function(next) {
  // Set published date if being published
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Ensure availableUntil is not before dueDate
  if (this.availableUntil > this.dueDate) {
    this.availableUntil = this.dueDate;
  }
  
  // Calculate passing grade if not set
  if (!this.passingGrade) {
    this.passingGrade = this.maxGrade * 0.6;
  }
  
  next();
});

// Method to check if assignment is available for submission
assignmentSchema.methods.isAvailableForSubmission = function() {
  const now = new Date();
  return this.isPublished && 
         this.isActive && 
         now >= this.availableFrom && 
         now <= this.availableUntil;
};

// Method to check if assignment accepts late submissions
assignmentSchema.methods.acceptsLateSubmission = function() {
  const now = new Date();
  return this.settings.allowLateSubmission && 
         now > this.dueDate && 
         now <= this.availableUntil;
};

// Method to calculate late penalty
assignmentSchema.methods.calculateLatePenalty = function(submissionDate) {
  if (!this.settings.latePenalty.enabled || submissionDate <= this.dueDate) {
    return 0;
  }
  
  const timeDiff = submissionDate - this.dueDate;
  const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  if (this.settings.latePenalty.perDay) {
    return Math.min(daysLate * this.settings.latePenalty.percentage, 100);
  } else {
    return this.settings.latePenalty.percentage;
  }
};

// Method to update statistics
assignmentSchema.methods.updateStatistics = async function() {
  const Submission = mongoose.model('Submission');
  
  const submissions = await Submission.find({ assignment: this._id });
  
  this.statistics.totalSubmissions = submissions.length;
  this.statistics.gradedSubmissions = submissions.filter(s => s.isGraded).length;
  
  if (this.statistics.gradedSubmissions > 0) {
    const gradedSubmissions = submissions.filter(s => s.isGraded);
    const grades = gradedSubmissions.map(s => s.finalGrade);
    
    this.statistics.averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    this.statistics.highestGrade = Math.max(...grades);
    this.statistics.lowestGrade = Math.min(...grades);
  }
  
  // Calculate submission rate (need course enrollment data)
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.course);
  if (course) {
    this.statistics.submissionRate = (this.statistics.totalSubmissions / course.enrolledStudents.length) * 100;
  }
  
  return this;
};

// Indexes for better query performance
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isPublished: 1, isActive: 1 });
assignmentSchema.index({ availableFrom: 1, availableUntil: 1 });
assignmentSchema.index({ type: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
