import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Save, 
  Upload, 
  X,
  Calendar,
  Users,
  Clock,
  FileText,
  Video,
  Image
} from 'lucide-react';
import './CourseCreation.css';

const CourseCreation = () => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    level: 'beginner',
    maxStudents: '',
    startDate: '',
    endDate: '',
    price: '',
    thumbnail: null
  });

  const [modules, setModules] = useState([
    {
      id: 1,
      title: '',
      description: '',
      lessons: [
        {
          id: 1,
          title: '',
          type: 'video',
          content: '',
          duration: ''
        }
      ]
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    setCourseData(prev => ({
      ...prev,
      thumbnail: file
    }));
  };

  const addModule = () => {
    const newModule = {
      id: modules.length + 1,
      title: '',
      description: '',
      lessons: [
        {
          id: 1,
          title: '',
          type: 'video',
          content: '',
          duration: ''
        }
      ]
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (moduleId) => {
    setModules(modules.filter(module => module.id !== moduleId));
  };

  const updateModule = (moduleId, field, value) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, [field]: value }
        : module
    ));
  };

  const addLesson = (moduleId) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            lessons: [
              ...module.lessons,
              {
                id: module.lessons.length + 1,
                title: '',
                type: 'video',
                content: '',
                duration: ''
              }
            ]
          }
        : module
    ));
  };

  const removeLesson = (moduleId, lessonId) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
          }
        : module
    ));
  };

  const updateLesson = (moduleId, lessonId, field, value) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            lessons: module.lessons.map(lesson => 
              lesson.id === lessonId 
                ? { ...lesson, [field]: value }
                : lesson
            )
          }
        : module
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate course creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCourse = {
      _id: `course_${Date.now()}`,
      ...courseData,
      modules,
      instructor: 'Current User',
      enrolledStudents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage (mock backend)
    const existingCourses = JSON.parse(localStorage.getItem('mockCourses') || '[]');
    existingCourses.push(newCourse);
    localStorage.setItem('mockCourses', JSON.stringify(existingCourses));

    setIsSubmitting(false);
    alert('Course created successfully!');
    
    // Reset form
    setCourseData({
      title: '',
      description: '',
      category: '',
      duration: '',
      level: 'beginner',
      maxStudents: '',
      startDate: '',
      endDate: '',
      price: '',
      thumbnail: null
    });
    setModules([
      {
        id: 1,
        title: '',
        description: '',
        lessons: [
          {
            id: 1,
            title: '',
            type: 'video',
            content: '',
            duration: ''
          }
        ]
      }
    ]);
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'text': return <FileText size={16} />;
      case 'image': return <Image size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="course-creation">
      <div className="creation-header">
        <div className="header-content">
          <h2>Create New Course</h2>
          <p>Build an engaging learning experience for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-section">
          <h3>Course Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={courseData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Backend Development">Backend Development</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Difficulty Level</label>
              <select
                id="level"
                name="level"
                value={courseData.level}
                onChange={handleInputChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={courseData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 8 weeks, 40 hours"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxStudents">Max Students</label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={courseData.maxStudents}
                onChange={handleInputChange}
                placeholder="Maximum enrollment"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={courseData.price}
                onChange={handleInputChange}
                placeholder="Course price"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={courseData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={courseData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Course Description *</label>
            <textarea
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              placeholder="Describe what students will learn in this course"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnail">Course Thumbnail</label>
            <div className="file-upload">
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailUpload}
              />
              <label htmlFor="thumbnail" className="file-upload-label">
                <Upload size={20} />
                {courseData.thumbnail ? courseData.thumbnail.name : 'Upload thumbnail image'}
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Course Modules</h3>
            <button type="button" onClick={addModule} className="add-module-btn">
              <Plus size={20} />
              Add Module
            </button>
          </div>

          {modules.map((module, moduleIndex) => (
            <div key={module.id} className="module-card">
              <div className="module-header">
                <h4>Module {moduleIndex + 1}</h4>
                {modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeModule(module.id)}
                    className="remove-btn"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="module-content">
                <div className="form-group">
                  <label>Module Title *</label>
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                    placeholder="Enter module title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Module Description</label>
                  <textarea
                    value={module.description}
                    onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                    placeholder="Describe this module"
                    rows={2}
                  />
                </div>

                <div className="lessons-section">
                  <div className="lessons-header">
                    <h5>Lessons</h5>
                    <button
                      type="button"
                      onClick={() => addLesson(module.id)}
                      className="add-lesson-btn"
                    >
                      <Plus size={16} />
                      Add Lesson
                    </button>
                  </div>

                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="lesson-card">
                      <div className="lesson-header">
                        <span className="lesson-number">
                          {getLessonIcon(lesson.type)}
                          Lesson {lessonIndex + 1}
                        </span>
                        {module.lessons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLesson(module.id, lesson.id)}
                            className="remove-btn small"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div className="lesson-content">
                        <div className="lesson-row">
                          <div className="form-group">
                            <label>Lesson Title *</label>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                              placeholder="Enter lesson title"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>Type</label>
                            <select
                              value={lesson.type}
                              onChange={(e) => updateLesson(module.id, lesson.id, 'type', e.target.value)}
                            >
                              <option value="video">Video</option>
                              <option value="text">Text/Article</option>
                              <option value="image">Image/Diagram</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Duration</label>
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) => updateLesson(module.id, lesson.id, 'duration', e.target.value)}
                              placeholder="e.g., 15 min"
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Content/URL</label>
                          <input
                            type="text"
                            value={lesson.content}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'content', e.target.value)}
                            placeholder="Enter content URL or description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? (
              <>Creating Course...</>
            ) : (
              <>
                <Save size={20} />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreation;
