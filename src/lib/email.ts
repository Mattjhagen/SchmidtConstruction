import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}


export interface SendProposalEmailParams {
  to: string;
  clientName: string;
  proposalNumber: string;
  projectName: string;
  portalUrl: string;
  total: number;
  expirationDate?: string;
}

export async function sendProposalEmail({
  to,
  clientName,
  proposalNumber,
  projectName,
  portalUrl,
  total,
  expirationDate,
}: SendProposalEmailParams) {
  const formattedTotal = total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const expirationLine = expirationDate
    ? `<tr>
        <td style="padding:4px 0;color:#64748b;font-size:14px;">Proposal Expires:</td>
        <td style="padding:4px 0;color:#0f172a;font-size:14px;font-weight:600;">${new Date(expirationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
       </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Schmidt Construction Proposal</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">

          <!-- Header Banner -->
          <tr>
            <td style="background-color:#0f172a;padding:28px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${siteUrl}/logo.png" width="200" alt="Schmidt Construction Inc." style="display:block;border:0;max-width:200px;height:auto;" />
                  </td>
                  <td align="right" style="padding-left:16px;vertical-align:middle;">
                    <div style="background-color:#1d4ed8;color:#ffffff;font-size:11px;font-weight:800;padding:6px 14px;border-radius:20px;white-space:nowrap;letter-spacing:0.05em;">
                      ${proposalNumber}
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.3;">Your Proposal Is Ready</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">
                Hello <strong style="color:#0f172a;">${clientName}</strong>,
              </p>
              <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.7;">
                Thank you for the opportunity to work on your project. We have prepared a detailed proposal for <strong style="color:#0f172a;">${projectName}</strong> and it is ready for your review in our secure client portal.
              </p>

              <!-- Proposal Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Proposal Summary</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:14px;padding-right:32px;">Project:</td>
                        <td style="padding:4px 0;color:#0f172a;font-size:14px;font-weight:600;">${projectName}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:14px;padding-right:32px;">Proposal #:</td>
                        <td style="padding:4px 0;color:#0f172a;font-size:14px;font-weight:600;">${proposalNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:14px;padding-right:32px;">Estimate Total:</td>
                        <td style="padding:4px 0;color:#0f172a;font-size:18px;font-weight:800;">${formattedTotal}</td>
                      </tr>
                      ${expirationLine}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}"
                       style="display:inline-block;background-color:#1d4ed8;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:8px;letter-spacing:0.02em;">
                      View &amp; Accept Your Proposal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.7;">
                In the portal you can review the full line-item cost breakdown, select any optional upgrades, and authorize the contract with a secure digital signature — all from any device.
              </p>
              <p style="margin:0 0 28px;color:#475569;font-size:14px;line-height:1.7;">
                If you have questions or would like to request any changes, simply reply to this email or leave a comment directly in the portal feedback panel.
              </p>

              <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">
                Thank you for choosing Schmidt Construction.<br />
                We look forward to working with you.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;color:#0f172a;font-size:13px;font-weight:700;">Schmidt Construction</p>
                    <p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">Omaha, Nebraska · office@schmidtconstruction.com</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;color:#cbd5e1;font-size:11px;">Retaining Walls · Concrete · Drainage<br />Kitchen &amp; Bath Remodels</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <p style="margin:20px 0 0;color:#94a3b8;font-size:11px;text-align:center;">
          This email was sent from Schmidt Construction's estimating system.<br />
          If you did not request this proposal, please disregard this message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const replyTo = process.env.PROPOSAL_REPLY_TO;
  const overrideTo = process.env.EMAIL_OVERRIDE_TO?.trim();
  const recipient = overrideTo || to;

  const subject = overrideTo
    ? `[EMAIL OVERRIDE] Your Proposal ${proposalNumber} Is Ready — Schmidt Construction`
    : `Your Proposal ${proposalNumber} Is Ready — Schmidt Construction`;

  const overrideBanner = overrideTo
    ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="background-color:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:800;color:#713f12;">⚠ Development Override</p>
        <p style="margin:0 0 4px;font-size:13px;color:#854d0e;line-height:1.5;">
          This email was originally intended for:
        </p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#713f12;font-family:monospace;">${to}</p>
        <p style="margin:0;font-size:12px;color:#a16207;">
          It has been redirected because <code style="background:#fef08a;padding:1px 4px;border-radius:3px;">EMAIL_OVERRIDE_TO</code> is enabled.
        </p>
      </td>
    </tr>
  </table>`
    : "";

  // Insert the override banner immediately after the opening body <td> padding cell
  const htmlWithBanner = overrideBanner
    ? html.replace(
        /(<td style="padding:36px 40px;">)/,
        `$1\n${overrideBanner}`
      )
    : html;

  return await getResend().emails.send({
    from:
      process.env.PROPOSAL_FROM_EMAIL ??
      "Schmidt Construction <Mikiel@schmidt-construction.com>",
    to: recipient,
    subject,
    html: htmlWithBanner,
    ...(replyTo ? { replyTo } : {}),
  });
}

