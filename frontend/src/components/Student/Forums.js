import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, MessageSquare, Search, Plus, TrendingUp, Clock, User } from 'lucide-react';
import './Forums.css';

const Forums = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'general' });

  const [threads] = useState([
    {
      id: 1,
      title: 'How to approach React Hooks?',
      author: 'John Student',
      category: 'Web Development',
      replies: 12,
      likes: 24,
      lastActivity: '2 hours ago',
      excerpt: 'I\'m having trouble understanding useEffect dependencies...'
    },
    {
      id: 2,
      title: 'Best practices for MongoDB indexing',
      author: 'Sarah Developer',
      category: 'Database',
      replies: 8,
      likes: 15,
      lastActivity: '5 hours ago',
      excerpt: 'What are the best strategies for indexing large collections?'
    },
    {
      id: 3,
      title: 'Assignment 3 - Need clarification',
      author: 'Mike Johnson',
      category: 'Assignments',
      replies: 20,
      likes: 10,
      lastActivity: '1 day ago',
      excerpt: 'Can someone explain the requirements for question 4?'
    }
  ]);

  const categories = ['All', 'General', 'Web Development', 'Database', 'Assignments', 'Projects'];

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateThread = (e) => {
    e.preventDefault();
    console.log('Creating thread:', newThread);
    setShowNewThread(false);
    setNewThread({ title: '', content: '', category: 'general' });
  };

  return (
    <div className="forums-container">
      <div className="forums-header">
        <div>
          <h1>Discussion Forums</h1>
          <p>Connect with fellow students and share knowledge</p>
        </div>
        <button onClick={() => setShowNewThread(true)} className="new-thread-btn">
          <Plus size={16} />
          New Thread
        </button>
      </div>

      {/* Search and Filter */}
      <div className="forums-toolbar">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tab ${activeTab === category.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveTab(category.toLowerCase())}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="modal-overlay" onClick={() => setShowNewThread(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Thread</h2>
            <form onSubmit={handleCreateThread}>
              <div className="form-group">
                <label>Thread Title</label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread({...newThread, title: e.target.value})}
                  placeholder="What's your question or topic?"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newThread.category}
                  onChange={(e) => setNewThread({...newThread, category: e.target.value})}
                >
                  <option value="general">General</option>
                  <option value="web-dev">Web Development</option>
                  <option value="database">Database</option>
                  <option value="assignments">Assignments</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread({...newThread, content: e.target.value})}
                  placeholder="Describe your question in detail..."
                  rows="6"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowNewThread(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threads List */}
      <div className="threads-list">
        {filteredThreads.length > 0 ? (
          filteredThreads.map(thread => (
            <div key={thread.id} className="thread-card">
              <div className="thread-main">
                <div className="thread-icon">
                  <MessageCircle size={24} />
                </div>
                <div className="thread-content">
                  <h3>{thread.title}</h3>
                  <p>{thread.excerpt}</p>
                  <div className="thread-meta">
                    <span className="category-badge">{thread.category}</span>
                    <span className="author">
                      <User size={14} />
                      {thread.author}
                    </span>
                    <span className="time">
                      <Clock size={14} />
                      {thread.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
              <div className="thread-stats">
                <div className="stat">
                  <MessageSquare size={18} />
                  <span>{thread.replies} replies</span>
                </div>
                <div className="stat">
                  <ThumbsUp size={18} />
                  <span>{thread.likes} likes</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <MessageCircle size={64} />
            <h3>No threads found</h3>
            <p>Try adjusting your search or create a new thread</p>
          </div>
        )}
      </div>

      {/* Trending Topics */}
      <div className="trending-section">
        <h3><TrendingUp size={20} /> Trending Topics</h3>
        <div className="trending-list">
          <div className="trending-item">#ReactHooks</div>
          <div className="trending-item">#MongoDB</div>
          <div className="trending-item">#JavaScript</div>
          <div className="trending-item">#NodeJS</div>
        </div>
      </div>
    </div>
  );
};

export default Forums;
