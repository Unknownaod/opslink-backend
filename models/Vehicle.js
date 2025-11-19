import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },

  // Civilian owner (optional if officer-created)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Civilian", required: false },

  // Basic info
  plate: { type: String, required: true, unique: false },
  make: { type: String, default: "" },
  model: { type: String, default: "" },
  color: { type: String, default: "" },
  year: { type: String, default: "" },

  // Status flags
  stolen: { type: Boolean, default: false },
  bolo: { type: Boolean, default: false },

  // Multiple flags (optional future)
  flags: { type: [String], default: [] }

}, { timestamps: true });

export default mongoose.model("Vehicle", VehicleSchema);
