import express from "express";
import Unit from "../models/Unit.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Create unit
router.post("/:communityId/create", auth, async (req, res) => {
  try {
    const { departmentId, callsign } = req.body;

    const unit = await Unit.create({
      communityId: req.params.communityId,
      departmentId,
      userId: req.user.userId,
      callsign
    });

    res.status(201).json(unit);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update status
router.post("/:communityId/status/:unitId", auth, async (req, res) => {
  try {
    const { status, location } = req.body;

    const unit = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { status, location },
      { new: true }
    );

    res.json(unit);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
