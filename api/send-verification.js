// api/send-verification.js
// Sends KYC documents to admin and includes a one-click Approve button
// that automatically verifies the account in Upstash.

import https from "https";

function resendRequest(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req  = https.request({
      hostname: "api.resend.com",
      path:     "/emails",
      method:   "POST",
      headers: {
        Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (r) => {
      let data = "";
      r.on("data", c => (data += c));
      r.on("end",  () => resolve(JSON.parse(data)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

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

  // One-click approve URL — calls verify-account API automatically
  const approveUrl = `https://steamr.app/api/verify-account?email=${encodeURIComponent(email)}&key=${encodeURIComponent(process.env.ADMIN_SECRET_KEY)}`;

  // Manual reject email link
  const rejectUrl = `mailto:${email}?subject=Your Steamr verification needs attention&body=Hi ${name},%0A%0AWe were unable to verify your identity. Please resubmit with clear, well-lit photos of your ID and a selfie holding it.%0A%0AThe Steamr Team`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d0608;color:#fff0f3;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#ff2d55,#c0163a);padding:24px 28px;">
        <h1 style="margin:0;font-size:22px;">🛡️ New KYC Verification Request</h1>
        <p style="margin:6px 0 0;opacity:0.8;font-size:14px;">Steamr Identity Verification</p>
      </div>
      <div style="padding:28px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:10px 12px;background:#1e0f13;border-bottom:1px solid #3d1f28;font-size:13px;color:#aa8890;width:140px;">👤 Full Name</td><td style="padding:10px 12px;background:#160a0d;border-bottom:1px solid #3d1f28;font-size:13px;font-weight:700;">${name}</td></tr>
          <tr><td style="padding:10px 12px;background:#1e0f13;border-bottom:1px solid #3d1f28;font-size:13px;color:#aa8890;">📧 Email</td><td style="padding:10px 12px;background:#160a0d;border-bottom:1px solid #3d1f28;font-size:13px;font-weight:700;">${email}</td></tr>
          <tr><td style="padding:10px 12px;background:#1e0f13;border-bottom:1px solid #3d1f28;font-size:13px;color:#aa8890;">🎭 Role</td><td style="padding:10px 12px;background:#160a0d;border-bottom:1px solid #3d1f28;font-size:13px;font-weight:700;">${role === "streamer" ? "Streamer" : "Viewer"}</td></tr>
          <tr><td style="padding:10px 12px;background:#1e0f13;border-bottom:1px solid #3d1f28;font-size:13px;color:#aa8890;">🪪 Document</td><td style="padding:10px 12px;background:#160a0d;border-bottom:1px solid #3d1f28;font-size:13px;font-weight:700;">${docLabel}</td></tr>
          <tr><td style="padding:10px 12px;background:#1e0f13;border-bottom:1px solid #3d1f28;font-size:13px;color:#aa8890;">🕐 Submitted</td><td style="padding:10px 12px;background:#160a0d;border-bottom:1px solid #3d1f28;font-size:13px;font-weight:700;">${submittedAt}</td></tr>
        </table>

        <p style="font-weight:700;font-size:14px;color:#ff2d55;margin:0 0 8px;">
          ${docType === "passport" ? "📄 Passport Photo Page" : "📄 ID — Front"}
        </p>
        <img src="${idFront}" style="width:100%;border-radius:8px;border:2px solid #3d1f28;margin-bottom:20px;" alt="ID Front"/>

        ${idBack ? `
        <p style="font-weight:700;font-size:14px;color:#ff2d55;margin:0 0 8px;">📄 ID — Back</p>
        <img src="${idBack}" style="width:100%;border-radius:8px;border:2px solid #3d1f28;margin-bottom:20px;" alt="ID Back"/>
        ` : ""}

        <p style="font-weight:700;font-size:14px;color:#ff2d55;margin:0 0 8px;">🤳 Selfie Holding ID</p>
        <img src="${selfie}" style="width:100%;border-radius:8px;border:2px solid #3d1f28;margin-bottom:28px;" alt="Selfie"/>

        <!-- Action buttons -->
        <div style="margin-bottom:24px;">
          <a href="${approveUrl}"
            style="display:inline-block;background:#00e5a0;color:#000;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:900;font-size:14px;margin-right:12px;">
            ✅ Approve — Auto Verify Account
          </a>
          <a href="${rejectUrl}"
            style="display:inline-block;background:#ff2d55;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:900;font-size:14px;">
            ❌ Reject — Email User
          </a>
        </div>

        <p style="font-size:11px;color:#aa8890;line-height:1.6;">
          Clicking ✅ Approve will automatically verify this account in Upstash and send a confirmation email to the user from noreply@steamr.app.
        </p>
      </div>
    </div>
  `;

  try {
    await resendRequest({
      from:     "Steamr Verification <noreply@steamr.app>",
      to:       [process.env.ADMIN_EMAIL],
      subject:  `🛡️ KYC Verification — ${name} (${role})`,
      reply_to: "noreply@steamr.app",
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
