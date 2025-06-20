const Appointment = require('../models/Appointment');
const sendEmailReminder = require('../utils/emailReminder');
const cron = require('node-cron');
const alertSystem = require('../utils/alertSystem');
const mongoose = require('mongoose'); // Add this line
const NotificationPreferences = require('../models/NotificationPreferences');
const smsService = require('../utils/smsService');

// Utility function to get start and end of day
const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Utility function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Health monitoring cron - runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    // Simple health check
    const healthCheck = {
      timestamp: new Date(),
      status: 'healthy',
      dbConnected: mongoose.connection.readyState === 1,
      emailService: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      smsService: smsService.enabled
    };
    
    console.log('💓 Health check:', healthCheck);
    
    // Store health data (optional)
    // await HealthLog.create(healthCheck);
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    alertSystem.sendAlert('Health Check Failed', error.message);
  }
});

// Enhanced reminder cron - runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('🔔 Checking for appointment reminders...', new Date().toLocaleString());
  
  try {
    const now = new Date();
    alertSystem.recordCronRun();
    
    // Get appointments that need reminders with user preferences
    await sendEnhancedReminders(now);
    
    // Clean up old data at 3 AM
    if (now.getHours() === 3) {
      await performMaintenanceTasks(now);
    }
    
  } catch (error) {
    console.error('❌ Error in appointment reminder scheduler:', error);
    alertSystem.sendAlert('Cron Job Error', error.message, { timestamp: new Date() });
  }
});

// Enhanced reminder function with preferences
async function sendEnhancedReminders(now) {
  const today = getStartOfDay(now);
  
  // Calculate target dates for reminders
  const in1Day = addDays(today, 1);
  const in3Days = addDays(today, 3);
  const in7Days = addDays(today, 7);
  
  console.log(`📅 Checking reminders for:
    - 1 day: ${in1Day.toDateString()}
    - 3 days: ${in3Days.toDateString()}
    - 7 days: ${in7Days.toDateString()}`);
  
  // Send reminders based on user preferences
  await sendPreferenceBasedReminders(in1Day, '1day');
  await sendPreferenceBasedReminders(in3Days, '3day');
  await sendPreferenceBasedReminders(in7Days, '7day');
}

