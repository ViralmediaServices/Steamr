// api/notifications.js
// GET  — fetch notifications for the logged-in user
// POST — add a new notification for a user (called internally by other APIs)

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

function parseResult(result) {
  if (!result) return null;
  if (typeof result === "object") return result;
  try { return JSON.parse(result); } catch { return null; }
}

// Look up user email from session token
async function getEmailFromToken(token) {
  if (!token) return null;
  const { result } = await kvCommand("GET", `token:${token}`);
  return result || null;
}

export default async function handler(req, res) {

  // ── GET — fetch user's notifications ─────────────────────────────────────
  if (req.method === "GET") {
    const token = req.headers["x-auth-token"] || req.query?.token;
    if (!token) return res.status(401).json({ error: "No token" });

    try {
      const email = await getEmailFromToken(token);
      if (!email) return res.status(401).json({ error: "Invalid token" });

      const key           = `notifications:${email}`;
      const { result }    = await kvCommand("GET", key);
      const notifications = parseResult(result) || [];

      return res.status(200).json({ ok: true, notifications });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — add a notification for a user ─────────────────────────────────
  if (req.method === "POST") {
    const { email, type, message, link } = req.body;
    if (!email || !type || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      const key           = `notifications:${email}`;
      const { result }    = await kvCommand("GET", key);
      const notifications = parseResult(result) || [];

      // Add new notification at the top
      notifications.unshift({
        id:      Date.now(),
        type,
        message,
        link:    link || null,
        read:    false,
        time:    new Date().toISOString(),
      });

      // Keep max 50 notifications per user
      const trimmed = notifications.slice(0, 50);
      await kvCommand("SET", key, JSON.stringify(trimmed));

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH — mark notifications as read ────────────────────────────────────
  if (req.method === "PATCH") {
    const token = req.headers["x-auth-token"] || req.body?.token;
    const { markAllRead, notificationId } = req.body;

    try {
      const email = await getEmailFromToken(token);
      if (!email) return res.status(401).json({ error: "Invalid token" });

      const key           = `notifications:${email}`;
      const { result }    = await kvCommand("GET", key);
      const notifications = parseResult(result) || [];

      const updated = notifications.map(n => {
        if (markAllRead) return { ...n, read: true };
        if (notificationId && n.id === notificationId) return { ...n, read: true };
        return n;
      });

      await kvCommand("SET", key, JSON.stringify(updated));
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
