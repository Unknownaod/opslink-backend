import express from "express";
import { auth } from "../middleware/auth.js";
import MDTUnitSession from "../models/MDTUnitSession.js";

const router = express.Router();

/* ============================================================
   START MDT SESSION / CREATE UNIT
============================================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const { communityId, callsign, name, department, rank, type } = req.body;

    if (!callsign || !communityId)
      return res.status(400).json({ message: "Callsign and community required" });

    // Prevent multiple active units for same user
    const existing = await MDTUnitSession.findOne({
      communityId,
      userId: req.user.userId
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have an active MDT session."
      });
    }

    const unit = await MDTUnitSession.create({
      communityId,
      userId: req.user.userId,
      callsign,
      name,
      department,
      rank,
      type,
      status: "10-8"
    });

    if (req.io) {
      req.io.emit("unit:status", {
        unitId: unit._id,
        callsign: unit.callsign,
        status: "10-8"
      });
    }

    return res.status(201).json(unit);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET MY CURRENT MDT SESSION
============================================================ */
router.get("/:communityId/me", auth, async (req, res) => {
  try {
    const unit = await MDTUnitSession.findOne({
      communityId: req.params.communityId,
      userId: req.user.userId
    });

    return res.json(unit || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL ACTIVE UNITS IN COMMUNITY
============================================================ */
router.get("/:communityId", auth, async (req, res) => {
  try {
    const units = await MDTUnitSession.find({
      communityId: req.params.communityId
    });

    return res.json(units);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE STATUS
============================================================ */
router.post("/:unitId/status", auth, async (req, res) => {
  try {
    const updated = await MDTUnitSession.findByIdAndUpdate(
      req.params.unitId,
      { status: req.body.status, lastActive: Date.now() },
      { new: true }
    );

    req.io?.emit("unit:status", updated);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE LOCATION
============================================================ */
router.post("/:unitId/location", auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const updated = await MDTUnitSession.findByIdAndUpdate(
      req.params.unitId,
      {
        location: { lat, lng, updatedAt: Date.now() },
        lastActive: Date.now()
      },
      { new: true }
    );

    req.io?.emit("unit:location", updated);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   PANIC BUTTON
============================================================ */
router.post("/:unitId/panic", auth, async (req, res) => {
  try {
    const updated = await MDTUnitSession.findByIdAndUpdate(
      req.params.unitId,
      { status: "panic", lastActive: Date.now() },
      { new: true }
    );

    req.io?.emit("unit:panic", updated);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   FORCE UNIT OFFLINE (Supervisor)
============================================================ */
router.post("/:unitId/forceOffline", auth, async (req, res) => {
  try {
    const updated = await MDTUnitSession.findByIdAndUpdate(
      req.params.unitId,
      { status: "10-7", lastActive: Date.now() },
      { new: true }
    );

    req.io?.emit("unit:forceOffline", updated);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   END SESSION (User logs out / page closes)
============================================================ */
router.delete("/:unitId/end", auth, async (req, res) => {
  try {
    await MDTUnitSession.findByIdAndDelete(req.params.unitId);
    req.io?.emit("unit:end", { unitId: req.params.unitId });

    return res.json({ message: "MDT session ended." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
