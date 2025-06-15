import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import RecordCard from '../components/RecordCard';
import ShareModal from '../components/ShareModal';
import './Dashboard.css';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    recentUploads: 0,
    upcomingAppointments: 0
  });

  useEffect(() => {
    fetchUserData();
    fetchRecords();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [records]);

  const fetchUserData = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await API.get('/records/all');
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentUploads = records.filter(r => {
      const uploadDate = new Date(r.createdAt);
      return uploadDate > weekAgo;
    }).length;

    setStats({
      totalRecords: records.length,
      recentUploads: recentUploads,
      uniqueHospitals: new Set(records.map(r => r.hospital)).size,
      uniqueDoctors: new Set(records.map(r => r.doctor)).size
    });
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await API.delete(`/records/${recordId}`);
        setRecords(records.filter(r => r._id !== recordId));
        toast.success('Record deleted successfully');
      } catch (err) {
        toast.error('Failed to delete record');
      }
    }
  };

  const handleShareRecord = (record) => {
    setSelectedRecord(record);
    setShareModalOpen(true);
  };

  const getFilteredAndSortedRecords = () => {
    let filtered = records.filter((r) => {
      const matchesSearch = r.condition?.toLowerCase().includes(search.toLowerCase()) ||
                           r.doctor?.toLowerCase().includes(search.toLowerCase()) ||
                           r.hospital?.toLowerCase().includes(search.toLowerCase()) ||
                           r.notes?.toLowerCase().includes(search.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && new Date(r.createdAt) > weekAgo;
      }
      if (filterBy === 'thisMonth') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return matchesSearch && new Date(r.date) > monthAgo;
      }
      return matchesSearch;
    });

    // Sort records
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'dateDesc':
          return new Date(b.date) - new Date(a.date);
        case 'dateAsc':
          return new Date(a.date) - new Date(b.date);
        case 'doctor':
          return a.doctor.localeCompare(b.doctor);
        case 'hospital':
          return a.hospital.localeCompare(b.hospital);
        default:
          return 0;
      }
    });
  };

  const filtered = getFilteredAndSortedRecords();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your medical records...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}! 👋</h1>
          <p>Manage your medical records and appointments securely</p>
        </div>
        <div className="quick-actions">
          <Link to="/upload" className="quick-action-btn primary">
            <span className="btn-text">Upload Record</span>
          </Link>
          <Link to="/appointments" className="quick-action-btn secondary">
            <span className="btn-text">Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalRecords}</h3>
            <p>Total Records</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.recentUploads}</h3>
            <p>Recent Uploads</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>{stats.uniqueHospitals}</h3>
            <p>Hospitals</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-content">
            <h3>{stats.uniqueDoctors}</h3>
            <p>Doctors</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by condition, doctor, hospital, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>Filter by:</label>
            <select 
              value={filterBy} 
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Records</option>
              <option value="recent">Recent (7 days)</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="dateDesc">Visit Date (Recent)</option>
              <option value="dateAsc">Visit Date (Oldest)</option>
              <option value="doctor">Doctor Name</option>
              <option value="hospital">Hospital Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Grid */}
      <div className="records-section">
        <div className="section-header">
          <h2>Your Medical Records</h2>
          <p>
            {filtered.length} of {records.length} records
            {search && ` matching "${search}"`}
            {filterBy !== 'all' && ` (${filterBy} filter applied)`}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            {records.length === 0 ? (
              <>
                <div className="empty-icon">📋</div>
                <h3>No Medical Records Yet</h3>
                <p>Start by uploading your first medical record</p>
                <Link to="/upload" className="empty-action-btn">
                  Upload Your First Record
                </Link>
              </>
            ) : (
              <>
                <div className="empty-icon">🔍</div>
                <h3>No Records Found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button 
                  onClick={() => {
                    setSearch('');
                    setFilterBy('all');
                  }}
                  className="empty-action-btn"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="records-grid">
            {filtered.map((record) => (
              <div key={record._id} className="record-item">
                <div className="record-card">
                  <div className="record-header">
                    <div className="record-type">
                      <span className="type-icon">🩺</span>
                      <span className="type-text">{record.condition}</span>
                    </div>
                    <div className="record-date">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="record-content">
                    <div className="record-info">
                      <div className="info-item">
                        <span className="info-icon">👨‍⚕️</span>
                        <div className="info-text">
                          <strong>Dr. {record.doctor}</strong>
                          <p>{record.hospital}</p>
                        </div>
                      </div>
                      
                      {record.notes && (
                        <div className="record-notes">
                          <span className="notes-icon">📝</span>
                          <p>{record.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    {record.fileUrl && (
                      <div className="record-file">
                        <div className="file-preview">
                          <span className="file-icon">📄</span>
                          <span>Attachment Available</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="record-actions">
                    {record.fileUrl && (
                      <button
                        onClick={() => window.open(record.fileUrl, '_blank')}
                        className="action-btn view-btn"
                        title="View Document"
                      >
                        View
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleShareRecord(record)}
                      className="action-btn share-btn"
                      title="Share Record"
                    >
                      Share
                    </button>
                    
                    <button
                      onClick={() => handleDeleteRecord(record._id)}
                      className="action-btn delete-btn"
                      title="Delete Record"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareModal 
          record={selectedRecord}
          user={user}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
