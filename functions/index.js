const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const LEMONSQUEEZY_API_KEY = defineSecret("LEMONSQUEEZY_API_KEY");
const LEMONSQUEEZY_WEBHOOK_SECRET = defineSecret("LEMONSQUEEZY_WEBHOOK_SECRET");
const LEMONSQUEEZY_STORE_ID = defineString("LEMONSQUEEZY_STORE_ID");
const LEMONSQUEEZY_VARIANT_ID_MONTHLY = defineString("LEMONSQUEEZY_VARIANT_ID_MONTHLY");
const LEMONSQUEEZY_VARIANT_ID_YEARLY = defineString("LEMONSQUEEZY_VARIANT_ID_YEARLY");

const LEMONSQUEEZY_API_BASE = "https://api.lemonsqueezy.com/v1";

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const AI_MODEL = "claude-haiku-4-5-20251001";
const AI_FREE_MONTHLY_QUOTA = 30;
const AI_MAX_TOKENS_CEILING = 2000;

const ALLOWED_ORIGINS = new Set([
  "https://theresumeio.com",
  "https://resumecraft-app.web.app",
  "http://localhost:5173",
  "http://localhost:5174",
]);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) res.set("Access-Control-Allow-Origin", origin);
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function lemonSqueezyFetch(path, options = {}) {
  const res = await fetch(`${LEMONSQUEEZY_API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY.value()}`,
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Lemon Squeezy API error (${res.status})`);
    err.body = body;
    throw err;
  }
  return body;
}

// Client calls this (with the user's Firebase ID token) to get a Lemon
// Squeezy Checkout URL to redirect to. Creating a checkout requires the
// secret API key, so this can never happen directly from the browser.
exports.createCheckoutSession = onRequest(
  { secrets: [LEMONSQUEEZY_API_KEY], cors: false },
  async (req, res) => {
    applyCors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: "Missing Authorization header" });

    let uid;
    try {
      ({ uid } = await admin.auth().verifyIdToken(idToken));
    } catch (err) {
      logger.warn("Invalid ID token", err);
      return res.status(401).json({ error: "Invalid ID token" });
    }

    const interval = req.body?.interval === "year" ? "year" : "month";
    const variantId =
      interval === "year" ? LEMONSQUEEZY_VARIANT_ID_YEARLY.value() : LEMONSQUEEZY_VARIANT_ID_MONTHLY.value();

    try {
      const body = await lemonSqueezyFetch("/checkouts", {
        method: "POST",
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                custom: { firebase_uid: uid, interval },
              },
              product_options: {
                redirect_url: "https://theresumeio.com/payment-success",
              },
            },
            relationships: {
              store: { data: { type: "stores", id: String(LEMONSQUEEZY_STORE_ID.value()) } },
              variant: { data: { type: "variants", id: String(variantId) } },
            },
          },
        }),
      });
      return res.status(200).json({ url: body.data.attributes.url });
    } catch (err) {
      logger.error("Failed to create checkout session", err.body || err);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  }
);

// Client calls this to switch an existing subscription between monthly and
// yearly billing. Changes the variant on the existing Lemon Squeezy
// subscription (with proration) rather than creating a second subscription.
exports.changeSubscriptionPlan = onRequest(
  { secrets: [LEMONSQUEEZY_API_KEY], cors: false },
  async (req, res) => {
    applyCors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: "Missing Authorization header" });

    let uid;
    try {
      ({ uid } = await admin.auth().verifyIdToken(idToken));
    } catch (err) {
      logger.warn("Invalid ID token", err);
      return res.status(401).json({ error: "Invalid ID token" });
    }

    const interval = req.body?.interval === "year" ? "year" : "month";
    const newVariantId =
      interval === "year" ? LEMONSQUEEZY_VARIANT_ID_YEARLY.value() : LEMONSQUEEZY_VARIANT_ID_MONTHLY.value();

    try {
      const statusDoc = await db.doc(`users/${uid}/subscription/status`).get();
      const subscriptionId = statusDoc.data()?.lemonSqueezySubscriptionId;
      if (!subscriptionId) {
        return res.status(400).json({ error: "No active subscription to change" });
      }

      await lemonSqueezyFetch(`/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        body: JSON.stringify({
          data: {
            type: "subscriptions",
            id: String(subscriptionId),
            attributes: { variant_id: Number(newVariantId) },
          },
        }),
      });

      // The lemonSqueezyWebhook will also confirm this via subscription_updated,
      // but we update here too so the UI reflects it immediately.
      await db.doc(`users/${uid}/subscription/status`).set({ interval }, { merge: true });

      return res.status(200).json({ success: true });
    } catch (err) {
      logger.error("Failed to change subscription plan", err.body || err);
      return res.status(500).json({ error: "Failed to change plan" });
    }
  }
);

