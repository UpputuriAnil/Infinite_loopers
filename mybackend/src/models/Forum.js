const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Forum title is required'],
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
  category: {
    type: String,
    enum: ['general', 'announcements', 'assignments', 'projects', 'q-and-a', 'study-groups', 'resources', 'off-topic'],
    default: 'general'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    text: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters']
    },
    html: {
      type: String,
      maxlength: [15000, 'HTML content cannot exceed 15000 characters']
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
    images: [{
      url: String,
      caption: String,
      alt: String
    }],
    links: [{
      url: String,
      title: String,
      description: String
    }]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  type: {
    type: String,
    enum: ['discussion', 'question', 'announcement', 'poll', 'resource'],
    default: 'discussion'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived', 'pinned', 'locked'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'course-members', 'instructors-only', 'private'],
    default: 'course-members'
  },
  moderation: {
    isModerated: {
      type: Boolean,
      default: false
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: {
      type: Date
    },
    moderationReason: String,
    flags: [{
      type: {
        type: String,
        enum: ['spam', 'inappropriate', 'off-topic', 'harassment', 'copyright'],
        required: true
      },
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reason: String,
      reportedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
      }
    }]
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
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
    dislikes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dislikedAt: {
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
    shares: {
      type: Number,
      default: 0
    }
  },
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      text: {
        type: String,
        required: true,
        maxlength: [5000, 'Reply content cannot exceed 5000 characters']
      },
      html: String,
      attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }]
    },
    parentReply: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
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
    isAnswer: {
      type: Boolean,
      default: false
    },
    isBestAnswer: {
      type: Boolean,
      default: false
    },
    isModerated: {
      type: Boolean,
      default: false
    },
    moderationReason: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    editHistory: [{
      editedAt: {
        type: Date,
        default: Date.now
      },
      reason: String,
      previousContent: String
    }]
  }],
  poll: {
    enabled: {
      type: Boolean,
      default: false
    },
    question: String,
    options: [{
      text: {
        type: String,
        required: true
      },
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    settings: {
      allowMultiple: {
        type: Boolean,
        default: false
      },
      showResults: {
        type: String,
        enum: ['always', 'after-vote', 'after-close'],
        default: 'after-vote'
      },
      anonymous: {
        type: Boolean,
        default: false
      }
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalReplies: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalBookmarks: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    lastReplyAt: Date,
    participantCount: {
      type: Number,
      default: 0
    }
  },
  notifications: {
    subscribers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      subscribedAt: {
        type: Date,
        default: Date.now
      },
      notificationTypes: [{
        type: String,
        enum: ['new-reply', 'new-like', 'status-change', 'moderation']
      }]
    }]
  },
  seo: {
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
forumSchema.virtual('likeCount').get(function() {
  return this.engagement.likes.length;
});

// Virtual for dislike count
forumSchema.virtual('dislikeCount').get(function() {
  return this.engagement.dislikes.length;
});

// Virtual for reply count
forumSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for bookmark count
forumSchema.virtual('bookmarkCount').get(function() {
  return this.engagement.bookmarks.length;
});

// Virtual for engagement score
forumSchema.virtual('engagementScore').get(function() {
  const likes = this.engagement.likes.length;
  const replies = this.replies.length;
  const views = this.engagement.views;
  const bookmarks = this.engagement.bookmarks.length;
  
  return (likes * 2) + (replies * 3) + (views * 0.1) + (bookmarks * 5);
});

// Pre-save middleware
forumSchema.pre('save', function(next) {
  // Update statistics
  this.statistics.totalReplies = this.replies.length;
  this.statistics.totalLikes = this.engagement.likes.length;
  this.statistics.totalViews = this.engagement.views;
  this.statistics.totalBookmarks = this.engagement.bookmarks.length;
  
  // Update last activity
  this.statistics.lastActivity = new Date();
  
  // Find last reply date
  if (this.replies.length > 0) {
    const lastReply = this.replies[this.replies.length - 1];
    this.statistics.lastReplyAt = lastReply.createdAt;
  }
  
  // Count unique participants
  const participants = new Set();
  participants.add(this.author.toString());
  this.replies.forEach(reply => {
    participants.add(reply.author.toString());
  });
  this.statistics.participantCount = participants.size;
  
  // Generate slug if not exists
  if (!this.seo.slug) {
    this.seo.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  next();
});

// Method to add reply
forumSchema.methods.addReply = function(authorId, content, parentReplyId = null) {
  const reply = {
    author: authorId,
    content,
    parentReply: parentReplyId
  };
  
  this.replies.push(reply);
  this.statistics.lastActivity = new Date();
  
  return this.replies[this.replies.length - 1];
};

// Method to like/unlike post
forumSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.engagement.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    // Unlike
    this.engagement.likes.splice(likeIndex, 1);
    return { liked: false, likeCount: this.engagement.likes.length };
  } else {
    // Like
    this.engagement.likes.push({ user: userId });
    
    // Remove dislike if exists
    const dislikeIndex = this.engagement.dislikes.findIndex(
      dislike => dislike.user.toString() === userId.toString()
    );
    if (dislikeIndex > -1) {
      this.engagement.dislikes.splice(dislikeIndex, 1);
    }
    
    return { liked: true, likeCount: this.engagement.likes.length };
  }
};

// Method to bookmark/unbookmark post
forumSchema.methods.toggleBookmark = function(userId) {
  const bookmarkIndex = this.engagement.bookmarks.findIndex(
    bookmark => bookmark.user.toString() === userId.toString()
  );
  
  if (bookmarkIndex > -1) {
    // Remove bookmark
    this.engagement.bookmarks.splice(bookmarkIndex, 1);
    return { bookmarked: false, bookmarkCount: this.engagement.bookmarks.length };
  } else {
    // Add bookmark
    this.engagement.bookmarks.push({ user: userId });
    return { bookmarked: true, bookmarkCount: this.engagement.bookmarks.length };
  }
};

// Method to mark reply as best answer
forumSchema.methods.markBestAnswer = function(replyId) {
  // Remove previous best answer
  this.replies.forEach(reply => {
    reply.isBestAnswer = false;
  });
  
  // Mark new best answer
  const reply = this.replies.id(replyId);
  if (reply) {
    reply.isBestAnswer = true;
    reply.isAnswer = true;
  }
  
  return reply;
};

// Method to subscribe to notifications
forumSchema.methods.subscribe = function(userId, notificationTypes = ['new-reply']) {
  const existingSubscription = this.notifications.subscribers.find(
    sub => sub.user.toString() === userId.toString()
  );
  
  if (existingSubscription) {
    existingSubscription.notificationTypes = notificationTypes;
  } else {
    this.notifications.subscribers.push({
      user: userId,
      notificationTypes
    });
  }
  
  return this;
};

// Method to increment view count
forumSchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this;
};

