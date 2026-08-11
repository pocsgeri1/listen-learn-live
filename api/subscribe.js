// /api/subscribe.js
// Adds a new subscriber to Brevo.
// ALL signups → list 3 (Epistemic Newsletter) + list 6 (Modal Signups) + FOUNDING_MEMBER=true
// Everyone who gives their email right now is a founding member — no distinction needed yet.
// Env var required: BREVO_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { email } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: BREVO_API_KEY missing.' });
  }

  // List 3 = Epistemic Newsletter (main list, triggers welcome automation)
  // List 6 = Epistemic — Modal Signups (founding member segment)
  // FOUNDING_MEMBER = true for all signups at this stage
  const listIds   = [3, 6];
  const attributes = { FOUNDING_MEMBER: true };

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        listIds,
        attributes,
        updateEnabled: true, // merges lists if contact already exists
      }),
    });

    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();
    console.error('Brevo error:', data);
    return res.status(response.status).json({
      error: data.message || 'Failed to subscribe. Please try again.',
    });

  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Network error. Please try again.' });
  }
}
