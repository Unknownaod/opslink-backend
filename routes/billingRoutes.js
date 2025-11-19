import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

/* ============================================
   CREATE SUBSCRIPTION
============================================= */
router.post("/create-subscription", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    let customer;

    // Create customer if new
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

    // Create subscription (Premier plan)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PREMIER_PRICE_ID }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"]
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


/* ============================================
   CANCEL SUBSCRIPTION (Stops Auto-Renew)
============================================= */
router.post("/cancel", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.subscriptionId)
      return res.status(400).json({ message: "No active subscription." });

    // Set Stripe subscription to cancel at end of period
    const canceled = await stripe.subscriptions.update(
      user.subscriptionId,
      { cancel_at_period_end: true }
    );

    user.planRenews = canceled.current_period_end * 1000;
    await user.save();

    res.json({
      message: "Subscription will cancel at the end of the current billing period.",
      renews: new Date(user.planRenews)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
