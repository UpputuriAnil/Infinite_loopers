const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
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
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1
  },
  submissionType: {
    type: String,
    enum: ['file', 'text', 'quiz', 'code', 'mixed'],
    default: 'mixed'
  },
  content: {
    text: {
      type: String,
      maxlength: [10000, 'Text content cannot exceed 10000 characters']
    },
    files: [{
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
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'code', 'file-upload'],
        required: true
      },
      answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object
      timeSpent: {
        type: Number,
        default: 0 // in seconds
      },
      isCorrect: {
        type: Boolean,
        default: null
      },
      points: {
        type: Number,
        default: 0
      }
    }],
    code: {
      language: String,
      sourceCode: String,
      testResults: [{
        testCase: String,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        executionTime: Number,
        memoryUsed: Number
      }],
      compilationOutput: String,
      runtimeErrors: [String]
    }
  },
  timing: {
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    timeLimitExceeded: {
      type: Boolean,
      default: false
    }
  },
  grading: {
    isGraded: {
      type: Boolean,
      default: false
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date
    },
    autoGraded: {
      type: Boolean,
      default: false
    },
    rawScore: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
      default: null
    },
    finalGrade: {
      type: Number,
      default: 0
    },
    latePenalty: {
      applied: {
        type: Boolean,
        default: false
      },
      percentage: {
        type: Number,
        default: 0
      },
      pointsDeducted: {
        type: Number,
        default: 0
      }
    },
    rubricScores: [{
      criterionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      criterionName: String,
      points: {
        type: Number,
        required: true
      },
      maxPoints: {
        type: Number,
        required: true
      },
      feedback: String
    }]
  },
  feedback: {
    instructor: {
      overall: {
        type: String,
        maxlength: [2000, 'Overall feedback cannot exceed 2000 characters']
      },
      specific: [{
        section: String,
        comment: String,
        type: {
          type: String,
          enum: ['positive', 'negative', 'suggestion', 'question'],
          default: 'suggestion'
        }
      }],
      audioFeedback: {
        url: String,
        duration: Number
      },
      videoFeedback: {
        url: String,
        duration: Number
      }
    },
    peer: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      reviewedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'returned', 'resubmitted'],
    default: 'submitted'
  },
  flags: {
    isLate: {
      type: Boolean,
      default: false
    },
    isPlagiarized: {
      type: Boolean,
      default: false
    },
    plagiarismScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    needsReview: {
      type: Boolean,
      default: false
    },
    isExceptional: {
      type: Boolean,
      default: false
    }
  },
  history: [{
    action: {
      type: String,
      enum: ['submitted', 'graded', 'returned', 'resubmitted', 'commented'],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    browserInfo: {
      name: String,
      version: String
    },
    deviceInfo: {
      type: String,
      platform: String
    },
    submissionEnvironment: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for grade status
submissionSchema.virtual('gradeStatus').get(function() {
  if (!this.grading.isGraded) return 'pending';
  
  const percentage = this.grading.percentage;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'good';
  if (percentage >= 70) return 'satisfactory';
  if (percentage >= 60) return 'needs-improvement';
  return 'unsatisfactory';
});

// Virtual for submission timeliness
submissionSchema.virtual('timeliness').get(function() {
  if (this.flags.isLate) return 'late';
  
  // Check if submitted close to deadline (within 1 hour)
  const Assignment = mongoose.model('Assignment');
  // This would need to be populated or fetched separately
  return 'on-time';
});

// Pre-save middleware
submissionSchema.pre('save', function(next) {
  // Calculate percentage if graded
  if (this.grading.isGraded && this.grading.maxScore > 0) {
    this.grading.percentage = Math.round((this.grading.rawScore / this.grading.maxScore) * 100);
    
    // Calculate letter grade
    this.grading.letterGrade = this.calculateLetterGrade(this.grading.percentage);
    
    // Calculate final grade after penalties
    this.grading.finalGrade = this.grading.rawScore - (this.grading.latePenalty.pointsDeducted || 0);
  }
  
  // Calculate time spent
  if (this.timing.submittedAt && this.timing.startedAt) {
    this.timing.timeSpent = Math.round((this.timing.submittedAt - this.timing.startedAt) / (1000 * 60));
  }
  
  next();
});

// Method to calculate letter grade
submissionSchema.methods.calculateLetterGrade = function(percentage) {
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

// Method to apply late penalty
submissionSchema.methods.applyLatePenalty = async function() {
  const Assignment = mongoose.model('Assignment');
  const assignment = await Assignment.findById(this.assignment);
  
  if (!assignment) return this;
  
  const penalty = assignment.calculateLatePenalty(this.timing.submittedAt);
  
  if (penalty > 0) {
    this.flags.isLate = true;
    this.grading.latePenalty.applied = true;
    this.grading.latePenalty.percentage = penalty;
    this.grading.latePenalty.pointsDeducted = Math.round((this.grading.rawScore * penalty) / 100);
  }
  
  return this;
};

// Method to auto-grade submission
submissionSchema.methods.autoGrade = function() {
  let totalPoints = 0;
  let maxPoints = 0;
  
  // Grade quiz/multiple choice questions
  this.content.answers.forEach(answer => {
    if (answer.questionType === 'multiple-choice' || answer.questionType === 'true-false') {
      maxPoints += answer.points || 0;
      if (answer.isCorrect) {
        totalPoints += answer.points || 0;
      }
    }
  });
  
  // Grade code submissions (basic check)
  if (this.content.code && this.content.code.testResults) {
    const passedTests = this.content.code.testResults.filter(test => test.passed).length;
    const totalTests = this.content.code.testResults.length;
    
    if (totalTests > 0) {
      const codePoints = (passedTests / totalTests) * (this.grading.maxScore || 100);
      totalPoints += codePoints;
      maxPoints += (this.grading.maxScore || 100);
    }
  }
  
  if (maxPoints > 0) {
    this.grading.rawScore = totalPoints;
    this.grading.maxScore = maxPoints;
    this.grading.isGraded = true;
    this.grading.autoGraded = true;
    this.grading.gradedAt = new Date();
    this.status = 'graded';
  }
  
  return this;
};

// Method to add feedback
submissionSchema.methods.addFeedback = function(feedback, feedbackType = 'instructor') {
  if (feedbackType === 'instructor') {
    this.feedback.instructor = { ...this.feedback.instructor, ...feedback };
  }
  
  // Add to history
  this.history.push({
    action: 'commented',
    performedBy: feedback.gradedBy || this.grading.gradedBy,
    details: 'Feedback added'
  });
  
  return this;
};

// Method to check if resubmission is allowed
submissionSchema.methods.canResubmit = async function() {
  const Assignment = mongoose.model('Assignment');
  const assignment = await Assignment.findById(this.assignment);
  
  if (!assignment) return false;
  
  // Check if assignment still accepts submissions
  if (!assignment.isAvailableForSubmission() && !assignment.acceptsLateSubmission()) {
    return false;
  }
  
  // Check attempt limits
  const submissionCount = await mongoose.model('Submission').countDocuments({
    assignment: this.assignment,
    student: this.student
  });
  
  return submissionCount < assignment.attempts.allowed;
};

// Indexes for better query performance
submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ course: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ 'grading.isGraded': 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ 'timing.submittedAt': 1 });
submissionSchema.index({ 'flags.isLate': 1 });
submissionSchema.index({ 'flags.needsReview': 1 });

// Compound indexes
submissionSchema.index({ assignment: 1, student: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
