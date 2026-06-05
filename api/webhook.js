// api/webhook.js
// Stripe calls this directly after every confirmed payment.
// This is the authoritative record of what was paid — more reliable than the redirect.

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data",  (c) => chunks.push(c));
    req.on("end",   ()  => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig     = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { total } = session.metadata;

    console.log(`✅ Payment confirmed — ${total} tokens — $${(session.amount_total / 100).toFixed(2)}`);

    // ── Add database call here when you're ready ──────────────────────────
    // await db.users.update({
    //   where: { email: session.customer_details.email },
    //   data:  { tokens: { increment: Number(total) } },
    // });
    // ─────────────────────────────────────────────────────────────────────
  }

  return res.status(200).json({ received: true });
}
