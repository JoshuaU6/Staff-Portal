/**
 * Email service using Resend (https://resend.com)
 * Free tier: 100 emails/day, 3,000/month — sufficient for MTC job portal.
 * Set RESEND_API_KEY in Railway environment variables.
 * Set HR_EMAIL in Railway environment variables (defaults to careers@mtc-groups.com).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "careers@mtc-groups.com";
const HR_EMAIL = process.env.HR_EMAIL ?? "careers@mtc-groups.com";
const COMPANY_NAME = "MTC Group of Companies";
const PORTAL_URL = process.env.FRONTEND_URL ?? "https://portal.mtc-groups.com";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — email not sent");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${COMPANY_NAME} Careers <${FROM_EMAIL}>`,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[email] Resend error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Failed to send:", err);
    return false;
  }
}

// ── Email Templates ───────────────────────────────────────────────────────────

const baseStyle = `
  font-family: Georgia, 'Times New Roman', serif;
  max-width: 620px;
  margin: 0 auto;
  background: #ffffff;
  color: #1a1a2e;
`;

const headerHtml = (subtitle: string) => `
  <div style="background: #0d1117; padding: 32px 40px; border-bottom: 3px solid #C0001A;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="width: 48px; height: 48px; background: #C0001A; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 20px; font-weight: bold;">M</span>
      </div>
      <div>
        <div style="color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">MTC Group of Companies</div>
        <div style="color: #C0001A; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px;">${subtitle}</div>
      </div>
    </div>
  </div>
`;

const footerHtml = () => `
  <div style="background: #f8f8f8; padding: 24px 40px; border-top: 1px solid #e5e5e5; text-align: center;">
    <p style="color: #888; font-size: 11px; margin: 0 0 6px;">MTC Group of Companies &bull; Global Energy, Trade &amp; Infrastructure</p>
    <p style="color: #aaa; font-size: 10px; margin: 0;">
      This email was sent by the MTC Group recruitment system.
      If you did not apply for a position, please disregard this message.
    </p>
  </div>
`;

/**
 * Email to applicant confirming their application was received.
 */
export function buildApplicantConfirmationEmail(data: {
  applicantName: string;
  jobTitle: string;
  department: string;
  location: string;
  applicationId: number;
}): EmailPayload {
  const { applicantName, jobTitle, department, location, applicationId } = data;
  const firstName = applicantName.split(" ")[0];
  const refNumber = `MTC-APP-${String(applicationId).padStart(5, "0")}`;

  return {
    to: "", // set by caller
    subject: `Application Received — ${jobTitle} | MTC Group of Companies`,
    html: `
      <div style="${baseStyle}">
        ${headerHtml("Careers &amp; Recruitment")}
        <div style="padding: 40px 40px 32px;">
          <p style="font-size: 16px; color: #1a1a2e; margin: 0 0 24px;">Dear ${firstName},</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 20px;">
            Thank you for your interest in joining <strong>MTC Group of Companies</strong>. 
            We are pleased to confirm that your application has been successfully received and is currently under review by our HR team.
          </p>

          <div style="background: #f8f8f8; border-left: 4px solid #C0001A; padding: 20px 24px; margin: 24px 0; border-radius: 0 4px 4px 0;">
            <p style="font-size: 11px; font-weight: bold; color: #C0001A; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px;">Application Details</p>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px; width: 140px;">Reference Number</td><td style="padding: 4px 0; font-size: 13px; font-weight: bold; color: #1a1a2e;">${refNumber}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Position Applied</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${jobTitle}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Department</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${department}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Location</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${location}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Date Received</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
            </table>
          </div>

          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">
            <strong>What happens next?</strong>
          </p>
          <ol style="padding-left: 20px; margin: 0 0 24px;">
            <li style="font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 8px;">
              Our HR team will carefully review your application and qualifications over the next <strong>5–7 business days</strong>.
            </li>
            <li style="font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 8px;">
              Shortlisted candidates will be contacted directly via email or phone to schedule an initial interview.
            </li>
            <li style="font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 8px;">
              If your profile matches our requirements, we will reach out to discuss the opportunity further.
            </li>
          </ol>

          <p style="font-size: 14px; line-height: 1.7; color: #555; margin: 0 0 16px;">
            Please retain your reference number <strong>${refNumber}</strong> for any future correspondence regarding this application.
          </p>

          <p style="font-size: 14px; line-height: 1.7; color: #555; margin: 0 0 32px;">
            If you have any questions, please do not hesitate to contact our HR team at 
            <a href="mailto:${HR_EMAIL}" style="color: #C0001A; text-decoration: none;">${HR_EMAIL}</a>.
          </p>

          <p style="font-size: 15px; color: #1a1a2e; margin: 0 0 4px;">Warm regards,</p>
          <p style="font-size: 15px; font-weight: bold; color: #1a1a2e; margin: 0 0 2px;">MTC Group Human Resources</p>
          <p style="font-size: 13px; color: #888; margin: 0;">MTC Group of Companies</p>
        </div>
        ${footerHtml()}
      </div>
    `,
  };
}

