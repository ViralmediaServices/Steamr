// api/user-profile/follow.js
// Saves and removes follows in the user's Upstash profile.
// Called whenever a viewer follows or unfollows a streamer.

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

async function getEmailFromToken(token) {
  const { result } = await kvCommand("GET", `token:${token}`);
  return result || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = req.headers["x-auth-token"] || req.body?.token;
  if (!token) return res.status(401).json({ error: "No token" });

  const { streamerId, action } = req.body;
  if (!streamerId || !action) return res.status(400).json({ error: "Missing fields" });

  try {
    const email    = await getEmailFromToken(token);
    if (!email) return res.status(401).json({ error: "Invalid token" });

    const key      = `user:${email}`;
    const { result } = await kvCommand("GET", key);
    const account  = parse(result);
    if (!account) return res.status(404).json({ error: "Account not found" });

    // Update following list
    const following = new Set(account.following || []);
    if (action === "follow")   following.add(Number(streamerId));
    if (action === "unfollow") following.delete(Number(streamerId));

    account.following = [...following];
    await kvCommand("SET", key, JSON.stringify(account));

    return res.status(200).json({ ok: true, following: account.following });
  } catch (err) {
    console.error("follow error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
