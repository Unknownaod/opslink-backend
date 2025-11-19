import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

/* ======================================================
   CREATE SUBSCRIPTION (Custom Checkout Flow)
====================================================== */
router.post("/create-subscription", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    const { fullname, email, address, city, country, zip } = req.body;

    let customer;

    // Create Stripe customer on first purchase
    if (!user.stripeCustomerId) {
      customer = await stripe.customers.create({
        email,
        name: fullname,
        address: {
          line1: address,
          city,
          country,
          postal_code: zip
        }
      });

      user.stripeCustomerId = customer.id;
      await user.save();
    } else {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    }

    // Create subscription + pending payment intent
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PREMIER_PRICE_ID }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"]
    });

    user.subscriptionId = subscription.id;
    user.cancelAtPeriodEnd = false;
    await user.save();

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });

  } catch (err) {
    console.log("CREATE SUB ERROR:", err);
    res.status(500).json({ message: "Stripe subscription failed." });
  }
});


/* ======================================================
   GET CUSTOMER & SUBSCRIPTION (dashboard uses this)
====================================================== */
router.get("/customer", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.stripeCustomerId) {
      return res.json({
        subscription: { status: "free" }
      });
    }

    // Get subscription details from Stripe
    let subscription = null;
    if (user.subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    }

    res.json({
      subscription: subscription
        ? { status: subscription.status }
        : { status: "free" },
      customerId: user.stripeCustomerId
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to load subscription." });
  }
});


/* ======================================================
   STRIPE BILLING PORTAL (manage subscription)
====================================================== */
router.get("/portal", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: "No Stripe customer found." });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: process.env.RETURN_URL || "https://opslink.app/dashboard.html"
    });

    res.json({ url: portal.url });

  } catch (err) {
    res.status(500).json({ message: "Failed to create portal session." });
  }
});


/* ======================================================
   CANCEL SUBSCRIPTION (End of current period)
====================================================== */
router.post("/cancel", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.subscriptionId)
      return res.status(400).json({ message: "No active subscription." });

    const canceled = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true
    });

    user.cancelAtPeriodEnd = true;
    user.planRenews = canceled.current_period_end * 1000;
    await user.save();

    res.json({
      message: "Subscription will end at the end of the billing cycle."
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to cancel subscription." });
  }
});


/* ======================================================
   REACTIVATE SUBSCRIPTION
====================================================== */
router.post("/reactivate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.subscriptionId)
      return res.status(400).json({ message: "No subscription to reactivate." });

    const reactivated = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false
    });

    user.cancelAtPeriodEnd = false;
    user.planRenews = reactivated.current_period_end * 1000;
    await user.save();

    res.json({
      message: "Subscription reactivated!"
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to reactivate subscription." });
  }
});

export default router;
