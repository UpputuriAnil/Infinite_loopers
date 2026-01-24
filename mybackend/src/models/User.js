const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: {
    type: Date
  },
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
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
    }
  }],
  teachingCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  skillPoints: {
    total: {
      type: Number,
      default: 0
    },
    breakdown: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      points: {
        type: Number,
        default: 0
      },
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  preferences: {
    dailyGoal: {
      type: Number,
      default: 180, // minutes
      min: 30,
      max: 480
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      assignments: {
        type: Boolean,
        default: true
      },
      grades: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  statistics: {
    totalStudyTime: {
      type: Number,
      default: 0 // in minutes
    },
    coursesCompleted: {
      type: Number,
      default: 0
    },
    assignmentsSubmitted: {
      type: Number,
      default: 0
    },
    averageGrade: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActivity: {
        type: Date,
        default: Date.now
      }
    }
  },
  achievements: [{
    title: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['course', 'assignment', 'grade', 'streak', 'participation']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's level based on skill points
userSchema.virtual('level').get(function() {
  return Math.floor(this.skillPoints.total / 100) + 1;
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update study streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = this.statistics.streak.lastActivity;
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.statistics.streak.current += 1;
    if (this.statistics.streak.current > this.statistics.streak.longest) {
      this.statistics.streak.longest = this.statistics.streak.current;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.statistics.streak.current = 1;
  }
  // If daysDiff === 0, same day, no change needed
  
  this.statistics.streak.lastActivity = today;
};

// Method to add skill points
userSchema.methods.addSkillPoints = function(courseId, points) {
  // Add to total
  this.skillPoints.total += points;
  
  // Add to breakdown
  const existingEntry = this.skillPoints.breakdown.find(
    entry => entry.course.toString() === courseId.toString()
  );
  
  if (existingEntry) {
    existingEntry.points += points;
  } else {
    this.skillPoints.breakdown.push({
      course: courseId,
      points: points
    });
  }
};

// Method to add achievement
userSchema.methods.addAchievement = function(achievement) {
  // Check if achievement already exists
  const exists = this.achievements.some(
    ach => ach.title === achievement.title
  );
  
  if (!exists) {
    this.achievements.push(achievement);
  }
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'enrolledCourses.course': 1 });
userSchema.index({ teachingCourses: 1 });

module.exports = mongoose.model('User', userSchema);
