// api/notify-followers.js
// Called when a streamer goes live.
// Notifies both followers (from the followers:email Set) and
// subscribers (from activity:email.subscriberEmails array), deduplicated.

import https from "https";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// ── Upstash REST helper (single-command format) ───────────────────────────────
async function kvGet(command, ...args) {
  const res = await fetch(`${KV_URL}/${[command, ...args].join("/")}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  return res.json();
}

// ── Resend email via Node https ───────────────────────────────────────────────
function sendEmail(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req  = https.request({
      hostname: "api.resend.com",
      path:     "/emails",
      method:   "POST",
      headers: {
        Authorization:   `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":  "application/json",
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

  const { streamerName, streamerEmail, streamTitle, streamUrl } = req.body;

  if (!streamerEmail || !streamerName) {
    return res.status(400).json({ error: "Missing streamerEmail or streamerName" });
  }

  try {
    // ── 1. Followers from the Redis Set ─────────────────────────────────────
    // Key: followers:${streamerEmail}  (set by follow.js on each follow action)
    const { result: followerList } = await kvGet("smembers", `followers:${streamerEmail}`);
    const followers = Array.isArray(followerList) ? followerList : [];

    // ── 2. Subscribers from the streamer's activity ──────────────────────────
    // subscriberEmails is the Set we maintain in user-profile.js
    let subscribers = [];
    try {
      const { result: actRaw } = await kvGet("get", `activity:${streamerEmail}`);
      if (actRaw) {
        const activity = typeof actRaw === "object" ? actRaw : JSON.parse(actRaw);
        subscribers = Array.isArray(activity.subscriberEmails) ? activity.subscriberEmails : [];
      }
    } catch {}

    // ── 3. Merge + deduplicate, never email the streamer themselves ──────────
    const allEmails = new Set([...followers, ...subscribers]);
    allEmails.delete(streamerEmail); // don't notify the streamer

    if (allEmails.size === 0) {
      return res.status(200).json({ sent: 0, message: "No followers or subscribers to notify" });
    }

    const watchUrl = streamUrl || "https://steamr.app";

    // ── 4. Send one email per unique address ─────────────────────────────────
    const results = await Promise.allSettled(
      [...allEmails].map(viewerEmail => {
        const isSubscriber = subscribers.includes(viewerEmail);
        const isFollower   = followers.includes(viewerEmail);
        const relation     = isSubscriber && isFollower ? "subscriber & follower"
                           : isSubscriber ? "subscriber"
                           : "follower";

        return sendEmail({
          from:     "Steamr <noreply@steamr.app>",
          to:       [viewerEmail],
          reply_to: streamerEmail,
          subject:  `🔴 ${streamerName} is live now on Steamr!`,
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
                  <div style="font-size:11px;color:#aa8890;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">Now Streaming</div>
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

                <!-- Footer -->
                <p style="margin-top:24px;font-size:11px;color:#aa8890;text-align:center;line-height:1.6;">
                  You're receiving this because you are a ${relation} of ${streamerName} on Steamr.<br/>
                  Log in to <a href="${watchUrl}" style="color:#ff2d55;">steamr.app</a> and unfollow to stop these emails.
                </p>
              </div>
            </div>
          `,
        });
      })
    );

    const sent   = results.filter(r => r.status === "fulfilled").length;
    const failed = results.length - sent;

    console.log(`📧 Notified ${sent}/${allEmails.size} people (${followers.length} followers + ${subscribers.length} subscribers, deduplicated) for ${streamerName}`);
    if (failed > 0) console.warn(`⚠️ Failed to send ${failed} emails`);

    return res.status(200).json({ sent, failed, total: allEmails.size, followers: followers.length, subscribers: subscribers.length });

  } catch (err) {
    console.error("notify-followers error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
