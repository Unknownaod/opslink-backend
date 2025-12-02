import express from "express";
import Bolo from "../models/Bolo.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   CREATE BOLO
============================================================ */
router.post("/create", auth, async (req, res) => {
  try {
    const bolo = await Bolo.create({
      communityId: req.body.communityId,
      type: req.body.type,
      description: req.body.description,
      plate: req.body.plate
    });

    req.io?.emit("bolo:new", bolo);
    res.status(201).json(bolo);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET BOLOS IN COMMUNITY
============================================================ */
router.get("/:communityId", auth, async (req, res) => {
  try {
    const bolos = await Bolo.find({ communityId: req.params.communityId });
    res.json(bolos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   DELETE BOLO
============================================================ */
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    await Bolo.findByIdAndDelete(req.params.id);
    req.io?.emit("bolo:delete", req.params.id);
    res.json({ message: "BOLO removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