// Method to add poll vote
forumSchema.methods.addPollVote = function(userId, optionIndex) {
  if (!this.poll.enabled || !this.poll.isActive) {
    throw new Error('Poll is not active');
  }
  
  if (optionIndex >= this.poll.options.length) {
    throw new Error('Invalid option');
  }
  
  // Check if user already voted (if multiple votes not allowed)
  if (!this.poll.settings.allowMultiple) {
    this.poll.options.forEach(option => {
      const voteIndex = option.votes.findIndex(
        vote => vote.user.toString() === userId.toString()
      );
      if (voteIndex > -1) {
        option.votes.splice(voteIndex, 1);
      }
    });
  }
  
  // Add new vote
  this.poll.options[optionIndex].votes.push({ user: userId });
  
  return this;
};

// Static method to get trending posts
forumSchema.statics.getTrending = async function(courseId, limit = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.find({
    course: courseId,
    createdAt: { $gte: oneDayAgo },
    status: 'active'
  })
  .sort({ 'statistics.lastActivity': -1 })
  .limit(limit)
  .populate('author', 'name avatar')
  .populate('course', 'title');
};

// Indexes for better query performance
forumSchema.index({ course: 1 });
forumSchema.index({ author: 1 });
forumSchema.index({ category: 1 });
forumSchema.index({ status: 1 });
forumSchema.index({ type: 1 });
forumSchema.index({ 'statistics.lastActivity': -1 });
forumSchema.index({ createdAt: -1 });
forumSchema.index({ tags: 1 });
forumSchema.index({ 'seo.slug': 1 });

// Text index for search
forumSchema.index({
  title: 'text',
  'content.text': 'text',
  tags: 'text'
});

module.exports = mongoose.model('Forum', forumSchema);
