// api/auth-signup.js
import { createHash } from "crypto";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// ── Correct Upstash REST API format ──────────────────────────────────────────
async function kvCommand(command, ...args) {
  const res = await fetch(KV_URL, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command, ...args]),
  });
  return res.json();
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const emailKey = `user:${email.toLowerCase().trim()}`;

  try {
    // Check if account already exists
    const { result: existing } = await kvCommand("GET", emailKey);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists. Please log in." });
    }

    const hashedPassword = hashPassword(password);
    const token          = generateToken();
    const account        = JSON.stringify({
      email:     email.toLowerCase().trim(),
      name,
      role,
      password:  hashedPassword,
      token,
      createdAt: new Date().toISOString(),
      verified:  false,
    });

    // Save account + token mapping
    await kvCommand("SET", emailKey, account);
    await kvCommand("SET", `token:${token}`, email.toLowerCase().trim());

    return res.status(200).json({ ok: true, token, email: email.toLowerCase().trim(), name, role });

  } catch (err) {
    console.error("auth-signup error:", err.message);
    return res.status(500).json({ error: "Signup failed. Please try again." });
  }
}