// Lemon Squeezy calls this directly (never the browser). Verifies the
// signature with the raw request body, then marks the user Pro in Firestore
// using the Admin SDK — the only way that document is allowed to be written.
exports.lemonSqueezyWebhook = onRequest(
  { secrets: [LEMONSQUEEZY_WEBHOOK_SECRET] },
  async (req, res) => {
    const signatureHeader = req.headers["x-signature"] || "";
    const hmac = crypto.createHmac("sha256", LEMONSQUEEZY_WEBHOOK_SECRET.value());
    const digest = hmac.update(req.rawBody).digest("hex");

    const digestBuf = Buffer.from(digest, "utf8");
    const signatureBuf = Buffer.from(signatureHeader, "utf8");
    const valid =
      digestBuf.length === signatureBuf.length && crypto.timingSafeEqual(digestBuf, signatureBuf);

    if (!valid) {
      logger.warn("Webhook signature verification failed");
      return res.status(400).send("Invalid signature");
    }

    let event;
    try {
      event = JSON.parse(req.rawBody.toString("utf8"));
    } catch (err) {
      logger.warn("Failed to parse webhook body", err);
      return res.status(400).send("Invalid payload");
    }

    try {
      const eventName = event.meta?.event_name;
      const uid = event.meta?.custom_data?.firebase_uid;
      const attrs = event.data?.attributes;

      if (!uid) {
        logger.warn("Webhook event with no firebase_uid", eventName, event.data?.id);
        return res.status(200).send();
      }

      switch (eventName) {
        case "subscription_created":
        case "subscription_updated":
        case "subscription_resumed":
        case "subscription_unpaused": {
          // Note: subscription_payment_success is deliberately NOT handled
          // here — that event's data is a subscription-invoice object
          // (status: "paid"/"pending"/...), not a subscription object
          // (status: "active"/"on_trial"/...), so it doesn't fit this shape.
          // subscription_created/updated already cover every state change.
          const variantId = String(attrs.variant_id);
          const interval = variantId === LEMONSQUEEZY_VARIANT_ID_YEARLY.value() ? "year" : "month";
          // "cancelled" subscriptions keep access until their period ends
          // (ends_at), same as Stripe's cancel_at_period_end behaviour.
          const isActive = ["active", "on_trial", "cancelled"].includes(attrs.status);
          await db.doc(`users/${uid}/subscription/status`).set(
            {
              plan: isActive ? "pro" : "free",
              status: attrs.status,
              interval,
              lemonSqueezyCustomerId: attrs.customer_id,
              lemonSqueezySubscriptionId: Number(event.data.id),
              activatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          logger.info("Synced subscription for user", uid, eventName, attrs.status);
          break;
        }
        case "subscription_expired": {
          await db.doc(`users/${uid}/subscription/status`).set(
            { plan: "free", status: "expired" },
            { merge: true }
          );
          logger.info("Downgraded expired subscription for user", uid);
          break;
        }
        default:
          break;
      }
      return res.status(200).send();
    } catch (err) {
      logger.error("Error handling webhook event", err);
      return res.status(500).send();
    }
  }
);

// Proxies Claude API calls so free/non-technical users don't need their own
// Anthropic key. Requires a signed-in Firebase user; Pro subscribers get
// unlimited use, free-tier users are capped at AI_FREE_MONTHLY_QUOTA
// requests per calendar month (tracked in Firestore, reset by the new
// month's document key rather than a cron job).
exports.aiProxy = onRequest(
  { secrets: [ANTHROPIC_API_KEY], cors: false },
  async (req, res) => {
    applyCors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: "Missing Authorization header" });

    let uid;
    try {
      ({ uid } = await admin.auth().verifyIdToken(idToken));
    } catch (err) {
      logger.warn("Invalid ID token", err);
      return res.status(401).json({ error: "Invalid ID token" });
    }

    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
    if (!prompt.trim()) return res.status(400).json({ error: "Missing prompt" });
    const systemPrompt = typeof req.body?.systemPrompt === "string" ? req.body.systemPrompt : undefined;
    const maxTokens = Math.min(Number(req.body?.maxTokens) || 600, AI_MAX_TOKENS_CEILING);

    try {
      const statusDoc = await db.doc(`users/${uid}/subscription/status`).get();
      const sub = statusDoc.data() || {};
      const isPro = sub.status === "active" && sub.plan === "pro";

      if (!isPro) {
        const monthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"
        const usageRef = db.doc(`users/${uid}/aiUsage/${monthKey}`);
        const withinQuota = await db.runTransaction(async (tx) => {
          const snap = await tx.get(usageRef);
          const count = snap.data()?.count || 0;
          if (count >= AI_FREE_MONTHLY_QUOTA) return false;
          tx.set(usageRef, { count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
          return true;
        });
        if (!withinQuota) {
          return res.status(429).json({
            error: `Free plan is limited to ${AI_FREE_MONTHLY_QUOTA} AI requests per month. Upgrade to Pro for unlimited use.`,
            code: "QUOTA_EXCEEDED",
          });
        }
      }

      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY.value(),
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: maxTokens,
          system: systemPrompt || "You are an expert resume writer. Write concise, impactful, professional content. Return only the requested text — no preamble, no quotes, no extra explanation.",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!claudeRes.ok) {
        const errBody = await claudeRes.json().catch(() => ({}));
        logger.error("Anthropic API error", claudeRes.status, errBody);
        return res.status(502).json({ error: errBody?.error?.message || `Anthropic API error ${claudeRes.status}` });
      }

      const data = await claudeRes.json();
      const text = data.content?.[0]?.text?.trim() || "";
      return res.status(200).json({ text });
    } catch (err) {
      logger.error("aiProxy failed", err);
      return res.status(500).json({ error: "AI request failed" });
    }
  }
);
