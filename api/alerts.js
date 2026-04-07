// Vercel Serverless Function — /api/alerts
// Persists price alerts to Vercel KV + sends confirmation via Resend

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'Jornado AI <onboarding@resend.dev>';

  // ─── CREATE ALERT ───
  if (req.method === 'POST') {
    try {
      const { email, destination, type, currentPrice } = req.body;

      if (!email || !destination) {
        return res.status(400).json({ error: 'Email and destination required' });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const alertId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      const alert = {
        id: alertId,
        email,
        destination,
        type: type || 'flight+hotel',
        currentPrice: currentPrice || null,
        createdAt: new Date().toISOString(),
        active: true
      };

      // Save to Vercel KV
      try {
        await kv.set(`alert:${alertId}`, alert);
        await kv.sadd(`alerts:by-email:${email}`, alertId);
        await kv.sadd('alerts:all', alertId);
      } catch (kvError) {
        console.error('KV error:', kvError.message);
        // Continue anyway — don't fail the user request
      }

      // Send confirmation email via Resend
      let emailSent = false;
      if (RESEND_API_KEY) {
        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: email,
              subject: `✈️ We're tracking prices for ${destination}`,
              html: buildEmailHtml(destination, alertId)
            })
          });

          if (emailRes.ok) emailSent = true;
          else console.error('Resend error:', await emailRes.text());
        } catch (mailError) {
          console.error('Email error:', mailError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: emailSent
          ? `Got it! Confirmation sent to ${email}. We'll watch ${destination} for you.`
          : `Got it! We'll watch ${destination} for you.`,
        alertId
      });

    } catch (error) {
      console.error('Alert error:', error.message);
      return res.status(500).json({ error: 'Failed to create price alert' });
    }
  }

  // ─── LIST ALERTS (admin/debug) ───
  if (req.method === 'GET') {
    try {
      const all = await kv.smembers('alerts:all');
      return res.status(200).json({ count: all?.length || 0 });
    } catch {
      return res.status(200).json({ count: 0 });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ─── Email Template (matches Jornado theme) ───
function buildEmailHtml(destination, alertId) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;background:#f5f0e8;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e0d8c8;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#0d1b2a;padding:32px 40px;border-bottom:2px solid #c9a84c;">
          <div style="font-family:Georgia,serif;font-size:28px;color:#c9a84c;letter-spacing:-0.5px;">
            Jornad<em style="color:#fff;">o</em> AI
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">
            Travel Planning Assistant
          </div>
        </td></tr>

        <tr><td style="padding:40px;">
          <h1 style="font-family:Georgia,serif;font-size:24px;color:#0d1b2a;margin:0 0 16px;">
            ✈️ You're tracking ${destination}
          </h1>
          <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 20px;">
            Great choice. We'll keep an eye on flight and hotel prices for <strong style="color:#c9a84c;">${destination}</strong> and email you the moment we spot a deal worth booking.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 28px;">
            No spam. No nonsense. Just real price drops.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:8px;padding:20px;margin:0 0 28px;">
            <tr><td>
              <div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">What we track</div>
              <div style="font-size:14px;color:#1a1a1a;line-height:1.8;">
                ✈️ <strong>Flights</strong> from your area to ${destination}<br>
                🏨 <strong>Hotels & stays</strong> in ${destination}<br>
                📈 <strong>Price drops</strong> below recent averages
              </div>
            </td></tr>
          </table>

          <p style="font-size:13px;color:#888;line-height:1.5;margin:0;">
            Alert ID: <code style="background:#f5f0e8;padding:2px 6px;border-radius:3px;">${alertId}</code><br>
            Want to stop tracking? Just reply to this email with "unsubscribe".
          </p>
        </td></tr>

        <tr><td style="background:#0d1b2a;padding:24px 40px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:14px;color:#c9a84c;">
            Jornad<em style="color:#fff;">o</em> AI
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:6px;">
            Your well-traveled friend. Powered by AI.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}
