// api/auth-login.js
// Verifies email + password against Upstash Redis.
// Returns a session token on success.

import { createHash } from "crypto";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

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

function hashPassword(password) {
  return createHash("sha256").update(password + (process.env.PASSWORD_SALT || "steamr_salt_2026")).digest("hex");
}

function generateToken() {
  return createHash("sha256").update(Math.random().toString() + Date.now().toString()).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailKey = `user:${email.toLowerCase().trim()}`;

  try {
    // Look up account
    const { result } = await kv("get", emailKey);

    if (!result) {
      return res.status(401).json({ error: "No account found with that email" });
    }

    // Parse account
    const account = typeof result === "string" ? JSON.parse(result) : result;

    // Check password
    const hashedInput = hashPassword(password);
    if (hashedInput !== account.password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate fresh session token
    const token = generateToken();

    // Save new token
    await kvSet(`token:${token}`, email.toLowerCase().trim());

    // Update account with new token
    account.token     = token;
    account.lastLogin = new Date().toISOString();
    await kvSet(emailKey, JSON.stringify(account));

    // Return session (never return password hash)
    return res.status(200).json({
      ok:    true,
      token,
      email: account.email,
      name:  account.name,
      role:  account.role,
    });

  } catch (err) {
    console.error("auth-login error:", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
}
