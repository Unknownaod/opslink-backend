import express from "express";
import { auth } from "../middleware/auth.js";
import Community from "../models/Community.js";
import User from "../models/User.js";

const router = express.Router();

// Create a new community
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const community = await Community.create({
      ownerId: req.user.userId,
      name,
      description
    });

    // Add user as owner
    await User.findByIdAndUpdate(req.user.userId, {
      $push: {
        communities: { communityId: community._id, role: "owner" }
      }
    });

    res.status(201).json(community);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all communities user belongs to
router.get("/mine", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user.communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
