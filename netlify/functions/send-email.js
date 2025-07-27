export default async (req, res) => {
  const { to, name } = req.body;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "BeezKnees <noreply@beezknees.co.uk>",
      to: [to],
      subject: "Welcome to BeezKnees",
      html: `<p>Hi ${name},</p><p>Thanks for registering with BeezKnees. You're all set to start managing your hives!</p><p>🐝</p>`
    })
  });

  if (!emailResponse.ok) {
    return res.status(500).json({ error: "Failed to send email." });
  }

  return res.status(200).json({ success: true });
};
