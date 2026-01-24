const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Material title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
    enum: ['document', 'video', 'audio', 'image', 'link', 'presentation', 'spreadsheet', 'archive', 'code', 'other'],
    required: [true, 'Material type is required']
  },
  category: {
    type: String,
    enum: ['lecture', 'reading', 'assignment', 'reference', 'supplementary', 'example', 'template', 'solution'],
    default: 'lecture'
  },
  file: {
    filename: {
      type: String,
      required: function() {
        return this.type !== 'link';
      }
    },
    originalName: {
      type: String,
      required: function() {
        return this.type !== 'link';
      }
    },
    mimetype: String,
    size: {
      type: Number,
      min: 0
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    previewUrl: String,
    downloadUrl: String,
    streamUrl: String
  },
  content: {
    text: String,
    html: String,
    markdown: String,
    metadata: {
      duration: Number, // for video/audio in seconds
      pages: Number, // for documents
      resolution: {
        width: Number,
        height: Number
      },
      bitrate: Number, // for audio/video
      format: String,
      encoding: String,
      language: String,
      author: String,
      subject: String,
      keywords: [String]
    }
  },
  access: {
    visibility: {
      type: String,
      enum: ['public', 'course-members', 'instructors-only', 'private'],
      default: 'course-members'
    },
    downloadable: {
      type: Boolean,
      default: true
    },
    printable: {
      type: Boolean,
      default: true
    },
    shareable: {
      type: Boolean,
      default: true
    },
    requiresLogin: {
      type: Boolean,
      default: true
    },
    accessCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  organization: {
    module: {
      type: String,
      trim: true
    },
    lesson: {
      type: String,
      trim: true
    },
    week: {
      type: Number,
      min: 1
    },
    order: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    folder: {
      type: String,
      trim: true
    }
  },
  schedule: {
    availableFrom: {
      type: Date,
      default: Date.now
    },
    availableUntil: {
      type: Date
    },
    isScheduled: {
      type: Boolean,
      default: false
    }
  },
  versioning: {
    version: {
      type: String,
      default: '1.0'
    },
    previousVersions: [{
      version: String,
      filename: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      changes: String
    }],
    isLatest: {
      type: Boolean,
      default: true
    }
  },
  analytics: {
    views: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      duration: Number, // time spent viewing in seconds
      device: String,
      browser: String,
      ipAddress: String
    }],
    downloads: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      downloadedAt: {
        type: Date,
        default: Date.now
      },
      device: String,
      browser: String,
      ipAddress: String
    }],
    totalViews: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    uniqueViewers: {
      type: Number,
      default: 0
    },
    averageViewDuration: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date
    }
  },
  interactions: {
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    bookmarks: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bookmarkedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
      },
      timestamp: Number, // for video/audio materials
      isPrivate: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      replies: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        content: {
          type: String,
          required: true,
          maxlength: [500, 'Reply cannot exceed 500 characters']
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
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
      review: String,
      ratedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  security: {
    isEncrypted: {
      type: Boolean,
      default: false
    },
    encryptionKey: String,
    checksum: String,
    virusScanStatus: {
      type: String,
      enum: ['pending', 'clean', 'infected', 'error'],
      default: 'pending'
    },
    scanDate: Date,
    accessLog: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      action: {
        type: String,
        enum: ['view', 'download', 'share', 'edit', 'delete']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'published'
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

// Virtual for file size in human readable format
materialSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.file.size) return 'Unknown';
  
  const bytes = this.file.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for average rating
materialSchema.virtual('averageRating').get(function() {
  if (this.interactions.ratings.length === 0) return 0;
  
  const total = this.interactions.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return Math.round((total / this.interactions.ratings.length) * 10) / 10;
});

// Virtual for like count
materialSchema.virtual('likeCount').get(function() {
  return this.interactions.likes.length;
});

// Virtual for comment count
materialSchema.virtual('commentCount').get(function() {
  return this.interactions.comments.length;
});

// Virtual for availability status
materialSchema.virtual('availabilityStatus').get(function() {
  const now = new Date();
  
  if (!this.isActive || this.status !== 'published') return 'unavailable';
  if (this.schedule.availableFrom && now < this.schedule.availableFrom) return 'scheduled';
  if (this.schedule.availableUntil && now > this.schedule.availableUntil) return 'expired';
  
  return 'available';
});

// Pre-save middleware
materialSchema.pre('save', function(next) {
  // Set published date if being published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Update analytics totals
  this.analytics.totalViews = this.analytics.views.length;
  this.analytics.totalDownloads = this.analytics.downloads.length;
  
  // Calculate unique viewers
  const uniqueViewers = new Set(this.analytics.views.map(view => view.user.toString()));
  this.analytics.uniqueViewers = uniqueViewers.size;
  
  // Calculate average view duration
  if (this.analytics.views.length > 0) {
    const totalDuration = this.analytics.views.reduce((sum, view) => sum + (view.duration || 0), 0);
    this.analytics.averageViewDuration = Math.round(totalDuration / this.analytics.views.length);
  }
  
  // Update access counts
  this.access.accessCount = this.analytics.totalViews;
  this.access.downloadCount = this.analytics.totalDownloads;
  
  next();
});

// Method to record view
materialSchema.methods.recordView = function(userId, duration = 0, deviceInfo = {}) {
  this.analytics.views.push({
    user: userId,
    duration,
    device: deviceInfo.device,
    browser: deviceInfo.browser,
    ipAddress: deviceInfo.ipAddress
  });
  
  this.analytics.lastAccessed = new Date();
  
  // Add to security log
  this.security.accessLog.push({
    user: userId,
    action: 'view',
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent
  });
  
  return this;
};

// Method to record download
materialSchema.methods.recordDownload = function(userId, deviceInfo = {}) {
  this.analytics.downloads.push({
    user: userId,
    device: deviceInfo.device,
    browser: deviceInfo.browser,
    ipAddress: deviceInfo.ipAddress
  });
  
  // Add to security log
  this.security.accessLog.push({
    user: userId,
    action: 'download',
    ipAddress: deviceInfo.ipAddress,
    userAgent: deviceInfo.userAgent
  });
  
  return this;
};

// Method to add comment
materialSchema.methods.addComment = function(userId, content, timestamp = null, isPrivate = false) {
  this.interactions.comments.push({
    user: userId,
    content,
    timestamp,
    isPrivate
  });
  
  return this.interactions.comments[this.interactions.comments.length - 1];
};

// Method to toggle like
materialSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.interactions.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    // Unlike
    this.interactions.likes.splice(likeIndex, 1);
    return { liked: false, likeCount: this.interactions.likes.length };
  } else {
    // Like
    this.interactions.likes.push({ user: userId });
    return { liked: true, likeCount: this.interactions.likes.length };
  }
};

