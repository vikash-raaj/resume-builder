const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const STRIPE_PRICE_ID_MONTHLY = defineString("STRIPE_PRICE_ID_MONTHLY");
const STRIPE_PRICE_ID_YEARLY = defineString("STRIPE_PRICE_ID_YEARLY");

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

// Client calls this (with the user's Firebase ID token) to get a Stripe
// Checkout URL to redirect to. Creating a session requires the secret key,
// so this can never happen directly from the browser.
exports.createCheckoutSession = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: false },
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
    const priceId = interval === "year" ? STRIPE_PRICE_ID_YEARLY.value() : STRIPE_PRICE_ID_MONTHLY.value();

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: uid,
        metadata: { firebaseUid: uid, interval },
        subscription_data: { metadata: { firebaseUid: uid, interval } },
        success_url: "https://theresumeio.com/payment-success",
        cancel_url: "https://theresumeio.com/#pricing",
      });
      return res.status(200).json({ url: session.url });
    } catch (err) {
      logger.error("Failed to create checkout session", err);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  }
);

// Client calls this to switch an existing subscription between monthly and
// yearly billing. Changes the price on the existing Stripe subscription
// (with proration) rather than creating a second, duplicate subscription.
exports.changeSubscriptionPlan = onRequest(
  { secrets: [STRIPE_SECRET_KEY], cors: false },
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
    const newPriceId = interval === "year" ? STRIPE_PRICE_ID_YEARLY.value() : STRIPE_PRICE_ID_MONTHLY.value();

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    try {
      const statusDoc = await db.doc(`users/${uid}/subscription/status`).get();
      const stripeSubscriptionId = statusDoc.data()?.stripeSubscriptionId;
      if (!stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription to change" });
      }

      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      const itemId = subscription.items.data[0].id;

      await stripe.subscriptions.update(stripeSubscriptionId, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: "create_prorations",
      });

      // The customer.subscription.updated webhook will also confirm this,
      // but we update here too so the UI reflects it immediately.
      await db.doc(`users/${uid}/subscription/status`).set({ interval }, { merge: true });

      return res.status(200).json({ success: true });
    } catch (err) {
      logger.error("Failed to change subscription plan", err);
      return res.status(500).json({ error: "Failed to change plan" });
    }
  }
);

// Stripe calls this directly (never the browser). Verifies the signature
// with the raw request body, then marks the user Pro in Firestore using
// the Admin SDK — the only way that document is allowed to be written.
exports.stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const signature = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, STRIPE_WEBHOOK_SECRET.value());
    } catch (err) {
      logger.warn("Webhook signature verification failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const uid = session.client_reference_id || session.metadata?.firebaseUid;
          if (!uid) {
            logger.warn("checkout.session.completed with no uid", session.id);
            break;
          }
          await db.doc(`users/${uid}/subscription/status`).set(
            {
              plan: "pro",
              status: "active",
              interval: session.metadata?.interval || "month",
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              activatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          logger.info("Activated Pro for user", uid);
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const uid = subscription.metadata?.firebaseUid;
          if (uid) {
            await db.doc(`users/${uid}/subscription/status`).set(
              { plan: "free", status: "canceled" },
              { merge: true }
            );
            logger.info("Downgraded canceled subscription for user", uid);
          }
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const uid = subscription.metadata?.firebaseUid;
          if (uid) {
            const interval = subscription.items.data[0]?.price?.recurring?.interval === "year" ? "year" : "month";
            const isActive = subscription.status === "active" || subscription.status === "trialing";
            await db.doc(`users/${uid}/subscription/status`).set(
              { plan: isActive ? "pro" : "free", status: subscription.status, interval },
              { merge: true }
            );
            logger.info("Synced subscription update for user", uid, interval, subscription.status);
          }
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
