/**
 * MTC Group Recruitment Email Service
 * Uses Resend (https://resend.com) — free tier: 100 emails/day, 3,000/month
 * All layouts use table-based HTML for maximum email client compatibility
 * (Gmail, Outlook, Apple Mail, Yahoo — flex/grid are not supported in emails)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "careers@mtc-groups.com";
const HR_EMAIL = process.env.HR_EMAIL ?? "careers@mtc-groups.com";
const COMPANY_NAME = "MTC Group of Companies";
const PORTAL_URL = process.env.FRONTEND_URL ?? "https://portal.mtc-groups.com";
const LOGO_URL = "https://www.mtc-groups.com/images/mtc-logo.png";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string; type?: string }>;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — email not sent");
    return false;
  }
  try {
    const body: any = {
      from: `${COMPANY_NAME} Careers <${FROM_EMAIL}>`,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    };
    if (payload.attachments?.length) body.attachments = payload.attachments;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

// ── Shared layout helpers (table-based — works in ALL email clients) ───────────

function header(subtitle: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0d1117;border-bottom:3px solid #C0001A;">
      <tr>
        <td style="padding:24px 40px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;padding-right:20px;width:80px;">
                <img src="${LOGO_URL}" alt="MTC Group" width="72" height="72"
                  style="display:block;width:72px;height:72px;object-fit:contain;border:0;" />
              </td>
              <td style="vertical-align:middle;">
                <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;line-height:1.2;">MTC Group of Companies</div>
                <div style="font-family:Arial,sans-serif;color:#C0001A;font-size:10px;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase;margin-top:5px;">${subtitle}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function footer(): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f8f8;border-top:1px solid #e5e5e5;">
      <tr>
        <td style="padding:24px 40px;text-align:center;">
          <p style="font-family:Arial,sans-serif;color:#999;font-size:11px;margin:0 0 6px;">MTC Group of Companies &bull; Global Energy, Trade &amp; Infrastructure</p>
          <p style="font-family:Arial,sans-serif;color:#bbb;font-size:10px;margin:0;">This is an automated message from the MTC Group recruitment system. Please do not reply directly to this email.</p>
        </td>
      </tr>
    </table>`;
}

function wrapper(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f0f0f0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;padding:20px 0;">
      <tr><td align="center">
        <table width="620" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;max-width:620px;width:100%;">
          ${content}
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function detailsBox(rows: Array<[string, string]>): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f8f8;border-left:4px solid #C0001A;margin:20px 0;">
      <tr><td style="padding:20px 24px;">
        <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#C0001A;text-transform:uppercase;letter-spacing:2px;margin:0 0 14px;">Application Details</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${rows.map(([label, value]) => `
            <tr>
              <td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:4px 0;width:150px;vertical-align:top;">${label}</td>
              <td style="font-family:Arial,sans-serif;color:#1a1a2e;font-size:12px;padding:4px 0;font-weight:500;">${value}</td>
            </tr>`).join("")}
        </table>
      </td></tr>
    </table>`;
}

function ctaButton(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
    <tr><td align="center">
      <a href="${url}" style="display:inline-block;background:#C0001A;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.5px;text-decoration:none;padding:14px 32px;border-radius:4px;">
        ${text}
      </a>
    </td></tr>
  </table>`;
}

function body(html: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:36px 40px 32px;">${html}</td></tr></table>`;
}

function para(text: string, style = ""): string {
  return `<p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.8;color:#333;margin:0 0 16px;${style}">${text}</p>`;
}

function greeting(name: string): string {
  const first = name.split(" ")[0];
  return `<p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1a1a2e;margin:0 0 20px;">Dear ${first},</p>`;
}

function signature(): string {
  return `
    <p style="font-family:Georgia,serif;font-size:14px;color:#1a1a2e;margin:28px 0 4px;">Warm regards,</p>
    <p style="font-family:Georgia,serif;font-size:14px;font-weight:bold;color:#1a1a2e;margin:0 0 2px;">MTC Group Human Resources</p>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin:0 0 4px;">MTC Group of Companies</p>
    <p style="font-family:Arial,sans-serif;font-size:12px;margin:0;"><a href="mailto:${HR_EMAIL}" style="color:#C0001A;text-decoration:none;">${HR_EMAIL}</a></p>`;
}

function alertBox(color: string, icon: string, text: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${color}10;border:1px solid ${color}30;border-radius:4px;margin:20px 0;">
    <tr><td style="padding:16px 20px;">
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#1a1a2e;margin:0;"><span style="font-size:18px;margin-right:10px;">${icon}</span>${text}</p>
    </td></tr>
  </table>`;
}

// ── Common data type ──────────────────────────────────────────────────────────
export interface StatusEmailData {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  department: string;
  location: string;
  applicationRef: string;
  // Optional extras per status
  assessmentDetails?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
  interviewNotes?: string;
  offerLetterUrl?: string;
  rejectionReason?: string;
  rejectionNote?: string;
}

// ── 1. New Application (applicant confirmation) ───────────────────────────────
export function buildApplicantConfirmationEmail(data: {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  department: string;
  location: string;
  applicationId: number;
  applicationRef?: string;
  country?: string;
  yearsOfExperience?: string;
  coverLetter?: string;
  applicantPhone?: string;
  applicantLinkedin?: string;
  jobRef?: string | null;
}): EmailPayload {
  const ref = data.applicationRef ?? `MTC-APP-${String(data.applicationId).padStart(6, "0")}`;
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return {
    to: data.applicantEmail,
    subject: `Application Received — ${data.jobTitle} | MTC Group of Companies`,
    html: wrapper(`
      ${header("Careers &amp; Recruitment")}
      ${body(`
        ${greeting(data.applicantName)}
        ${para(`Thank you for your interest in joining <strong>MTC Group of Companies</strong>. We are pleased to confirm that your application has been successfully received and is currently under review by our HR team.`)}
        ${detailsBox([
          ["Reference Number", `<strong style="color:#C0001A;">${ref}</strong>`],
          ["Position Applied", data.jobTitle],
          ["Department", data.department],
          ["Location", data.location],
          ["Date Received", date],
        ])}
        ${para("<strong>What happens next?</strong>")}
        <ol style="font-family:Arial,sans-serif;font-size:13px;line-height:1.9;color:#444;padding-left:20px;margin:0 0 20px;">
          <li style="margin-bottom:8px;">Our HR team will carefully review your application and qualifications over the next <strong>5–7 business days</strong>.</li>
          <li style="margin-bottom:8px;">Shortlisted candidates will be contacted directly via email or phone to schedule an initial interview.</li>
          <li style="margin-bottom:8px;">If your profile matches our requirements, we will reach out to discuss the opportunity in detail.</li>
        </ol>
        ${para(`Please retain your reference number <strong>${ref}</strong> for any future correspondence regarding this application.`)}
        ${para(`If you have any questions in the meantime, please contact our HR team at <a href="mailto:${HR_EMAIL}" style="color:#C0001A;text-decoration:none;">${HR_EMAIL}</a>.`)}
        ${signature()}
      `)}
      ${footer()}
    `),
  };
}

// ── 2. HR notification of new application ────────────────────────────────────
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
  applicationRef?: string;
  jobRef?: string | null;
}): EmailPayload {
  const ref = data.applicationRef ?? `MTC-APP-${String(data.applicationId).padStart(6, "0")}`;
  const date = new Date().toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return {
    to: HR_EMAIL,
    subject: `New Application: ${data.jobTitle} — ${data.applicantName} [${ref}]`,
    replyTo: data.applicantEmail,
    html: wrapper(`
      ${header("HR Notification — New Application")}
      ${body(`
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#C0001A;border-radius:4px;margin-bottom:24px;">
          <tr><td style="padding:10px 16px;">
            <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">New Application Received</span>
          </td></tr>
        </table>
        ${para("A new job application has been submitted through the MTC Group careers portal.")}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:4px;margin-bottom:16px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#C0001A;text-transform:uppercase;letter-spacing:2px;margin:0 0 14px;">Position</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;width:140px;">Reference</td><td style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#C0001A;padding:3px 0;">${ref}</td></tr>
              <tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Job Title</td><td style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#1a1a2e;padding:3px 0;">${data.jobTitle}</td></tr>
              <tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Department</td><td style="font-family:Arial,sans-serif;font-size:12px;color:#1a1a2e;padding:3px 0;">${data.department}</td></tr>
              <tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Location</td><td style="font-family:Arial,sans-serif;font-size:12px;color:#1a1a2e;padding:3px 0;">${data.location}</td></tr>
            </table>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:4px;margin-bottom:16px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#C0001A;text-transform:uppercase;letter-spacing:2px;margin:0 0 14px;">Applicant</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;width:140px;">Full Name</td><td style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#1a1a2e;padding:3px 0;">${data.applicantName}</td></tr>
              <tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Email</td><td style="font-family:Arial,sans-serif;font-size:12px;padding:3px 0;"><a href="mailto:${data.applicantEmail}" style="color:#C0001A;text-decoration:none;">${data.applicantEmail}</a></td></tr>
              ${data.applicantPhone ? `<tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Phone</td><td style="font-family:Arial,sans-serif;font-size:12px;color:#1a1a2e;padding:3px 0;">${data.applicantPhone}</td></tr>` : ""}
              ${data.applicantLinkedin ? `<tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">LinkedIn</td><td style="font-family:Arial,sans-serif;font-size:12px;padding:3px 0;"><a href="${data.applicantLinkedin}" style="color:#C0001A;text-decoration:none;">View Profile</a></td></tr>` : ""}
              <tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Applied</td><td style="font-family:Arial,sans-serif;font-size:12px;color:#1a1a2e;padding:3px 0;">${date}</td></tr>
            </table>
          </td></tr>
        </table>
        ${data.coverLetter ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffaf9;border:1px solid #f0e0dc;border-radius:4px;margin-bottom:16px;">
          <tr><td style="padding:20px 24px;">
            <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#C0001A;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Cover Letter</p>
            <p style="font-family:Georgia,serif;font-size:13px;line-height:1.8;color:#444;margin:0;white-space:pre-wrap;">${data.coverLetter}</p>
          </td></tr>
        </table>` : ""}
        ${ctaButton("Review Application in Staff Portal →", `${PORTAL_URL}/admin/job-applications`)}
        <p style="font-family:Arial,sans-serif;font-size:11px;color:#aaa;text-align:center;margin:0;">Reply to this email to contact the applicant directly.</p>
      `)}
      ${footer()}
    `),
  };
}

// ── Status email builder ──────────────────────────────────────────────────────
// Builds a candidate email for every status change triggered from HR dashboard

export function buildStatusEmail(status: string, data: StatusEmailData): EmailPayload | null {
  const { applicantName, applicantEmail, jobTitle, department, location, applicationRef } = data;
  const details = detailsBox([
    ["Reference", `<strong style="color:#C0001A;">${applicationRef}</strong>`],
    ["Position", jobTitle],
    ["Department", department],
    ["Location", location],
  ]);

  switch (status) {

    case "reviewing":
      return {
        to: applicantEmail,
        subject: `Application Update — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Application Update")}
          ${body(`
            ${greeting(applicantName)}
            ${para(`We are writing to inform you that your application for the position of <strong>${jobTitle}</strong> at MTC Group of Companies is currently being reviewed by our HR team.`)}
            ${details}
            ${para("Our recruitment team is carefully assessing all applications received. We will be in touch with further updates as soon as possible.")}
            ${para("Thank you for your patience and continued interest in joining MTC Group of Companies.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "shortlisted":
      return {
        to: applicantEmail,
        subject: `Congratulations — You Have Been Shortlisted | ${jobTitle} | MTC Group`,
        html: wrapper(`
          ${header("Application Update — Shortlisted")}
          ${body(`
            ${greeting(applicantName)}
            ${alertBox("#22c55e", "🎉", "Congratulations! Your application has been shortlisted.")}
            ${para(`We are delighted to inform you that following a careful review of applications received for the position of <strong>${jobTitle}</strong>, your profile has been <strong>shortlisted</strong> for the next stage of our recruitment process.`)}
            ${details}
            ${para("This is a significant step forward in your application. Our recruitment team will be contacting you shortly to discuss the next steps in detail.")}
            ${para("We look forward to getting to know you better and thank you for your interest in MTC Group of Companies.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "assessment":
      return {
        to: applicantEmail,
        subject: `Assessment Invitation — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Assessment Stage Invitation")}
          ${body(`
            ${greeting(applicantName)}
            ${para(`Following your successful shortlisting for the position of <strong>${jobTitle}</strong>, we are pleased to invite you to the <strong>Assessment Stage</strong> of our recruitment process.`)}
            ${details}
            ${data.assessmentDetails ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f8f8;border-left:4px solid #C0001A;margin:20px 0;">
              <tr><td style="padding:20px 24px;">
                <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#C0001A;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Assessment Details</p>
                <p style="font-family:Georgia,serif;font-size:13px;line-height:1.8;color:#333;margin:0;white-space:pre-wrap;">${data.assessmentDetails}</p>
              </td></tr>
            </table>` : ""}
            ${para("Please review the assessment details carefully and complete within the specified timeframe. Should you have any questions, do not hesitate to reach out to our HR team.")}
            ${para(`Contact us at <a href="mailto:${HR_EMAIL}" style="color:#C0001A;text-decoration:none;">${HR_EMAIL}</a> if you need any clarification.`)}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "interview_scheduled":
      return {
        to: applicantEmail,
        subject: `Interview Invitation — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Interview Invitation")}
          ${body(`
            ${greeting(applicantName)}
            ${alertBox("#3b82f6", "📅", "You have been invited for an interview with MTC Group of Companies.")}
            ${para(`We are pleased to inform you that you have been selected for an <strong>interview</strong> for the position of <strong>${jobTitle}</strong> at MTC Group of Companies.`)}
            ${details}
            ${(data.interviewDate || data.interviewTime || data.interviewLink) ? `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f8f8;border-left:4px solid #3b82f6;margin:20px 0;">
              <tr><td style="padding:20px 24px;">
                <p style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;color:#3b82f6;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Interview Schedule</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${data.interviewDate ? `<tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;width:120px;">Date</td><td style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#1a1a2e;padding:3px 0;">${data.interviewDate}</td></tr>` : ""}
                  ${data.interviewTime ? `<tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Time</td><td style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#1a1a2e;padding:3px 0;">${data.interviewTime}</td></tr>` : ""}
                  ${data.interviewLink ? `<tr><td style="font-family:Arial,sans-serif;color:#888;font-size:12px;padding:3px 0;">Meeting Link</td><td style="font-family:Arial,sans-serif;font-size:12px;padding:3px 0;"><a href="${data.interviewLink}" style="color:#C0001A;text-decoration:none;">${data.interviewLink}</a></td></tr>` : ""}
                </table>
              </td></tr>
            </table>` : ""}
            ${para("Please confirm your attendance by replying to this email or contacting our HR team. Kindly ensure you are available at the scheduled time and have a stable internet connection if this is a virtual interview.")}
            ${para("We look forward to speaking with you.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "interview_completed":
      return {
        to: applicantEmail,
        subject: `Interview Follow-Up — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Interview Follow-Up")}
          ${body(`
            ${greeting(applicantName)}
            ${para(`Thank you for attending your interview for the position of <strong>${jobTitle}</strong> at MTC Group of Companies. We greatly appreciate the time you invested in speaking with our team.`)}
            ${details}
            ${para("Our recruitment team is currently evaluating the outcomes of all interviews conducted. We will be in touch with you regarding the next steps in the process as soon as our assessment is complete.")}
            ${para("Thank you again for your interest in joining MTC Group of Companies. We will be in contact shortly.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "reference_check":
      return {
        to: applicantEmail,
        subject: `Reference Verification — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Reference Verification")}
          ${body(`
            ${greeting(applicantName)}
            ${para(`We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> is progressing well. As part of our standard recruitment process, we are now initiating the <strong>reference verification stage</strong>.`)}
            ${details}
            ${para("Our HR team will be contacting the professional references you provided during your application. Please ensure your referees are aware that they may receive a request from MTC Group of Companies.")}
            ${para("If you need to update or add any reference details, please contact our HR team at the earliest opportunity.")}
            ${para(`Contact us at <a href="mailto:${HR_EMAIL}" style="color:#C0001A;text-decoration:none;">${HR_EMAIL}</a> for any updates.`)}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "document_verification":
      return {
        to: applicantEmail,
        subject: `Document Verification — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Document Verification")}
          ${body(`
            ${greeting(applicantName)}
            ${para(`Your application for the position of <strong>${jobTitle}</strong> continues to progress through our recruitment process. We are now at the <strong>document verification stage</strong>.`)}
            ${details}
            ${para("Our HR team will be reviewing the qualification certificates, professional licenses, identification documents and other credentials you submitted as part of your application.")}
            ${para("If there are any additional documents required, or if we need clarification on any submitted materials, our HR team will contact you directly.")}
            ${para("Please ensure you are available and responsive during this stage to avoid any delays in processing your application.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "offer_issued":
      return {
        to: applicantEmail,
        subject: `Employment Offer — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Employment Offer")}
          ${body(`
            ${greeting(applicantName)}
            ${alertBox("#22c55e", "🎊", "Congratulations — MTC Group of Companies is pleased to extend you an employment offer.")}
            ${para(`Following the successful completion of our recruitment process, we are delighted to formally offer you the position of <strong>${jobTitle}</strong> at MTC Group of Companies.`)}
            ${details}
            ${data.offerLetterUrl ? `
            ${ctaButton("Download Your Offer Letter →", data.offerLetterUrl)}` : ""}
            ${para("Please review the offer letter carefully, including the terms and conditions, compensation package, and start date. To accept this offer, please sign and return the offer letter to our HR team within <strong>5 business days</strong>.")}
            ${para(`Should you have any questions regarding the offer, please do not hesitate to contact us at <a href="mailto:${HR_EMAIL}" style="color:#C0001A;text-decoration:none;">${HR_EMAIL}</a>.`)}
            ${para("We are very excited about the prospect of you joining the MTC Group team and look forward to your positive response.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "offer_accepted":
      return {
        to: applicantEmail,
        subject: `Offer Acceptance Confirmed — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Offer Acceptance Confirmed")}
          ${body(`
            ${greeting(applicantName)}
            ${para(`We are delighted to confirm that your acceptance of the offer for the position of <strong>${jobTitle}</strong> at MTC Group of Companies has been received and recorded.`)}
            ${details}
            ${para("Our HR and onboarding teams will be in contact with you shortly with all the information you need to prepare for your start date, including onboarding documentation, induction schedule and any pre-employment requirements.")}
            ${para("We look forward to welcoming you to the MTC Group family and are excited about the contribution you will make to our team.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "hired":
      return {
        to: applicantEmail,
        subject: `Welcome to MTC Group of Companies — ${jobTitle}`,
        html: wrapper(`
          ${header("Welcome to MTC Group of Companies")}
          ${body(`
            ${greeting(applicantName)}
            ${alertBox("#C0001A", "🌟", "Welcome to MTC Group of Companies — we are thrilled to have you on board.")}
            ${para(`On behalf of the entire MTC Group team, we are absolutely delighted to officially welcome you as our newest team member in the role of <strong>${jobTitle}</strong>.`)}
            ${details}
            ${para("Your employee profile is now being created and your onboarding process has officially commenced. You will receive further communications from our HR team regarding your induction programme, reporting structure, systems access and everything you need to get started.")}
            ${para("MTC Group of Companies is a dynamic, global organisation and we are confident you will thrive in your new role. We look forward to seeing the value and expertise you bring to the team.")}
            ${para("Once again, welcome to MTC Group of Companies. We are excited to have you with us.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    case "rejected":
      return {
        to: applicantEmail,
        subject: `Application Outcome — ${jobTitle} | MTC Group of Companies`,
        html: wrapper(`
          ${header("Application Outcome")}
          ${body(`
            ${greeting(applicantName)}
            ${para(`Thank you for your interest in the position of <strong>${jobTitle}</strong> at MTC Group of Companies, and for the time and effort you invested in your application.`)}
            ${details}
            ${para(`After careful consideration of all applications received, we regret to inform you that we will not be progressing with your application at this time.${data.rejectionReason ? ` <strong>Reason: ${data.rejectionReason}.</strong>` : ""}`)}
            ${data.rejectionNote ? para(data.rejectionNote) : ""}
            ${para("This decision was not taken lightly, and we want to assure you that we received applications from a large number of highly qualified candidates, making the selection process extremely competitive.")}
            ${para("We encourage you to continue monitoring our careers page at <a href='https://www.mtc-groups.com/careers' style='color:#C0001A;text-decoration:none;'>www.mtc-groups.com/careers</a> for future opportunities that may be a strong match for your skills and experience.")}
            ${para("We wish you every success in your career journey and thank you sincerely for considering MTC Group of Companies as a potential employer.")}
            ${signature()}
          `)}
          ${footer()}
        `)
      };

    default:
      return null;
  }
}