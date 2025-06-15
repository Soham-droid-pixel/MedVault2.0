const Appointment = require('../models/Appointment');
const sendEmailReminder = require('../utils/emailReminder');
const cron = require('node-cron');

// Schedule job to run daily at 9 AM to send reminders and clean up
cron.schedule('0 9 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate reminder dates
    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const oneDayEnd = new Date(oneDayFromNow);
    oneDayEnd.setDate(oneDayEnd.getDate() + 1);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setDate(threeDaysEnd.getDate() + 1);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const sevenDaysEnd = new Date(sevenDaysFromNow);
    sevenDaysEnd.setDate(sevenDaysEnd.getDate() + 1);
    
    // Send 1-day reminders
    const oneDayAppointments = await Appointment.find({
      date: { $gte: oneDayFromNow, $lt: oneDayEnd },
      remindersSent: { $ne: '1day' }
    }).populate('user', 'email name');
    
    for (const appointment of oneDayAppointments) {
      if (appointment.user.email) {
        await sendEmailReminder(
          appointment.user.email,
          '🔔 Appointment Reminder - Tomorrow!',
          `Hi ${appointment.user.name},

This is a friendly reminder that you have an appointment with Dr. ${appointment.doctor} TOMORROW.

📅 Date & Time: ${appointment.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}

📝 Notes: ${appointment.notes || 'None'}

Please make sure to arrive 15 minutes early and bring any necessary documents.

Best regards,
MedVault Team`
        );
        
        // Mark reminder as sent
        await Appointment.findByIdAndUpdate(appointment._id, {
          remindersSent: '1day'
        });
      }
    }
    
    // Send 3-day reminders
    const threeDayAppointments = await Appointment.find({
      date: { $gte: threeDaysFromNow, $lt: threeDaysEnd },
      remindersSent: { $ne: '3day' }
    }).populate('user', 'email name');
    
    for (const appointment of threeDayAppointments) {
      if (appointment.user.email) {
        await sendEmailReminder(
          appointment.user.email,
          '📅 Appointment Reminder - In 3 Days',
          `Hi ${appointment.user.name},

Just a heads up that you have an upcoming appointment with Dr. ${appointment.doctor} in 3 days.

📅 Date & Time: ${appointment.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}

📝 Notes: ${appointment.notes || 'None'}

This is a good time to prepare any questions you might have for your doctor and gather any necessary documents.

You'll receive another reminder tomorrow.

Best regards,
MedVault Team`
        );
        
        // Mark reminder as sent
        await Appointment.findByIdAndUpdate(appointment._id, {
          remindersSent: '3day'
        });
      }
    }
    
    // Send 7-day reminders
    const sevenDayAppointments = await Appointment.find({
      date: { $gte: sevenDaysFromNow, $lt: sevenDaysEnd },
      remindersSent: { $exists: false }
    }).populate('user', 'email name');
    
    for (const appointment of sevenDayAppointments) {
      if (appointment.user.email) {
        await sendEmailReminder(
          appointment.user.email,
          '📋 Upcoming Appointment - Next Week',
          `Hi ${appointment.user.name},

This is a reminder that you have an appointment with Dr. ${appointment.doctor} scheduled for next week.

📅 Date & Time: ${appointment.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}

📝 Notes: ${appointment.notes || 'None'}

You have plenty of time to prepare. Consider:
- Writing down any symptoms or concerns
- Preparing a list of current medications
- Gathering any relevant medical records

You'll receive additional reminders as the appointment approaches.

Best regards,
MedVault Team`
        );
        
        // Mark initial reminder as sent
        await Appointment.findByIdAndUpdate(appointment._id, {
          remindersSent: '7day'
        });
      }
    }
    
    // Remove past appointments (older than 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(23, 59, 59, 999);
    
    const deletedCount = await Appointment.deleteMany({ date: { $lt: weekAgo } });
    
    console.log(`Appointment reminders processed:
      - 1-day reminders: ${oneDayAppointments.length}
      - 3-day reminders: ${threeDayAppointments.length}
      - 7-day reminders: ${sevenDayAppointments.length}
      - Past appointments cleaned: ${deletedCount.deletedCount}`);
      
  } catch (error) {
    console.error('Error in appointment scheduler:', error);
  }
});

// Also run a check every hour to catch any missed reminders
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    
    // Check for appointments in the next 25 hours that might need 1-day reminders
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    const urgentAppointments = await Appointment.find({
      date: { $gte: now, $lte: tomorrow },
      remindersSent: { $ne: '1day' }
    }).populate('user', 'email name');
    
    for (const appointment of urgentAppointments) {
      if (appointment.user.email) {
        const hoursUntil = Math.ceil((appointment.date - now) / (1000 * 60 * 60));
        
        await sendEmailReminder(
          appointment.user.email,
          `🚨 Urgent: Appointment in ${hoursUntil} hours!`,
          `Hi ${appointment.user.name},

URGENT REMINDER: You have an appointment with Dr. ${appointment.doctor} in approximately ${hoursUntil} hours.

📅 Date & Time: ${appointment.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}

📝 Notes: ${appointment.notes || 'None'}

Please confirm your attendance or contact the clinic if you need to reschedule.

Best regards,
MedVault Team`
        );
        
        await Appointment.findByIdAndUpdate(appointment._id, {
          remindersSent: '1day'
        });
      }
    }
  } catch (error) {
    console.error('Error in hourly appointment check:', error);
  }
});

exports.addAppointment = async (req, res) => {
  try {
    const { doctor, date, notes } = req.body;
    const appointmentDate = new Date(date);
    
    // Check if appointment is in the future
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ message: 'Appointment must be in the future' });
    }
    
    const appointment = await Appointment.create({
      user: req.user.id,
      doctor,
      date: appointmentDate,
      notes,
    });
    
    // Send immediate confirmation email
    const user = req.user;
    if (user.email) {
      await sendEmailReminder(
        user.email,
        '✅ Appointment Scheduled Successfully',
        `Hi ${user.name},

Your appointment has been successfully scheduled!

📅 Date & Time: ${appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}

👨‍⚕️ Doctor: Dr. ${doctor}
📝 Notes: ${notes || 'None'}

You will receive reminder emails:
- 7 days before your appointment
- 3 days before your appointment  
- 1 day before your appointment

Best regards,
MedVault Team`
      );
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Error creating appointment' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      user: req.user.id,
      date: { $gte: new Date() }
    }).sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor, date, notes } = req.body;
    const appointmentDate = new Date(date);
    
    if (appointmentDate <= new Date()) {
      return res.status(400).json({ message: 'Appointment must be in the future' });
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
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Send update confirmation email
    const user = req.user;
    if (user.email) {
      await sendEmailReminder(
        user.email,
        '📝 Appointment Updated Successfully',
        `Hi ${user.name},

Your appointment has been updated!

📅 New Date & Time: ${appointmentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}

👨‍⚕️ Doctor: Dr. ${doctor}
📝 Notes: ${notes || 'None'}

New reminder emails will be sent according to the updated schedule.

Best regards,
MedVault Team`
      );
    }
    
    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Error updating appointment' });
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
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Send cancellation email
    const user = req.user;
    if (user.email) {
      await sendEmailReminder(
        user.email,
        '❌ Appointment Cancelled',
        `Hi ${user.name},

Your appointment has been cancelled:

📅 Date & Time: ${appointment.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}

👨‍⚕️ Doctor: Dr. ${appointment.doctor}

If you need to reschedule, please create a new appointment.

Best regards,
MedVault Team`
      );
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};
