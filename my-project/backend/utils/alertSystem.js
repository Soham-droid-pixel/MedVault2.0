const nodemailer = require('nodemailer');

class AlertSystem {
  constructor() {
    this.alertThresholds = {
      emailFailures: 5, // Alert after 5 consecutive failures
      cronJobMissed: 2, // Alert after 2 hours of no cron job
      dbConnectFailures: 3
    };
    
    this.failureCounts = {
      emailFailures: 0,
      cronJobMissed: 0,
      dbConnectFailures: 0
    };
    
    this.lastCronRun = new Date();
    this.adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  }

  async sendAlert(type, message, details = {}) {
    if (!this.adminEmails.length) {
      console.warn('⚠️ No admin emails configured for alerts');
      return;
    }

    try {
      const transporter = nodemailer.createTransport({ // Fixed: createTransport not createTransporter
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const alertEmail = {
        from: {
          name: 'MedVault Alert System',
          address: process.env.EMAIL_USER
        },
        to: this.adminEmails.join(','),
        subject: `🚨 MedVault Alert: ${type}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #e74c3c; color: white; padding: 20px; text-align: center;">
              <h1>🚨 MedVault System Alert</h1>
            </div>
            
            <div style="background: white; padding: 30px;">
              <h2 style="color: #e74c3c;">${type}</h2>
              <p><strong>Message:</strong> ${message}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              
              ${Object.keys(details).length > 0 ? `
                <h3>Details:</h3>
                <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(details, null, 2)}
                </pre>
              ` : ''}
              
              <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
                <strong>Action Required:</strong> Please check the MedVault system immediately.
              </div>
            </div>
          </div>
        `
      };

      await transporter.sendMail(alertEmail);
      console.log(`🚨 Alert sent to admins: ${type}`);
      
    } catch (error) {
      console.error('Failed to send alert email:', error);
    }
  }

  recordEmailFailure(error) {
    this.failureCounts.emailFailures++;
    
    if (this.failureCounts.emailFailures >= this.alertThresholds.emailFailures) {
      this.sendAlert('High Email Failure Rate', 
        `${this.failureCounts.emailFailures} consecutive email failures detected`,
        { lastError: error.message, failureCount: this.failureCounts.emailFailures }
      );
      this.failureCounts.emailFailures = 0; // Reset after alert
    }
  }

  recordEmailSuccess() {
    this.failureCounts.emailFailures = 0; // Reset on success
  }

  recordCronRun() {
    this.lastCronRun = new Date();
  }

  checkCronHealth() {
    const hoursSinceLastRun = (new Date() - this.lastCronRun) / (1000 * 60 * 60);
    
    if (hoursSinceLastRun > this.alertThresholds.cronJobMissed) {
      this.sendAlert('Cron Job Failure', 
        `Cron job hasn't run for ${Math.floor(hoursSinceLastRun)} hours`,
        { lastRun: this.lastCronRun, currentTime: new Date() }
      );
    }
  }
}

const alertSystem = new AlertSystem();

// Check cron health every 30 minutes
setInterval(() => {
  alertSystem.checkCronHealth();
}, 30 * 60 * 1000);

module.exports = alertSystem;