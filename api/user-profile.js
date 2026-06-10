// api/user-profile.js
// GET   — load the logged-in user's profile from Upstash
// POST  — update profile / actions (follow, subscribe, stream-start, stream-end, tip, payout-request)
// PATCH — update token balance

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

// Returns Monday of the ISO week for a given Date
function isoWeekKey(date) {
  const d = new Date(date);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().split("T")[0]; // e.g. "2026-06-02"
}

function dateKey(date) {
  return new Date(date).toISOString().split("T")[0]; // "2026-06-07"
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ── Viewer count helpers (sorted-set based, 45s TTL per viewer) ───────────────
const VIEWER_TTL_MS  = 45_000;
const VIEWER_KEY_EXP = 120;

async function viewerCount_get(streamId) {
  const key = `viewers:${streamId}`;
  const now = Date.now();
  await kvCommand("ZREMRANGEBYSCORE", key, 0, now - VIEWER_TTL_MS);
  const { result } = await kvCommand("ZCARD", key);
  return Number(result) || 0;
}

async function viewerCount_heartbeat(streamId, sessionId) {
  const key = `viewers:${streamId}`;
  const now = Date.now();
  await kvCommand("ZREMRANGEBYSCORE", key, 0, now - VIEWER_TTL_MS);
  await kvCommand("ZADD", key, now, sessionId);
  await kvCommand("EXPIRE", key, VIEWER_KEY_EXP);
  const { result } = await kvCommand("ZCARD", key);
  return Number(result) || 0;
}

async function viewerCount_leave(streamId, sessionId) {
  const key = `viewers:${streamId}`;
  await kvCommand("ZREM", key, sessionId);
  const now = Date.now();
  await kvCommand("ZREMRANGEBYSCORE", key, 0, now - VIEWER_TTL_MS);
  const { result } = await kvCommand("ZCARD", key);
  return Number(result) || 0;
}

export default async function handler(req, res) {
  // ── Public streamer profile — no auth needed ─────────────────────────────
  // Called by ProfileScreen and StreamRoomScreen when viewing another streamer.
  // ?publicId={email} returns the public fields for that streamer.
  const publicId = req.query?.publicId;
  if (publicId) {
    try {
      const lookupEmail = decodeURIComponent(publicId).toLowerCase().trim();
      const [{ result: accResult }, { result: actResult }] = await Promise.all([
        kvCommand("GET", `user:${lookupEmail}`),
        kvCommand("GET", `activity:${lookupEmail}`),
      ]);
      const account  = parse(accResult);
      const activity = parse(actResult) || {};

      if (!account || account.role !== "streamer") {
        return res.status(404).json({ error: "Streamer not found" });
      }

      const sp = account.streamerProfile || {};

      // Load bannerImg from its own Redis key (kept separate to avoid large account objects)
      const { result: bannerResult } = await kvCommand("GET", `banner:${lookupEmail}`);
      sp.bannerImg = bannerResult || null;

      return res.status(200).json({
        ok: true,
        profile: {
          email:           account.email,
          name:            account.displayName || account.name || "Streamer",
          displayName:     account.displayName || account.name || "Streamer",
          avatarImg:       account.avatarImg   || null,
          bio:             account.bio         || "",
          verified:        account.verified    || false,
          streamerProfile: sp,
        },
        activity: {
          followers: activity.followers || 0,
          isLive:    activity.isLive    || false,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Live streamers list — no auth needed ─────────────────────────────────
  // Called by BrowseScreen, DiscoveryScreen, SearchResultsScreen.
  // Scans activity:* keys for isLive:true and returns public profile data.
  if (req.query?.live === "true") {
    try {
      // Scan all activity keys
      const activityKeys = [];
      let cursor = "0";
      do {
        const { result } = await kvCommand("SCAN", cursor, "MATCH", "activity:*", "COUNT", "100");
        if (!result || !Array.isArray(result)) break;
        cursor = result[0];
        if (Array.isArray(result[1])) activityKeys.push(...result[1]);
      } while (cursor !== "0");

      if (activityKeys.length === 0) {
        return res.status(200).json({ ok: true, streamers: [] });
      }

      const VIEWER_TTL_MS = 45_000;
      const liveStreamers = [];

      await Promise.all(
        activityKeys.map(async (actKey) => {
          try {
            const email = actKey.replace(/^activity:/, "");

            const { result: actResult } = await kvCommand("GET", actKey);
            const activity = parse(actResult);
            if (!activity?.isLive) return;

            const { result: accResult } = await kvCommand("GET", `user:${email}`);
            const account = parse(accResult);
            if (!account || account.role !== "streamer") return;

            const sp = account.streamerProfile || {};

            // Real viewer count from sorted-set heartbeats
            const streamId = encodeURIComponent(email);
            const vKey = `viewers:${streamId}`;
            const now  = Date.now();
            await kvCommand("ZREMRANGEBYSCORE", vKey, 0, now - VIEWER_TTL_MS);
            const { result: vcResult } = await kvCommand("ZCARD", vKey);
            const viewers = Number(vcResult) || 0;

            // bannerImg stored in its own key (kept separate from account object)
            const { result: bannerRes } = await kvCommand("GET", `banner:${email}`);
            const bannerImg = bannerRes || null;

            const isNew = activity.liveStartedAt
              ? Date.now() - new Date(activity.liveStartedAt).getTime() < 30 * 60 * 1000
              : false;

            liveStreamers.push({
              id:          email,
              email,
              name:        account.displayName || account.name || "Streamer",
              displayName: account.displayName || account.name || "Streamer",
              category:    sp.category    || "Female",
              region:      sp.region      || "",
              tags:        sp.tags        || [],
              avatarImg:   account.avatarImg  || null,
              avatar:      "🎭",
              bannerColor: sp.bannerColor || "#1a0a2e",
              bannerImg:   bannerImg,
              roomSubject: sp.roomSubject || "",
              live:        true,
              isNew,
              viewers,
              verified:    account.verified || false,
              streamTitle: activity.currentStreamTitle || "",
              liveStartedAt: activity.liveStartedAt   || null,
              goal: (sp.goalLabel && sp.goalTarget) ? {
                current: 0,
                target:  sp.goalTarget,
                label:   sp.goalLabel,
              } : null,
            });
          } catch { /* skip entries that fail */ }
        })
      );

      liveStreamers.sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
      return res.status(200).json({ ok: true, streamers: liveStreamers });

    } catch (err) {
      console.error("live-streamers error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── All streamers list (live + offline) — for BrowseScreen ──────────────────
  // Returns every registered streamer, with live status and viewer counts.
  // Live streamers are sorted first, then offline by follower count.
  if (req.query?.all === "true") {
    try {
      // Scan all user:* keys to find streamers
      const userKeys = [];
      let cursor = "0";
      do {
        const { result } = await kvCommand("SCAN", cursor, "MATCH", "user:*", "COUNT", "100");
        if (!result || !Array.isArray(result)) break;
        cursor = result[0];
        if (Array.isArray(result[1])) userKeys.push(...result[1]);
      } while (cursor !== "0");

      if (userKeys.length === 0) {
        return res.status(200).json({ ok: true, streamers: [] });
      }

      const VIEWER_TTL_MS = 45_000;
      const allStreamers = [];

      await Promise.all(
        userKeys.map(async (userKey) => {
          try {
            const { result: accResult } = await kvCommand("GET", userKey);
            const account = parse(accResult);
            if (!account || account.role !== "streamer") return;

            const email = account.email || userKey.replace(/^user:/, "");
            const sp = account.streamerProfile || {};

            // Fetch activity and bannerImg in parallel
            const [{ result: actResult }, { result: bannerRes }] = await Promise.all([
              kvCommand("GET", `activity:${email}`),
              kvCommand("GET", `banner:${email}`),
            ]);
            const activity = parse(actResult) || {};
            const bannerImg = bannerRes || null;

            const isLive = activity.isLive || false;
            let viewers = 0;

            if (isLive) {
              const streamId = encodeURIComponent(email);
              const vKey = `viewers:${streamId}`;
              const now  = Date.now();
              await kvCommand("ZREMRANGEBYSCORE", vKey, 0, now - VIEWER_TTL_MS);
              const { result: vcResult } = await kvCommand("ZCARD", vKey);
              viewers = Number(vcResult) || 0;
            }

            const isNew = isLive && activity.liveStartedAt
              ? Date.now() - new Date(activity.liveStartedAt).getTime() < 30 * 60 * 1000
              : false;

            allStreamers.push({
              id:          email,
              email,
              name:        account.displayName || account.name || "Streamer",
              displayName: account.displayName || account.name || "Streamer",
              category:    sp.category    || "Female",
              region:      sp.region      || "",
              tags:        sp.tags        || [],
              avatarImg:   account.avatarImg  || null,
              avatar:      "🎭",
              bannerColor: sp.bannerColor || "#1a0a2e",
              bannerImg,
              roomSubject: sp.roomSubject || "",
              live:        isLive,
              isNew,
              viewers,
              followers:   activity.followers  || 0,
              verified:    account.verified || false,
              streamTitle: activity.currentStreamTitle || "",
              liveStartedAt: activity.liveStartedAt   || null,
              goal: (sp.goalLabel && sp.goalTarget) ? {
                current: 0, target: sp.goalTarget, label: sp.goalLabel,
              } : null,
            });
          } catch { /* skip accounts that fail */ }
        })
      );

      // Live streamers first (sorted by viewers), then offline (sorted by followers)
      allStreamers.sort((a, b) => {
        if (a.live !== b.live) return a.live ? -1 : 1;
        if (a.live) return (b.viewers || 0) - (a.viewers || 0);
        return (b.followers || 0) - (a.followers || 0);
      });

      return res.status(200).json({ ok: true, streamers: allStreamers });

    } catch (err) {
      console.error("all-streamers error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Public geo-block fetch — no auth needed ────────────────────────────────
  const geoBlockId = req.query?.geoBlockId;
  if (geoBlockId) {
    try {
      const { result } = await kvCommand("GET", `geo:block:${geoBlockId}`);
      const geoBlocking = parse(result) || { enabled: false, blocked: [] };
      return res.status(200).json({ ok: true, geoBlocking });
    } catch {
      return res.status(200).json({ ok: true, geoBlocking: { enabled: false, blocked: [] } });
    }
  }

  // ── Viewer count — no auth needed ─────────────────────────────────────────
  const streamId = req.query?.streamId;
  if (streamId) {
    try {
      if (req.method === "GET") {
        const count = await viewerCount_get(streamId);
        return res.status(200).json({ ok: true, count });
      }
      if (req.method === "POST" && req.body?.action === "viewer-heartbeat") {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ error: "sessionId required" });
        const count = await viewerCount_heartbeat(streamId, sessionId);
        return res.status(200).json({ ok: true, count });
      }
      if (req.method === "DELETE") {
        const { sessionId } = req.body || {};
        const count = sessionId ? await viewerCount_leave(streamId, sessionId) : 0;
        return res.status(200).json({ ok: true, count });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Agora RTC token — no auth needed ──────────────────────────────────────
  // Called by GoLiveScreen (role=publisher) and StreamRoomScreen (role=subscriber).
  // Returns a short-lived token so the client can join the Agora channel.
  if (req.query?.action === "agora-token") {
    try {
      const _agoraToken   = await import("agora-token");
      const { RtcTokenBuilder, RtcRole } = _agoraToken.default ?? _agoraToken;
      const appId   = process.env.AGORA_APP_ID;
      const appCert = process.env.AGORA_APP_CERT;
      if (!appId || !appCert) {
        return res.status(500).json({ error: "Agora credentials not configured" });
      }
      const channel = String(req.query.channel || "").slice(0, 64);
      if (!channel) return res.status(400).json({ error: "channel required" });
      const role = req.query.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
      // buildTokenWithUid(appId, appCert, channel, uid, role, tokenExpirySecs, privilegeExpirySecs)
      const token = RtcTokenBuilder.buildTokenWithUid(appId, appCert, channel, 0, role, 3600, 3600);
      return res.status(200).json({ ok: true, token, appId });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── Private show earnings — each tick writes directly to streamer's balance ──
  // POST ?action=private-pay&channel=streamerEmail  → adds amount to their tokenBalance
  if (req.query?.action === "private-pay") {
    const channel = String(req.query.channel || "").toLowerCase().trim();
    if (!channel) return res.status(400).json({ error: "channel required" });
    try {
      if (req.method === "POST") {
        const amount = parseInt(req.body?.amount || 0, 10);
        if (amount > 0) {
          const actKey = `activity:${channel}`;
          const { result } = await kvCommand("GET", actKey);
          const activity = parse(result) || {};
          // Credit all earnings fields the StreamerDashboard reads
          activity.todayTokens    = (activity.todayTokens    || 0) + amount;
          activity.weekTokens     = (activity.weekTokens     || 0) + amount;
          activity.monthTokens    = (activity.monthTokens    || 0) + amount;
          activity.allTimeTokens  = (activity.allTimeTokens  || 0) + amount;
          activity.availableTokens = (activity.availableTokens || 0) + amount;
          activity.tokenBalance   = (activity.tokenBalance   || 0) + amount; // used by GoLiveScreen balance poll
          await kvCommand("SET", actKey, JSON.stringify(activity));
        }
        return res.status(200).json({ ok: true });
      }
      // GET — return current tokenBalance so GoLiveScreen can compute delta
      if (req.method === "GET") {
        const actKey = `activity:${channel}`;
        const { result } = await kvCommand("GET", actKey);
        const activity = parse(result) || {};
        return res.status(200).json({ ok: true, balance: activity.tokenBalance || 0 });
      }
      return res.status(200).json({ ok: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }


  if (req.query?.action === "private-req") {
    const channel = String(req.query.channel || "").toLowerCase().trim();
    if (!channel) return res.status(400).json({ error: "channel required" });
    const key = `private:req:${channel}`;
    try {
      if (req.method === "GET") {
        const { result } = await kvCommand("GET", key);
        return res.status(200).json({ ok: true, request: parse(result) || null });
      }
      if (req.method === "POST") {
        const { viewerName, viewerEmail, sessionId } = req.body || {};
        await kvCommand("SET", key, JSON.stringify({ viewerName: String(viewerName||"Viewer").slice(0,40), viewerEmail: String(viewerEmail||""), sessionId, time: new Date().toISOString() }));
        await kvCommand("EXPIRE", key, 300); // 5 min TTL
        return res.status(200).json({ ok: true });
      }
      if (req.method === "DELETE") {
        await kvCommand("DEL", key);
        return res.status(200).json({ ok: true });
      }
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  // ── Private show status (streamer → all viewers, no auth) ────────────────────
  if (req.query?.action === "private-status") {
    const channel = String(req.query.channel || "").toLowerCase().trim();
    if (!channel) return res.status(400).json({ error: "channel required" });
    const key = `private:status:${channel}`;
    try {
      if (req.method === "GET") {
        const { result } = await kvCommand("GET", key);
        return res.status(200).json({ ok: true, status: parse(result) || null });
      }
      if (req.method === "POST") {
        const { status, privateChannel, viewerEmail } = req.body || {};
        if (status === "ended") {
          // Keep "ended" visible for 30 s so both streamer and viewer can detect it,
          // then it expires automatically — don't delete immediately.
          await kvCommand("SET", key, JSON.stringify({ status: "ended", time: new Date().toISOString() }));
          await kvCommand("EXPIRE", key, 30);
        } else {
          await kvCommand("SET", key, JSON.stringify({ status, privateChannel, viewerEmail, time: new Date().toISOString() }));
          await kvCommand("EXPIRE", key, 7200); // 2 h TTL
        }
        return res.status(200).json({ ok: true });
      }
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }


  // GET  ?action=chat&channel=email   → last 50 messages, oldest first
  // POST ?action=chat&channel=email   → push a new message
  if (req.query?.action === "chat") {
    const channel = String(req.query.channel || "").toLowerCase().trim();
    if (!channel) return res.status(400).json({ error: "channel required" });
    const key = `chat:${channel}`;
    try {
      if (req.method === "GET") {
        const { result } = await kvCommand("LRANGE", key, 0, 49);
        const messages = (Array.isArray(result) ? result : [])
          .map(m => parse(m)).filter(Boolean).reverse(); // oldest→newest
        return res.status(200).json({ ok: true, messages });
      }
      if (req.method === "POST") {
        const { user, msg, tokens, type = "chat" } = req.body || {};
        if (!msg?.trim()) return res.status(400).json({ error: "msg required" });
        const entry = JSON.stringify({
          type,
          user:   String(user  || "Viewer").slice(0, 40),
          msg:    String(msg).trim().slice(0, 300),
          tokens: tokens || null,
          time:   new Date().toISOString(),
        });
        await kvCommand("LPUSH", key, entry);
        await kvCommand("LTRIM", key, 0, 99);   // keep last 100
        await kvCommand("EXPIRE", key, 86400);  // 24 h TTL
        return res.status(200).json({ ok: true });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const token = req.headers["x-auth-token"] || req.query?.token || req.body?.token;
  if (!token) return res.status(401).json({ error: "No token provided" });

  const email = await getEmailFromToken(token);
  if (!email) return res.status(401).json({ error: "Invalid session" });

  const accountKey  = `user:${email}`;
  const activityKey = `activity:${email}`;

  // ── Credit private-show earnings to streamer's token balance ─────────────────
  if (req.query?.action === "credit-tokens" && req.method === "POST") {
    try {
      const earningsKey = `private:earnings:${email}`;
      const { result: rawEarnings } = await kvCommand("GET", earningsKey);
      const earned = parseInt(rawEarnings || "0", 10);
      if (earned > 0) {
        const { result: rawActivity } = await kvCommand("GET", activityKey);
        const activity = parse(rawActivity) || {};
        activity.tokenBalance = (activity.tokenBalance || 0) + earned;
        await kvCommand("SET", activityKey, JSON.stringify(activity));
        await kvCommand("DEL", earningsKey);
      }
      return res.status(200).json({ ok: true, credited: earned });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }


  if (req.method === "GET") {
    try {
      const [{ result: accResult }, { result: actResult }, { result: bannerResult }] = await Promise.all([
        kvCommand("GET", accountKey),
        kvCommand("GET", activityKey),
        kvCommand("GET", `banner:${email}`),
      ]);

      const account   = parse(accResult);
      const activity  = parse(actResult) || {};
      const bannerImg = bannerResult || null;

      if (!account) return res.status(404).json({ error: "Account not found" });

      // Recalculate period-based earnings using dailyEarnings history
      const now       = new Date();
      const todayStr  = dateKey(now);
      const weekStr   = isoWeekKey(now);
      const monthStr  = monthKey(now);

      const daily = activity.dailyEarnings || [];

      const todayTokens = daily
        .filter(d => d.day === todayStr)
        .reduce((s, d) => s + (d.tokens || 0), 0);

      const weekTokens = daily
        .filter(d => isoWeekKey(d.day) === weekStr)
        .reduce((s, d) => s + (d.tokens || 0), 0);

      const monthTokens = daily
        .filter(d => monthKey(d.day) === monthStr)
        .reduce((s, d) => s + (d.tokens || 0), 0);

      // Merge bannerImg back into streamerProfile (stored separately to keep account object small)
      const streamerProfile = account.streamerProfile
        ? { ...account.streamerProfile, bannerImg }
        : null;

      return res.status(200).json({
        ok: true,
        profile: {
          email:           account.email,
          name:            account.name,
          displayName:     account.displayName  || account.name,
          username:        account.username     || account.email.split("@")[0],
          bio:             account.bio          || "",
          avatarImg:       account.avatarImg    || null,
          role:            account.role,
          joinDate:        account.createdAt
                             ? new Date(account.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                             : "Recently",
          verified:        account.verified     || false,
          verifiedAt:      account.verifiedAt   || null,
          kycStatus:       account.kycStatus    || null,
          following:       account.following    || [],
          streamerProfile,
          streamerSchedule:  account.streamerSchedule  || [],
        },
        activity: {
          // Viewer fields
          tokenBalance:   activity.tokenBalance  ?? 0,
          totalSpent:     activity.totalSpent    || 0,
          tipsCount:      activity.tipsCount     || 0,
          tipHistory:     activity.tipHistory    || [],
          giftsCount:     activity.giftsCount    || 0,
          achievements:   activity.achievements  || [],
          subscriptions:  activity.subscriptions || {},
          ppvPurchased:   activity.ppvPurchased  || [],
          // Streamer earnings — calculated from real daily history
          todayTokens,
          weekTokens,
          monthTokens,
          allTimeTokens:  daily.reduce((s, d) => s + (d.tokens || 0), 0),
          availableTokens: activity.availableTokens || 0,
          dailyEarnings:  daily.slice(0, 30),
          // Live status — real-time flag set by stream-start / stream-end
          isLive:         activity.isLive         || false,
          liveStartedAt:  activity.liveStartedAt  || null,
          // Streamer stats
          totalStreams:   activity.totalStreams   || 0,
          hoursStreamed:  activity.hoursStreamed  || 0,
          peakViewers:    activity.peakViewers    || 0,
          followers:      activity.followers      || 0,
          // Derive subscriber count from the Set (always accurate) — fall back to stored field
          subscribers:    Array.isArray(activity.subscriberEmails)
                            ? activity.subscriberEmails.length
                            : (activity.subscribers || 0),
          payoutHistory:  activity.payoutHistory  || [],
          streamHistory:  activity.streamHistory  || [],
        },
      });
    } catch (err) {
      console.error("user-profile GET error:", err.message, err.stack);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — update profile fields or perform actions ───────────────────────
  if (req.method === "POST") {
    try {
      const { displayName, bio, avatarImg, username, streamerId, action } = req.body;

      const { result: accResult } = await kvCommand("GET", accountKey);
      const account = parse(accResult);
      if (!account) return res.status(404).json({ error: "Account not found" });

      // ── Follow / unfollow ────────────────────────────────────────────────
      if (streamerId && (action === "follow" || action === "unfollow")) {
        const following    = new Set(account.following || []);
        const streamerKey  = String(streamerId); // email or legacy numeric ID as string
        const wasFollowing = following.has(streamerKey);
        if (action === "follow")   following.add(streamerKey);
        if (action === "unfollow") following.delete(streamerKey);
        account.following = [...following];
        await kvCommand("SET", accountKey, JSON.stringify(account));

        // Also update the streamer's real-time follower counter
        const streamerEmail = req.body.streamerEmail;
        if (streamerEmail) {
          const sKey = `activity:${streamerEmail}`;
          const { result: sRes } = await kvCommand("GET", sKey);
          const sActivity = parse(sRes) || {};
          if (action === "follow" && !wasFollowing) {
            sActivity.followers = (sActivity.followers || 0) + 1;
          } else if (action === "unfollow" && wasFollowing) {
            sActivity.followers = Math.max(0, (sActivity.followers || 0) - 1);
          }
          await kvCommand("SET", sKey, JSON.stringify(sActivity));
        }

        return res.status(200).json({ ok: true, following: account.following });
      }

      // ── Subscribe / unsubscribe ──────────────────────────────────────────
      if (action === "subscribe" && req.body.sub) {
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};
        activity.subscriptions = activity.subscriptions || {};
        activity.subscriptions[streamerId] = req.body.sub;
        await kvCommand("SET", activityKey, JSON.stringify(activity));

        // Update streamer's subscriber Set — accurate and idempotent
        if (streamerId) {
          const sKey = `activity:${streamerId}`;
          const { result: sRes } = await kvCommand("GET", sKey);
          const sActivity = parse(sRes) || {};
          const subs = new Set(sActivity.subscriberEmails || []);
          subs.add(email); // email = this viewer's email
          sActivity.subscriberEmails = [...subs];
          sActivity.subscribers      = sActivity.subscriberEmails.length;
          await kvCommand("SET", sKey, JSON.stringify(sActivity));
        }

        return res.status(200).json({ ok: true });
      }

      if (action === "unsubscribe") {
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};
        activity.subscriptions = activity.subscriptions || {};
        delete activity.subscriptions[streamerId];
        await kvCommand("SET", activityKey, JSON.stringify(activity));

        // Remove viewer from streamer's subscriber Set
        if (streamerId) {
          const sKey = `activity:${streamerId}`;
          const { result: sRes } = await kvCommand("GET", sKey);
          const sActivity = parse(sRes) || {};
          const subs = new Set(sActivity.subscriberEmails || []);
          subs.delete(email); // email = this viewer's email
          sActivity.subscriberEmails = [...subs];
          sActivity.subscribers      = sActivity.subscriberEmails.length;
          await kvCommand("SET", sKey, JSON.stringify(sActivity));
        }

        return res.status(200).json({ ok: true });
      }

      // ── Stream start ─────────────────────────────────────────────────────
      if (action === "stream-start") {
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};
        activity.totalStreams        = (activity.totalStreams || 0) + 1;
        activity.lastStreamAt       = new Date().toISOString();
        activity.currentStreamTitle = req.body.streamTitle || "Untitled Stream";
        activity.currentStreamStart = new Date().toISOString();
        activity.isLive             = true;
        activity.liveStartedAt      = new Date().toISOString();
        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // ── Stream end — save real duration + tokens earned ──────────────────
      if (action === "stream-end") {
        const { durationSecs = 0, tokensEarned = 0, peakViewers = 0, streamTitle } = req.body;
        const actResult  = (await kvCommand("GET", activityKey)).result;
        const activity   = parse(actResult) || {};

        const hoursAdded = Math.round((durationSecs / 3600) * 10) / 10;
        activity.hoursStreamed    = Math.round(((activity.hoursStreamed || 0) + hoursAdded) * 10) / 10;
        activity.allTimeTokens   = (activity.allTimeTokens  || 0) + tokensEarned;
        activity.availableTokens = (activity.availableTokens || 0) + tokensEarned;

        // Update daily earnings history
        const todayStr = dateKey(new Date());
        activity.dailyEarnings = activity.dailyEarnings || [];
        const existing = activity.dailyEarnings.find(d => d.day === todayStr);
        if (existing) {
          existing.tokens = (existing.tokens || 0) + tokensEarned;
        } else {
          activity.dailyEarnings.unshift({ day: todayStr, tokens: tokensEarned });
        }
        activity.dailyEarnings = activity.dailyEarnings.slice(0, 730);

        // Update all-time peak viewers
        if (peakViewers > (activity.peakViewers || 0)) {
          activity.peakViewers = peakViewers;
        }

        // Save individual stream record for analytics history
        const title = streamTitle || activity.currentStreamTitle || "Untitled Stream";
        const startedAt = activity.currentStreamStart || new Date().toISOString();
        const durationMins = Math.round(durationSecs / 60);
        const durationStr  = durationMins >= 60
          ? `${Math.floor(durationMins/60)}h ${durationMins%60}m`
          : `${durationMins}m`;

        activity.streamHistory = activity.streamHistory || [];
        activity.streamHistory.unshift({
          title,
          date:        todayStr,
          startedAt,
          durationSecs,
          duration:    durationStr,
          tokensEarned,
          peakViewers,
        });
        activity.streamHistory = activity.streamHistory.slice(0, 100); // keep last 100 streams

        // Clear live status and stream tracking fields
        activity.isLive = false;
        delete activity.liveStartedAt;
        delete activity.currentStreamTitle;
        delete activity.currentStreamStart;

        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // ── Payout request ───────────────────────────────────────────────────
      if (action === "payout-request") {
        const { amountUSD } = req.body;
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};

        const availableTokens = activity.availableTokens || 0;
        const availableUSD    = availableTokens * 0.05;
        const requestedUSD    = Number(amountUSD) || availableUSD;

        if (requestedUSD < 20)
          return res.status(400).json({ error: "Minimum payout is $20" });
        if (requestedUSD > availableUSD + 0.01)
          return res.status(400).json({ error: "Amount exceeds available balance" });

        const tokensToDeduct = Math.ceil(requestedUSD / 0.05);
        activity.availableTokens = Math.max(0, availableTokens - tokensToDeduct);

        activity.payoutHistory = activity.payoutHistory || [];
        activity.payoutHistory.unshift({
          date:        new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          amount:      requestedUSD,
          status:      "pending",
          requestedAt: new Date().toISOString(),
        });
        activity.payoutHistory = activity.payoutHistory.slice(0, 50);

        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true, remaining: activity.availableTokens });
      }

      // ── PPV purchase ─────────────────────────────────────────────────────
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

      // ── Tip (viewer sending a tip) ────────────────────────────────────────
      if (action === "tip" && req.body.tip) {
        const tip      = req.body.tip;
        const actResult = (await kvCommand("GET", activityKey)).result;
        const activity  = parse(actResult) || {};

        activity.tipsCount  = (activity.tipsCount  || 0) + 1;
        activity.totalSpent = (activity.totalSpent  || 0) + tip.tokens;
        activity.tipHistory = [
          { streamer: tip.streamer, streamerId: tip.streamerId, tokens: tip.tokens, date: tip.date },
          ...(activity.tipHistory || []),
        ].slice(0, 100);

        await kvCommand("SET", activityKey, JSON.stringify(activity));
        return res.status(200).json({ ok: true });
      }

      // ── Schedule update ─────────────────────────────────────────────────
      if (action === "schedule-update") {
        account.streamerSchedule = (req.body.schedule || []).map((slot, i) => ({
          id:        slot.id        || `slot_${Date.now()}_${i}`,
          day:       Number(slot.day)       || 0,
          startHour: Number(slot.startHour) || 20,
          duration:  Number(slot.duration)  || 2,
          title:     String(slot.title     || "My Stream").slice(0, 80),
          color:     String(slot.color     || "#ff2d55").slice(0, 10),
        }));
        await kvCommand("SET", accountKey, JSON.stringify(account));
        return res.status(200).json({ ok: true });
      }

      // ── Update profile fields ────────────────────────────────────────────
      if (displayName !== undefined) account.displayName = displayName;
      if (bio         !== undefined) account.bio         = bio;
      if (avatarImg   !== undefined) account.avatarImg   = avatarImg;
      if (username    !== undefined) account.username    = username;
      if (req.body.streamerProfile !== undefined) {
        // Strip bannerImg out of the main account — it's a base64 data URL (can be 500KB+)
        // which makes the account object too large for Redis and silently kills all saves.
        // Store it in its own key so social links, tags, etc. always save reliably.
        const { bannerImg, ...spWithoutBanner } = req.body.streamerProfile;
        account.streamerProfile = spWithoutBanner;

        // Persist bannerImg to its own Redis key (empty string = cleared)
        if (bannerImg !== undefined) {
          await kvCommand("SET", `banner:${email}`, bannerImg || "");
        }

        // Save geo-blocking to a public key so StreamRoomScreen can check it without auth
        // Key uses email (same as what StreamRoomScreen fetches via geoBlockId=streamerEmail)
        if (req.body.streamerProfile.geoBlocking) {
          await kvCommand("SET", `geo:block:${email}`,
            JSON.stringify(req.body.streamerProfile.geoBlocking));
        }
      }

      await kvCommand("SET", accountKey, JSON.stringify(account));
      return res.status(200).json({ ok: true });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH — update viewer token balance ───────────────────────────────────
  if (req.method === "PATCH") {
    try {
      const { tokenBalance } = req.body;
      if (tokenBalance === undefined) return res.status(400).json({ error: "tokenBalance required" });

      const { result: actResult } = await kvCommand("GET", activityKey);
      const activity = parse(actResult) || {};
      activity.tokenBalance = Math.max(0, Number(tokenBalance));
      await kvCommand("SET", activityKey, JSON.stringify(activity));

      return res.status(200).json({ ok: true, tokenBalance: activity.tokenBalance });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
