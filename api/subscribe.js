// api/subscribe.js
// Handles newsletter signups by forwarding them to Beehiiv

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Basic email validation
  if (!email || !email.includes('@') || email.length < 5) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

  if (!API_KEY || !PUBLICATION_ID) {
    console.error('Missing Beehiiv credentials');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'website',
          utm_medium: 'inline_form',
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Beehiiv API error:', data);
      return res.status(response.status).json({ 
        error: data.message || 'Could not subscribe. Please try again.' 
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
