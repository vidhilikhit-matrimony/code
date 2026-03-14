require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ──────────────────────────────────────────────
// ✏️  CUSTOMISE YOUR EMAIL HERE
// ──────────────────────────────────────────────
const EMAIL_SUBJECT = '🎉 Exciting News: We\'ve Upgraded Our Website!';

const buildEmailHtml = (firstName) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
      VidhiLikhit Matrimonial
    </h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 15px;">
      We've made some exciting improvements!
    </p>
  </div>

  <!-- Body -->
  <div style="padding: 36px 32px;">
    <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
      Dear <strong>${firstName || 'Member'}</strong>,
    </p>
    <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
      We are thrilled to announce that we have upgraded our website with several new features and improvements to make your experience even better:
    </p>

    <!-- Feature list -->
    <ul style="font-size: 15px; color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
      <li>✨ <strong>New &amp; improved user interface</strong> — cleaner, faster, and more modern</li>
      <li>🔍 <strong>Better profile search &amp; filters</strong> — find your match more easily</li>
      <li>📸 <strong>Enhanced photo gallery</strong> — view profiles in higher quality</li>
      <li>🔒 <strong>Improved security</strong> — your data is safer than ever</li>
      <li>📱 <strong>Mobile-friendly design</strong> — works beautifully on any device</li>
    </ul>

    <p style="font-size: 16px; color: #374151; margin: 0 0 28px 0;">
      Log in now to explore all the new features. As always, we are here to help you on your journey.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.FRONTEND_URL || 'https://vidhilikhit.com'}"
         style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none;
                padding: 14px 36px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
        Visit Our Website →
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin: 0;">
      If you have any questions or feedback, feel free to reply to this email or contact our support team.
    </p>
  </div>

  <!-- Footer -->
  <div style="background: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
      With warm regards,<br/>
      <strong style="color: #6b7280;">The VidhiLikhit Matrimonial Team</strong>
    </p>
  </div>

</div>
`;
// ──────────────────────────────────────────────

// Log file setup
const LOG_FILE = path.join(__dirname, 'email-log.txt');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  logStream.write(line + '\n');
}

async function sendUpgradeEmails() {
  log('====== BULK EMAIL RUN STARTED ======');

  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  log('Connected to MongoDB');

  // 2. Load User model
  require('../src/models');
  const User = mongoose.model('User');

  // 3. Fetch ALL users (active + inactive)
  const users = await User.find({}).select('firstName lastName email');
  log(`Found ${users.length} total users to email\n`);

  if (users.length === 0) {
    log('No users found. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // 4. Set up nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // 5. Send emails one by one
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'VidhiLikhit Matrimonial'}" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: EMAIL_SUBJECT,
        html: buildEmailHtml(user.firstName)
      });

      sent++;
      log(`✅ [${sent + failed}/${users.length}] SENT   | ${user.firstName || 'N/A'} ${user.lastName || ''} | ${user.email}`);

      // Small delay to avoid Gmail rate limits
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      failed++;
      log(`❌ [${sent + failed}/${users.length}] FAILED | ${user.email} | ${err.message}`);
    }
  }

  log('\n─────────────────────────────');
  log(`DONE — Sent: ${sent} | Failed: ${failed} | Total: ${users.length}`);
  log(`Log saved to: ${LOG_FILE}`);
  log('─────────────────────────────\n');

  logStream.end();
  await mongoose.disconnect();
  process.exit(0);
}

sendUpgradeEmails().catch((err) => {
  log(`Fatal error: ${err.message}`);
  logStream.end();
  process.exit(1);
});
