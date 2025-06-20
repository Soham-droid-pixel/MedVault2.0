const twilio = require('twilio');

class SMSService {
  constructor() {
    console.log('\n🔧 SMS SERVICE INITIALIZATION');
    console.log('===============================');
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? `✅ Present (${process.env.TWILIO_ACCOUNT_SID.substring(0, 8)}...)` : '❌ Missing');
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? `✅ Present (${process.env.TWILIO_AUTH_TOKEN.substring(0, 8)}...)` : '❌ Missing');
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || '❌ Missing');
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        console.log('🔧 Creating Twilio client...');
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        this.enabled = true;
        console.log('✅ SMS service initialized with Twilio');
        console.log(`📱 Using phone number: ${this.fromNumber}`);
      } catch (error) {
        console.error('❌ Failed to initialize Twilio client:', error.message);
        this.enabled = false;
      }
    } else {
      console.warn('⚠️ Twilio credentials incomplete - SMS disabled');
      console.log('Missing:');
      if (!process.env.TWILIO_ACCOUNT_SID) console.log('  - TWILIO_ACCOUNT_SID');
      if (!process.env.TWILIO_AUTH_TOKEN) console.log('  - TWILIO_AUTH_TOKEN');
      if (!process.env.TWILIO_PHONE_NUMBER) console.log('  - TWILIO_PHONE_NUMBER');
      this.enabled = false;
    }
    console.log('===============================\n');
  }

  async sendSMS(to, message, options = {}) {
    if (!this.enabled) {
      console.log('📱 SMS disabled - would have sent:', { to, message });
      return { success: false, message: 'SMS service not available' };
    }

    try {
      console.log(`📱 Sending SMS to ${to}`);
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      
      console.log(`✅ SMS sent successfully: ${result.sid}`);
      return { success: true, sid: result.sid };
      
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      throw error;
    }
  }

  formatAppointmentSMS(appointment, reminderType) {
    if (!this.enabled) {
      return 'SMS service not available';
    }

    const appointmentTime = new Date(appointment.date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let message = '';
    
    switch (reminderType) {
      case '1day':
        message = `🏥 MedVault: Your appointment with Dr. ${appointment.doctor} is TOMORROW at ${appointmentTime}. Please arrive 15 min early.`;
        break;
      case '3day':
        message = `🏥 MedVault: Reminder - Your appointment with Dr. ${appointment.doctor} is in 3 days (${appointmentTime}). Prepare your questions!`;
        break;
      case '7day':
        message = `🏥 MedVault: You have an appointment with Dr. ${appointment.doctor} next week on ${appointmentTime}. Mark your calendar!`;
        break;
      default:
        message = `🏥 MedVault: Appointment reminder - Dr. ${appointment.doctor} on ${appointmentTime}`;
    }
    
    return message;
  }
}

module.exports = new SMSService();