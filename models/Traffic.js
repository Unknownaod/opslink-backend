import mongoose from "mongoose";

const TrafficStopSchema = new mongoose.Schema({
  communityId: mongoose.Schema.Types.ObjectId,
  unitId: mongoose.Schema.Types.ObjectId,
  callsign: String,
  plate: String,
  color: String,
  model: String,
  notes: String
}, { timestamps: true });

export default mongoose.model("TrafficStop", TrafficStopSchema);
