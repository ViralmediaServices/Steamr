// api/user-profile.js
// GET  — load the logged-in user's profile from Upstash
// POST — update profile data (displayName, bio, avatarImg)

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
  if (!token) return null;
  const { result } = await kvCommand("GET", `token:${token}`);
  return result || null;
}

export default async function handler(req, res) {
  const token = req.headers["x-auth-token"] || req.query?.token || req.body?.token;
  if (!token) return res.status(401).json({ error: "No token provided" });

  const email = await getEmailFromToken(token);
  if (!email) return res.status(401).json({ error: "Invalid session" });

  const accountKey  = `user:${email}`;
  const activityKey = `activity:${email}`;

  // ── GET — load full profile ───────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const [{ result: accResult }, { result: actResult }] = await Promise.all([
        kvCommand("GET", accountKey),
        kvCommand("GET", activityKey),
      ]);

      const account  = parse(accResult);
      const activity = parse(actResult) || {
        tokenBalance: 350,
        totalSpent:   0,
        tipsCount:    0,
        tipHistory:   [],
        giftsCount:   0,
        achievements: [],
      };

      if (!account) return res.status(404).json({ error: "Account not found" });

      return res.status(200).json({
        ok: true,
        profile: {
          email:        account.email,
          name:         account.name,
          displayName:  account.displayName  || account.name,
          username:     account.username     || account.email.split("@")[0],
          bio:          account.bio          || "",
          avatarImg:    account.avatarImg    || null,
          role:         account.role,
          joinDate:     account.createdAt    ? new Date(account.createdAt).toLocaleDateString("en-US", { month:"long", year:"numeric" }) : "Recently",
          verified:     account.verified     || false,
          verifiedAt:   account.verifiedAt   || null,
        },
        activity: {
          tokenBalance: activity.tokenBalance || 350,
          totalSpent:   activity.totalSpent   || 0,
          tipsCount:    activity.tipsCount    || 0,
          tipHistory:   activity.tipHistory   || [],
          giftsCount:   activity.giftsCount   || 0,
          achievements: activity.achievements || [],
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — update profile fields ──────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const { displayName, bio, avatarImg, username } = req.body;

      const { result: accResult } = await kvCommand("GET", accountKey);
      const account = parse(accResult);
      if (!account) return res.status(404).json({ error: "Account not found" });

      // Update only provided fields
      if (displayName !== undefined) account.displayName = displayName;
      if (bio         !== undefined) account.bio         = bio;
      if (avatarImg   !== undefined) account.avatarImg   = avatarImg;
      if (username    !== undefined) account.username    = username;

      await kvCommand("SET", accountKey, JSON.stringify(account));

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
