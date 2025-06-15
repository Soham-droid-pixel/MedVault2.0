import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import './UploadRecord.css';

const UploadRecord = () => {
  const [formData, setFormData] = useState({
    doctor: '',
    hospital: '',
    condition: '',
    date: '',
    notes: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    if (!formData.doctor.trim()) {
      toast.error('Please enter doctor name');
      return false;
    }
    if (!formData.hospital.trim()) {
      toast.error('Please enter hospital name');
      return false;
    }
    if (!formData.condition.trim()) {
      toast.error('Please enter medical condition');
      return false;
    }
    if (!formData.date) {
      toast.error('Please select date');
      return false;
    }
    if (!file) {
      toast.error('Please select a file to upload');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) submitData.append(key, val);
    });
    submitData.append('file', file);

    try {
      await API.post('/records/upload', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Medical record uploaded successfully!');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>📤 Upload Medical Record</h1>
        <p>Add a new medical record to your secure vault</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {/* Medical Information */}
        <div className="form-section">
          <h2>🩺 Medical Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="doctor">Doctor Name *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="doctor"
                  name="doctor"
                  placeholder="Dr. John Smith"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hospital">Hospital/Clinic *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="hospital"
                  name="hospital"
                  placeholder="City General Hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="condition">Medical Condition *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="condition"
                  name="condition"
                  placeholder="Annual Check-up, Blood Test, etc."
                  value={formData.condition}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date of Visit *</label>
              <div className="input-wrapper">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <div className="input-wrapper">
              <textarea
                id="notes"
                name="notes"
                placeholder="Any additional information about this medical record..."
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="form-section">
          <h2>📄 Upload Document</h2>
          
          <div 
            className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              className="file-input"
            />
            
            {file ? (
              <div className="file-preview">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <h4>{file.name}</h4>
                  <p>{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="file-upload-content">
                <div className="upload-icon">📁</div>
                <h3>Drop your file here or click to browse</h3>
                <p>Supports: Images (JPG, PNG), PDF, Word documents</p>
                <p>Maximum file size: 10MB</p>
                <label htmlFor="file" className="browse-btn">
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                <span className="btn-icon">📤</span>
                Upload Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadRecord;
