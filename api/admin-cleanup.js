// api/admin-cleanup.js
// Admin panel — list, delete accounts from Upstash
// Protected by ADMIN_SECRET_KEY env var

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

async function kvCommand(command, ...args) {
  try {
    const res = await fetch(KV_URL, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([command, ...args]),
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.error(`kvCommand ${command} failed:`, err.message);
    throw err;
  }
}

function parse(result) {
  if (!result) return null;
  if (typeof result === "object") return result;
  try { return JSON.parse(result); } catch { return null; }
}

// Use SCAN to list all user:* keys (safer than KEYS for large datasets)
async function getAllUserKeys() {
  const keys = [];
  let cursor = "0";
  do {
    const { result } = await kvCommand("SCAN", cursor, "MATCH", "user:*", "COUNT", "100");
    if (!result || !Array.isArray(result)) break;
    cursor = result[0];
    if (Array.isArray(result[1])) keys.push(...result[1]);
  } while (cursor !== "0");
  return keys;
}

export default async function handler(req, res) {
  // Allow CORS for same-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "x-admin-key, Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ── Auth check ─────────────────────────────────────────────────────────────
  const adminKey = req.headers["x-admin-key"] || req.body?.adminKey;

  if (!ADMIN_KEY) {
    console.error("ADMIN_SECRET_KEY env var not set");
    return res.status(500).json({ error: "Admin key not configured on server" });
  }

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized — invalid admin key" });
  }

  // ── GET — list all accounts ────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const keys = await getAllUserKeys();

      if (keys.length === 0) {
        return res.status(200).json({ accounts: [], total: 0 });
      }

      const accounts = await Promise.all(
        keys.map(async (key) => {
          try {
            const { result } = await kvCommand("GET", key);
            const account = parse(result);
            return {
              key,
              email:     account?.email     || key.replace("user:", ""),
              name:      account?.name      || "Unknown",
              role:      account?.role      || "unknown",
              createdAt: account?.createdAt || null,
              verified:  account?.verified  || false,
              kycStatus: account?.kycStatus || null,
            };
          } catch {
            return { key, email: key.replace("user:", ""), error: "Could not parse" };
          }
        })
      );

      return res.status(200).json({ accounts, total: accounts.length });

    } catch (err) {
      console.error("admin-cleanup GET error:", err.message);
      return res.status(500).json({ error: `Server error: ${err.message}` });
    }
  }

  // ── DELETE — remove one account ────────────────────────────────────────────
  if (req.method === "DELETE") {
    const email = req.body?.email;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      const emailKey = `user:${email.toLowerCase().trim()}`;
      const { result } = await kvCommand("GET", emailKey);
      if (result) {
        const account = parse(result);
        if (account?.token) await kvCommand("DEL", `token:${account.token}`);
        // Also clean up activity and notifications
        await kvCommand("DEL", `activity:${email.toLowerCase().trim()}`);
        await kvCommand("DEL", `notifications:${email.toLowerCase().trim()}`);
      }
      await kvCommand("DEL", emailKey);
      return res.status(200).json({ ok: true, deleted: email });

    } catch (err) {
      console.error("admin-cleanup DELETE error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — delete all (nuclear) ────────────────────────────────────────────
  if (req.method === "POST" && req.body?.action === "delete-all-test") {
    try {
      const userKeys         = await getAllUserKeys();
      const { result: toks } = await kvCommand("SCAN", "0", "MATCH", "token:*",        "COUNT", "200");
      const { result: acts } = await kvCommand("SCAN", "0", "MATCH", "activity:*",     "COUNT", "200");
      const { result: nots } = await kvCommand("SCAN", "0", "MATCH", "notifications:*","COUNT", "200");
      const { result: ress } = await kvCommand("SCAN", "0", "MATCH", "reset:*",        "COUNT", "200");

      const allKeys = [
        ...userKeys,
        ...(Array.isArray(toks?.[1]) ? toks[1] : []),
        ...(Array.isArray(acts?.[1]) ? acts[1] : []),
        ...(Array.isArray(nots?.[1]) ? nots[1] : []),
        ...(Array.isArray(ress?.[1]) ? ress[1] : []),
      ];

      if (allKeys.length === 0) return res.status(200).json({ ok: true, deleted: 0 });

      // Delete in batches of 10
      for (let i = 0; i < allKeys.length; i += 10) {
        const batch = allKeys.slice(i, i + 10);
        await kvCommand("DEL", ...batch);
      }

      return res.status(200).json({ ok: true, deleted: allKeys.length });

    } catch (err) {
      console.error("admin-cleanup DELETE-ALL error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
