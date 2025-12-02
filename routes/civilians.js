import express from "express";
import Civilian from "../models/Civilian.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   CREATE CIVILIAN
   POST /civilians/:communityId/create
   Body: { name, dob, address, phone }
   Owner is ALWAYS the logged-in user (req.user.userId)
============================================================ */
router.post("/:communityId/create", auth, async (req, res) => {
  try {
    const { name, dob, address, phone } = req.body;

    if (!name) return res.status(400).json({ message: "Name required" });

    const civilian = await Civilian.create({
      communityId: req.params.communityId,
      ownerId: req.user.userId, // secured, can't spoof
      name,
      dob,
      address,
      phone
    });

    res.status(201).json(civilian);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL CIVILIANS OWNED BY LOGGED USER
   GET /civilians/user
============================================================ */
router.get("/user", auth, async (req, res) => {
  try {
    const civs = await Civilian.find({ ownerId: req.user.userId });
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
   SEARCH CIVILIANS
   GET /civilians/:communityId/search?q=John
============================================================ */
router.get("/:communityId/search", auth, async (req, res) => {
  try {
    const query = req.query.q ?? "";
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
   GET CIVILIAN DETAILS
   GET /civilians/:id
============================================================ */
router.get("/:id", auth, async (req, res) => {
  try {
    const civ = await Civilian.findById(req.params.id).populate("vehicles");
    if (!civ) return res.status(404).json({ message: "Not found" });
    res.json(civ);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE CIVILIAN PROFILE + LICENSES
   PUT /civilians/:id
============================================================ */
router.put("/:id", auth, async (req, res) => {
  try {
    const allowed = ["name", "dob", "address", "phone", "licenses"];
    const update = {};

    Object.keys(req.body).forEach(key => {
      if (allowed.includes(key)) update[key] = req.body[key];
    });

    const civ = await Civilian.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json(civ);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   ADD WARRANT / FLAG / NOTE / HISTORY ENTRY
============================================================ */

router.put("/:id/warrant", auth, async (req, res) => {
  try {
    const civ = await Civilian.findById(req.params.id);
    civ.warrants.push({
      reason: req.body.reason,
      issuedBy: req.user.userId
    });
    await civ.save();
    res.json(civ.warrants);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/flag", auth, async (req, res) => {
  try {
    const civ = await Civilian.findById(req.params.id);
    civ.flags.push({
      text: req.body.text,
      addedBy: req.user.userId
    });
    await civ.save();
    res.json(civ.flags);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/note", auth, async (req, res) => {
  try {
    const civ = await Civilian.findById(req.params.id);
    civ.notes.push({
      text: req.body.text,
      officer: req.user.userId
    });
    await civ.save();
    res.json(civ.notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/history", auth, async (req, res) => {
  try {
    const civ = await Civilian.findById(req.params.id);
    civ.history.push({
      type: req.body.type,
      details: req.body.details,
      officer: req.user.userId
    });
    await civ.save();
    res.json(civ.history);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ============================================================
   DELETE CIVILIAN
============================================================ */
router.delete("/:id", auth, async (req, res) => {
  try {
    await Civilian.findByIdAndDelete(req.params.id);
    res.json({ message: "Civilian deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
