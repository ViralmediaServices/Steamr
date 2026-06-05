// api/send-verification.js
// Receives ID photos + selfie from the KYC screen and emails them to the admin.
// Uses Resend (resend.com) — free tier: 3,000 emails/month.

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, role, docType, idFront, idBack, selfie, submittedAt } = req.body;

  if (!name || !email || !idFront || !selfie) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const docLabel =
    docType === "passport" ? "Passport"
    : docType === "drivers" ? "Driver's Licence"
    : "National ID Card";

  // ── Build the HTML email ──────────────────────────────────────────────────
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d0608;color:#fff0f3;border-radius:12px;overflow:hidden;">

      <div style="background:linear-gradient(135deg,#ff2d55,#c0163a);padding:24px 28px;">
        <h1 style="margin:0;font-size:22px;">🛡️ New KYC Verification Request</h1>
        <p style="margin:6px 0 0;opacity:0.8;font-size:14px;">Steamr Identity Verification</p>
      </div>

      <div style="padding:28px;">

        <!-- User Info -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          ${[
            ["👤 Full Name",    name],
            ["📧 Email",        email],
            ["🎭 Role",         role === "streamer" ? "Streamer" : "Viewer"],
            ["🪪 Document",     docLabel],
            ["🕐 Submitted",    submittedAt],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:10px 12px;background:#1e0f13;border-bottom:1px solid #3d1f28;font-size:13px;color:#aa8890;width:140px;">${label}</td>
              <td style="padding:10px 12px;background:#160a0d;border-bottom:1px solid #3d1f28;font-size:13px;font-weight:700;">${value}</td>
            </tr>
          `).join("")}
        </table>

        <!-- ID Front -->
        <div style="margin-bottom:20px;">
          <p style="margin:0 0 8px;font-weight:700;font-size:14px;color:#ff2d55;">
            ${docType === "passport" ? "📄 Passport Photo Page" : "📄 ID — Front"}
          </p>
          <img src="${idFront}" style="width:100%;border-radius:8px;border:2px solid #3d1f28;" alt="ID Front"/>
        </div>

        <!-- ID Back (if applicable) -->
        ${idBack ? `
        <div style="margin-bottom:20px;">
          <p style="margin:0 0 8px;font-weight:700;font-size:14px;color:#ff2d55;">📄 ID — Back</p>
          <img src="${idBack}" style="width:100%;border-radius:8px;border:2px solid #3d1f28;" alt="ID Back"/>
        </div>
        ` : ""}

        <!-- Selfie -->
        <div style="margin-bottom:24px;">
          <p style="margin:0 0 8px;font-weight:700;font-size:14px;color:#ff2d55;">🤳 Selfie Holding ID</p>
          <img src="${selfie}" style="width:100%;border-radius:8px;border:2px solid #3d1f28;" alt="Selfie"/>
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:12px;margin-top:8px;">
          <a href="mailto:${email}?subject=Your Steamr verification has been approved&body=Hi ${name},%0A%0AGreat news! Your identity has been verified and your Steamr account is now fully active.%0A%0AWelcome to Steamr!%0A%0AThe Steamr Team"
            style="display:inline-block;background:#00e5a0;color:#000;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:800;font-size:13px;">
            ✅ Approve — Email User
          </a>
          <a href="mailto:${email}?subject=Your Steamr verification needs attention&body=Hi ${name},%0A%0AWe were unable to verify your identity with the documents provided.%0A%0APlease resubmit with clear, well-lit photos of your ID and a selfie holding it.%0A%0AThe Steamr Team"
            style="display:inline-block;background:#ff2d55;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:800;font-size:13px;">
            ❌ Reject — Email User
          </a>
        </div>

      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from:    "Steamr Verification <onboarding@resend.dev>",
      to:      [process.env.ADMIN_EMAIL],
      subject: `🛡️ KYC Verification — ${name} (${role})`,
      html,
      // Reply-to the user so you can respond directly
      reply_to: email,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err.message);
    return res.status(500).json({ error: "Failed to send verification email" });
  }
}
