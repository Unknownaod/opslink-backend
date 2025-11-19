import express from "express";
const router = express.Router();

// PERSON SEARCH (placeholder)
router.post("/person", async (req, res) => {
  const { name } = req.body;

  // Placeholder response
  return res.json({
    name,
    dob: "01/01/1990",
    address: "123 Main St",
    licenseStatus: "Valid",
    warrants: [],
    notes: []
  });
});

// VEHICLE SEARCH (placeholder)
router.post("/vehicle", async (req, res) => {
  const { plate } = req.body;

  return res.json({
    plate,
    type: "Sedan",
    model: "2020 Toyota Camry",
    color: "Black",
    registeredOwner: "John Doe",
    BOLO: false
  });
});

export default router;
