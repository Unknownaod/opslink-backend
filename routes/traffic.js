import express from "express";
import TrafficStop from "../models/TrafficStop.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   RECORD TRAFFIC STOP
============================================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const stop = await TrafficStop.create({
      communityId: req.body.communityId,
      unitId: req.body.unitId,
      callsign: req.body.callsign,
      plate: req.body.plate,
      color: req.body.color,
      model: req.body.model,
      notes: req.body.notes
    });

    req.io?.emit("traffic:new", stop);
    res.status(201).json(stop);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   LIST COMMUNITY TRAFFIC STOPS
============================================================ */
router.get("/:communityId", auth, async (req, res) => {
  try {
    const stops = await TrafficStop.find({ communityId: req.params.communityId });
    res.json(stops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
