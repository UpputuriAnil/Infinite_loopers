import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, User, BookOpen, FileText } from 'lucide-react';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, placeholder = "Search courses, assignments, discussions..." }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    instructor: '',
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);

  const searchTypes = [
    { id: 'all', label: 'All Content', icon: Search },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: User }
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'semester', label: 'This Semester' }
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'programming', label: 'Programming' },
    { id: 'design', label: 'Design' },
    { id: 'business', label: 'Business' },
    { id: 'science', label: 'Science' },
    { id: 'mathematics', label: 'Mathematics' }
  ];

  const suggestions = searchQuery.length > 0 ? [
    { text: `${searchQuery} in Courses`, type: 'course', icon: BookOpen },
    { text: `${searchQuery} in Assignments`, type: 'assignment', icon: FileText },
    { text: `${searchQuery} in Discussions`, type: 'discussion', icon: User },
    { text: `Recent: ${searchQuery}`, type: 'recent', icon: Search }
  ].filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase())) : [
    { text: 'React Components', type: 'course', icon: BookOpen },
    { text: 'JavaScript Assignment', type: 'assignment', icon: FileText },
    { text: 'Database Design', type: 'course', icon: BookOpen },
    { text: 'UI/UX Discussion', type: 'discussion', icon: User }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        query: searchQuery,
        filters: filters
      });
    }
    // Show search results feedback
    if (searchQuery.trim()) {
      console.log(`Searching for: "${searchQuery}" with filters:`, filters);
      // You can add actual search logic here
    }
    setIsExpanded(false);
    setShowFilters(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsExpanded(value.length > 0);
    
    // Real-time search as user types
    if (value.length > 2) {
      handleSearch();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilters({
      type: 'all',
      dateRange: 'all',
      instructor: '',
      category: 'all'
    });
    onSearch && onSearch({ query: '', filters: {} });
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== 'all' && value !== ''
  );

  return (
    <div ref={searchRef} className={`advanced-search ${isExpanded ? 'expanded' : ''}`}>
      <div className="search-main">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsExpanded(true)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-button" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>
        
        <button 
          className={`filter-toggle ${hasActiveFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          {hasActiveFilters && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Search Suggestions */}
      {isExpanded && searchQuery && (
        <div className="search-suggestions">
          <div className="suggestion-item">
            <Search size={16} />
            <span>Search for "{searchQuery}"</span>
          </div>
          <div className="suggestion-item">
            <BookOpen size={16} />
            <span>Courses containing "{searchQuery}"</span>
          </div>
          <div className="suggestion-item">
            <FileText size={16} />
            <span>Assignments about "{searchQuery}"</span>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="search-filters">
          <div className="filter-section">
            <label className="filter-label">Content Type</label>
            <div className="filter-options">
              {searchTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    className={`filter-option ${filters.type === type.id ? 'active' : ''}`}
                    onClick={() => updateFilter('type', type.id)}
                  >
                    <IconComponent size={16} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Date Range</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => updateFilter('dateRange', e.target.value)}
              className="filter-select"
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label className="filter-label">Category</label>
            <select 
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label className="filter-label">Instructor</label>
            <input
              type="text"
              placeholder="Search by instructor name..."
              value={filters.instructor}
              onChange={(e) => updateFilter('instructor', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-actions">
            <button className="filter-clear" onClick={clearSearch}>
              Clear All
            </button>
            <button className="filter-apply" onClick={handleSearch}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
