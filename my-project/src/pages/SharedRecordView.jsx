import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SharedRecordView.css';

const SharedRecordView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/share/access/${token}`);
        setRecord(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to access this record');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (record?.fileUrl) {
      const link = document.createElement('a');
      link.href = record.fileUrl;
      link.download = `${record.condition}_${record.doctor}_${new Date(record.date).toISOString().split('T')[0]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="shared-record-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading medical record...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-record-container">
        <div className="error-section">
          <div className="error-icon">⚠️</div>
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="home-btn">
            Go to MedVault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-record-container">
      <div className="shared-record-header">
        <div className="header-brand">
          <div className="brand-icon">🏥</div>
          <h1>MedVault</h1>
        </div>
        <div className="header-actions">
          <button onClick={handlePrint} className="action-btn print-btn">
            <span className="btn-icon">🖨️</span>
            Print
          </button>
          {record?.fileUrl && (
            <button onClick={handleDownload} className="action-btn download-btn">
              <span className="btn-icon">📥</span>
              Download
            </button>
          )}
        </div>
      </div>

      <div className="shared-record-content">
        <div className="record-title">
          <h2>Medical Record</h2>
          <div className="access-info">
            <span className="access-icon">🔗</span>
            <span>Shared Record View</span>
          </div>
        </div>

        <div className="record-details">
          <div className="detail-section">
            <h3>Patient Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-icon">🩺</span>
                <div className="detail-content">
                  <label>Medical Condition</label>
                  <p>{record.condition}</p>
                </div>
              </div>
              
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <div className="detail-content">
                  <label>Visit Date</label>
                  <p>{new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Healthcare Provider</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-icon">👨‍⚕️</span>
                <div className="detail-content">
                  <label>Doctor</label>
                  <p>Dr. {record.doctor}</p>
                </div>
              </div>
              
              <div className="detail-item">
                <span className="detail-icon">🏥</span>
                <div className="detail-content">
                  <label>Hospital/Clinic</label>
                  <p>{record.hospital}</p>
                </div>
              </div>
            </div>
          </div>

          {record.notes && (
            <div className="detail-section">
              <h3>Additional Notes</h3>
              <div className="notes-content">
                <span className="detail-icon">📝</span>
                <p>{record.notes}</p>
              </div>
            </div>
          )}

          {record.fileUrl && (
            <div className="detail-section">
              <h3>Attached Document</h3>
              <div className="file-section">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <p>Medical document attached</p>
                    <span className="file-meta">Click to view or download</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(record.fileUrl, '_blank')}
                  className="view-file-btn"
                >
                  <span className="btn-icon">👁️</span>
                  View Document
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="record-footer">
          <div className="security-notice">
            <span className="security-icon">🔒</span>
            <p>This medical record is shared securely through MedVault. All data is encrypted and access is logged for security purposes.</p>
          </div>
          
          <div className="timestamp">
            <p>Record uploaded: {new Date(record.createdAt).toLocaleDateString()}</p>
            <p>Accessed: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedRecordView;
