import express from "express";
import Civilian from "../models/Civilian.js";
import Vehicle from "../models/Vehicle.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   PERSON SEARCH
   POST /search/person
   Body: { query, communityId }
   ============================================================ */
router.post("/person", auth, async (req, res) => {
  try {
    const { query, communityId } = req.body;

    if (!query || !communityId)
      return res.status(400).json({ message: "Missing query or communityId" });

    // Search civilians by name (first, last, or full)
    const results = await Civilian.find({
      communityId,
      name: { $regex: query, $options: "i" }
    });

    return res.json(results);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   VEHICLE SEARCH
   POST /search/vehicle
   Body: { plate, communityId }
   ============================================================ */
router.post("/vehicle", auth, async (req, res) => {
  try {
    const { plate, communityId } = req.body;

    if (!plate || !communityId)
      return res.status(400).json({ message: "Missing plate or communityId" });

    // Search vehicles by partial plate
    const results = await Vehicle.find({
      communityId,
      plate: { $regex: plate, $options: "i" }
    }).populate("ownerId");

    // Format response nicely
    const formatted = results.map(v => ({
      plate: v.plate,
      make: v.make,
      model: v.model,
      color: v.color,
      year: v.year,
      stolen: v.stolen,
      bolo: v.bolo,
      owner: v.ownerId ? {
        id: v.ownerId._id,
        name: v.ownerId.name,
        dob: v.ownerId.dob,
        address: v.ownerId.address,
        license: v.ownerId.license
      } : null
    }));

    return res.json(formatted);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
