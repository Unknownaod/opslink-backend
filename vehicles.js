import express from "express";
import { auth } from "../middleware/auth.js";
import Vehicle from "../models/Vehicle.js";
import Civilian from "../models/Civilian.js";

const router = express.Router();


// ======================================================
// GET VEHICLES FOR CIVILIAN
// ======================================================
router.get("/:civId", auth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.params.civId });
    return res.json(vehicles);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// ======================================================
// CREATE VEHICLE
// ======================================================
router.post("/create", auth, async (req, res) => {
  try {
    const { ownerId, communityId, plate, model, color } = req.body;

    const vehicle = await Vehicle.create({
      ownerId,
      communityId,
      plate,
      model,
      color
    });

    // Add to civilian
    await Civilian.findByIdAndUpdate(ownerId, {
      $push: { vehicles: vehicle._id }
    });

    return res.status(201).json(vehicle);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// ======================================================
// DELETE VEHICLE
// ======================================================
router.delete("/:vehId", auth, async (req, res) => {
  try {
    const veh = await Vehicle.findById(req.params.vehId);
    if (!veh) return res.status(404).json({ message: "Not found" });

    // remove from civ
    await Civilian.findByIdAndUpdate(veh.ownerId, {
      $pull: { vehicles: veh._id }
    });

    await veh.deleteOne();

    return res.json({ message: "Vehicle deleted" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