// Method to toggle bookmark
materialSchema.methods.toggleBookmark = function(userId) {
  const bookmarkIndex = this.interactions.bookmarks.findIndex(
    bookmark => bookmark.user.toString() === userId.toString()
  );
  
  if (bookmarkIndex > -1) {
    // Remove bookmark
    this.interactions.bookmarks.splice(bookmarkIndex, 1);
    return { bookmarked: false, bookmarkCount: this.interactions.bookmarks.length };
  } else {
    // Add bookmark
    this.interactions.bookmarks.push({ user: userId });
    return { bookmarked: true, bookmarkCount: this.interactions.bookmarks.length };
  }
};

// Method to add rating
materialSchema.methods.addRating = function(userId, rating, review = '') {
  // Check if user already rated
  const existingRating = this.interactions.ratings.find(
    r => r.user.toString() === userId.toString()
  );
  
  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.review = review;
    existingRating.ratedAt = new Date();
  } else {
    // Add new rating
    this.interactions.ratings.push({
      user: userId,
      rating,
      review
    });
  }
  
  return this;
};

// Method to check if user can access material
materialSchema.methods.canAccess = function(user) {
  // Check if material is active and published
  if (!this.isActive || this.status !== 'published') {
    return false;
  }
  
  // Check schedule
  const now = new Date();
  if (this.schedule.availableFrom && now < this.schedule.availableFrom) {
    return false;
  }
  if (this.schedule.availableUntil && now > this.schedule.availableUntil) {
    return false;
  }
  
  // Check visibility
  switch (this.access.visibility) {
    case 'public':
      return true;
    case 'course-members':
      return user && (user.enrolledCourses.some(ec => ec.course.toString() === this.course.toString()) ||
                     user.teachingCourses.includes(this.course));
    case 'instructors-only':
      return user && (user.role === 'teacher' || user.role === 'admin') &&
             user.teachingCourses.includes(this.course);
    case 'private':
      return user && user._id.toString() === this.instructor.toString();
    default:
      return false;
  }
};

// Method to create new version
materialSchema.methods.createVersion = function(newFile, changes = '') {
  // Archive current version
  this.versioning.previousVersions.push({
    version: this.versioning.version,
    filename: this.file.filename,
    url: this.file.url,
    changes: changes
  });
  
  // Update to new version
  const versionParts = this.versioning.version.split('.');
  const majorVersion = parseInt(versionParts[0]);
  const minorVersion = parseInt(versionParts[1] || 0);
  
  this.versioning.version = `${majorVersion}.${minorVersion + 1}`;
  this.file = { ...this.file, ...newFile };
  
  return this;
};

// Static method to get popular materials
materialSchema.statics.getPopular = async function(courseId, limit = 10) {
  return this.find({
    course: courseId,
    status: 'published',
    isActive: true
  })
  .sort({ 'analytics.totalViews': -1, 'interactions.likes': -1 })
  .limit(limit)
  .populate('instructor', 'name avatar')
  .populate('course', 'title');
};

// Static method to get recent materials
materialSchema.statics.getRecent = async function(courseId, limit = 10) {
  return this.find({
    course: courseId,
    status: 'published',
    isActive: true
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('instructor', 'name avatar')
  .populate('course', 'title');
};

// Indexes for better query performance
materialSchema.index({ course: 1 });
materialSchema.index({ instructor: 1 });
materialSchema.index({ type: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ status: 1, isActive: 1 });
materialSchema.index({ 'organization.tags': 1 });
materialSchema.index({ 'organization.module': 1, 'organization.lesson': 1 });
materialSchema.index({ 'analytics.totalViews': -1 });
materialSchema.index({ createdAt: -1 });
materialSchema.index({ publishedAt: -1 });

// Text index for search
materialSchema.index({
  title: 'text',
  description: 'text',
  'organization.tags': 'text',
  'content.text': 'text'
});

module.exports = mongoose.model('Material', materialSchema);
