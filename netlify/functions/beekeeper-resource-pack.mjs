const BREVO_API = "https://api.brevo.com/v3";
const RESOURCE_PACK_URL = "https://beezknees.co.uk/downloads/BeezKnees-UK-Beekeeper-Resource-Pack.zip";

async function brevoRequest(path, body) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured in Netlify.");
  }

  const response = await fetch(`${BREVO_API}${path}`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo request failed (${response.status}): ${details}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export default {
  async formSubmitted(event) {
    const data = event.data ?? {};

    // Ignore every Netlify form except the BeezKnees resource-pack form.
    if (data["form-name"] !== "beekeeper-resource-pack") return;

    const email = String(data.email ?? "").trim().toLowerCase();
    const firstName = String(data["first-name"] ?? "").trim();
    const marketingConsent = data["marketing-consent"] === "yes";

    if (!email) {
      console.error("Resource-pack submission did not include an email address.");
      return;
    }

    const templateId = Number(process.env.BREVO_RESOURCE_TEMPLATE_ID);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      throw new Error("BREVO_RESOURCE_TEMPLATE_ID is missing or invalid.");
    }

    // Everyone who requests the pack receives the delivery email.
    await brevoRequest("/smtp/email", {
      templateId,
      to: [{ email, name: firstName || undefined }],
      params: {
        firstName: firstName || "there",
        downloadUrl: RESOURCE_PACK_URL,
      },
      tags: ["beekeeper-resource-pack"],
    });

    // Only an explicit opt-in becomes a marketing contact.
    if (!marketingConsent) return;

    const marketingListId = Number(process.env.BREVO_MARKETING_LIST_ID);
    if (!Number.isInteger(marketingListId) || marketingListId <= 0) {
      throw new Error("BREVO_MARKETING_LIST_ID is missing or invalid.");
    }

    const today = new Date().toISOString().slice(0, 10);

    await brevoRequest("/contacts", {
      email,
      updateEnabled: true,
      listIds: [marketingListId],
      attributes: {
        FIRSTNAME: firstName,
        OPT_IN: true,
        CONSENT_SOURCE: "BeezKnees Resource Pack - Downloads Page",
        CONSENT_DATE: today,
      },
    });
  },
};
