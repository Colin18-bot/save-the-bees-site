// /netlify/functions/send-email.js

import { Resend } from 'resend';

const resend = new Resend('your_api_key_here'); // Replace with your Resend API key

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = JSON.parse(req.body);

  try {
    const data = await resend.emails.send({
      from: 'Your Name <info@beezknees.co.uk>',
      to,
      subject,
      html,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Email failed to send' });
  }
};
