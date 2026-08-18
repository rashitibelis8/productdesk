import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? 'ProductDesk <onboarding@resend.dev>';

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  if (!resend) {
    // Dev fallback so the app keeps working before RESEND_API_KEY is configured.
    console.log(`[email:dev-stub] to=${to} subject="${subject}"\n${html}`);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error('[email] Resend send failed:', error);
    throw new Error('Failed to send email');
  }
}

function emailShell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #191c1d;">
      <div style="margin-bottom: 24px;">
        <span style="display: inline-flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700;">
          <span style="display: inline-block; width: 28px; height: 28px; background: #4648d4; border-radius: 6px;"></span>
          Product<span style="color: #4648d4;">Desk</span>
        </span>
      </div>
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #767576;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

export function renderVerifyEmail(verifyUrl: string, businessName: string): string {
  return emailShell(
    'Verify your email to finish setting up ProductDesk',
    `
      <p style="font-size: 14px; line-height: 20px; color: #464554;">
        Hi ${businessName}, thanks for signing up. Click below to verify your email and set your password.
      </p>
      <a href="${verifyUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #4648d4; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Verify email &amp; set password
      </a>
      <p style="margin-top: 16px; font-size: 12px; color: #767576;">This link expires in 24 hours.</p>
    `
  );
}

export function renderResetPasswordEmail(resetUrl: string): string {
  return emailShell(
    'Reset your password',
    `
      <p style="font-size: 14px; line-height: 20px; color: #464554;">
        We received a request to reset your password. Click below to choose a new one.
      </p>
      <a href="${resetUrl}" style="display: inline-block; margin-top: 16px; padding: 10px 24px; background: #4648d4; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Reset password
      </a>
      <p style="margin-top: 16px; font-size: 12px; color: #767576;">This link expires in 1 hour.</p>
    `
  );
}
