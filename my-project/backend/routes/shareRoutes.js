const express = require('express');
const nodemailer = require('nodemailer');
const Record = require('../models/Record');
const auth = require('../middleware/auth');
const router = express.Router();

// Test route to verify the route is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Share routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Configure email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Email sharing will not work.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Share record via email
router.post('/email', auth, async (req, res) => {
  console.log('Email share route hit:', req.body);
  
  try {
    const { to, subject, recordId, personalMessage, patientName } = req.body;

    // Validate input
    if (!to || !recordId) {
      return res.status(400).json({ 
        success: false,
        message: 'Recipient email and record ID are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address' 
      });
    }

    // Get the record
    const record = await Record.findById(recordId);
    if (!record) {
      return res.status(404).json({ 
        success: false,
        message: 'Medical record not found' 
      });
    }

    // Create transporter
    const transporter = createTransporter();
    if (!transporter) {
      return res.status(500).json({ 
        success: false,
        message: 'Email service not configured. Please contact administrator.' 
      });
    }

    // Create email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical Record - ${record.condition}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 700px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f5f7fa;
            color: #2c3e50;
            line-height: 1.6;
          }
          .container {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 2.2rem;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 1.1rem;
            opacity: 0.9;
          }
          .content { 
            padding: 40px 30px; 
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            color: #667eea;
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 20px;
            border-bottom: 2px solid #e1e8ed;
            padding-bottom: 10px;
          }
          .record-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          .record-item { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 12px; 
            border-left: 4px solid #667eea;
          }
          .label { 
            font-weight: 700; 
            color: #667eea; 
            font-size: 0.9rem; 
            text-transform: uppercase; 
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
          }
          .value { 
            color: #2c3e50; 
            font-size: 1.1rem; 
            font-weight: 500;
          }
          .notes-section {
            background: #e8f4fd;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #3498db;
            margin: 20px 0;
          }
          .message-section { 
            background: #fff3cd; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0; 
            border-left: 4px solid #ffc107; 
          }
          .attachment-section { 
            background: #d1ecf1; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0; 
            border-left: 4px solid #17a2b8;
            text-align: center;
          }
          .download-btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 15px;
          }
          .footer { 
            text-align: center; 
            color: #7f8c8d; 
            font-size: 0.9rem; 
            padding: 30px; 
            background: #f8f9fa;
            border-top: 1px solid #e1e8ed;
          }
          .security-notice {
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc3545;
            font-weight: 500;
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .record-grid { grid-template-columns: 1fr; }
            .record-item { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MedVault</h1>
            <p>Secure Medical Record Sharing</p>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">📋 Medical Record Details</div>
              
              <div class="record-grid">
                <div class="record-item">
                  <span class="label">👤 Patient Name</span>
                  <div class="value">${patientName || 'Patient'}</div>
                </div>
                
                <div class="record-item">
                  <span class="label">🩺 Medical Condition</span>
                  <div class="value">${record.condition}</div>
                </div>
                
                <div class="record-item">
                  <span class="label">👨‍⚕️ Doctor</span>
                  <div class="value">Dr. ${record.doctor}</div>
                </div>
                
                <div class="record-item">
                  <span class="label">🏥 Hospital/Clinic</span>
                  <div class="value">${record.hospital}</div>
                </div>
                
                <div class="record-item">
                  <span class="label">📅 Visit Date</span>
                  <div class="value">${new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</div>
                </div>
                
                <div class="record-item">
                  <span class="label">📝 Record Created</span>
                  <div class="value">${new Date(record.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</div>
                </div>
              </div>
              
              ${record.notes ? `
                <div class="notes-section">
                  <span class="label">📝 Additional Notes</span>
                  <div class="value">${record.notes}</div>
                </div>
              ` : ''}
              
              ${personalMessage ? `
                <div class="message-section">
                  <span class="label">💬 Personal Message</span>
                  <div class="value">${personalMessage}</div>
                </div>
              ` : ''}
              
              ${record.fileUrl ? `
                <div class="attachment-section">
                  <span class="label">📎 Medical Document</span>
                  <div class="value">A medical document is attached to this email for your reference.</div>
                  <div style="margin-top: 15px;">
                    <strong>📄 Document:</strong> Medical_Record_${record.condition.replace(/\s+/g, '_')}_${new Date(record.date).toISOString().split('T')[0]}.pdf
                  </div>
                  <a href="${record.fileUrl}" class="download-btn" target="_blank">
                    📥 View Document Online
                  </a>
                </div>
              ` : ''}
            </div>
            
            <div class="security-notice">
              <strong>🔒 Confidentiality Notice:</strong> This email contains confidential medical information. 
              If you have received this email in error, please notify the sender immediately and delete this email. 
              Any unauthorized review, use, disclosure, or distribution is strictly prohibited.
            </div>
          </div>
          
          <div class="footer">
            <p><strong>🏥 MedVault - Secure Medical Record Management</strong></p>
            <p>This medical record was shared securely on ${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>🔐 All medical data is encrypted and handled according to healthcare privacy standards.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'MedVault - Medical Records',
        address: process.env.EMAIL_USER
      },
      to: to,
      subject: subject || `Medical Record - ${record.condition} (${patientName || 'Patient'})`,
      html: emailHtml,
      attachments: []
    };

    // Add attachment if file exists
    if (record.fileUrl) {
      try {
        mailOptions.attachments.push({
          filename: `Medical_Record_${record.condition.replace(/\s+/g, '_')}_${new Date(record.date).toISOString().split('T')[0]}.pdf`,
          href: record.fileUrl
        });
      } catch (attachError) {
        console.log('Could not attach file:', attachError.message);
      }
    }

    // Send email
    console.log('Attempting to send email to:', to);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);

    res.json({ 
      success: true, 
      message: 'Medical record sent successfully via email!',
      messageId: info.messageId,
      attachmentIncluded: !!record.fileUrl,
      recipientEmail: to
    });

  } catch (error) {
    console.error('Email sharing error:', error);
    
    // Handle specific email errors
    if (error.code === 'EAUTH') {
      return res.status(500).json({ 
        success: false,
        message: 'Email authentication failed. Please check email configuration.',
        error: 'Authentication Error'
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(500).json({ 
        success: false,
        message: 'Email service not available. Please try again later.',
        error: 'Network Error'
      });
    }

    if (error.responseCode === 535) {
      return res.status(500).json({ 
        success: false,
        message: 'Email authentication failed. Please check your email credentials.',
        error: 'Invalid Credentials'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to send email. Please try again.',
      error: error.message 
    });
  }
});

// Get sharing statistics
router.get('/stats', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Share service is active',
      availableMethods: ['email', 'whatsapp'],
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Test email configuration
router.post('/test-email', auth, async (req, res) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return res.status(500).json({ 
        success: false, 
        message: 'Email service not configured' 
      });
    }

    const testEmail = {
      from: {
        name: 'MedVault Test',
        address: process.env.EMAIL_USER
      },
      to: req.body.email || 'test@example.com',
      subject: 'MedVault Email Configuration Test',
      html: `
        <div style="padding: 30px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0;">🏥 MedVault</h1>
            <p style="margin: 10px 0 0 0;">Email Configuration Test</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa; margin: 20px 0; border-radius: 10px;">
            <h2 style="color: #667eea; margin-top: 0;">✅ Email Test Successful!</h2>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Test User:</strong> ${req.user?.name || 'Test User'}</p>
            <p style="color: #27ae60; font-weight: bold;">Your email configuration is working correctly!</p>
          </div>
          <div style="text-align: center; color: #7f8c8d; font-size: 14px;">
            <p>This is an automated test message from MedVault</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(testEmail);
    res.json({ 
      success: true, 
      message: 'Test email sent successfully!',
      testEmail: req.body.email || 'test@example.com'
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email test failed', 
      error: error.message 
    });
  }
});

module.exports = router;
