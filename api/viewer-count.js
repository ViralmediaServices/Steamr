// api/viewer-count.js
// GET    ?streamId=X          — return current live viewer count
// POST   ?streamId=X  { sessionId }  — viewer heartbeat (register/refresh presence)
// DELETE ?streamId=X  { sessionId }  — viewer leaving

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kv(command, ...args) {
  const res = await fetch(KV_URL, {
    method:  "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body:    JSON.stringify([command, ...args]),
  });
  return res.json();
}

const VIEWER_TTL_MS  = 45_000; // viewer considered gone after 45 s of no heartbeat
const KEY_EXPIRE_SEC = 120;    // Redis key self-destructs 2 min after all viewers leave

export default async function handler(req, res) {
  const streamId = req.query?.streamId;
  if (!streamId) return res.status(400).json({ error: "streamId required" });

  const key = `viewers:${streamId}`;
  const now = Date.now();

  // Always prune stale viewers first
  await kv("ZREMRANGEBYSCORE", key, 0, now - VIEWER_TTL_MS);

  // ── GET — return current count ──────────────────────────────────────────────
  if (req.method === "GET") {
    const { result } = await kv("ZCARD", key);
    return res.status(200).json({ ok: true, count: Number(result) || 0 });
  }

  // ── POST — viewer heartbeat ─────────────────────────────────────────────────
  if (req.method === "POST") {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    // Score = current timestamp so ZREMRANGEBYSCORE can prune old entries
    await kv("ZADD", key, now, sessionId);
    await kv("EXPIRE", key, KEY_EXPIRE_SEC);

    const { result } = await kv("ZCARD", key);
    return res.status(200).json({ ok: true, count: Number(result) || 0 });
  }

  // ── DELETE — viewer left cleanly ────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { sessionId } = req.body || {};
    if (sessionId) await kv("ZREM", key, sessionId);
    const { result } = await kv("ZCARD", key);
    return res.status(200).json({ ok: true, count: Number(result) || 0 });
  }

  return res.status(405).end();
}
