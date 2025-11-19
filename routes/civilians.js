import express from "express";
import Civilian from "../models/Civilian.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:communityId/create", auth, async (req, res) => {
  try {
    const civ = await Civilian.create({
      communityId: req.params.communityId,
      ...req.body
    });

    res.status(201).json(civ);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:communityId/search", auth, async (req, res) => {
  try {
    const query = req.query.q;
    const civs = await Civilian.find({
      communityId: req.params.communityId,
      name: { $regex: query, $options: "i" }
    });

    res.json(civs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
