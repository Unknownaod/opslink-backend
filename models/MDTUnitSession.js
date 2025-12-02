import mongoose from "mongoose";

const MDTUnitSessionSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // current unit session status
  online: { type: Boolean, default: true },
  lastStatus: { type: String, default: "10-7" },

  // geolocation history
  lastLocation: {
    lat: Number,
    lng: Number,
    updatedAt: { type: Date, default: Date.now }
  },

  // timestamps for session start/end
  sessionStarted: { type: Date, default: Date.now },
  sessionEnded: { type: Date },

}, { timestamps: true });

export default mongoose.model("MDTUnitSession", MDTUnitSessionSchema);
