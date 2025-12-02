import express from "express";
import { auth } from "../middleware/auth.js";
import Unit from "../models/Unit.js";

const router = express.Router();

/* ============================================================
   CREATE UNIT (First time going 10-8)
   ============================================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const { communityId, callsign, name, departmentId, rank, type } = req.body;

    // Prevent duplicate unit for same user in same community
    const exists = await Unit.findOne({
      communityId,
      userId: req.user.userId
    });

    if (exists) {
      return res.status(400).json({
        message: "You already have a unit in this community."
      });
    }

    const unit = await Unit.create({
  communityId,
  userId: req.user.userId,
  callsign,
  name,
  departmentId: resolvedDeptId || departmentId,
  rank,
  type,
  status: "10-8"
});

// Only broadcast if Socket.IO is available
if (req.io) {
  try {
    req.io.emit("unit:status", {
      unitId: unit._id,
      callsign: unit.callsign,
      status: "10-8"
    });
  } catch (err) {
    console.warn("Socket emit failed:", err.message);
  }
}

    return res.status(201).json(unit);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


/* ============================================================
   GET USER'S UNIT
   ============================================================ */
router.get("/:communityId/me", auth, async (req, res) => {
  try {
    const unit = await Unit.findOne({
      communityId: req.params.communityId,
      userId: req.user.userId
    });

    return res.json(unit || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


/* ============================================================
   GET ALL UNITS IN COMMUNITY
   ============================================================ */
router.get("/:communityId", auth, async (req, res) => {
  try {
    const units = await Unit.find({ communityId: req.params.communityId });
    return res.json(units);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


/* ============================================================
   UPDATE STATUS (10-8, 10-7, ENROUTE, BUSY, etc)
   ============================================================ */
router.post("/:unitId/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { status, lastActive: Date.now() },
      { new: true }
    );

    req.io.emit("unit:status", updated);

    return res.json(updated);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


/* ============================================================
   UPDATE LOCATION (GPS)
   ============================================================ */
router.post("/:unitId/location", auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    const updated = await Unit.findByIdAndUpdate(
      req.params.unitId,
      {
        location: { lat, lng },
        lastActive: Date.now()
      },
      { new: true }
    );

    req.io.emit("unit:location", updated);

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
    const updated = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { status: "panic" },
      { new: true }
    );

    req.io.emit("unit:panic", updated);

    return res.json(updated);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


/* ============================================================
   SUPERVISOR: FORCE UNIT OFFLINE
   ============================================================ */
router.post("/:unitId/forceOffline", auth, async (req, res) => {
  try {
    const updated = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { status: "10-7" },
      { new: true }
    );

    req.io.emit("unit:forceOffline", updated);

    return res.json(updated);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


/* ============================================================
   DELETE UNIT (Admin / Owner)
   ============================================================ */
router.delete("/:unitId/delete", auth, async (req, res) => {
  try {
    await Unit.findByIdAndDelete(req.params.unitId);

    return res.json({ message: "Unit removed." });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


export default router;

