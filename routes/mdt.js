import express from "express";
import { auth } from "../middleware/auth.js";
import MDTUnitSession from "../models/MDTUnitSession.js";
import Unit from "../models/Unit.js";

const router = express.Router();

/* ============================================================
   START MDT SESSION
   POST /mdt/session/start
============================================================ */
router.post("/session/start", auth, async (req, res) => {
  try {
    const { communityId, unitId } = req.body;

    if (!unitId || !communityId)
      return res.status(400).json({ message: "Missing unitId or communityId" });

    // End previous session (failsafe)
    await MDTUnitSession.updateMany(
      { unitId, online: true },
      { online: false, sessionEnded: Date.now() }
    );

    const session = await MDTUnitSession.create({
      unitId,
      userId: req.user.userId,
      communityId,
      online: true,
      lastStatus: "10-8"
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   END MDT SESSION
   POST /mdt/session/end
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

    res.json(session || { message: "No active session" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
