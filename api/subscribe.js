// /api/subscribe.js
// Adds a new subscriber to Brevo.
// source='modal'  → list 3 (Newsletter) + list 4 (Modal Signups) + FOUNDING_MEMBER=true
// source='inline' → list 3 (Newsletter) only
// Env var required: BREVO_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { email, source, founding } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: BREVO_API_KEY missing.' });
  }

  const isModal = source === 'modal';

  // List IDs: 3 = Newsletter, 4 = Modal Signups (founding members)
  // NOTE: Create list 4 in Brevo dashboard before enabling — add its real ID here.
  const listIds = isModal ? [3, 4] : [3];

  // Attributes: FOUNDING_MEMBER custom boolean attribute (create in Brevo first)
  const attributes = isModal ? { FOUNDING_MEMBER: true } : {};

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
        updateEnabled: true, // prevents error if contact already exists; merges lists
      }),
    });

    // Brevo returns 201 Created or 204 No Content (updateEnabled + existing contact)
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
