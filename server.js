import http from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";

import billingRoutes from "./routes/billingRoutes.js";
import User from "./models/User.js";
import Stripe from "stripe";

import app from "./app.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);

// =======================================================
// CORS CONFIG
// =======================================================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200);
});


// =======================================================
// STRIPE WEBHOOK (MUST BE BEFORE express.json())
// =======================================================
app.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ============ PAYMENT SUCCESS ============
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          subscription: "premier",
          cancelAtPeriodEnd: false,
          planRenews: new Date(invoice.lines.data[0].period.end * 1000),
          subscriptionId: invoice.subscription
        }
      );
    }

    // ============ SUB CANCELLED IMMEDIATELY ============
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;

      await User.findOneAndUpdate(
        { subscriptionId: sub.id },
        {
          subscription: "free",
          subscriptionId: null,
          cancelAtPeriodEnd: false
        }
      );
    }

    // ============ PAYMENT FAILED ============
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;

      await User.findOneAndUpdate(
        { stripeCustomerId: invoice.customer },
        {
          subscription: "free",
          subscriptionId: null
        }
      );
    }

    return res.json({ received: true });
  }
);


// =======================================================
// JSON PARSER — AFTER WEBHOOK (FIXES LOGIN ISSUE)
// =======================================================
app.use(express.json());


// =======================================================
// BILLING API
// =======================================================
app.use("/billing", billingRoutes);


// =======================================================
// HEALTH CHECKS
// =======================================================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "OpsLink API is running successfully.",
    uptime: process.uptime()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});


// =======================================================
// HTTP SERVER + SOCKET.IO
// =======================================================
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("unit:status", (d) => io.emit("unit:status", d));
  socket.on("unit:location", (d) => io.emit("unit:location", d));
  socket.on("unit:forceOffline", (d) => io.emit("unit:forceOffline", d));
  socket.on("unit:panic", (d) => io.emit("unit:panic", d));
  socket.on("call:update", (d) => io.emit("call:update", d));

  socket.on("disconnect", () =>
    console.log("🔴 Socket disconnected:", socket.id)
  );
});

server.listen(PORT, () => {
  console.log(`🚀 OpsLink API running on port ${PORT}`);
});


