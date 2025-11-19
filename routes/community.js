import express from "express";
import { auth } from "../middleware/auth.js";
import { requireOwner } from "../middleware/roles.js";
import Community from "../models/Community.js";
import User from "../models/User.js";

const router = express.Router();

/* ============================
   KEY GENERATOR
============================ */
function generateKey(prefix) {
  return prefix.toUpperCase() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ============================
   CREATE COMMUNITY
============================ */
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    const community = await Community.create({
      ownerId: userId,
      name,
      description,

      permissionKeys: {
        leo: generateKey("LEO"),
        fire: generateKey("FIRE"),
        dispatch: generateKey("DISP"),
        supervisor: generateKey("SUP"),
        admin: generateKey("ADMIN")
      },

      members: [
        {
          userId,
          role: "owner",
          permissions: ["leo", "fire", "dispatch", "supervisor", "admin"]
        }
      ]
    });

    await User.findByIdAndUpdate(userId, {
      $push: { communities: { communityId: community._id, role: "owner" } }
    });

    res.status(201).json(community);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   JOIN COMMUNITY
============================ */
router.post("/join", auth, async (req, res) => {
  try {
    const { communityId } = req.body;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Already a member?
    if (community.members.some(m => m.userId.toString() === userId)) {
      return res.status(400).json({ message: "Already in this community" });
    }

    community.members.push({ userId, role: "member", permissions: [] });
    await community.save();

    user.communities.push({ communityId, role: "member" });
    await user.save();

    res.json({ message: "Joined community successfully", communityId });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   CLAIM PERMISSION KEY
============================ */
router.post("/permission/claim", auth, async (req, res) => {
  try {
    const { communityId, key } = req.body;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    let matchedRole = null;

    // Match against stored permission keys
    for (const [role, storedKey] of Object.entries(community.permissionKeys)) {
      if (storedKey === key) matchedRole = role;
    }

    if (!matchedRole)
      return res.status(400).json({ message: "Invalid permission key" });

    const member = community.members.find(m => m.userId.toString() === userId);

    if (!member)
      return res.status(400).json({ message: "You are not part of this community" });

    // Grant permission
    if (!member.permissions.includes(matchedRole)) {
      member.permissions.push(matchedRole);
      await community.save();
    }

    res.json({ granted: matchedRole });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   OWNER-ONLY: VIEW PERMISSION KEYS
============================ */
router.get("/:communityId/keys", auth, requireOwner, async (req, res) => {
  const community = req.community;
  res.json(community.permissionKeys);
});

/* ============================
   GET USER COMMUNITIES
============================ */
router.get("/my", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const ids = user.communities.map(c => c.communityId);
    const communities = await Community.find({ _id: { $in: ids } });

    res.json(communities);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================
   COMMUNITY DETAILS
============================ */
router.get("/:id", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    res.json(community);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
