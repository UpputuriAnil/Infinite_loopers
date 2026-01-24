import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock, 
  ThumbsUp, 
  Reply,
  Plus,
  Search
} from 'lucide-react';
import './Forum.css';

const DiscussionForum = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      // Mock discussion data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockDiscussions = [
        {
          _id: 'discussion_1',
          title: 'Question about React Hooks',
          content: 'Can someone explain the difference between useState and useEffect?',
          author: {
            _id: 'student_1',
            name: 'Alice Johnson',
            role: 'student'
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          replies: [
            {
              _id: 'reply_1',
              content: 'useState manages state, useEffect handles side effects like API calls.',
              author: {
                _id: 'teacher_1',
                name: 'John Teacher',
                role: 'teacher'
              },
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              likes: 5
            }
          ],
          likes: 3,
          views: 15
        },
        {
          _id: 'discussion_2',
          title: 'Assignment 2 Clarification',
          content: 'I\'m having trouble understanding the requirements for the component props section.',
          author: {
            _id: 'student_2',
            name: 'Bob Smith',
            role: 'student'
          },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          replies: [],
          likes: 1,
          views: 8
        }
      ];
      
      setDiscussions(mockDiscussions);
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      return;
    }

    const topic = {
      _id: 'discussion_' + Date.now(),
      title: newTopic.title,
      content: newTopic.content,
      author: {
        _id: user._id,
        name: user.name,
        role: user.role
      },
      createdAt: new Date().toISOString(),
      replies: [],
      likes: 0,
      views: 0
    };

    setDiscussions([topic, ...discussions]);
    setNewTopic({ title: '', content: '' });
    setShowNewTopic(false);
  };

  const handleReply = (discussionId, replyContent) => {
    if (!replyContent.trim()) return;

    const reply = {
      _id: 'reply_' + Date.now(),
      content: replyContent,
      author: {
        _id: user._id,
        name: user.name,
        role: user.role
      },
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setDiscussions(prev => 
      prev.map(discussion => 
        discussion._id === discussionId
          ? { ...discussion, replies: [...discussion.replies, reply] }
          : discussion
      )
    );
  };

  const handleLike = (discussionId, replyId = null) => {
    setDiscussions(prev => 
      prev.map(discussion => {
        if (discussion._id === discussionId) {
          if (replyId) {
            return {
              ...discussion,
              replies: discussion.replies.map(reply =>
                reply._id === replyId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              )
            };
          } else {
            return { ...discussion, likes: discussion.likes + 1 };
          }
        }
        return discussion;
      })
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="forum-container">
        <div className="loading">Loading discussions...</div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Course Discussion Forum</h1>
        <p>Ask questions, share knowledge, and collaborate with your classmates</p>
      </div>

      <div className="forum-controls">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setShowNewTopic(!showNewTopic)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          New Topic
        </button>
      </div>

      {showNewTopic && (
        <div className="new-topic-form">
          <h3>Create New Discussion Topic</h3>
          <form onSubmit={handleCreateTopic}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Topic title..."
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="What would you like to discuss?"
                value={newTopic.content}
                onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                rows="4"
                required
              />
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowNewTopic(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Topic
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="discussions-list">
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map((discussion) => (
            <DiscussionItem
              key={discussion._id}
              discussion={discussion}
              onReply={handleReply}
              onLike={handleLike}
              formatTimeAgo={formatTimeAgo}
              currentUser={user}
            />
          ))
        ) : (
          <div className="empty-state">
            <MessageCircle size={64} />
            <h2>No discussions found</h2>
            <p>Be the first to start a discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DiscussionItem = ({ discussion, onReply, onLike, formatTimeAgo, currentUser }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    onReply(discussion._id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
    setShowReplies(true);
  };

  return (
    <div className="discussion-item">
      <div className="discussion-header">
        <div className="author-info">
          <User size={20} />
          <div>
            <span className="author-name">{discussion.author.name}</span>
            <span className={`author-role ${discussion.author.role}`}>
              {discussion.author.role}
            </span>
          </div>
        </div>
        <div className="discussion-meta">
          <Clock size={16} />
          <span>{formatTimeAgo(discussion.createdAt)}</span>
        </div>
      </div>

      <div className="discussion-content">
        <h3>{discussion.title}</h3>
        <p>{discussion.content}</p>
      </div>

      <div className="discussion-actions">
        <button 
          onClick={() => onLike(discussion._id)}
          className="action-btn"
        >
          <ThumbsUp size={16} />
          <span>{discussion.likes}</span>
        </button>
        
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="action-btn"
        >
          <Reply size={16} />
          Reply
        </button>
        
        {discussion.replies.length > 0 && (
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="action-btn"
          >
            <MessageCircle size={16} />
            {discussion.replies.length} replies
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows="3"
            required
          />
          <div className="reply-actions">
            <button 
              type="button" 
              onClick={() => setShowReplyForm(false)}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={16} />
              Reply
            </button>
          </div>
        </form>
      )}

      {showReplies && discussion.replies.length > 0 && (
        <div className="replies-list">
          {discussion.replies.map((reply) => (
            <div key={reply._id} className="reply-item">
              <div className="reply-header">
                <div className="author-info">
                  <User size={16} />
                  <span className="author-name">{reply.author.name}</span>
                  <span className={`author-role ${reply.author.role}`}>
                    {reply.author.role}
                  </span>
                </div>
                <span className="reply-time">{formatTimeAgo(reply.createdAt)}</span>
              </div>
              <p className="reply-content">{reply.content}</p>
              <button 
                onClick={() => onLike(discussion._id, reply._id)}
                className="action-btn"
              >
                <ThumbsUp size={14} />
                <span>{reply.likes}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;
