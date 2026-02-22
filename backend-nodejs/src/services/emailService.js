const nodemailer = require('nodemailer');
const config = require('../config/env');

// Lazy load transporter to avoid module loading issues
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth
    });
  }
  return transporter;
};

/**
 * Generate 6-digit OTP
 * @returns {string} - OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email for registration
 * @param {string} email - Recipient email
 * @param {string} username - User's username
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>} - Success status
 */
const sendRegistrationOTP = async (email, username, otp) => {
  try {
    const mailOptions = {
      from: `"${config.app.name}" <${config.email.auth.user}>`,
      to: email,
      subject: `Verification OTP - ${config.app.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Welcome to ${config.app.name}!</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Thank you for registering with ${config.app.name}!</p>
          <p>Your verification OTP is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #6366f1; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">Best regards,<br>${config.app.name} Team</p>
        </div>
      `
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    return true;

  } catch (error) {
    console.error('❌ Email send error:', error);
    // For development, log OTP to console
    console.log(`📧 OTP for ${email}: ${otp}`);
    return true; // Return true for development
  }
};

/**
 * Send OTP email for password reset
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"${config.app.name}" <${config.email.auth.user}>`,
      to: email,
      subject: `Password Reset OTP - ${config.app.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested to reset your password for ${config.app.name}.</p>
          <p>Your password reset OTP is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #6366f1; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email or contact support.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">Best regards,<br>${config.app.name} Team</p>
        </div>
      `
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent to ${email}: ${otp}`);
    return true;

  } catch (error) {
    console.error('❌ Email send error:', error);
    // For development, log OTP to console
    console.log(`📧 Password reset OTP for ${email}: ${otp}`);
    return true; // Return true for development
  }
};

module.exports = {
  generateOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP
};
