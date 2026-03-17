import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>iBento</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f0eb; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #e07b39, #c4622d); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
    .header p { margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; }
    .body { padding: 36px 40px; color: #3d2b1f; }
    .body h2 { color: #c4622d; margin-top: 0; }
    .otp-box { background: #fdf3ec; border: 2px dashed #e07b39; border-radius: 10px; text-align: center; padding: 24px; margin: 24px 0; }
    .otp-box span { font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #c4622d; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .detail-table td { padding: 8px 12px; border-bottom: 1px solid #f0e8e0; font-size: 14px; }
    .detail-table td:first-child { font-weight: 600; color: #6b4226; width: 40%; }
    .btn { display: inline-block; background: #e07b39; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 16px; }
    .footer { background: #fdf3ec; padding: 20px 40px; text-align: center; font-size: 12px; color: #a07050; }
    .footer a { color: #c4622d; text-decoration: none; }
    .divider { height: 1px; background: #f0e8e0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>iBento</h1>
      <p>India's Premium Event Services Marketplace</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} iBento. All rights reserved.<br/>
      <a href="https://ibento.in">ibento.in</a> &bull; <a href="mailto:support@ibento.in">support@ibento.in</a>
    </div>
  </div>
</body>
</html>
`

const purposeLabels = {
  register: 'Email Verification',
  login: 'Login',
  'reset-password': 'Password Reset',
  'bank-verify': 'Bank Account Verification',
}

export const sendOTPEmail = async (email, otp, purpose) => {
  try {
    const label = purposeLabels[purpose] || 'Verification'
    const content = `
      <h2>${label} Code</h2>
      <p>Hello,</p>
      <p>Use the OTP below to complete your <strong>${label.toLowerCase()}</strong> on iBento. This code is valid for <strong>10 minutes</strong>.</p>
      <div class="otp-box">
        <div style="font-size:13px;color:#a07050;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase;">Your One-Time Password</div>
        <span>${otp}</span>
      </div>
      <p style="font-size:13px;color:#a07050;">If you did not request this OTP, please ignore this email. Do not share this code with anyone.</p>
    `
    await transporter.sendMail({
      from: `"iBento" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${otp} is your iBento ${label} OTP`,
      html: baseTemplate(content),
    })
  } catch (error) {
    console.error('sendOTPEmail error:', error.message)
    throw error
  }
}

export const sendBookingConfirmation = async (email, booking) => {
  try {
    const content = `
      <h2>Booking Confirmed!</h2>
      <p>Hi there,</p>
      <p>Your booking has been successfully placed on iBento. Here are your booking details:</p>
      <table class="detail-table">
        <tr><td>Booking ID</td><td><strong>${booking.bookingNumber}</strong></td></tr>
        <tr><td>Event Date</td><td>${new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        <tr><td>Event Type</td><td>${booking.eventType || 'N/A'}</td></tr>
        <tr><td>Total Amount</td><td><strong>₹${booking.totalAmount?.toLocaleString('en-IN')}</strong></td></tr>
        <tr><td>Advance Paid</td><td>₹${booking.advanceAmount?.toLocaleString('en-IN')}</td></tr>
        <tr><td>Status</td><td style="color:#e07b39;font-weight:600;">${booking.status?.toUpperCase()}</td></tr>
      </table>
      <div class="divider"></div>
      <p style="font-size:13px;color:#6b4226;">You will be notified once the vendor confirms your booking. For any queries, contact <a href="mailto:support@ibento.in">support@ibento.in</a>.</p>
    `
    await transporter.sendMail({
      from: `"iBento" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Booking Confirmed: ${booking.bookingNumber}`,
      html: baseTemplate(content),
    })
  } catch (error) {
    console.error('sendBookingConfirmation error:', error.message)
    throw error
  }
}

export const sendVendorApproval = async (email, vendorName) => {
  try {
    const content = `
      <h2>Congratulations! Your Vendor Account is Approved</h2>
      <p>Hi <strong>${vendorName}</strong>,</p>
      <p>Great news! Your vendor application on iBento has been <strong style="color:#2e7d32;">approved</strong>. You can now start receiving bookings from customers across India.</p>
      <div class="divider"></div>
      <p><strong>What's next?</strong></p>
      <ul style="color:#3d2b1f;line-height:1.8;">
        <li>Complete your vendor profile with photos and portfolio</li>
        <li>Add your services and pricing</li>
        <li>Set your availability calendar</li>
        <li>Start receiving booking requests!</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/vendor/dashboard" class="btn">Go to Dashboard</a>
    `
    await transporter.sendMail({
      from: `"iBento" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your iBento Vendor Account is Approved!',
      html: baseTemplate(content),
    })
  } catch (error) {
    console.error('sendVendorApproval error:', error.message)
    throw error
  }
}

export const sendVendorRejection = async (email, vendorName, reason) => {
  try {
    const content = `
      <h2>Vendor Application Update</h2>
      <p>Hi <strong>${vendorName}</strong>,</p>
      <p>We regret to inform you that your vendor application on iBento could not be approved at this time.</p>
      ${reason ? `<div style="background:#fff3f3;border-left:4px solid #e53935;padding:14px 18px;border-radius:6px;margin:16px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
      <div class="divider"></div>
      <p>You are welcome to reapply after addressing the above concerns. If you have any questions, feel free to reach out to our support team.</p>
      <p style="font-size:13px;color:#a07050;">Email: <a href="mailto:support@ibento.in">support@ibento.in</a></p>
    `
    await transporter.sendMail({
      from: `"iBento" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'iBento Vendor Application - Action Required',
      html: baseTemplate(content),
    })
  } catch (error) {
    console.error('sendVendorRejection error:', error.message)
    throw error
  }
}

export const sendWithdrawalUpdate = async (email, amount, status) => {
  try {
    const statusConfig = {
      approved: { label: 'Approved', color: '#2e7d32', msg: 'Your withdrawal request has been approved and is being processed.' },
      rejected: { label: 'Rejected', color: '#e53935', msg: 'Your withdrawal request has been rejected. Please contact support for details.' },
      paid: { label: 'Paid', color: '#1565c0', msg: 'Your withdrawal has been successfully transferred to your bank account.' },
    }
    const config = statusConfig[status] || { label: status, color: '#555', msg: `Your withdrawal status has been updated to ${status}.` }

    const content = `
      <h2>Withdrawal Request ${config.label}</h2>
      <p>Your withdrawal request for <strong>₹${Number(amount).toLocaleString('en-IN')}</strong> has been updated.</p>
      <div style="background:#f9f5f2;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
        <div style="font-size:32px;font-weight:800;color:${config.color};">₹${Number(amount).toLocaleString('en-IN')}</div>
        <div style="color:${config.color};font-weight:600;margin-top:6px;">${config.label}</div>
      </div>
      <p>${config.msg}</p>
      <p style="font-size:13px;color:#a07050;">For queries: <a href="mailto:support@ibento.in">support@ibento.in</a></p>
    `
    await transporter.sendMail({
      from: `"iBento" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Withdrawal ${config.label} - iBento`,
      html: baseTemplate(content),
    })
  } catch (error) {
    console.error('sendWithdrawalUpdate error:', error.message)
    throw error
  }
}
