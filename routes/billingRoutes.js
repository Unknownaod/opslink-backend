import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

/* ======================================================
   CREATE SUBSCRIPTION
====================================================== */
router.post("/create-subscription", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    let customer;

    // Create Stripe customer if new
    if (!user.stripeCustomerId) {
      customer = await stripe.customers.create({
        email: req.body.email,
        name: req.body.fullname,
        address: {
          line1: req.body.address,
          city: req.body.city,
          postal_code: req.body.zip,
          country: req.body.country
        }
      });

      user.stripeCustomerId = customer.id;
      await user.save();
    } else {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PREMIER_PRICE_ID }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"]
    });

    // Save subscription ID for later
    user.subscriptionId = subscription.id;
    await user.save();

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });

  } catch (err) {
    console.log("CREATE SUB ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


/* ======================================================
   GET SUBSCRIPTION STATUS
====================================================== */
router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    res.json({
      subscription: user.subscription || "free",
      subscriptionId: user.subscriptionId || null,
      renews: user.planRenews || null,
      stripeCustomerId: user.stripeCustomerId || null
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ======================================================
   CANCEL SUBSCRIPTION (at next renewal)
====================================================== */
router.post("/cancel", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.subscriptionId)
      return res.status(400).json({ message: "No active subscription found." });

    // Cancel at end of period (keeps access until end date)
    const canceled = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true
    });

    user.planRenews = canceled.current_period_end * 1000;
    user.cancelAtPeriodEnd = true;
    await user.save();

    res.json({
      message: "Your subscription will end at the next billing period.",
      endDate: new Date(user.planRenews)
    });

  } catch (err) {
    console.log("CANCEL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


/* ======================================================
   REACTIVATE SUBSCRIPTION
====================================================== */
router.post("/reactivate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.subscriptionId)
      return res.status(400).json({ message: "No subscription found." });

    const reactivated = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false
    });

    user.cancelAtPeriodEnd = false;
    user.planRenews = reactivated.current_period_end * 1000;
    await user.save();

    res.json({
      message: "Subscription reactivated!",
      renews: new Date(user.planRenews)
    });

  } catch (err) {
    console.log("REACTIVATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


export default router;
