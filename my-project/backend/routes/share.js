const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Record = require('../models/Record');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure email transporter (use your email service)
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your email password or app password
  }
});

// Share record via email
router.post('/email', auth, async (req, res) => {
  try {
    const { to, subject, recordId, personalMessage, patientName } = req.body;

    // Get the record
    const record = await Record.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Create email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0; }
          .record-item { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .label { font-weight: bold; color: #667eea; font-size: 14px; text-transform: uppercase; }
          .value { color: #2c3e50; font-size: 16px; margin-top: 5px; }
          .message { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }
          .footer { text-align: center; color: #7f8c8d; font-size: 14px; padding: 20px; }
          .attachment-note { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 MedVault</h1>
          <p>Medical Record Shared Securely</p>
        </div>
        
        <div class="content">
          <h2>Medical Record Details</h2>
          
          <div class="record-item">
            <div class="label">Patient Name</div>
            <div class="value">${patientName}</div>
          </div>
          
          <div class="record-item">
            <div class="label">Medical Condition</div>
            <div class="value">${record.condition}</div>
          </div>
          
          <div class="record-item">
            <div class="label">Doctor</div>
            <div class="value">Dr. ${record.doctor}</div>
          </div>
          
          <div class="record-item">
            <div class="label">Hospital/Clinic</div>
            <div class="value">${record.hospital}</div>
          </div>
          
          <div class="record-item">
            <div class="label">Visit Date</div>
            <div class="value">${new Date(record.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</div>
          </div>
          
          ${record.notes ? `
            <div class="record-item">
              <div class="label">Additional Notes</div>
              <div class="value">${record.notes}</div>
            </div>
          ` : ''}
          
          ${personalMessage ? `
            <div class="message">
              <div class="label">Personal Message</div>
              <div class="value">${personalMessage}</div>
            </div>
          ` : ''}
          
          ${record.fileUrl ? `
            <div class="attachment-note">
              <strong>📎 Medical Document Attached</strong>
              <p>A medical document related to this record has been attached to this email.</p>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>🔒 This medical record has been shared securely through MedVault</p>
          <p>Please handle this confidential medical information with appropriate care.</p>
          <p>Shared on: ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </body>
      </html>
    `;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: emailHtml
    };

    // Add attachment if file exists
    if (record.fileUrl) {
      // If fileUrl is a local path
      if (fs.existsSync(record.fileUrl)) {
        mailOptions.attachments = [{
          filename: `Medical_Record_${record.condition}_${new Date(record.date).toISOString().split('T')[0]}.pdf`,
          path: record.fileUrl
        }];
      }
      // If fileUrl is a URL, you might want to download it first or provide the link
    }

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Email sent successfully with medical record and attachment' 
    });

  } catch (error) {
    console.error('Email sharing error:', error);
    res.status(500).json({ 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

module.exports = router;