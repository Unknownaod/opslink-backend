import express from "express";
import Call from "../models/Call.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:communityId/create", auth, async (req, res) => {
  try {
    const call = await Call.create({
      communityId: req.params.communityId,
      ...req.body
    });

    res.status(201).json(call);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:communityId/update/:callId", auth, async (req, res) => {
  try {
    const call = await Call.findByIdAndUpdate(
      req.params.callId,
      req.body,
      { new: true }
    );

    res.json(call);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
