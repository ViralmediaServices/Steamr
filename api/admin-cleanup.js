// api/admin-cleanup.js
// Admin-only endpoint. Requires x-admin-key header matching ADMIN_SECRET_KEY env var.
//
// GET  → list all user accounts (with verified/kycStatus fields)
// DELETE { email } → delete one account
// POST { action:"delete-all-test" } → delete all accounts
// PATCH { action:"verify", email } → mark account as verified / approve KYC

const KV_URL    = process.env.KV_REST_API_URL;
const KV_TOKEN  = process.env.KV_REST_API_TOKEN;
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

async function kvCommand(cmd, ...args) {
  const res = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([cmd, ...args]),
  });
  const json = await res.json();
  return json.result;
}

function parseAccount(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

export default async function handler(req, res) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const adminKey = req.headers["x-admin-key"];
  if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ── GET — list all accounts ───────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      // SCAN for all user:* keys
      let cursor = "0";
      const userKeys = [];
      do {
        const result = await kvCommand("SCAN", cursor, "MATCH", "user:*", "COUNT", "100");
        cursor   = Array.isArray(result) ? result[0] : "0";
        const keys = Array.isArray(result) ? result[1] : [];
        userKeys.push(...keys);
      } while (cursor !== "0");

      // Fetch each account in parallel
      const accounts = (
        await Promise.all(
          userKeys.map(async (key) => {
            const raw  = await kvCommand("GET", key);
            const acct = parseAccount(raw);
            if (!acct) return null;
            return {
              key,
              email:      acct.email     || key.replace("user:", ""),
              name:       acct.name      || acct.displayName || "",
              role:       acct.role      || "viewer",
              createdAt:  acct.createdAt || null,
              verified:   acct.verified  || false,
              kycStatus:  acct.kycStatus || null,
            };
          })
        )
      ).filter(Boolean);

      // Sort: streamer first, then by email
      accounts.sort((a, b) => {
        if (a.role === "streamer" && b.role !== "streamer") return -1;
        if (a.role !== "streamer" && b.role === "streamer") return 1;
        return (a.email || "").localeCompare(b.email || "");
      });

      return res.status(200).json({ ok: true, accounts });
    } catch (err) {
      console.error("admin-cleanup GET error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH — verify / approve KYC for an account ───────────────────────────
  if (req.method === "PATCH") {
    try {
      const { action, email } = req.body || {};
      if (action !== "verify" || !email) {
        return res.status(400).json({ error: "Missing action:verify or email" });
      }

      const emailKey = `user:${email.toLowerCase().trim()}`;
      const raw      = await kvCommand("GET", emailKey);
      const account  = parseAccount(raw);

      if (!account) {
        return res.status(404).json({ error: `Account not found: ${email}` });
      }

      // Mark verified and approve KYC
      account.verified      = true;
      account.verifiedAt    = new Date().toISOString();
      account.kycStatus     = "approved";
      account.kycApprovedAt = new Date().toISOString();

      await kvCommand("SET", emailKey, JSON.stringify(account));

      console.log(`Admin verified account: ${email}`);
      return res.status(200).json({ ok: true, email, verified: true });
    } catch (err) {
      console.error("admin-cleanup PATCH error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE — remove one account ───────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: "Missing email" });

      const emailKey = `user:${email.toLowerCase().trim()}`;
      await kvCommand("DEL", emailKey);

      return res.status(200).json({ ok: true, deleted: email });
    } catch (err) {
      console.error("admin-cleanup DELETE error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — bulk delete all test accounts ──────────────────────────────────
  if (req.method === "POST") {
    try {
      const { action } = req.body || {};
      if (action !== "delete-all-test") {
        return res.status(400).json({ error: "Unknown action" });
      }

      let cursor = "0";
      const userKeys = [];
      do {
        const result = await kvCommand("SCAN", cursor, "MATCH", "user:*", "COUNT", "100");
        cursor   = Array.isArray(result) ? result[0] : "0";
        const keys = Array.isArray(result) ? result[1] : [];
        userKeys.push(...keys);
      } while (cursor !== "0");

      let deleted = 0;
      for (const key of userKeys) {
        await kvCommand("DEL", key);
        deleted++;
      }

      return res.status(200).json({ ok: true, deleted });
    } catch (err) {
      console.error("admin-cleanup POST error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
