import express from "express";
import Unit from "../models/Unit.js";

const router = express.Router();

// UPDATE UNIT STATUS
router.put("/status/:unitId", async (req, res) => {
  try {
    const { status } = req.body;

    const unit = await Unit.findByIdAndUpdate(
      req.params.unitId,
      { status },
      { new: true }
    );

    return res.json(unit);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
