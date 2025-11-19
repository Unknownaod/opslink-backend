import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },

  plate: { type: String, required: true },
  model: { type: String },
  color: { type: String },
  flags: { type: Array, default: [] }

}, { timestamps: true });

export default mongoose.model("Vehicle", VehicleSchema);