async function sendPreferenceBasedReminders(targetDate, reminderType) {
  try {
    const startOfDay = getStartOfDay(targetDate);
    const endOfDay = getEndOfDay(targetDate);
    
    // Get appointments with user preferences
    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      $or: [
        { remindersSent: { $exists: false } },
        { remindersSent: { $ne: reminderType } }
      ]
    }).populate('user', 'email name').lean();
    
    console.log(`📧 Found ${appointments.length} appointments needing ${reminderType} reminders`);
    
    for (const appointment of appointments) {
      if (appointment.user?.email) {
        try {
          // Get user preferences
          const preferences = await NotificationPreferences.findOne({ 
            user: appointment.user._id 
          }) || { emailReminders: { enabled: true, reminderDays: { [reminderType.replace('day', 'Day')]: true } } };
          
          // Check if user wants this type of reminder
          const reminderKey = reminderType.replace('day', 'Day');
          const shouldSendEmail = preferences.emailReminders?.enabled && 
                                preferences.emailReminders?.reminderDays?.[reminderKey];
          
          const shouldSendSMS = preferences.smsReminders?.enabled && 
                               preferences.smsReminders?.reminderDays?.[reminderKey] &&
                               preferences.smsReminders?.phoneNumber;
          
          if (shouldSendEmail) {
            await sendEmailWithPreferences(appointment, reminderType, preferences);
          }
          
          if (shouldSendSMS) {
            await sendSMSReminder(appointment, reminderType, preferences);
          }
          
          if (shouldSendEmail || shouldSendSMS) {
            // Update reminder status
            await Appointment.findByIdAndUpdate(appointment._id, {
              remindersSent: reminderType
            });
          }
          
        } catch (error) {
          console.error(`❌ Failed to send ${reminderType} reminder:`, error);
          alertSystem.recordEmailFailure(error);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error sending ${reminderType} reminders:`, error);
    alertSystem.sendAlert(`${reminderType} Reminder Error`, error.message);
  }
}

async function sendEmailWithPreferences(appointment, reminderType, preferences) {
  const appointmentTime = new Date(appointment.date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: preferences.timezone || 'UTC'
  });
  
  let subject = '';
  let message = '';
  
  switch (reminderType) {
    case '1day':
      subject = '🚨 Appointment Tomorrow - Important Reminder';
      message = `Hi ${appointment.user.name},

🔔 IMPORTANT REMINDER: You have an appointment with Dr. ${appointment.doctor} TOMORROW!

📅 Date & Time: ${appointmentTime}
📝 Notes: ${appointment.notes || 'None'}

⏰ Please arrive 15 minutes early and bring:
- Valid ID
- Insurance card (if applicable)
- List of current medications
- Any relevant medical records

If you need to cancel or reschedule, please contact the office as soon as possible.

Best regards,
MedVault Team`;
      break;
      
    case '3day':
      subject = '📅 Appointment in 3 Days - Prepare Now';
      message = `Hi ${appointment.user.name},

📋 Friendly reminder: You have an appointment with Dr. ${appointment.doctor} in 3 days.

📅 Date & Time: ${appointmentTime}
📝 Notes: ${appointment.notes || 'None'}

🎯 Time to prepare:
- Write down any symptoms or questions
- Gather your current medications list
- Review any previous test results
- Confirm transportation arrangements

You'll receive another reminder 1 day before your appointment.

Best regards,
MedVault Team`;
      break;
      
    case '7day':
      subject = '📝 Upcoming Appointment - 1 Week Notice';
      message = `Hi ${appointment.user.name},

📋 This is an early reminder that you have an appointment with Dr. ${appointment.doctor} scheduled for next week.

📅 Date & Time: ${appointmentTime}
📝 Notes: ${appointment.notes || 'None'}

📋 You have plenty of time to prepare. Consider:
- Scheduling time off work if needed
- Arranging childcare or transportation
- Preparing questions for your doctor
- Gathering any relevant medical documents

You'll receive additional reminders at 3 days and 1 day before your appointment.

Best regards,
MedVault Team`;
      break;
  }
  
  await sendEmailReminder(
    appointment.user.email,
    subject,
    message,
    {
      userId: appointment.user._id,
      appointmentId: appointment._id,
      type: reminderType,
      unsubscribeToken: generateUnsubscribeToken(appointment.user._id)
    }
  );
  
  alertSystem.recordEmailSuccess();
  console.log(`✅ ${reminderType} email reminder sent to ${appointment.user.email} for Dr. ${appointment.doctor}`);
}

async function sendSMSReminder(appointment, reminderType, preferences) {
  const smsMessage = smsService.formatAppointmentSMS(appointment, reminderType);
  
  await smsService.sendSMS(
    preferences.smsReminders.phoneNumber,
    smsMessage,
    {
      userId: appointment.user._id,
      appointmentId: appointment._id,
      type: reminderType
    }
  );
  
  console.log(`✅ ${reminderType} SMS reminder sent to ${preferences.smsReminders.phoneNumber} for Dr. ${appointment.doctor}`);
}

// Maintenance tasks
async function performMaintenanceTasks(now) {
  try {
    console.log('🧹 Running maintenance tasks...');
    
    // Clean up old appointments
    const weekAgo = addDays(now, -7);
    const oldAppointments = await Appointment.deleteMany({ 
      date: { $lt: weekAgo } 
    });
    
    // Clean up old email logs (keep for 30 days)
    const monthAgo = addDays(now, -30);
    const oldEmailLogs = await EmailLog.deleteMany({ 
      createdAt: { $lt: monthAgo } 
    });
    
    // Database optimization
    await mongoose.connection.db.command({ compact: 'appointments' });
    await mongoose.connection.db.command({ compact: 'emaillogs' });
    
    console.log(`🧹 Maintenance completed:
      - Deleted ${oldAppointments.deletedCount} old appointments
      - Deleted ${oldEmailLogs.deletedCount} old email logs
      - Optimized database`);
    
  } catch (error) {
    console.error('❌ Error during maintenance:', error);
    alertSystem.sendAlert('Maintenance Error', error.message);
  }
}

// Unsubscribe token generation
function generateUnsubscribeToken(userId) {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId, type: 'unsubscribe' }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// CRUD Operations (keeping your existing logic but with better error handling)
exports.addAppointment = async (req, res) => {
  try {
    const { doctor, date, notes } = req.body;
    const appointmentDate = new Date(date);
    const now = new Date();
    
    console.log(`📅 Creating appointment:
      - Doctor: ${doctor}
      - Date: ${appointmentDate.toLocaleString()}
      - Current time: ${now.toLocaleString()}`);
    
    // Check if appointment is in the future (at least 1 hour from now)
    if (appointmentDate <= addDays(now, 0)) {
      return res.status(400).json({ 
        success: false,
        message: 'Appointment must be scheduled for the future' 
      });
    }
    
    const appointment = await Appointment.create({
      user: req.user.id,
      doctor,
      date: appointmentDate,
      notes,
    });
    
    console.log(`✅ Appointment created with ID: ${appointment._id}`);
    
    // Send immediate confirmation email
    try {
      if (req.user.email) {
        const appointmentTime = appointmentDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        await sendEmailReminder(
          req.user.email,
          '✅ Appointment Confirmed - MedVault',
          `Hi ${req.user.name},

🎉 Your appointment has been successfully scheduled!

📅 Date & Time: ${appointmentTime}
👨‍⚕️ Doctor: Dr. ${doctor}
📝 Notes: ${notes || 'None'}

📧 You will receive automatic reminders:
- 7 days before your appointment
- 3 days before your appointment  
- 1 day before your appointment

💡 You can view and manage your appointments in your MedVault dashboard.

Best regards,
MedVault Team`
        );
        
        console.log(`📧 Confirmation email sent to ${req.user.email}`);
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email:', emailError.message);
      // Don't fail the appointment creation if email fails
    }
    
    res.json({
      success: true,
      appointment,
      message: 'Appointment created successfully'
    });
    
  } catch (err) {
    console.error('❌ Error creating appointment:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error creating appointment',
      error: err.message 
    });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({ 
      user: req.user.id,
      date: { $gte: now } // Only future appointments
    }).sort({ date: 1 });
    
    console.log(`📋 Retrieved ${appointments.length} upcoming appointments for user ${req.user.id}`);
    
    res.json({
      success: true,
      appointments,
      count: appointments.length
    });
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching appointments',
      error: err.message 
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor, date, notes } = req.body;
    const appointmentDate = new Date(date);
    const now = new Date();
    
    if (appointmentDate <= now) {
      return res.status(400).json({ 
        success: false,
        message: 'Appointment must be scheduled for the future' 
      });
    }
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { 
        doctor, 
        date: appointmentDate, 
        notes,
        // Reset reminder status when appointment is updated
        $unset: { remindersSent: 1 }
      },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }
    
    console.log(`📝 Appointment ${id} updated successfully`);
    
    // Send update confirmation email
    try {
      if (req.user.email) {
        const appointmentTime = appointmentDate.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        await sendEmailReminder(
          req.user.email,
          '📝 Appointment Updated - MedVault',
          `Hi ${req.user.name},

✅ Your appointment has been successfully updated!

📅 New Date & Time: ${appointmentTime}
👨‍⚕️ Doctor: Dr. ${doctor}
📝 Notes: ${notes || 'None'}

📧 Fresh reminder emails will be sent according to the new schedule.

Best regards,
MedVault Team`
        );
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send update email:', emailError.message);
    }
    
    res.json({
      success: true,
      appointment,
      message: 'Appointment updated successfully'
    });
    
  } catch (err) {
    console.error('❌ Error updating appointment:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error updating appointment',
      error: err.message 
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findOneAndDelete({
      _id: id,
      user: req.user.id
    });
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }
    
    console.log(`🗑️ Appointment ${id} deleted successfully`);
    
    // Send cancellation email
    try {
      if (req.user.email) {
        const appointmentTime = appointment.date.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        await sendEmailReminder(
          req.user.email,
          '❌ Appointment Cancelled - MedVault',
          `Hi ${req.user.name},

Your appointment has been cancelled:

📅 Date & Time: ${appointmentTime}
👨‍⚕️ Doctor: Dr. ${appointment.doctor}

If you need to reschedule, please create a new appointment through your MedVault dashboard.

Best regards,
MedVault Team`
        );
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send cancellation email:', emailError.message);
    }
    
    res.json({ 
      success: true,
      message: 'Appointment cancelled successfully' 
    });
    
  } catch (err) {
    console.error('❌ Error deleting appointment:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting appointment',
      error: err.message 
    });
  }
};

// Test endpoint for manual 1-day reminder
exports.testOneDayReminder = async (req, res) => {
  try {
    const { email, appointmentId } = req.body;
    
    // If appointmentId provided, use real appointment data
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate('user', 'email name');
      
      if (!appointment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Appointment not found' 
        });
      }
      
      const appointmentTime = new Date(appointment.date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      await sendEmailReminder(
        email || appointment.user.email,
        '🚨 TEST: Appointment Tomorrow - Important Reminder',
        `Hi ${appointment.user.name},

🔔 THIS IS A TEST EMAIL - Your appointment with Dr. ${appointment.doctor} is TOMORROW!

📅 Date & Time: ${appointmentTime}
📝 Notes: ${appointment.notes || 'None'}

⏰ Please arrive 15 minutes early and bring:
- Valid ID
- Insurance card (if applicable)
- List of current medications
- Any relevant medical records

[TEST MODE] This is a test of the 1-day reminder system.

Best regards,
MedVault Team`
      );
      
      // Update reminder status for testing
      await Appointment.findByIdAndUpdate(appointment._id, {
        remindersSent: 'test-1day'
      });
      
    } else {
      // Send test email with dummy data
      const testEmail = email || 'test@example.com';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await sendEmailReminder(
        testEmail,
        '🚨 TEST: Appointment Tomorrow - Important Reminder',
        `Hi Test User,

🔔 THIS IS A TEST EMAIL - You have an appointment with Dr. Test Doctor TOMORROW!

📅 Date & Time: ${tomorrow.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',  
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}
📝 Notes: This is a test appointment

⏰ Please arrive 15 minutes early and bring:
- Valid ID
- Insurance card (if applicable)
- List of current medications
- Any relevant medical records

[TEST MODE] This is a test of the 1-day reminder system.

Best regards,
MedVault Team`
      );
    }
    
    res.json({
      success: true,
      message: '1-day reminder test email sent successfully!',
      sentTo: email,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test 1-day reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test 1-day reminder',
      error: error.message
    });
  }
};
