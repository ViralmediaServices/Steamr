// api/auth-login.js
import { createHash } from "crypto";

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

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

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailKey = `user:${email.toLowerCase().trim()}`;

  try {
    const { result } = await kvCommand("GET", emailKey);

    if (!result) {
      return res.status(401).json({ error: "No account found with that email. Please sign up first." });
    }

    const account        = JSON.parse(result);
    const hashedInput    = hashPassword(password);

    if (hashedInput !== account.password) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    // Fresh token on each login
    const token      = generateToken();
    account.token    = token;
    account.lastLogin = new Date().toISOString();

    await kvCommand("SET", emailKey, JSON.stringify(account));
    await kvCommand("SET", `token:${token}`, email.toLowerCase().trim());

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
