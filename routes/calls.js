import express from "express";
import { auth } from "../middleware/auth.js";
import Call from "../models/Call.js";

const router = express.Router();

/* ============================================================
   CREATE CALL (Dispatch)
   POST /calls/create
============================================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const call = await Call.create({
      communityId: req.body.communityId,
      callNumber: await Call.countDocuments({ communityId: req.body.communityId }) + 1,
      type: req.body.type,
      location: req.body.location,
      description: req.body.description,
      units: []
    });

    req.io?.emit("call:new", call);
    res.status(201).json(call);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL CALLS IN COMMUNITY
   GET /calls/:communityId
============================================================ */
router.get("/:communityId", auth, async (req, res) => {
  try {
    const calls = await Call.find({ communityId: req.params.communityId });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ATTACH UNIT TO CALL
   PUT /calls/attach/:callId
============================================================ */
router.put("/attach/:callId", auth, async (req, res) => {
  try {
    const { unitId, callsign } = req.body;

    const call = await Call.findByIdAndUpdate(
      req.params.callId,
      { $addToSet: { units: { unitId, callsign } } },
      { new: true }
    );

    req.io?.emit("call:update", call);
    res.json(call);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   CLEAR CALL
   DELETE /calls/clear/:callId
============================================================ */
router.delete("/clear/:callId", auth, async (req, res) => {
  try {
    await Call.findByIdAndDelete(req.params.callId);
    req.io?.emit("call:clear", req.params.callId);
    res.json({ message: "Call cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
