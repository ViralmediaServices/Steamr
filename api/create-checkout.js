// api/create-checkout.js
// Vercel serverless function — creates a Stripe Checkout session.
// Called by BuyTokensScreen when the viewer clicks "Pay with Stripe".

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { packId, tokens, bonus, total, price, label } = req.body;

  if (!price || !total || !label) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: label,
              description:
                bonus > 0
                  ? `${tokens} tokens + ${bonus} bonus tokens`
                  : `${tokens} tokens added to your Steamr account`,
            },
            unit_amount: Math.round(price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // After payment Steamr reads ?payment=success&tokens=550 and credits tokens
      success_url: `${process.env.SITE_URL}?payment=success&tokens=${total}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.SITE_URL}?payment=cancelled`,
      metadata: {
        packId: String(packId),
        tokens: String(tokens),
        bonus:  String(bonus),
        total:  String(total),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
