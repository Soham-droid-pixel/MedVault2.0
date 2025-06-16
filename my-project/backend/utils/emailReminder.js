const nodemailer = require('nodemailer');

const sendEmailReminder = async (to, subject, text) => {
  console.log('\n📧 EMAIL REMINDER SYSTEM');
  console.log('=======================');
  console.log(`📤 To: ${to}`);
  console.log(`📝 Subject: ${subject}`);
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured in environment variables');
    }
    
    console.log('🔧 Creating email transporter...');
    const transporter = nodemailer.createTransport({ // Fixed: createTransport not createTransporter
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('📋 Preparing email content...');
    const mailOptions = {
      from: {
        name: 'MedVault Health',
        address: process.env.EMAIL_USER // Fixed: use EMAIL_USER instead of EMAIL_FROM
      },
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏥 MedVault Health</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; margin-top: 0;">${subject}</h2>
            <div style="line-height: 1.6; color: #34495e; white-space: pre-line;">
              ${text}
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-size: 14px; color: #7f8c8d;">
                📱 This is an automated reminder from MedVault Health. Please do not reply to this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px;">
            © ${new Date().getFullYear()} MedVault Health. All rights reserved.
          </div>
        </div>
      `
    };

    console.log('📮 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ SUCCESS! Email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Sent to: ${to}`);
    console.log(`📝 Subject: ${subject}`);
    console.log('=======================\n');
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.log('❌ ERROR! Email sending failed!');
    console.log(`🚫 Error: ${error.message}`);
    console.log('=======================\n');
    
    // Log specific error types
    if (error.code === 'EAUTH') {
      console.log('🔑 Authentication Error: Check your EMAIL_USER and EMAIL_PASS');
    }
    
    throw error;
  }
};

module.exports = sendEmailReminder;

