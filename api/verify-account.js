// api/verify-account.js
// Called when admin clicks the Approve button in the KYC email.
// Marks the user as verified in Upstash and sends them a confirmation email.

import https from "https";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

async function kvCommand(command, ...args) {
  const res = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command, ...args]),
  });
  return res.json();
}

function parseAccount(result) {
  if (!result) return null;
  if (typeof result === "object") return result;
  try { return JSON.parse(result); } catch { return null; }
}

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

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();

  // ── Verify admin key ────────────────────────────────────────────────────────
  const adminKey = req.query?.key || req.body?.key;
  if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
    return res.status(401).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d0608;color:#ff6666;">
        <h2>❌ Unauthorized</h2>
        <p>Invalid admin key.</p>
      </body></html>
    `);
  }

  const email = req.query?.email || req.body?.email;
  if (!email) {
    return res.status(400).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d0608;color:#ff6666;">
        <h2>❌ Missing email</h2>
      </body></html>
    `);
  }

  const emailKey = `user:${email.toLowerCase().trim()}`;

  try {
    // Get account from Upstash
    const { result } = await kvCommand("GET", emailKey);
    const account    = parseAccount(result);

    if (!account) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d0608;color:#ff6666;">
          <h2>❌ Account not found</h2>
          <p>${email}</p>
        </body></html>
      `);
    }

    if (account.verified) {
      return res.status(200).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d0608;color:#00e5a0;">
          <h2>✅ Already Verified</h2>
          <p>${email} was already approved.</p>
        </body></html>
      `);
    }

    // Mark as verified
    account.verified   = true;
    account.verifiedAt = new Date().toISOString();
    await kvCommand("SET", emailKey, JSON.stringify(account));

    // Write a real notification for the user
    const notifKey   = `notifications:${email.toLowerCase().trim()}`;
    const { result: existingNotifs } = await kvCommand("GET", notifKey);
    const notifList  = (() => { try { return JSON.parse(existingNotifs||"[]"); } catch { return []; } })();
    notifList.unshift({
      id:      Date.now(),
      type:    "verified",
      message: "🎉 Your identity has been verified! Your account is now fully active.",
      read:    false,
      time:    new Date().toISOString(),
    });
    await kvCommand("SET", notifKey, JSON.stringify(notifList.slice(0,50)));

    // Send approval email to user
    await sendEmail({
      from:    "Steamr <noreply@steamr.app>",
      to:      [email],
      subject: "✅ Your Steamr account has been verified!",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0d0608;color:#fff0f3;border-radius:14px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#00e5a0,#00b37a);padding:28px;">
            <div style="font-size:40px;margin-bottom:10px;">✅</div>
            <h1 style="margin:0;font-size:24px;font-weight:900;color:#000;">You're Verified!</h1>
            <p style="margin:8px 0 0;color:#00000099;font-size:14px;">Your Steamr account is now fully active</p>
          </div>
          <div style="padding:28px;">
            <p style="color:#aa8890;font-size:14px;line-height:1.7;margin:0 0 20px;">
              Hi <strong style="color:#fff0f3;">${account.name}</strong>,<br/><br/>
              Great news! Your identity has been verified and your Steamr account is now fully active.
              ${account.role === "streamer"
                ? "You can now go live, receive tips, and get paid for your streams!"
                : "You can now browse streams, tip your favourite creators, and subscribe to fan clubs!"}
            </p>
            <a href="https://steamr.app" style="display:block;background:linear-gradient(135deg,#ff2d55,#c0163a);color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;">
              Go to Steamr →
            </a>
            <p style="margin-top:20px;font-size:11px;color:#aa8890;text-align:center;">
              steamr.app · Questions? Reply to this email
            </p>
          </div>
        </div>
      `,
    });

    // Return success page
    return res.status(200).send(`
      <html>
      <head><style>
        body { font-family:sans-serif; text-align:center; padding:60px; background:#0d0608; color:#fff0f3; }
        h2   { color:#00e5a0; font-size:28px; margin-bottom:12px; }
        p    { color:#aa8890; font-size:15px; line-height:1.7; }
        .card { background:#1e0f13; border:1px solid #3d1f28; border-radius:14px; padding:32px; max-width:420px; margin:0 auto; }
      </style></head>
      <body>
        <div class="card">
          <div style="font-size:48px;margin-bottom:16px;">✅</div>
          <h2>Account Approved!</h2>
          <p><strong style="color:#fff0f3;">${account.name}</strong> (${email}) has been verified.<br/><br/>
          A confirmation email has been sent to them from <strong style="color:#ff2d55;">noreply@steamr.app</strong>.</p>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("verify-account error:", err.message);
    return res.status(500).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d0608;color:#ff6666;">
        <h2>❌ Error</h2><p>${err.message}</p>
      </body></html>
    `);
  }
}
