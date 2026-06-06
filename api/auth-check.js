// api/auth-check.js
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "No token provided" });

  try {
    // Token → email
    const { result: email } = await kvCommand("GET", `token:${token}`);
    if (!email) {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    // Email → account
    const { result } = await kvCommand("GET", `user:${email}`);
    if (!result) {
      return res.status(401).json({ error: "Account not found." });
    }

    const account = JSON.parse(result);

    return res.status(200).json({
      ok:    true,
      email: account.email,
      name:  account.name,
      role:  account.role,
    });

  } catch (err) {
    console.error("auth-check error:", err.message);
    return res.status(500).json({ error: "Session check failed." });
  }
}
