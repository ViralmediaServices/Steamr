// api/auth-check.js
// Verifies a session token is valid and returns the user's account info.
// Called on app load to auto-login returning users.

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kv(command, ...args) {
  const res = await fetch(`${KV_URL}/${[command, ...args.map(a => encodeURIComponent(a))].join("/")}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "No token provided" });

  try {
    // Look up token → email
    const { result: email } = await kv("get", `token:${token}`);
    if (!email) return res.status(401).json({ error: "Session expired. Please log in again." });

    // Look up account
    const { result } = await kv("get", `user:${email}`);
    if (!result) return res.status(401).json({ error: "Account not found" });

    const account = typeof result === "string" ? JSON.parse(result) : result;

    // Return session info (never return password hash)
    return res.status(200).json({
      ok:    true,
      email: account.email,
      name:  account.name,
      role:  account.role,
    });

  } catch (err) {
    console.error("auth-check error:", err.message);
    return res.status(500).json({ error: "Session check failed" });
  }
}
