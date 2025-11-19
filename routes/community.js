import express from "express";
import { auth } from "../middleware/auth.js";
import { requireOwner } from "../middleware/roles.js";
import Community from "../models/Community.js";
import User from "../models/User.js";

const router = express.Router();

/* ============================================
   KEY GENERATOR
============================================ */
function generateKey(prefix) {
  return prefix.toUpperCase() + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ============================================
   CREATE COMMUNITY
============================================ */
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
      ],
      ranks: []
    });

    await User.findByIdAndUpdate(userId, {
      $push: { communities: { communityId: community._id, role: "owner" } }
    });

    res.status(201).json(community);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   GET USER COMMUNITIES (FIXED)
============================================ */
router.get("/my", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.communities) return res.json([]);

    const ids = user.communities.map(c => c.communityId.toString());
    const existing = await Community.find({ _id: { $in: ids } });

    // Build cleaned list (communities that still exist)
    const existingIds = existing.map(c => c._id.toString());

    const cleanedCommunities = user.communities.filter(c =>
      existingIds.includes(c.communityId.toString())
    );

    // If cleanup needed, save user
    if (cleanedCommunities.length !== user.communities.length) {
      user.communities = cleanedCommunities;
      await user.save();
    }

    res.json(existing);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   JOIN COMMUNITY
============================================ */
router.post("/join", auth, async (req, res) => {
  try {
    const { communityId } = req.body;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.members.some(m => m.userId.toString() === userId)) {
      return res.status(400).json({ message: "Already in this community" });
    }

    community.members.push({ userId, role: "member", permissions: [] });
    await community.save();

    await User.findByIdAndUpdate(userId, {
      $push: { communities: { communityId, role: "member" } }
    });

    res.json({ message: "Joined community successfully", communityId });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   CLAIM PERMISSION KEY
============================================ */
router.post("/permission/claim", auth, async (req, res) => {
  try {
    const { communityId, key } = req.body;
    const userId = req.user.userId;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    let matchedRole = null;

    for (const [role, storedKey] of Object.entries(community.permissionKeys)) {
      if (storedKey === key) matchedRole = role;
    }

    if (!matchedRole)
      return res.status(400).json({ message: "Invalid permission key" });

    const member = community.members.find(m => m.userId.toString() === userId);
    if (!member)
      return res.status(400).json({ message: "You are not in this community" });

    if (!member.permissions.includes(matchedRole)) {
      member.permissions.push(matchedRole);
      await community.save();
    }

    res.json({ granted: matchedRole });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   RANK SYSTEM
============================================ */

// GET RANKS
router.get("/:communityId/ranks", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    res.json(community.ranks || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE RANK
router.post("/:communityId/ranks/create", auth, requireOwner, async (req, res) => {
  try {
    const { name } = req.body;
    const community = req.community;

    community.ranks.push({ name });
    await community.save();

    res.json(community.ranks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE RANK
router.delete("/:communityId/ranks/delete/:rankId", auth, requireOwner, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);

    community.ranks = community.ranks.filter(r => r._id.toString() !== req.params.rankId);
    await community.save();

    res.json({ message: "Rank deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   GET MEMBERS
============================================ */
router.get("/:communityId/members", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId)
      .populate("members.userId");

    if (!community) return res.status(404).json({ message: "Community not found" });

    const members = community.members.map(m => ({
      _id: m._id,
      userId: m.userId._id,
      email: m.userId.email,
      role: m.role,
      permissions: m.permissions
    }));

    res.json(members);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   UPDATE COMMUNITY
============================================ */
router.post("/update/:id", auth, requireOwner, async (req, res) => {
  try {
    const { name, description } = req.body;

    const updated = await Community.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   DELETE COMMUNITY
============================================ */
router.delete("/delete/:id", auth, requireOwner, async (req, res) => {
  try {
    const communityId = req.params.id;

    await Community.findByIdAndDelete(communityId);

    await User.updateMany(
      { "communities.communityId": communityId },
      {
        $pull: {
          communities: { communityId }
        }
      }
    );

    res.json({ message: "Community deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   GET COMMUNITY DETAILS
============================================ */
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
