import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendAuditCompleteEmail(
  to: string,
  userName: string,
  auditUrl: string,
  agent: string,
  score: number,
  grade: string
) {
  const resend = getResend();
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email");
    return;
  }

  try {
    await resend.emails.send({
      from: "SEO Agents Hub <onboarding@resend.dev>",
      to,
      subject: `Audit Complete: ${auditUrl} — Score ${score}/100 (${grade})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; line-height: 48px; color: white; font-weight: 900; font-size: 20px;">S</div>
            <h1 style="margin: 16px 0 0; font-size: 20px; color: #111;">SEO Agents Hub</h1>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center;">
            <p style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Audit Complete</p>
            <p style="font-size: 48px; font-weight: 800; margin: 0; color: ${score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'};">${score}<span style="font-size: 20px; color: #94a3b8;">/100</span></p>
            <p style="font-size: 14px; color: #64748b; margin: 8px 0 0;">Grade: <strong>${grade}</strong></p>
          </div>

          <div style="margin-top: 20px; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <table style="width: 100%; font-size: 14px; color: #334155;">
              <tr><td style="padding: 6px 0; color: #94a3b8;">URL</td><td style="padding: 6px 0; text-align: right; font-weight: 500;">${auditUrl}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Agent</td><td style="padding: 6px 0; text-align: right; font-weight: 500;">${agent}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8;">Auditor</td><td style="padding: 6px 0; text-align: right; font-weight: 500;">${userName}</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://agents-hub-fawn.vercel.app/reports" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View Full Report</a>
          </div>

          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px;">
            SEO Agents Hub — AI-Powered SEO Command Center
          </p>
        </div>
      `,
    });
    console.log(`[Email] Audit complete notification sent to ${to}`);
  } catch (err) {
    console.error("[Email] Failed to send:", err);
  }
}
