import express from "express";
import Call from "../models/Call.js";
import Unit from "../models/Unit.js";

const router = express.Router();

// AUTO INCREMENT CALL NUMBER FUNCTION
async function getNextCallNumber(communityId) {
  const lastCall = await Call.findOne({ communityId }).sort({ callNumber: -1 });
  return lastCall ? lastCall.callNumber + 1 : 1;
}

// CREATE CALL
router.post("/create", async (req, res) => {
  try {
    const { communityId, type, priority, location, description } = req.body;

    const callNumber = await getNextCallNumber(communityId);

    const call = await Call.create({
      communityId,
      callNumber,
      type,
      priority,
      location,
      description
    });

    return res.status(201).json(call);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET ACTIVE CALLS
router.get("/:communityId", async (req, res) => {
  try {
    const calls = await Call.find({ 
      communityId: req.params.communityId,
      status: "Active"
    }).sort({ callNumber: 1 });

    return res.json(calls);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ATTACH UNIT
router.put("/attach/:callId", async (req, res) => {
  try {
    const { unitId, callsign } = req.body;

    const call = await Call.findById(req.params.callId);
    call.attachedUnits.push({ unitId, callsign });
    await call.save();

    return res.json(call);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// DETACH UNIT
router.put("/detach/:callId", async (req, res) => {
  try {
    const { unitId } = req.body;

    const call = await Call.findById(req.params.callId);
    call.attachedUnits = call.attachedUnits.filter(u => u.unitId != unitId);
    await call.save();

    return res.json(call);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ADD NOTE
router.post("/addNote/:callId", async (req, res) => {
  try {
    const { userId, text } = req.body;

    const call = await Call.findById(req.params.callId);
    call.notes.push({ userId, text });
    await call.save();

    return res.json(call);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// UPDATE CALL
router.put("/update/:callId", async (req, res) => {
  try {
    const call = await Call.findByIdAndUpdate(req.params.callId, req.body, { new: true });
    return res.json(call);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE CALL
router.delete("/delete/:callId", async (req, res) => {
  try {
    await Call.findByIdAndDelete(req.params.callId);
    return res.json({ message: "Call deleted" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
