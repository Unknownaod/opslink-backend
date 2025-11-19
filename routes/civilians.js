import express from "express";
import Civilian from "../models/Civilian.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   CREATE CIVILIAN
   POST /civilians/create
   Body: { userId, communityId, name, dob, address, license, notes }
   ============================================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const civ = await Civilian.create(req.body);
    res.status(201).json(civ);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL CIVILIANS FOR USER
   GET /civilians/user/:userId
   ============================================================ */
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const civs = await Civilian.find({ userId: req.params.userId });
    res.json(civs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL CIVILIANS IN COMMUNITY
   GET /civilians/community/:communityId
   ============================================================ */
router.get("/community/:communityId", auth, async (req, res) => {
  try {
    const civs = await Civilian.find({ communityId: req.params.communityId });
    res.json(civs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   SEARCH CIVILIANS (by name)
   GET /civilians/search/:communityId?q=Name
   ============================================================ */
router.get("/search/:communityId", auth, async (req, res) => {
  try {
    const query = req.query.q || "";
    const civs = await Civilian.find({
      communityId: req.params.communityId,
      name: { $regex: query, $options: "i" }
    });

    res.json(civs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET CIVILIAN BY ID
   GET /civilians/id/:id
   ============================================================ */
router.get("/id/:id", auth, async (req, res) => {
  try {
    const civ = await Civilian.findById(req.params.id);
    if (!civ) return res.status(404).json({ message: "Not found" });
    res.json(civ);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE CIVILIAN
   PUT /civilians/update/:id
   Body: (any fields to update)
   ============================================================ */
router.put("/update/:id", auth, async (req, res) => {
  try {
    const civ = await Civilian.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(civ);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   DELETE CIVILIAN
   DELETE /civilians/delete/:id
   ============================================================ */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Civilian.findByIdAndDelete(req.params.id);
    res.json({ message: "Civilian deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
