import express from "express";
import { auth } from "../middleware/auth.js";
import MDTUnitSession from "../models/MDTUnitSession.js";
import Unit from "../models/Unit.js";

const router = express.Router();

/* ============================================================
   START MDT SESSION
   POST /mdt/session/start
   Body: { unitId, communityId }
============================================================ */
router.post("/session/start", auth, async (req, res) => {
  try {
    const { unitId, communityId } = req.body;

    if (!unitId || !communityId)
      return res.status(400).json({ message: "Missing unitId or communityId" });

    // close any orphaned active sessions
    await MDTUnitSession.updateMany(
      { unitId, online: true },
      { online: false, sessionEnded: Date.now() }
    );

    const session = await MDTUnitSession.create({
      unitId,
      userId: req.user.userId,
      communityId,
      online: true,
      sessionStarted: Date.now(),
      lastStatus: "10-8"
    });

    return res.status(201).json(session);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   END MDT SESSION
   POST /mdt/session/end
   Body: { unitId }
============================================================ */
router.post("/session/end", auth, async (req, res) => {
  try {
    const { unitId } = req.body;

    if (!unitId)
      return res.status(400).json({ message: "Missing unitId" });

    const session = await MDTUnitSession.findOneAndUpdate(
      { unitId, online: true },
      { online: false, sessionEnded: Date.now() },
      { new: true }
    );

    return res.json(session || { message: "No active session" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET MY ACTIVE MDT SESSION
   GET /mdt/session/me/:communityId
============================================================ */
router.get("/session/me/:communityId", auth, async (req, res) => {
  try {
    const session = await MDTUnitSession.findOne({
      userId: req.user.userId,
      communityId: req.params.communityId,
      online: true
    });

    return res.json(session || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL ACTIVE SESSIONS IN COMMUNITY
   GET /mdt/sessions/:communityId
============================================================ */
router.get("/sessions/:communityId", auth, async (req, res) => {
  try {
    const sessions = await MDTUnitSession.find({
      communityId: req.params.communityId,
      online: true
    }).populate("unitId userId");

    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET MDT HISTORY FOR UNIT
   GET /mdt/history/:unitId
============================================================ */
router.get("/history/:unitId", auth, async (req, res) => {
  try {
    const sessions = await MDTUnitSession.find({ unitId: req.params.unitId })
      .sort({ sessionStarted: -1 });

    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE MDT LAST STATUS
   POST /mdt/status
   Body: { unitId, status }
============================================================ */
router.post("/status", auth, async (req, res) => {
  try {
    const { unitId, status } = req.body;

    await MDTUnitSession.findOneAndUpdate(
      { unitId, online: true },
      { lastStatus: status, lastUpdate: Date.now() }
    );

    return res.json({ updated: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE MDT LOCATION
   POST /mdt/location
   Body: { unitId, lat, lng }
============================================================ */
router.post("/location", auth, async (req, res) => {
  try {
    const { unitId, lat, lng } = req.body;

    await MDTUnitSession.findOneAndUpdate(
      { unitId, online: true },
      { lastLocation: { lat, lng }, lastUpdate: Date.now() }
    );

    return res.json({ updated: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   SUPERVISOR: FORCE END SESSION
   POST /mdt/session/forceEnd
   Body: { unitId }
============================================================ */
router.post("/session/forceEnd", auth, async (req, res) => {
  try {
    const { unitId } = req.body;

    await MDTUnitSession.findOneAndUpdate(
      { unitId, online: true },
      { online: false, sessionEnded: Date.now() }
    );

    return res.json({ forced: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
