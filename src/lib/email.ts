/**
 * Email utility for sending password reset emails
 *
 * NOTE: This is currently a placeholder that logs to console.
 * To enable real email sending, integrate with an email service provider:
 * - SendGrid: https://sendgrid.com/
 * - Resend: https://resend.com/
 * - AWS SES: https://aws.amazon.com/ses/
 * - Mailgun: https://www.mailgun.com/
 *
 * Example integration with Resend:
 *
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 *
 * await resend.emails.send({
 *   from: 'RetailPass <noreply@retailpass.com>',
 *   to: email,
 *   subject: 'Password Reset Request',
 *   html: `<p>Click here to reset your password: ${resetUrl}</p>`,
 * });
 */

/**
 * Send a password reset email to the user
 * @param email - User's email address
 * @param resetToken - Password reset token
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  // Construct the reset URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  // TODO: Replace this console.log with actual email sending
  console.log('\n==============================================');
  console.log('PASSWORD RESET EMAIL');
  console.log('==============================================');
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Token: ${resetToken}`);
  console.log('==============================================\n');

  // Simulate async email sending
  await new Promise((resolve) => setTimeout(resolve, 100));
}
