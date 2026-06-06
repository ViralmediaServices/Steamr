// api/notify-followers.js
// Called when a streamer goes live.
// Reads all followers from Vercel KV and emails each one via Resend.
// Uses no external npm packages.

import https from "https";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// ── Vercel KV helper ─────────────────────────────────────────────────────────
async function kvGet(command, ...args) {
  const res = await fetch(`${KV_URL}/${[command, ...args].join("/")}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  return res.json();
}

// ── Resend email via Node https (no package needed) ───────────────────────────
function sendEmail(payload) {
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

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { streamerId, streamerName, streamerEmail, streamTitle, streamUrl } = req.body;

  if (!streamerId || !streamerName) {
    return res.status(400).json({ error: "Missing streamerId or streamerName" });
  }

  try {
    // Get all follower emails from KV
    const { result: followers } = await kvGet("smembers", `followers:${streamerId}`);

    if (!followers || followers.length === 0) {
      return res.status(200).json({ sent: 0, message: "No followers to notify" });
    }

    // Send email to each follower
    const watchUrl = `${streamUrl || "https://steamr.app"}`;

    const results = await Promise.allSettled(
      followers.map(viewerEmail =>
        sendEmail({
          from:    "Steamr <noreply@steamr.app>",
          to:      [viewerEmail],
          subject: `🔴 ${streamerName} is live now on Steamr!`,
          reply_to: streamerEmail,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0d0608;color:#fff0f3;border-radius:14px;overflow:hidden;">

              <!-- Header -->
              <div style="background:linear-gradient(135deg,#ff2d55,#c0163a);padding:28px 28px 20px;">
                <div style="font-size:32px;margin-bottom:8px;">🔴</div>
                <h1 style="margin:0;font-size:24px;font-weight:900;">${streamerName} is live!</h1>
                <p style="margin:8px 0 0;opacity:0.85;font-size:14px;">Your favourite streamer just went live on Steamr</p>
              </div>

              <!-- Body -->
              <div style="padding:28px;">
                ${streamTitle ? `
                <div style="background:#1e0f13;border:1px solid #3d1f28;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
                  <div style="font-size:11px;color:#aa8890;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Streaming</div>
                  <div style="font-size:16px;font-weight:700;">${streamTitle}</div>
                </div>
                ` : ""}

                <p style="color:#aa8890;font-size:14px;line-height:1.7;margin:0 0 24px;">
                  Don't miss out — jump in now and show your support with tips, reactions and messages!
                </p>

                <!-- CTA Button -->
                <a href="${watchUrl}" style="display:block;background:linear-gradient(135deg,#ff2d55,#c0163a);color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;letter-spacing:-0.3px;">
                  Watch Live Now →
                </a>

                <!-- Unsubscribe note -->
                <p style="margin-top:24px;font-size:11px;color:#aa8890;text-align:center;line-height:1.6;">
                  You're receiving this because you follow ${streamerName} on Steamr.<br/>
                  Log in to <a href="${watchUrl}" style="color:#ff2d55;">steamr.app</a> and unfollow to stop these emails.
                </p>
              </div>
            </div>
          `,
        })
      )
    );

    const sent   = results.filter(r => r.status === "fulfilled").length;
    const failed = results.length - sent;

    console.log(`📧 Notified ${sent}/${followers.length} followers of ${streamerName}`);
    if (failed > 0) console.warn(`⚠️ Failed to send ${failed} emails`);

    return res.status(200).json({ sent, failed, total: followers.length });

  } catch (err) {
    console.error("notify-followers error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
