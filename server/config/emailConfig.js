// server/config/emailConfig.js

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Verify the connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Error with email transporter config:', error);
    } else {
        console.log('Email transporter is ready to send emails');
    }
});

module.exports = transporter;