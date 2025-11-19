import express from "express";
import { auth } from "../middleware/auth.js";
import Community from "../models/Community.js";
import User from "../models/User.js";

const router = express.Router();

/* ===============================
   CREATE COMMUNITY
================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    // Create community
    const community = await Community.create({
      ownerId: userId,
      name,
      description,
      members: [
        { userId: userId, role: "owner" }  // Add creator as member/owner
      ]
    });

    // Add to user record
    await User.findByIdAndUpdate(userId, {
      $push: {
        communities: { communityId: community._id, role: "owner" }
      }
    });

    res.status(201).json(community);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ===============================
   JOIN COMMUNITY (Option A)
   Join with only community ID
================================ */
router.post("/join", auth, async (req, res) => {
  try {
    const { communityId } = req.body;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Check if already member
    if (community.members.some(m => m.userId.toString() === userId)) {
      return res.status(400).json({ message: "You are already in this community" });
    }

    // Add to community members
    community.members.push({ userId, role: "member" });
    await community.save();

    // Add to user's community array
    user.communities.push({ communityId, role: "member" });
    await user.save();

    return res.json({ message: "Joined community successfully", communityId });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ===============================
   MY COMMUNITIES
   Returns full community objects
================================ */
router.get("/my", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const ids = user.communities.map(c => c.communityId);

    const communities = await Community.find({ _id: { $in: ids } });

    res.json(communities);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ===============================
   GET SPECIFIC COMMUNITY DETAILS
================================ */
router.get("/:id", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community)
      return res.status(404).json({ message: "Community not found" });

    res.json(community);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
