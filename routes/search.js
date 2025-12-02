import express from "express";
import Civilian from "../models/Civilian.js";
import Vehicle from "../models/Vehicle.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   PERSON SEARCH
   GET /search/person/:communityId?q=John
============================================================ */
router.get("/person/:communityId", auth, async (req, res) => {
  try {
    const q = req.query.q?.trim() || "";
    if (!q) return res.json([]);

    const results = await Civilian.find({
      communityId: req.params.communityId,
      name: { $regex: q, $options: "i" }
    });

    return res.json({
      type: "person",
      count: results.length,
      results
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   VEHICLE SEARCH
   GET /search/vehicle/:communityId?plate=ABC
============================================================ */
router.get("/vehicle/:communityId", auth, async (req, res) => {
  try {
    const plate = req.query.plate?.trim() || "";
    if (!plate) return res.json([]);

    const vehicles = await Vehicle.find({
      communityId: req.params.communityId,
      plate: { $regex: plate, $options: "i" }
    }).populate("ownerId");

    const formatted = vehicles.map(v => ({
      id: v._id,
      plate: v.plate,
      make: v.make,
      model: v.model,
      year: v.year,
      color: v.color,
      bolo: v.bolo,
      stolen: v.stolen,
      flags: v.flags || [],

      owner: v.ownerId && {
        id: v.ownerId._id,
        name: v.ownerId.name,
        dob: v.ownerId.dob,
        address: v.ownerId.address,

        // Updated licenses object
        licenses: {
          driver: v.ownerId.licenses?.driver || "none",
          firearm: v.ownerId.licenses?.firearm || "none",
          boating: v.ownerId.licenses?.boating || "none",
          pilot: v.ownerId.licenses?.pilot || "none"
        },

        history: v.ownerId.history || [],
        flags: v.ownerId.flags || []
      }
    }));

    return res.json({
      type: "vehicle",
      count: formatted.length,
      results: formatted
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
