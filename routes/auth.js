import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ===========================================
   REGISTER
=========================================== */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      passwordHash,
      name,
      subscription: "free" // default plan
    });

    return res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      subscription: "free"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===========================================
   LOGIN (SECURE VERSION)
=========================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ⛔ DO NOT send passwordHash, stripe IDs, timestamps, anything sensitive
    return res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription || "free"
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
