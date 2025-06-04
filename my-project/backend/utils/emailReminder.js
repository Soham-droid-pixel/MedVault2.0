const nodemailer = require('nodemailer');

const sendEmailReminder = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
};

module.exports = sendEmailReminder;

