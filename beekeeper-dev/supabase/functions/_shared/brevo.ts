// supabase/functions/_shared/brevo.ts

export type BrevoRecipient = {
  email: string;
  name?: string;
};

export type SendBrevoTemplateEmailOptions = {
  templateId: number;
  to: BrevoRecipient | BrevoRecipient[];
  params?: Record<string, unknown>;
  replyTo?: BrevoRecipient;
};

export async function sendBrevoTemplateEmail(
  options: SendBrevoTemplateEmailOptions,
  apiKey: string
) {
  if (!apiKey) {
    throw new Error("Brevo API key is missing.");
  }

  const recipients = Array.isArray(options.to)
    ? options.to
    : [options.to];

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        templateId: options.templateId,
        to: recipients,
        params: options.params ?? {},
        ...(options.replyTo
          ? { replyTo: options.replyTo }
          : {}),
      }),
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Brevo email failed (${response.status}): ${responseText}`
    );
  }

  return responseText
    ? JSON.parse(responseText)
    : null;
}