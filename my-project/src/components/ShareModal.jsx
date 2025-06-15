import React, { useState } from 'react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import './ShareModal.css';

const ShareModal = ({ record, user, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const formatRecordText = () => {
    const recordText = `📋 MEDICAL RECORD FROM MEDVAULT

👤 Patient: ${user?.name || 'Patient'}
🩺 Condition: ${record.condition}
👨‍⚕️ Doctor: Dr. ${record.doctor}
🏥 Hospital: ${record.hospital}
📅 Visit Date: ${new Date(record.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}
${record.notes ? `📝 Notes: ${record.notes}` : ''}

${personalMessage ? `💬 Message: ${personalMessage}` : ''}

${record.fileUrl ? '📄 Medical document attached with this record' : ''}

🔒 Shared securely via MedVault`;

    return recordText;
  };

  const handleEmailShare = async () => {
    if (!recipientEmail) {
      toast.error('Please enter recipient email address');
      return;
    }

    setIsSharing(true);
    try {
      // Send email with attachment through backend
      const emailData = {
        to: recipientEmail,
        subject: `Medical Record - ${record.condition} (${user?.name || 'Patient'})`,
        recordId: record._id,
        personalMessage: personalMessage,
        patientName: user?.name || 'Patient'
      };

      await API.post('/share/email', emailData);
      toast.success('Email sent successfully with medical record and attachment!');
      onClose();
    } catch (error) {
      console.error('Email sharing error:', error);
      // Fallback to mailto if backend fails
      const emailSubject = encodeURIComponent(`Medical Record - ${record.condition} (${user?.name || 'Patient'})`);
      const emailBody = encodeURIComponent(formatRecordText() + '\n\nNote: Please request the medical document file separately.');
      
      const mailtoLink = `mailto:${recipientEmail}?subject=${emailSubject}&body=${emailBody}`;
      window.location.href = mailtoLink;
      
      toast.info('Email client opened. Note: File attachment needs to be sent separately.');
      onClose();
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!recipientPhone) {
      toast.error('Please enter recipient phone number');
      return;
    }

    setIsSharing(true);
    try {
      // First, try to get a shareable link or prepare the file
      let whatsappText = formatRecordText();
      
      if (record.fileUrl) {
        // Add file information to the message
        whatsappText += `\n\n📄 Medical Document: ${record.fileUrl}`;
        whatsappText += `\n\n⬇️ Please download and save this medical document for your records.`;
      }

      const encodedText = encodeURIComponent(whatsappText);
      const cleanPhone = recipientPhone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
      
      window.open(whatsappUrl, '_blank');
      toast.success('WhatsApp opened with medical record details and document link!');
      onClose();
    } catch (error) {
      toast.error('Failed to share via WhatsApp');
    } finally {
      setIsSharing(false);
    }
  };

  const downloadFile = () => {
    if (record.fileUrl) {
      const link = document.createElement('a');
      link.href = record.fileUrl;
      link.download = `${record.condition}_${record.doctor}_${new Date(record.date).toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('File downloaded! You can now attach it manually to your message.');
    }
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share Medical Record</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="record-preview">
            <h3>📋 {record.condition}</h3>
            <p><strong>👨‍⚕️ Dr. {record.doctor}</strong> • 🏥 {record.hospital}</p>
            <p>📅 {new Date(record.date).toLocaleDateString()}</p>
            {record.fileUrl && (
              <p className="file-indicator">📄 Medical document attached</p>
            )}
          </div>

          <div className="personal-message-section">
            <label htmlFor="personalMessage">Add Personal Message (Optional):</label>
            <textarea
              id="personalMessage"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Add a personal note for the recipient..."
              rows="3"
            />
          </div>

          <div className="share-methods">
            <h3>Choose Sharing Method:</h3>
            
            {/* Email Option */}
            <div className="share-option">
              <div className="option-header" onClick={() => setSelectedMethod('email')}>
                <input
                  type="radio"
                  id="email"
                  name="shareMethod"
                  value="email"
                  checked={selectedMethod === 'email'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                />
                <label htmlFor="email">
                  <span className="option-icon">📧</span>
                  <div className="option-info">
                    <strong>Email</strong>
                    <span>Send record with attachment via email</span>
                  </div>
                </label>
              </div>
              {selectedMethod === 'email' && (
                <div className="option-details">
                  <input
                    type="email"
                    placeholder="Enter recipient's email address"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                  <div className="email-features">
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span>Record details included</span>
                    </div>
                    {record.fileUrl && (
                      <div className="feature-item">
                        <span className="feature-icon">📎</span>
                        <span>Medical document attached</span>
                      </div>
                    )}
                    <div className="feature-item">
                      <span className="feature-icon">🔒</span>
                      <span>Secure professional email</span>
                    </div>
                  </div>
                  <button 
                    className="share-action-btn email-btn"
                    onClick={handleEmailShare}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <span className="spinner"></span>
                        Sending Email...
                      </>
                    ) : (
                      'Send Email with Attachment'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* WhatsApp Option */}
            <div className="share-option">
              <div className="option-header" onClick={() => setSelectedMethod('whatsapp')}>
                <input
                  type="radio"
                  id="whatsapp"
                  name="shareMethod"
                  value="whatsapp"
                  checked={selectedMethod === 'whatsapp'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                />
                <label htmlFor="whatsapp">
                  <span className="option-icon">💬</span>
                  <div className="option-info">
                    <strong>WhatsApp</strong>
                    <span>Share record with document link via WhatsApp</span>
                  </div>
                </label>
              </div>
              {selectedMethod === 'whatsapp' && (
                <div className="option-details">
                  <input
                    type="tel"
                    placeholder="Enter phone number (with country code)"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                  />
                  <div className="whatsapp-features">
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span>Complete record details</span>
                    </div>
                    {record.fileUrl && (
                      <div className="feature-item">
                        <span className="feature-icon">🔗</span>
                        <span>Direct download link for document</span>
                      </div>
                    )}
                    <div className="feature-item">
                      <span className="feature-icon">📱</span>
                      <span>Instant messaging</span>
                    </div>
                  </div>
                  <button 
                    className="share-action-btn whatsapp-btn"
                    onClick={handleWhatsAppShare}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <span className="spinner"></span>
                        Opening WhatsApp...
                      </>
                    ) : (
                      'Share via WhatsApp'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* File Download Option */}
          {record.fileUrl && (
            <div className="file-download-section">
              <h4>📄 Medical Document</h4>
              <div className="file-info">
                <div className="file-details">
                  <span className="file-icon">📄</span>
                  <div>
                    <p><strong>Medical Document Available</strong></p>
                    <span>You can download this file to share it manually</span>
                  </div>
                </div>
                <button className="download-btn" onClick={downloadFile}>
                  Download File
                </button>
              </div>
            </div>
          )}

          <div className="sharing-note">
            <div className="note-icon">💡</div>
            <div className="note-content">
              <strong>Sharing Tips:</strong>
              <ul>
                <li><strong>Email:</strong> Best for healthcare providers - includes attachment</li>
                <li><strong>WhatsApp:</strong> Quick sharing with family/friends - includes download link</li>
                <li>All sharing is secure and encrypted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;