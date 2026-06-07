// api/auth-login.js
// Handles: login, forgot password, reset password

import { createHash } from "crypto";
import https from "https";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvCommand(command, ...args) {
  const res = await fetch(KV_URL, {
    method:  "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body:    JSON.stringify([command, ...args]),
  });
  return res.json();
}

function parse(result) {
  if (!result) return null;
  if (typeof result === "object") return result;
  try { return JSON.parse(result); } catch { return null; }
}

function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || "steamr_salt_2026";
  return createHash("sha256").update(password + salt).digest("hex");
}

function generateToken() {
  return createHash("sha256")
    .update(Math.random().toString() + Date.now().toString())
    .digest("hex");
}

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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { action, email, password, token, newPassword } = req.body;

  // ── Forgot password ────────────────────────────────────────────────────────
  if (action === "forgot") {
    if (!email) return res.status(400).json({ error: "Email is required." });

    try {
      const emailKey     = `user:${email.toLowerCase().trim()}`;
      const { result }   = await kvCommand("GET", emailKey);
      const account      = parse(result);

      // Always return ok to prevent email enumeration
      if (!account) return res.status(200).json({ ok: true });

      const resetToken   = generateToken();
      const expiry       = Date.now() + 30 * 60 * 1000; // 30 minutes

      await kvCommand("SET", `reset:${resetToken}`, JSON.stringify({ email: email.toLowerCase().trim(), expiry }));

      const resetUrl = `https://steamr.app?reset=${resetToken}`;

      await sendEmail({
        from:    "Steamr <noreply@steamr.app>",
        to:      [email.trim()],
        subject: "🔑 Reset your Steamr password",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0d0608;color:#fff0f3;border-radius:14px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#ff2d55,#c0163a);padding:28px;text-align:center;">
              <div style="font-size:36px;margin-bottom:10px;">🔑</div>
              <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">Reset Your Password</h1>
            </div>
            <div style="padding:28px;">
              <p style="color:#aa8890;font-size:14px;line-height:1.7;margin:0 0 24px;">
                Hi <strong style="color:#fff0f3;">${account.name || "there"}</strong>,<br/><br/>
                We received a request to reset your Steamr password. Click the button below to choose a new one. This link expires in <strong style="color:#ff2d55;">30 minutes</strong>.
              </p>
              <a href="${resetUrl}"
                style="display:block;background:linear-gradient(135deg,#ff2d55,#c0163a);color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:900;font-size:16px;margin-bottom:20px;">
                Reset Password →
              </a>
              <p style="font-size:12px;color:#aa8890;line-height:1.6;">
                If you didn't request this, you can safely ignore this email — your password won't change.<br/><br/>
                Or copy this link: <span style="color:#ff2d55;word-break:break-all;">${resetUrl}</span>
              </p>
            </div>
          </div>
        `,
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("forgot password error:", err.message);
      return res.status(500).json({ error: "Could not send reset email. Try again." });
    }
  }

  // ── Reset password ────────────────────────────────────────────────────────
  if (action === "reset") {
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    try {
      const { result: resetData } = await kvCommand("GET", `reset:${token}`);
      const reset = parse(resetData);

      if (!reset) return res.status(400).json({ error: "Reset link is invalid or has already been used." });
      if (Date.now() > reset.expiry) return res.status(400).json({ error: "This reset link has expired. Please request a new one." });

      const emailKey     = `user:${reset.email}`;
      const { result }   = await kvCommand("GET", emailKey);
      const account      = parse(result);
      if (!account) return res.status(404).json({ error: "Account not found." });

      // Update password
      account.password = hashPassword(newPassword);
      await kvCommand("SET", emailKey, JSON.stringify(account));

      // Delete the reset token so it can't be reused
      await kvCommand("DEL", `reset:${token}`);

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("reset password error:", err.message);
      return res.status(500).json({ error: "Reset failed. Please try again." });
    }
  }

  // ── Normal login ──────────────────────────────────────────────────────────
  const loginEmail = email?.trim().toLowerCase();
  if (!loginEmail || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { result } = await kvCommand("GET", `user:${loginEmail}`);
    if (!result) {
      return res.status(401).json({ error: "No account found with that email. Please sign up first." });
    }

    const account     = parse(result);
    if (!account) return res.status(500).json({ error: "Account data error." });

    const hashedInput = hashPassword(password);
    if (hashedInput !== account.password) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    const newToken    = generateToken();
    account.token     = newToken;
    account.lastLogin = new Date().toISOString();

    await kvCommand("SET", `user:${loginEmail}`, JSON.stringify(account));
    await kvCommand("SET", `token:${newToken}`,  loginEmail);

    return res.status(200).json({
      ok:    true,
      token: newToken,
      email: account.email,
      name:  account.name,
      role:  account.role,
    });
  } catch (err) {
    console.error("auth-login error:", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}
