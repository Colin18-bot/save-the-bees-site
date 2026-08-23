const BREVO_API = "https://api.brevo.com/v3";

const RESOURCE_PACK_URL =
  "https://beezknees.co.uk/downloads/BeezKnees-UK-Beekeeper-Resource-Pack.zip";

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

    throw new Error(
      `Brevo request failed (${response.status}): ${details}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export default {
  async formSubmitted(event) {
    const data = event.data ?? {};

    console.log("Resource-pack form submission received", {
      source: data.source,
      hasEmail: Boolean(data.email),
      marketingConsent: data["marketing-consent"],
    });

    /*
     * Only process submissions from the BeezKnees
     * Resource Pack form.
     */
    if (data.source !== "downloads-resource-pack") {
      console.log("Ignoring unrelated form submission", {
        source: data.source,
      });

      return;
    }

    const email = String(data.email ?? "")
      .trim()
      .toLowerCase();

    const firstName = String(data["first-name"] ?? "").trim();

    const marketingConsent =
      data["marketing-consent"] === "yes";

    if (!email) {
      console.error(
        "Resource-pack submission did not include an email address."
      );

      return;
    }

    /*
     * Brevo transactional template
     */
    const templateId = Number(
      process.env.BREVO_RESOURCE_TEMPLATE_ID
    );

    if (!Number.isInteger(templateId) || templateId <= 0) {
      throw new Error(
        "BREVO_RESOURCE_TEMPLATE_ID is missing or invalid."
      );
    }

    console.log("Sending Brevo resource-pack email", {
      email,
      templateId,
    });

    /*
     * Send the requested Resource Pack email to everyone
     * who completes the form.
     *
     * This happens whether or not they consent to marketing.
     */
    await brevoRequest("/smtp/email", {
      templateId,

      to: [
        {
          email,
          name: firstName || undefined,
        },
      ],

      params: {
        firstName: firstName || "there",
        downloadUrl: RESOURCE_PACK_URL,
      },

      tags: ["beekeeper-resource-pack"],
    });

    console.log(
      "Brevo resource-pack email request accepted",
      {
        email,
      }
    );

    /*
     * If the visitor did NOT actively consent to marketing,
     * stop here.
     *
     * They receive their requested Resource Pack email,
     * but they are NOT added to the marketing list.
     */
    if (!marketingConsent) {
      console.log(
        "No marketing consent; contact not added to marketing list",
        {
          email,
        }
      );

      return;
    }

    /*
     * Marketing consent WAS given.
     */
    const marketingListId = Number(
      process.env.BREVO_MARKETING_LIST_ID
    );

    if (
      !Number.isInteger(marketingListId) ||
      marketingListId <= 0
    ) {
      throw new Error(
        "BREVO_MARKETING_LIST_ID is missing or invalid."
      );
    }

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    /*
     * Create/update the Brevo contact and add them
     * to the marketing list.
     */
    await brevoRequest("/contacts", {
      email,

      updateEnabled: true,

      listIds: [marketingListId],

      attributes: {
        FIRSTNAME: firstName,
        OPT_IN: true,
        CONSENT_SOURCE:
          "BeezKnees Resource Pack - Downloads Page",
        CONSENT_DATE: today,
      },
    });

    console.log(
      "Brevo marketing contact created/updated",
      {
        email,
        marketingListId,
        consentDate: today,
      }
    );
  },
};