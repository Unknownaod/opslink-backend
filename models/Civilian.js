import mongoose from "mongoose";

const CivilianSchema = new mongoose.Schema({

  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },

  name: { type: String, required: true },
  dob: { type: String },
  address: { type: String },
  phone: { type: String },

  licenses: {
    driver: { type: String, default: "none" },     // valid | suspended | none
    firearm: { type: String, default: "none" },    // valid | revoked | none
    boating: { type: String, default: "none" },
    pilot: { type: String, default: "none" }
  },

  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],

  warrants: { type: Array, default: [] },
  flags: { type: Array, default: [] },
  notes: { type: Array, default: [] },
  history: { type: Array, default: [] }

}, { timestamps: true });

export default mongoose.model("Civilian", CivilianSchema);
