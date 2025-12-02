import mongoose from "mongoose";

const MDTUnitSessionSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },

  online: { type: Boolean, default: true },
  sessionStarted: { type: Date, default: Date.now },
  sessionEnded: { type: Date },

  lastStatus: { type: String, default: "10-8" },
  lastLocation: { lat: Number, lng: Number },
  lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.models.MDTUnitSession ||
       mongoose.model("MDTUnitSession", MDTUnitSessionSchema);
