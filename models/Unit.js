import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema({

  communityId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Community" },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Department" },

  // Unit Identity
  callsign: { type: String, required: true },
  name: { type: String },             // Officer/Firefighter real name
  rank: { type: String },             // Patrol Officer, Corporal, Engineer, etc.

  // Unit Type
  type: {
    type: String,
    enum: ["leo", "fire", "ems", "dispatch"],
    default: "leo"
  },

  // Unit Status
  status: {
    type: String,
    enum: [
      "10-8",  // In Service
      "10-7",  // Out of Service
      "10-6",  // Busy
      "10-23", // On Scene
      "panic", // Panic Button
      "signal100" // Optional
    ],
    default: "10-7"
  },

  // Live location (optional for map)
  location: {
    lat: Number,
    lng: Number
  },

  // Metadata for custom systems (notes, flags, etc.)
  metadata: { type: Object, default: {} },

  // Supervisor tracking
  lastActive: { type: Date, default: Date.now }

}, { timestamps: true });

export default mongoose.model("Unit", UnitSchema);
