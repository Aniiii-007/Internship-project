import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Send OTP verification email
 * @param {string} to  - recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - recipient name
 */
export async function sendOtpEmail(to, otp, name = 'there') {
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your Morpheus account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Hi ${name} 👋</h2>
        <p style="color: #444; font-size: 15px; line-height: 1.6;">
          Welcome to <strong>Morpheus</strong>! Use the OTP below to verify your email address.
          This code is valid for <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="
            display: inline-block;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 10px;
            color: #4f46e5;
            background: #eef2ff;
            padding: 16px 32px;
            border-radius: 8px;
          ">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('[EmailService] Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}


/**
 * Send tutor approval/rejection notification email
 * @param {string} to       - tutor email
 * @param {string} name     - tutor name
 * @param {'approved'|'rejected'} status
 * @param {string} [remarks] - admin notes
 */
export async function sendTutorReviewEmail(to, name, status, remarks = '') {
  const isApproved = status === 'approved';

  const subject = isApproved
    ? '🎉 Your Morpheus tutor application has been approved!'
    : 'Your Morpheus tutor application status update';

  const headerColor = isApproved ? '#16a34a' : '#dc2626';
  const headerText = isApproved ? 'Application Approved ✅' : 'Application Not Approved';

  const bodyText = isApproved
    ? `Great news! Your tutor application on <strong>Morpheus</strong> has been <strong>approved</strong>. You can now log in and start connecting with students.`
    : `After reviewing your application, we were unable to approve it at this time. You are welcome to reapply after addressing the feedback below.`;

  const remarksBlock = remarks
    ? `<div style="margin-top:16px;padding:12px 16px;background:#f3f4f6;border-left:4px solid ${headerColor};border-radius:4px;">
             <p style="margin:0;font-size:13px;color:#374151;"><strong>Admin remarks:</strong> ${remarks}</p>
           </div>`
    : '';

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:8px;">
        <div style="background:${headerColor};padding:16px 24px;border-radius:6px;margin-bottom:24px;">
          <h2 style="color:#fff;margin:0;">${headerText}</h2>
        </div>
        <p style="color:#111;font-size:15px;">Hi ${name} 👋</p>
        <p style="color:#444;font-size:15px;line-height:1.6;">${bodyText}</p>
        ${remarksBlock}
        <p style="margin-top:24px;color:#888;font-size:13px;">If you have any questions, reply to this email or contact our support team.</p>
        <p style="color:#888;font-size:13px;">— The Morpheus Team</p>
      </div>
    `,
  });

  if (error) {
    console.error('[EmailService] Failed to send tutor review email:', error);
    throw new Error('Failed to send tutor review email');
  }
}
