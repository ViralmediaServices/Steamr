// api/admin-cleanup.js
// Deletes test/broken accounts from Upstash.
// Protected by an admin secret key so only you can use it.

const KV_URL    = process.env.KV_REST_API_URL;
const KV_TOKEN  = process.env.KV_REST_API_TOKEN;
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

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
  // ── Auth check — must pass admin key ────────────────────────────────────────
  const adminKey = req.headers["x-admin-key"] || req.body?.adminKey;
  if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    // ── LIST all user accounts ─────────────────────────────────────────────────
    try {
      const { result: keys } = await kvCommand("KEYS", "user:*");
      if (!keys || keys.length === 0) {
        return res.status(200).json({ accounts: [], total: 0 });
      }

      const accounts = await Promise.all(
        keys.map(async (key) => {
          const { result } = await kvCommand("GET", key);
          try {
            const account = typeof result === "string" ? JSON.parse(result) : result;
            return {
              key,
              email:     account?.email,
              name:      account?.name,
              role:      account?.role,
              createdAt: account?.createdAt,
              verified:  account?.verified,
            };
          } catch {
            return { key, error: "Could not parse" };
          }
        })
      );

      return res.status(200).json({ accounts, total: accounts.length });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "DELETE") {
    // ── DELETE a specific account by email ────────────────────────────────────
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
      const emailKey = `user:${email.toLowerCase().trim()}`;

      // Get account to find its token
      const { result } = await kvCommand("GET", emailKey);
      if (result) {
        const account = typeof result === "string" ? JSON.parse(result) : result;
        if (account?.token) {
          await kvCommand("DEL", `token:${account.token}`);
        }
      }

      // Delete the account
      await kvCommand("DEL", emailKey);

      return res.status(200).json({ ok: true, deleted: email });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST" && req.body?.action === "delete-all-test") {
    // ── DELETE ALL accounts (nuclear option) ──────────────────────────────────
    try {
      const { result: userKeys }  = await kvCommand("KEYS", "user:*");
      const { result: tokenKeys } = await kvCommand("KEYS", "token:*");

      const allKeys = [...(userKeys || []), ...(tokenKeys || [])];

      if (allKeys.length === 0) {
        return res.status(200).json({ ok: true, deleted: 0 });
      }

      await kvCommand("DEL", ...allKeys);

      return res.status(200).json({ ok: true, deleted: allKeys.length });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
