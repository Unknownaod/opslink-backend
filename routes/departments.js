import express from "express";
import Department from "../models/Department.js";
import Community from "../models/Community.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   CREATE DEPARTMENT
   POST /departments/:communityId/create
   Body: { name, type }
============================================================ */
router.post("/:communityId/create", auth, async (req, res) => {
  try {
    const { name, type } = req.body;
    const { communityId } = req.params;

    if (!name || !type)
      return res.status(400).json({ message: "Name and type required" });

    const exists = await Department.findOne({ communityId, name });
    if (exists)
      return res.status(400).json({ message: "Department already exists" });

    const dept = await Department.create({
      name,
      type,
      communityId
    });

    res.status(201).json(dept);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL DEPARTMENTS
   GET /departments/:communityId
============================================================ */
router.get("/:communityId", auth, async (req, res) => {
  try {
    const departments = await Department.find({
      communityId: req.params.communityId
    });

    res.json(departments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE DEPARTMENT
   PUT /departments/update/:id
   Body: { name?, type? }
============================================================ */
router.put("/update/:id", auth, async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!dept)
      return res.status(404).json({ message: "Department not found" });

    res.json(dept);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   DELETE DEPARTMENT
   DELETE /departments/delete/:id
============================================================ */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const removed = await Department.findByIdAndDelete(req.params.id);

    if (!removed)
      return res.status(404).json({ message: "Department not found" });

    res.json({ message: "Department deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
