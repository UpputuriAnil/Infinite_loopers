const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: [true, 'Submission is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  scores: {
    raw: {
      type: Number,
      required: [true, 'Raw score is required'],
      min: 0
    },
    adjusted: {
      type: Number,
      default: function() {
        return this.scores.raw;
      }
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    points: {
      earned: {
        type: Number,
        required: true,
        min: 0
      },
      possible: {
        type: Number,
        required: true,
        min: 1
      }
    }
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
    required: true
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4
  },
  rubricScores: [{
    criterion: {
      name: {
        type: String,
        required: true
      },
      description: String,
      maxPoints: {
        type: Number,
        required: true
      }
    },
    score: {
      type: Number,
      required: true,
      min: 0
    },
    level: {
      name: String,
      description: String
    },
    feedback: String
  }],
  feedback: {
    overall: {
      type: String,
      maxlength: [2000, 'Overall feedback cannot exceed 2000 characters']
    },
    strengths: [{
      type: String,
      maxlength: [500, 'Strength feedback cannot exceed 500 characters']
    }],
    improvements: [{
      type: String,
      maxlength: [500, 'Improvement feedback cannot exceed 500 characters']
    }],
    suggestions: [{
      type: String,
      maxlength: [500, 'Suggestion feedback cannot exceed 500 characters']
    }],
    private: {
      type: String,
      maxlength: [1000, 'Private feedback cannot exceed 1000 characters']
    }
  },
  penalties: [{
    type: {
      type: String,
      enum: ['late', 'plagiarism', 'format', 'length', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    pointsDeducted: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  bonuses: [{
    type: {
      type: String,
      enum: ['early', 'extra-credit', 'participation', 'creativity', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    pointsAdded: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      min: 0
    }
  }],
  gradingMethod: {
    type: String,
    enum: ['manual', 'auto', 'hybrid'],
    default: 'manual'
  },
  gradingCriteria: {
    accuracy: {
      weight: {
        type: Number,
        default: 40,
        min: 0,
        max: 100
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    completeness: {
      weight: {
        type: Number,
        default: 30,
        min: 0,
        max: 100
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    quality: {
      weight: {
        type: Number,
        default: 20,
        min: 0,
        max: 100
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    timeliness: {
      weight: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'returned', 'disputed', 'final'],
    default: 'published'
  },
  visibility: {
    student: {
      type: Boolean,
      default: true
    },
    parents: {
      type: Boolean,
      default: false
    },
    public: {
      type: Boolean,
      default: false
    }
  },
  timeline: {
    gradedAt: {
      type: Date,
      default: Date.now
    },
    publishedAt: {
      type: Date
    },
    viewedByStudentAt: {
      type: Date
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now
    }
  },
  flags: {
    isExceptional: {
      type: Boolean,
      default: false
    },
    needsReview: {
      type: Boolean,
      default: false
    },
    isDisputed: {
      type: Boolean,
      default: false
    },
    hasComments: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    timeToGrade: {
      type: Number, // in minutes
      default: 0
    },
    revisionCount: {
      type: Number,
      default: 0
    },
    studentViewCount: {
      type: Number,
      default: 0
    },
    lastViewedAt: {
      type: Date
    }
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    type: {
      type: String,
      enum: ['question', 'clarification', 'dispute', 'appreciation'],
      default: 'question'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: [1000, 'Reply cannot exceed 1000 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for grade status
gradeSchema.virtual('gradeStatus').get(function() {
  const percentage = this.scores.percentage;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'good';
  if (percentage >= 70) return 'satisfactory';
  if (percentage >= 60) return 'needs-improvement';
  return 'unsatisfactory';
});

// Virtual for weighted score
gradeSchema.virtual('weightedScore').get(function() {
  const criteria = this.gradingCriteria;
  const totalWeight = criteria.accuracy.weight + criteria.completeness.weight + 
                     criteria.quality.weight + criteria.timeliness.weight;
  
  if (totalWeight === 0) return this.scores.percentage;
  
  const weightedSum = (criteria.accuracy.score * criteria.accuracy.weight) +
                     (criteria.completeness.score * criteria.completeness.weight) +
                     (criteria.quality.score * criteria.quality.weight) +
                     (criteria.timeliness.score * criteria.timeliness.weight);
  
  return Math.round(weightedSum / totalWeight);
});

// Pre-save middleware
gradeSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.scores.points.possible > 0) {
    this.scores.percentage = Math.round((this.scores.points.earned / this.scores.points.possible) * 100);
  }
  
  // Calculate grade points (4.0 scale)
  this.gradePoints = this.calculateGradePoints(this.letterGrade);
  
  // Set published date if status is published
  if (this.status === 'published' && !this.timeline.publishedAt) {
    this.timeline.publishedAt = new Date();
  }
  
  // Update last modified
  this.timeline.lastModifiedAt = new Date();
  
  // Check if has comments
  this.flags.hasComments = this.comments.length > 0;
  
  next();
});

// Method to calculate grade points
gradeSchema.methods.calculateGradePoints = function(letterGrade) {
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  return gradePoints[letterGrade] || 0.0;
};

// Method to calculate letter grade from percentage
gradeSchema.methods.calculateLetterGrade = function(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

// Method to add penalty
gradeSchema.methods.addPenalty = function(penalty) {
  this.penalties.push(penalty);
  
  // Recalculate adjusted score
  const totalPenalty = this.penalties.reduce((sum, p) => sum + p.pointsDeducted, 0);
  this.scores.adjusted = Math.max(0, this.scores.raw - totalPenalty);
  
  // Recalculate percentage and letter grade
  this.scores.percentage = Math.round((this.scores.adjusted / this.scores.points.possible) * 100);
  this.letterGrade = this.calculateLetterGrade(this.scores.percentage);
  
  return this;
};

// Method to add bonus
gradeSchema.methods.addBonus = function(bonus) {
  this.bonuses.push(bonus);
  
  // Recalculate adjusted score
  const totalBonus = this.bonuses.reduce((sum, b) => sum + b.pointsAdded, 0);
  this.scores.adjusted = this.scores.raw + totalBonus;
  
  // Recalculate percentage and letter grade
  this.scores.percentage = Math.round((this.scores.adjusted / this.scores.points.possible) * 100);
  this.letterGrade = this.calculateLetterGrade(this.scores.percentage);
  
  return this;
};

// Method to add comment
gradeSchema.methods.addComment = function(authorId, content, type = 'question', isPrivate = false) {
  this.comments.push({
    author: authorId,
    content,
    type,
    isPrivate
  });
  
  this.flags.hasComments = true;
  
  return this;
};

// Method to mark as viewed by student
gradeSchema.methods.markAsViewed = function() {
  this.timeline.viewedByStudentAt = new Date();
  this.analytics.studentViewCount += 1;
  this.analytics.lastViewedAt = new Date();
  
  return this;
};

// Static method to calculate course average
gradeSchema.statics.calculateCourseAverage = async function(courseId) {
  const result = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    { $group: {
      _id: null,
      averagePercentage: { $avg: '$scores.percentage' },
      averageGradePoints: { $avg: '$gradePoints' },
      totalGrades: { $sum: 1 }
    }}
  ]);
  
  return result[0] || { averagePercentage: 0, averageGradePoints: 0, totalGrades: 0 };
};

// Static method to get grade distribution
gradeSchema.statics.getGradeDistribution = async function(courseId) {
  const result = await this.aggregate([
    { $match: { course: mongoose.Types.ObjectId(courseId) } },
    { $group: {
      _id: '$letterGrade',
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);
  
  return result;
};

// Indexes for better query performance
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ assignment: 1 });
gradeSchema.index({ instructor: 1 });
gradeSchema.index({ course: 1, 'scores.percentage': -1 });
gradeSchema.index({ letterGrade: 1 });
gradeSchema.index({ status: 1 });
gradeSchema.index({ 'timeline.gradedAt': -1 });

// Compound indexes
gradeSchema.index({ student: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
