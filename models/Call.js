import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  callNumber: Number,
  type: String,
  location: String,
  description: String,

  units: [{
    unitId: mongoose.Schema.Types.ObjectId,
    callsign: String
  }]

}, { timestamps: true });

export default mongoose.model("Call", CallSchema);
