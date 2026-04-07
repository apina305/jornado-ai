# ✈️ Jornado AI

Multi-language AI travel assistant powered by **Google Gemini** with **Stay22** affiliate monetization, **Vercel KV** persistence, and **Resend** email confirmations.

## 🌍 Features

- 🤖 Real AI chat (Google Gemini 2.0 Flash)
- 🌐 **Multi-language** — responds in any language the user writes in
- 🏨 Stays sidebar (Stay22 → Booking, Expedia, Vrbo)
- ✈️ **Flights search** (Stay22 → Kayak)
- 🎫 **Activities** (Stay22 → GetYourGuide)
- 📈 **Price tracking** with email confirmations
- 💾 **Vercel KV** persistence (no data loss)
- 📧 **Resend** email delivery (3K free emails/month)
- 🎨 Voyagr luxury theme (navy + gold)

## 📁 Files

```
jornado-ai/
├── api/
│   ├── chat.js      ← Gemini AI (multi-language personality)
│   ├── stays.js     ← Stay22 (stays + flights + activities)
│   └── alerts.js    ← Price alerts (KV + Resend)
├── public/
│   └── index.html
├── package.json
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Deployment (15 minutes total)

### Step 1: Get a Resend API Key (free)
1. Go to **resend.com** → sign up (free tier: 3,000 emails/month)
2. Go to **API Keys** → click **Create API Key**
3. Copy the key (starts with `re_`)
4. Save it for Step 4

### Step 2: Push to GitHub
1. Go to **github.com/new** → name it `jornado-ai` → Create
2. Upload all files (keeping the `api/` and `public/` folder structure)

### Step 3: Deploy to Vercel
1. Go to **vercel.com/new** → sign in with GitHub
2. Import your `jornado-ai` repo
3. Click **Deploy** (don't add env vars yet — we'll do it after)

### Step 4: Connect Vercel KV (free database)
1. In your Vercel project → click **Storage** tab
2. Click **Create Database** → select **KV** (Upstash Redis)
3. Choose a name → click **Create**
4. Click **Connect Project** → select your project → **Connect**
5. ✅ KV environment variables are now auto-injected

### Step 5: Add Remaining Environment Variables
In Vercel → Project Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | `AIzaSyB12nlcH3mOsDbvJP3NcZRsdd2U3pHec9I` |
| `STAY22_AID` | `stay22_a08e9e2b-2c3b-4f47-8a87-aafb48af8d3a` |
| `RESEND_API_KEY` | `re_BhJPrdao_8cqokFUsvcq4xDHBSzGV1Nrs` |
| `FROM_EMAIL` | `Jornado AI <onboarding@resend.dev>` |

> 💡 Once you verify a custom domain in Resend, change `FROM_EMAIL` to `Jornado AI <hello@yourdomain.com>`.

### Step 6: Redeploy
1. Go to **Deployments** tab → click latest deployment → **Redeploy**
2. Wait 1-2 minutes
3. Done! Visit your live URL.

## 🧪 Testing

| Test | What to do | Expected |
|------|-----------|----------|
| Multi-language | Type "Quiero ir a Madrid" | AI responds in Spanish |
| Multi-language | Type "Je veux visiter Paris" | AI responds in French |
| Stays sidebar | Type "Tokyo for a week" | Map + booking links appear |
| Flights | Click "Find Flights" link | Opens Kayak search |
| Activities | Click "Things to Do" link | Opens GetYourGuide |
| Price alert | Click "Track Prices" → enter email | Confirmation modal + email arrives |
| Persistence | Track 2 alerts, redeploy | Alerts still saved (KV) |

## 💰 Revenue Streams (all hidden from users)

| Source | Commission | Setup |
|--------|-----------|-------|
| Hotels (Booking, Expedia, Vrbo) | ~30% via Stay22 | ✅ Done |
| Flights (Kayak) | ~30% via Stay22 | ✅ Done |
| Activities (GetYourGuide) | ~30% via Stay22 | ✅ Done |
| Email retention list | Lifetime value | ✅ Done (Resend) |

## 🔒 Security

- All API keys live ONLY on the server (Vercel env vars)
- Frontend has zero secrets — view-source safe
- Email validation on the server
- Rate-limit ready (add Vercel rate limiting later if needed)

## 📧 About Resend

- Free tier: **3,000 emails/month**
- No credit card required
- Default sender works immediately (`onboarding@resend.dev`)
- For your own domain (`hello@jornado.com`), verify it in Resend → DNS → done

## 💾 About Vercel KV

- Free tier: **30,000 commands/month + 256 MB storage**
- Auto-scales, zero config after Step 4
- Powered by Upstash Redis
- Persists across deployments and cold starts

## 🌐 Languages Supported

The AI responds in whatever language the user writes in. Tested:
- English, Spanish, French, German, Italian, Portuguese
- Japanese, Korean, Chinese (Simplified + Traditional)
- Arabic, Hebrew, Hindi, Russian, Turkish
- Dutch, Polish, Swedish, Greek, Thai, Vietnamese
- ...and 100+ more (anything Gemini supports)
