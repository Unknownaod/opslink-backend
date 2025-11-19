import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  callNumber: { type: Number, required: true },   // auto-increment
  type: { type: String, default: "General" },
  priority: { type: Number, default: 3 },

  location: { type: String, required: true },
  description: { type: String, default: "" },

  // Dispatch data
  status: { type: String, default: "Active" }, // Active, Closed, etc.

  attachedUnits: [
    {
      unitId: mongoose.Schema.Types.ObjectId,
      callsign: String,
    }
  ],

  notes: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],

}, { timestamps: true });

export default mongoose.model("Call", CallSchema);
