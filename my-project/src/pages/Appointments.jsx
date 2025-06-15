import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    doctor: '',
    date: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      toast.error('Error fetching appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/appointments/${editingId}`
        : 'http://localhost:5000/api/appointments';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingId ? 'Appointment updated! Email confirmation sent.' : 'Appointment added! Confirmation email sent.');
        resetForm();
        fetchAppointments();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error saving appointment');
      }
    } catch (error) {
      toast.error('Error saving appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setFormData({
      doctor: appointment.doctor,
      date: new Date(appointment.date).toISOString().slice(0, 16),
      notes: appointment.notes || ''
    });
    setEditingId(appointment._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment? A cancellation email will be sent.')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('Appointment cancelled! Cancellation email sent.');
          fetchAppointments();
        } else {
          toast.error('Error deleting appointment');
        }
      } catch (error) {
        toast.error('Error deleting appointment');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ doctor: '', date: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = (date) => {
    const now = new Date();
    const appointmentDate = new Date(date);
    const diffTime = appointmentDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReminderStatus = (appointment) => {
    const daysUntil = getDaysUntil(appointment.date);
    const remindersSent = appointment.remindersSent;
    
    if (daysUntil <= 1) {
      return { text: 'Final reminder sent', color: '#e74c3c', icon: '🔔' };
    } else if (daysUntil <= 3) {
      if (remindersSent === '3day' || remindersSent === '1day') {
        return { text: '3-day reminder sent', color: '#f39c12', icon: '📅' };
      } else {
        return { text: 'Reminder pending', color: '#95a5a6', icon: '⏳' };
      }
    } else if (daysUntil <= 7) {
      if (remindersSent) {
        return { text: '7-day reminder sent', color: '#3498db', icon: '📋' };
      } else {
        return { text: 'Reminder pending', color: '#95a5a6', icon: '⏳' };
      }
    } else {
      return { text: `${daysUntil} days away`, color: '#27ae60', icon: '📆' };
    }
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2>My Appointments</h2>
        <button 
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Appointment'}
        </button>
      </div>

      {showForm && (
        <div className="appointment-form-card">
          <h3>{editingId ? 'Edit Appointment' : 'Add New Appointment'}</h3>
          <div className="reminder-info">
            <p>📧 You will receive email reminders 7 days, 3 days, and 1 day before your appointment.</p>
          </div>
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-group">
              <label>Doctor Name</label>
              <input
                type="text"
                value={formData.doctor}
                onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                required
                placeholder="Dr. Smith"
              />
            </div>
            
            <div className="form-group">
              <label>Date & Time</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
              />
              <small>Minimum 24 hours from now</small>
            </div>
            
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any special instructions or notes..."
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Appointment
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="appointments-list">
        {loading && <div className="loading">Loading appointments...</div>}
        
        {!loading && appointments.length === 0 && (
          <div className="no-appointments">
            <p>No upcoming appointments scheduled.</p>
          </div>
        )}

        <div className="appointments-grid">
          {appointments.map((appointment) => {
            const reminderStatus = getReminderStatus(appointment);
            const daysUntil = getDaysUntil(appointment.date);
            
            return (
              <div key={appointment._id} className={`appointment-card ${isUpcoming(appointment.date) ? 'upcoming' : 'past'}`}>
                <div className="appointment-header">
                  <h4>{appointment.doctor}</h4>
                  <div className="appointment-actions">
                    <button 
                      onClick={() => handleEdit(appointment)}
                      className="btn-edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(appointment._id)}
                      className="btn-delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="appointment-date">
                  📅 {formatDate(appointment.date)}
                </div>
                
                <div className="days-until">
                  {daysUntil > 0 ? `${daysUntil} days to go` : daysUntil === 0 ? 'Today!' : 'Past'}
                </div>
                
                {appointment.notes && (
                  <div className="appointment-notes">
                    <strong>Notes:</strong> {appointment.notes}
                  </div>
                )}
                
                <div className="reminder-status" style={{ color: reminderStatus.color }}>
                  {reminderStatus.icon} {reminderStatus.text}
                </div>
                
                <div className={`appointment-status ${isUpcoming(appointment.date) ? 'upcoming' : 'past'}`}>
                  {isUpcoming(appointment.date) ? 'Upcoming' : 'Past'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
