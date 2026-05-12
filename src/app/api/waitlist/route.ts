import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type WaitlistPayload = {
  name?: string;
  email?: string;
  company?: string;
  teamSize?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as WaitlistPayload;
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const company = payload.company?.trim();
  const teamSize = payload.teamSize?.trim();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and work email are required." },
      { status: 400 },
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeCompany = escapeHtml(company || "Not provided");
  const safeTeamSize = escapeHtml(teamSize || "Not provided");

  const { error } = await resend.emails.send({
    from: "The Bragi <noreply@thebragi.com>",
    to: "hello@thebragi.com",
    replyTo: email,
    subject: `New Bragi waitlist signup: ${name}`,
    html: `
      <div style="margin:0;padding:32px;background:#050705;font-family:Arial,Helvetica,sans-serif;color:#f4fff7;">
        <div style="max-width:620px;margin:0 auto;border:1px solid #1d3324;border-radius:24px;overflow:hidden;background:#090c09;">
          <div style="padding:28px 30px;border-bottom:1px solid #1d3324;background:linear-gradient(135deg,#0b130d 0%,#14281b 100%);">
            <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:#7dc890;">
              New early access request
            </p>
            <h1 style="margin:0;font-size:30px;line-height:1.15;color:#ffffff;">
              ${safeName} joined the Bragi waitlist
            </h1>
          </div>

          <div style="padding:28px 30px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid #16251a;color:#7d8f82;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;">Name</td>
                <td style="padding:14px 0;border-bottom:1px solid #16251a;color:#ffffff;font-size:16px;text-align:right;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid #16251a;color:#7d8f82;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;">Work email</td>
                <td style="padding:14px 0;border-bottom:1px solid #16251a;color:#ffffff;font-size:16px;text-align:right;">
                  <a href="mailto:${safeEmail}" style="color:#9fe0ae;text-decoration:none;">${safeEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid #16251a;color:#7d8f82;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;">Company</td>
                <td style="padding:14px 0;border-bottom:1px solid #16251a;color:#ffffff;font-size:16px;text-align:right;">${safeCompany}</td>
              </tr>
              <tr>
                <td style="padding:14px 0;color:#7d8f82;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;">Team size</td>
                <td style="padding:14px 0;color:#ffffff;font-size:16px;text-align:right;">${safeTeamSize}</td>
              </tr>
            </table>

          </div>

          <div style="padding:18px 30px;border-top:1px solid #1d3324;color:#657467;font-size:12px;">
            © 2026 Bragi | Built by Geekonomy
          </div>
        </div>
      </div>
    `,
    text: [
      "New Bragi waitlist signup",
      "",
      `Name: ${name}`,
      `Work email: ${email}`,
      `Company: ${company || "Not provided"}`,
      `Team size: ${teamSize || "Not provided"}`,
    ].join("\n"),
  });

  if (error) {
    return NextResponse.json(
      { error: "Unable to send waitlist email." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
