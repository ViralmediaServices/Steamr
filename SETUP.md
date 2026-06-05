# Steamr — Go Live Checklist

## Your project is already linked. Follow these 4 steps.

---

### Step 1 — Create a Stripe account (5 min)
1. Go to **https://stripe.com** → sign up free
2. Dashboard → **Developers → API Keys**
3. Copy your **Secret key** (starts `sk_test_...`)

---

### Step 2 — Deploy to Vercel (10 min)
1. Go to **https://vercel.com** → sign up free with GitHub
2. Push this whole folder to a new GitHub repo
3. In Vercel → **"Add New Project"** → import your repo
4. Vercel detects Vite automatically → click **Deploy**
5. Copy your live URL e.g. `https://steamr-abc.vercel.app`

---

### Step 3 — Add your Stripe keys in Vercel (5 min)
Vercel Dashboard → your project → **Settings → Environment Variables**

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_...` from Stripe |
| `SITE_URL` | your Vercel URL (no trailing slash) |
| `STRIPE_WEBHOOK_SECRET` | from step 4 below |

Click **Save** → **Redeploy**

---

### Step 4 — Set up the webhook (5 min)
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://YOUR-SITE.vercel.app/api/webhook`
3. Event: `checkout.session.completed`
4. Click Add → copy the **Signing secret** (`whsec_...`)
5. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel → Redeploy

---

### Test it
Open your site → **Buy Tokens** → pick a pack → **Pay with Stripe**

Use Stripe test card: `4242 4242 4242 4242` · any future date · any CVC

Tokens appear in your account instantly ✅

---

### Go live with real payments
1. Activate your Stripe account (5 min — needs business info)
2. Swap `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...`
3. Create a new live webhook → update `STRIPE_WEBHOOK_SECRET`
4. Redeploy → done 🎉
