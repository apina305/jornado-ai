// Vercel Serverless Function — /api/stays
// Generates Stay22 affiliate embed URLs and deep links

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const STAY22_AID = process.env.STAY22_AID;

  if (!STAY22_AID) {
    return res.status(500).json({ error: 'Stay22 AID not configured on server' });
  }

  try {
    const { destination, lat, lng, checkin, checkout } = req.body;

    if (!destination && (!lat || !lng)) {
      return res.status(400).json({ error: 'Provide destination or lat/lng' });
    }

    const params = new URLSearchParams();
    params.set('aid', STAY22_AID);
    if (lat && lng) { params.set('lat', lat); params.set('lng', lng); }
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    params.set('campaign', 'jornado-ai-chat');
    params.set('maincolor', 'c9a84c');

    const addr = destination ? `&address=${encodeURIComponent(destination)}` : '';
    const base = params.toString() + addr;

    return res.status(200).json({
      embedUrl: `https://www.stay22.com/embed/gm?${base}`,
      searchLink: `https://www.stay22.com/allez/roam?${base}`,
      bookingLink: `https://www.stay22.com/allez/booking?${base}`,
      expediaLink: `https://www.stay22.com/allez/expedia?${base}`,
      flightsLink: `https://www.stay22.com/allez/kayak?${base}`,
      activitiesLink: `https://www.stay22.com/allez/getyourguide?${base}`,
      destination: destination || `${lat},${lng}`
    });

  } catch (error) {
    console.error('Stay22 error:', error.message);
    return res.status(500).json({ error: 'Failed to generate stay links' });
  }
}
