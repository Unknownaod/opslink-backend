import express from "express";
import Department from "../models/Department.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:communityId/create", auth, async (req, res) => {
  try {
    const { name, type } = req.body;

    const department = await Department.create({
      communityId: req.params.communityId,
      name,
      type
    });

    res.status(201).json(department);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:communityId/list", auth, async (req, res) => {
  try {
    const deps = await Department.find({ communityId: req.params.communityId });
    res.json(deps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
