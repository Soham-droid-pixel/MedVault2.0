const dotenv = require('dotenv');
dotenv.config();

const sendEmailReminder = require('./utils/emailReminder');

async function testEmailReminder() {
  console.log('🧪 Testing Email Reminder System...\n');
  
  try {
    // Test configuration
    const testEmail = 'your-email@gmail.com'; // Replace with your email
    const testSubject = '🏥 MedVault Email Test';
    const testMessage = `Hello! This is a test from MedVault Email Reminder System.

Test Information:
- Test Time: ${new Date().toLocaleString()}
- Environment: ${process.env.NODE_ENV || 'development'}
- Email Service: Gmail via Nodemailer

✅ If you receive this email, your email reminder system is working correctly!

Next, try testing with appointment reminders.

Best regards,
MedVault Development Team`;

    console.log(`📧 Sending test email to: ${testEmail}`);
    console.log(`📝 Subject: ${testSubject}`);
    console.log('⏳ Sending...\n');
    
    await sendEmailReminder(testEmail, testSubject, testMessage);
    
    console.log('✅ SUCCESS! Test email sent successfully!');
    console.log(`📬 Check your inbox at: ${testEmail}`);
    console.log('🎉 Your email reminder system is working!\n');
    
  } catch (error) {
    console.log('❌ ERROR! Email test failed:');
    console.log(`🚫 Error: ${error.message}\n`);
    
    // Common error solutions
    if (error.code === 'EAUTH') {
      console.log('💡 Solution: Check your EMAIL_USER and EMAIL_PASS in .env file');
      console.log('🔑 Make sure you\'re using Gmail App Password, not regular password');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Solution: Check your internet connection');
    } else {
      console.log('💡 Check your .env configuration and try again');
    }
  }
}

// Run the test
testEmailReminder();