/**
 * Email to HR notifying of a new application.
 */
export function buildHRNotificationEmail(data: {
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantLinkedin?: string;
  jobTitle: string;
  department: string;
  location: string;
  coverLetter?: string;
  applicationId: number;
}): EmailPayload {
  const { applicantName, applicantEmail, applicantPhone, applicantLinkedin, jobTitle, department, location, coverLetter, applicationId } = data;
  const refNumber = `MTC-APP-${String(applicationId).padStart(5, "0")}`;

  return {
    to: HR_EMAIL,
    subject: `New Application: ${jobTitle} — ${applicantName} [${refNumber}]`,
    replyTo: applicantEmail,
    html: `
      <div style="${baseStyle}">
        ${headerHtml("HR Notification — New Application")}
        <div style="padding: 32px 40px 28px;">
          <div style="background: #C0001A; color: white; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; display: inline-block;">
            <span style="font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">New Application Received</span>
          </div>

          <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 20px;">
            A new job application has been submitted through the MTC Group careers portal. Details are below.
          </p>

          <div style="background: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; padding: 20px 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; font-weight: bold; color: #C0001A; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px;">Position</p>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px; width: 140px;">Reference</td><td style="padding: 4px 0; font-size: 13px; font-weight: bold; color: #C0001A;">${refNumber}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Job Title</td><td style="padding: 4px 0; font-size: 13px; font-weight: bold; color: #1a1a2e;">${jobTitle}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Department</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${department}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Location</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${location}</td></tr>
            </table>
          </div>

          <div style="background: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; padding: 20px 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; font-weight: bold; color: #C0001A; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px;">Applicant</p>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px; width: 140px;">Full Name</td><td style="padding: 4px 0; font-size: 13px; font-weight: bold; color: #1a1a2e;">${applicantName}</td></tr>
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Email</td><td style="padding: 4px 0; font-size: 13px;"><a href="mailto:${applicantEmail}" style="color: #C0001A; text-decoration: none;">${applicantEmail}</a></td></tr>
              ${applicantPhone ? `<tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Phone</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${applicantPhone}</td></tr>` : ""}
              ${applicantLinkedin ? `<tr><td style="padding: 4px 0; color: #888; font-size: 13px;">LinkedIn</td><td style="padding: 4px 0; font-size: 13px;"><a href="${applicantLinkedin}" style="color: #C0001A; text-decoration: none;">View Profile</a></td></tr>` : ""}
              <tr><td style="padding: 4px 0; color: #888; font-size: 13px;">Applied At</td><td style="padding: 4px 0; font-size: 13px; color: #1a1a2e;">${new Date().toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td></tr>
            </table>
          </div>

          ${coverLetter ? `
          <div style="background: #fffaf9; border: 1px solid #f0e0dc; border-radius: 4px; padding: 20px 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; font-weight: bold; color: #C0001A; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px;">Cover Letter</p>
            <p style="font-size: 13px; line-height: 1.8; color: #444; margin: 0; white-space: pre-wrap;">${coverLetter}</p>
          </div>
          ` : ""}

          <div style="text-align: center; margin: 28px 0;">
            <a href="${PORTAL_URL}/admin/job-applications" style="background: #C0001A; color: white; padding: 12px 28px; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; border-radius: 4px; display: inline-block;">
              Review in Staff Portal →
            </a>
          </div>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
            You can reply directly to this email to contact the applicant.
          </p>
        </div>
        ${footerHtml()}
      </div>
    `,
  };
}