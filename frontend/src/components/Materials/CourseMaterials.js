import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  FolderPlus,
  File,
  Image,
  Video,
  Archive
} from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Materials.css';

const CourseMaterials = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock materials data
      const mockMaterials = [
        {
          _id: 'material_1',
          name: 'Course Syllabus.pdf',
          type: 'pdf',
          size: 245760,
          uploadedBy: 'John Teacher',
          uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          downloads: 15,
          url: '#'
        },
        {
          _id: 'material_2',
          name: 'React Basics Presentation.pptx',
          type: 'presentation',
          size: 1048576,
          uploadedBy: 'John Teacher',
          uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          downloads: 12,
          url: '#'
        },
        {
          _id: 'material_3',
          name: 'Sample Code.zip',
          type: 'archive',
          size: 512000,
          uploadedBy: 'John Teacher',
          uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          downloads: 8,
          url: '#'
        },
        {
          _id: 'material_4',
          name: 'Tutorial Video.mp4',
          type: 'video',
          size: 15728640,
          uploadedBy: 'John Teacher',
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          downloads: 20,
          url: '#'
        }
      ];
      
      setMaterials(mockMaterials);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    try {
      // Mock upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newMaterials = selectedFiles.map(file => ({
        _id: 'material_' + Date.now() + Math.random(),
        name: file.name,
        type: getFileType(file.type),
        size: file.size,
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString(),
        downloads: 0,
        url: URL.createObjectURL(file)
      }));
      
      setMaterials([...newMaterials, ...materials]);
      setSelectedFiles([]);
      
      // Reset file input
      document.getElementById('file-upload').value = '';
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      setMaterials(materials.filter(m => m._id !== materialId));
    }
  };

  const handleDownload = (material) => {
    // Mock download - increment counter
    setMaterials(materials.map(m => 
      m._id === material._id 
        ? { ...m, downloads: m.downloads + 1 }
        : m
    ));
    
    // In a real app, this would trigger actual download
    console.log('Downloading:', material.name);
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
    return 'document';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={20} />;
      case 'video': return <Video size={20} />;
      case 'archive': return <Archive size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="materials-container">
        <LoadingSpinner size="large" text="Loading course materials..." />
      </div>
    );
  }

  return (
    <div className="materials-container">
      <div className="materials-header">
        <h1>Course Materials</h1>
        <p>Access and download course resources, presentations, and documents</p>
      </div>

      {user?.role === 'teacher' && (
        <div className="upload-section">
          <div className="upload-area">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-button">
              <FolderPlus size={24} />
              <span>Choose Files to Upload</span>
            </label>
            
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({selectedFiles.length})</h4>
                <div className="files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="selected-file">
                      <File size={16} />
                      <span>{file.name}</span>
                      <span className="file-size">({formatFileSize(file.size)})</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn btn-primary animated-button"
                >
                  <Upload size={20} />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="materials-grid">
        {materials.length > 0 ? (
          materials.map((material) => (
            <div key={material._id} className="material-card animated-card fade-in">
              <div className="material-header">
                <div className="file-icon">
                  {getFileIcon(material.type)}
                </div>
                <div className="material-info">
                  <h3>{material.name}</h3>
                  <div className="material-meta">
                    <span>{formatFileSize(material.size)}</span>
                    <span>•</span>
                    <span>{material.downloads} downloads</span>
                  </div>
                </div>
              </div>
              
              <div className="material-details">
                <p>Uploaded by {material.uploadedBy}</p>
                <p>{formatDate(material.uploadedAt)}</p>
              </div>
              
              <div className="material-actions">
                <button 
                  onClick={() => handleDownload(material)}
                  className="action-btn download"
                >
                  <Download size={16} />
                  Download
                </button>
                
                <button className="action-btn view">
                  <Eye size={16} />
                  Preview
                </button>
                
                {user?.role === 'teacher' && (
                  <button 
                    onClick={() => handleDelete(material._id)}
                    className="action-btn delete"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FileText size={64} />
            <h2>No materials uploaded yet</h2>
            <p>
              {user?.role === 'teacher' 
                ? 'Upload your first course material to get started.'
                : 'Your instructor will upload course materials here.'
              }
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <LoadingSpinner 
          fullScreen 
          size="large" 
          text="Uploading files..." 
        />
      )}
    </div>
  );
};

export default CourseMaterials;
