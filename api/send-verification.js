// api/send-verification.js
// Sends KYC verification documents to the admin email via Resend API.
// Uses Node's built-in https module — no external packages needed.

import https from "https";

function resendRequest(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: "api.resend.com",
      path:     "/emails",
      method:   "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":  "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Resend error ${res.statusCode}: ${data}`));
        }
      });
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
        <img src="${selfie}" style="width:100%;border-radius:8px;border:2px solid #3d1f28;margin-bottom:24px;" alt="Selfie"/>

        <div>
          <a href="mailto:${email}?subject=Your Steamr verification has been approved&body=Hi ${name},%0A%0AGreat news! Your identity has been verified and your Steamr account is now fully active.%0A%0AWelcome to Steamr!%0A%0AThe Steamr Team"
            style="display:inline-block;background:#00e5a0;color:#000;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:800;font-size:13px;margin-right:12px;">
            ✅ Approve — Email User
          </a>
          <a href="mailto:${email}?subject=Your Steamr verification needs attention&body=Hi ${name},%0A%0AWe were unable to verify your identity. Please resubmit with clear photos.%0A%0AThe Steamr Team"
            style="display:inline-block;background:#ff2d55;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:800;font-size:13px;">
            ❌ Reject — Email User
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    await resendRequest({
      from:     "Steamr Verification <noreply@steamr.app>",
      to:       [process.env.ADMIN_EMAIL],
      subject:  `🛡️ KYC Verification — ${name} (${role})`,
      reply_to: email,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
