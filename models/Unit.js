import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  callsign: { type: String, required: true },
  name: { type: String },
  rank: { type: String },

  type: {
    type: String,
    enum: ["leo", "fire", "ems", "dispatch"],
    default: "leo"
  },

  status: {
    type: String,
    enum: ["10-8", "10-7", "10-6", "10-23", "panic", "signal100"],
    default: "10-7"
  },

  location: {
    lat: Number,
    lng: Number
  },

  metadata: { type: Object, default: {} },
  lastActive: { type: Date, default: Date.now }

}, { timestamps: true });

export default mongoose.models.Unit || mongoose.model("Unit", UnitSchema);
