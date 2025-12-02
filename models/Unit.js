import mongoose from "mongoose";

const MDTUnitSessionSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Community",
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true // ONE SESSION PER USER
    },

    // Identity
    name: { type: String, required: true },        // "J. Smith"
    callsign: { type: String, required: true },    // "2B-21"
    department: { type: String, required: true },  // "LEO", "Fire", etc.
    rank: { type: String, default: "Officer" },
    type: { type: String, default: "patrol" },     // free text

    // Operational Status
    status: {
      type: String,
      enum: [
        "10-8",
        "10-7",
        "10-6",
        "10-23",
        "Enroute",
        "Clearing",
        "TrafficStop",
        "LunchBreak",
        "panic"
      ],
      default: "10-7"
    },

    // Live map tracking
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date }
    },

    // Supervisor & Audit
    lastActive: { type: Date, default: Date.now },

    // Optional custom storage
    metadata: { type: Object, default: {} }
  },

  { timestamps: true }
);

export default mongoose.model("MDTUnitSession", MDTUnitSessionSchema);
