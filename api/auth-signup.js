// api/auth-signup.js
// Creates a new user account in Upstash Redis.
// Password is hashed with SHA-256 before storing — never stored in plain text.

import { createHash } from "crypto";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// ── Upstash REST helper ───────────────────────────────────────────────────────
async function kv(command, ...args) {
  const res = await fetch(`${KV_URL}/${[command, ...args.map(a => encodeURIComponent(a))].join("/")}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  return res.json();
}

async function kvSet(key, value) {
  const res = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  return res.json();
}

// ── Hash password ─────────────────────────────────────────────────────────────
function hashPassword(password) {
  return createHash("sha256").update(password + process.env.PASSWORD_SALT || "steamr_salt_2026").digest("hex");
}

// ── Generate session token ────────────────────────────────────────────────────
function generateToken() {
  return createHash("sha256").update(Math.random().toString() + Date.now().toString()).digest("hex");
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
    const existing = await kv("get", emailKey);
    if (existing.result) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    // Hash password + create account
    const hashedPassword = hashPassword(password);
    const token          = generateToken();
    const account = {
      email:     email.toLowerCase().trim(),
      name,
      role,
      password:  hashedPassword,
      token,
      createdAt: new Date().toISOString(),
      verified:  false,
    };

    // Save account to Upstash
    await kvSet(emailKey, JSON.stringify(account));

    // Save token → email mapping for session lookup
    await kvSet(`token:${token}`, email.toLowerCase().trim());

    // Return session (never return password hash)
    return res.status(200).json({
      ok:    true,
      token,
      email: account.email,
      name:  account.name,
      role:  account.role,
    });

  } catch (err) {
    console.error("auth-signup error:", err.message);
    return res.status(500).json({ error: "Signup failed. Please try again." });
  }
}
