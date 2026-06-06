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

// Safely parse result whether it comes back as string or object
function parseAccount(result) {
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

    const account = parseAccount(result);

    if (!account) {
      console.error("Could not parse account for:", email);
      return res.status(500).json({ error: "Account data error. Please contact support." });
    }

    if (!account.password) {
      console.error("Account missing password field for:", email, "Keys:", Object.keys(account));
      return res.status(500).json({ error: "Account data incomplete. Please sign up again." });
    }

    const hashedInput = hashPassword(password);

    // Debug log (remove after confirming it works)
    console.log("Login attempt for:", email);
    console.log("Hash match:", hashedInput === account.password);

    if (hashedInput !== account.password) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    const token       = generateToken();
    account.token     = token;
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
