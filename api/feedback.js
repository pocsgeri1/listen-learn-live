// /api/feedback.js
// Receives post-signup feedback form data and sends it to Gergely via Brevo transactional email.
// Env vars required: BREVO_API_KEY
// No extra services needed — reuses the same Brevo account.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { email, source, pro_want, frustration, visit_freq } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email required.' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: BREVO_API_KEY missing.' });
  }

  const emailBody = `
New signup feedback from Epistemic:

Email: ${email}

How they found Epistemic: ${source || '—'}
Visit frequency: ${visit_freq || '—'}
#1 thing they want from Pro: ${pro_want || '—'}
Biggest frustration with free version: ${frustration || '—'}
  `.trim();

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Epistemic Feedback', email: 'getepistemic.app@gmail.com' },
        to: [{ email: 'getepistemic.app@gmail.com' }],
        subject: `New signup feedback — ${email}`,
        textContent: emailBody,
      }),
    });

    if (response.status === 201) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();
    console.error('Brevo feedback email error:', data);
    // Don't fail visibly to user if this breaks — feedback is best-effort
    return res.status(200).json({ success: true, warning: 'Feedback may not have been delivered.' });

  } catch (err) {
    console.error('Feedback error:', err);
    // Same: silent fail — don't show error to user for a best-effort feedback form
    return res.status(200).json({ success: true });
  }
}
