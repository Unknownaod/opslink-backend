import express from "express";
import mongoose from "mongoose";
import Department from "../models/Department.js";
import Community from "../models/Community.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Allowed department types
const VALID_TYPES = ["leo", "fire", "ems", "dispatch"];

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
      return res.status(400).json({ message: "Name and type are required" });

    if (!VALID_TYPES.includes(type.toLowerCase()))
      return res.status(400).json({
        message: `Invalid department type. Must be one of: ${VALID_TYPES.join(", ")}`
      });

    // Ensure community exists
    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    // Ensure unique dept type per community
    const exists = await Department.findOne({ communityId, type });
    if (exists)
      return res.status(400).json({ message: `A ${type.toUpperCase()} department already exists` });

    const dept = await Department.create({
      name: name.trim(),
      type: type.toLowerCase(),
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
    }).sort({ createdAt: 1 });

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
    const { name, type } = req.body;
    const update = {};

    if (name) update.name = name.trim();

    if (type) {
      if (!VALID_TYPES.includes(type.toLowerCase()))
        return res.status(400).json({
          message: `Invalid type. Must be: ${VALID_TYPES.join(", ")}`
        });
      update.type = type.toLowerCase();
    }

    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      update,
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