// ============================================================
// TIMESHEET EMAIL (Phase 7)
// ============================================================

export interface TimesheetRow {
  employee_name: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  total_pay: number;
}

export interface TimesheetAttachment {
  filename: string;
  content: string; // base64-encoded
}

export interface SendTimesheetEmailParams {
  to: string;
  periodFrom: string;
  periodTo: string;
  rows: TimesheetRow[];
  totals: { hours: number; overtime: number; pay: number };
  attachments: TimesheetAttachment[];
  senderName?: string;
}

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtPeriod = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export async function sendTimesheetEmail({
  to,
  periodFrom,
  periodTo,
  rows,
  totals,
  attachments,
  senderName,
}: SendTimesheetEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const rowsHtml = rows
    .map(
      (r) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;">${r.employee_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#334155;font-size:13px;text-align:right;">${r.regular_hours.toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:${r.overtime_hours > 0 ? "#d97706" : "#94a3b8"};font-size:13px;text-align:right;font-weight:${r.overtime_hours > 0 ? 700 : 400};">${r.overtime_hours.toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;text-align:right;font-weight:600;">${r.total_hours.toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#15803d;font-size:13px;text-align:right;font-weight:700;">${usd(r.total_pay)}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
        <tr><td style="background:#0f172a;padding:24px 32px;">
          <img src="${siteUrl}/logo.png" width="190" alt="Schmidt Construction" style="display:block;border:0;max-width:190px;height:auto;" />
          <p style="margin:16px 0 0;color:#fff;font-size:18px;font-weight:700;">Employee Timesheet</p>
          <p style="margin:4px 0 0;color:#cbd5e1;font-size:13px;">${fmtPeriod(periodFrom)} – ${fmtPeriod(periodTo)}</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
            Attached is the timesheet for the pay period above (PDF + CSV). A summary is included below.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            <thead><tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Employee</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;">Reg</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;">OT</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;">Total</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;">Pay</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot><tr style="background:#0f172a;">
              <td style="padding:10px 12px;color:#fff;font-size:13px;font-weight:700;">TOTALS</td>
              <td style="padding:10px 12px;"></td>
              <td style="padding:10px 12px;color:#fbbf24;font-size:13px;text-align:right;font-weight:700;">${totals.overtime.toFixed(2)}</td>
              <td style="padding:10px 12px;color:#fff;font-size:13px;text-align:right;font-weight:700;">${totals.hours.toFixed(2)}</td>
              <td style="padding:10px 12px;color:#4ade80;font-size:13px;text-align:right;font-weight:700;">${usd(totals.pay)}</td>
            </tr></tfoot>
          </table>
          <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
            Overtime is calculated per week (over 40 hours at 1.5×).${senderName ? ` Sent by ${senderName}.` : ""}
          </p>
        </td></tr>
        <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;">
          <p style="margin:0;color:#0f172a;font-size:13px;font-weight:700;">Schmidt Construction</p>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:12px;">Omaha, Nebraska · (402) 320-2600 · Mike@walls2.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const overrideTo = process.env.EMAIL_OVERRIDE_TO?.trim();
  const recipient = overrideTo || to;
  const replyTo = process.env.PROPOSAL_REPLY_TO;

  return await getResend().emails.send({
    from:
      process.env.PROPOSAL_FROM_EMAIL ??
      "Schmidt Construction <Mikiel@schmidt-construction.com>",
    to: recipient,
    subject: `Timesheet ${fmtPeriod(periodFrom)} – ${fmtPeriod(periodTo)} — Schmidt Construction`,
    html,
    attachments: attachments.map((a) => ({ filename: a.filename, content: a.content })),
    ...(replyTo ? { replyTo } : {}),
  });
}
