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
          following:       account.following       || [],
          streamerProfile: account.streamerProfile || null,
        },
        activity: {
          tokenBalance:  activity.tokenBalance  || 350,
          totalSpent:    activity.totalSpent    || 0,
          tipsCount:     activity.tipsCount     || 0,
          tipHistory:    activity.tipHistory    || [],
          giftsCount:    activity.giftsCount    || 0,
          achievements:  activity.achievements  || [],
          subscriptions:  activity.subscriptions  || {},
          ppvPurchased:   activity.ppvPurchased   || [],
          // Streamer stats
          todayTokens:    activity.todayTokens    || 0,
          weekTokens:     activity.weekTokens     || 0,
          monthTokens:    activity.monthTokens    || 0,
          allTimeTokens:  activity.allTimeTokens  || 0,
          totalStreams:    activity.totalStreams    || 0,
          hoursStreamed:   activity.hoursStreamed   || 0,
          peakViewers:    activity.peakViewers     || 0,
          followers:      activity.followers       || 0,
          subscribers:    activity.subscribers     || 0,
          payoutHistory:  activity.payoutHistory   || [],
        },
      });
    } catch (err) {
      console.error("user-profile GET error:", err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — update profile fields OR follow/unfollow a streamer ──────────────
  if (req.method === "POST") {
    try {
      const { displayName, bio, avatarImg, username, streamerId, action } = req.body;

      const { result: accResult } = await kvCommand("GET", accountKey);
      const account = parse(accResult);
      if (!account) return res.status(404).json({ error: "Account not found" });

      // Follow / unfollow action
      if (streamerId && action) {
        const following = new Set(account.following || []);
        if (action === "follow")   following.add(Number(streamerId));
        if (action === "unfollow") following.delete(Number(streamerId));
        account.following = [...following];
        await kvCommand("SET", accountKey, JSON.stringify(account));
        return res.status(200).json({ ok: true, following: account.following });
      }

      // Subscribe / unsubscribe action
      if (action === "subscribe" && req.body.sub) {
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};
        activity.subscriptions = activity.subscriptions || {};
        activity.subscriptions[streamerId] = req.body.sub;
        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      if (action === "unsubscribe") {
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};
        activity.subscriptions = activity.subscriptions || {};
        delete activity.subscriptions[streamerId];
        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // Stream start — increment total streams counter
      if (action === "stream-start") {
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};
        activity.totalStreams = (activity.totalStreams || 0) + 1;
        activity.lastStreamAt = new Date().toISOString();
        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // Stream end — save duration + tokens earned
      if (action === "stream-end") {
        const { durationSecs = 0, tokensEarned = 0 } = req.body;
        const actResult  = (await kvCommand("GET", activityKey)).result;
        const activity   = parse(actResult) || {};
        const hoursAdded = Math.round((durationSecs / 3600) * 10) / 10;
        activity.hoursStreamed   = Math.round(((activity.hoursStreamed || 0) + hoursAdded) * 10) / 10;
        activity.allTimeTokens   = (activity.allTimeTokens  || 0) + tokensEarned;
        activity.weekTokens      = (activity.weekTokens     || 0) + tokensEarned;
        activity.monthTokens     = (activity.monthTokens    || 0) + tokensEarned;
        activity.todayTokens     = (activity.todayTokens    || 0) + tokensEarned;
        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // PPV purchase action
      if (action === "ppv-purchase" && req.body.itemId) {
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};
        activity.ppvPurchased = activity.ppvPurchased || [];
        if (!activity.ppvPurchased.includes(req.body.itemId)) {
          activity.ppvPurchased.push(req.body.itemId);
          activity.ppvHistory = activity.ppvHistory || [];
          activity.ppvHistory.unshift(req.body.item || { itemId: req.body.itemId });
          activity.ppvHistory = activity.ppvHistory.slice(0, 100);
        }
        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // Tip action — record tip in activity
      if (action === "tip" && req.body.tip) {
        const tip      = req.body.tip;
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};

        activity.tipsCount  = (activity.tipsCount  || 0) + 1;
        activity.totalSpent = (activity.totalSpent  || 0) + tip.tokens;
        activity.tipHistory = [
          { streamer: tip.streamer, streamerId: tip.streamerId, tokens: tip.tokens, date: tip.date },
          ...(activity.tipHistory || []),
        ].slice(0, 100); // keep last 100 tips

        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // Update profile fields
      if (displayName     !== undefined) account.displayName     = displayName;
      if (bio             !== undefined) account.bio             = bio;
      if (avatarImg       !== undefined) account.avatarImg       = avatarImg;
      if (username        !== undefined) account.username        = username;
      if (req.body.streamerProfile !== undefined) account.streamerProfile = req.body.streamerProfile;

      await kvCommand("SET", accountKey, JSON.stringify(account));
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH — update token balance ──────────────────────────────────────────
  if (req.method === "PATCH") {
    try {
      const { tokenBalance } = req.body;
      if (tokenBalance === undefined) return res.status(400).json({ error: "tokenBalance required" });

      const key = activityKey;
      const { result: actResult } = await kvCommand("GET", key);
      const activity = parse(actResult) || {};
      activity.tokenBalance = Math.max(0, Number(tokenBalance));
      await kvCommand("SET", key, JSON.stringify(activity));

      return res.status(200).json({ ok: true, tokenBalance: activity.tokenBalance });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
