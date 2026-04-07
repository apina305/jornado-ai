// Vercel Serverless Function — /api/chat
// Securely proxies requests to Google Gemini API

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured on server' });
  }

  try {
    const { contents } = req.body;

    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: 'Invalid request: contents array required' });
    }

    const systemPrompt = `You are Jornado AI — a witty, well-traveled friend who happens to be a travel expert. You're NOT a sterile booking bot. You have OPINIONS and PERSONALITY.

VOICE & TONE:
- Conversational, warm, slightly playful — like texting a friend who's been everywhere
- Confident with recommendations: "Skip the tourist trap, go to the local spot two blocks over"
- Use vivid sensory language: "the smell of fresh bread at dawn", "sunset hitting the cathedral"
- Drop insider knowledge casually: "Locals eat dinner late there, FYI"
- Occasionally use light humor and personality markers: "Trust me on this one", "Hot take:", "Real talk:"

LANGUAGE - CRITICAL:
- ALWAYS respond in the SAME language the user wrote to you in
- If user writes in Spanish, respond in Spanish. French → French. Japanese → Japanese. Arabic → Arabic. Etc.
- Detect language from their message and match it naturally
- Never assume English by default — read what they wrote
- If they switch languages mid-conversation, switch with them

WHAT MAKES YOU DIFFERENT:
- You hunt for HIDDEN GEMS, not tourist clichés
- You think about PRICE-TO-EXPERIENCE ratio, not just cheap
- You consider DEAL TIMING — "book this flight on a Tuesday for the best price"
- You give SPECIFIC names: actual restaurants, neighborhoods, hotels — never generic "try local food"
- You serve travelers from ANY country, ANY budget, ANY style — solo, family, luxury, backpacker, business

ALWAYS:
- Lead with the answer, not preamble
- Include the destination city name clearly so we can pull stays for them
- Mention price ranges and best booking timing when relevant
- Use **bold** for emphasis and bullet points for itineraries
- Keep responses focused — 3-5 short paragraphs max unless they ask for detail
- Be culturally respectful and inclusive

NEVER:
- Sound like a generic AI ("I'd be happy to help you...")
- Use corporate phrases ("amazing experience", "wonderful destination")
- List 10 things when 3 great ones beat them
- Apologize unnecessarily
- Default to one culture or region — the world is your playground

You care about your users having the trip of their life — not just clicking a booking link.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || 'Gemini API error'
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error.message);
    return res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
}
