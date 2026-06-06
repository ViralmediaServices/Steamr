// api/follow.js
// Stores and removes follower relationships in Vercel KV.
// Uses Vercel KV's REST API directly — no npm packages needed.
//
// KV structure:
//   followers:{streamerId}        → Set of viewer emails
//   follower_name:{viewerEmail}   → viewer display name

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kv(command, ...args) {
  const res = await fetch(`${KV_URL}/${[command, ...args].join("/")}`, {
    method:  "GET",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  return res.json();
}

async function kvPost(command, ...args) {
  const res = await fetch(`${KV_URL}/pipeline`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify([[command, ...args]]),
  });
  return res.json();
}

export default async function handler(req, res) {
  const { streamerId, viewerEmail, viewerName, streamerName } = req.body;

  if (!streamerId || !viewerEmail) {
    return res.status(400).json({ error: "Missing streamerId or viewerEmail" });
  }

  const followKey = `followers:${streamerId}`;
  const nameKey   = `follower_name:${viewerEmail.replace(/[@.]/g, "_")}`;

  try {
    if (req.method === "POST") {
      // Add follower
      await Promise.all([
        kvPost("sadd", followKey, viewerEmail),
        kvPost("set",  nameKey,   viewerName || viewerEmail),
      ]);
      return res.status(200).json({ ok: true, action: "followed" });

    } else if (req.method === "DELETE") {
      // Remove follower
      await kvPost("srem", followKey, viewerEmail);
      return res.status(200).json({ ok: true, action: "unfollowed" });

    } else {
      return res.status(405).end();
    }
  } catch (err) {
    console.error("KV error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
