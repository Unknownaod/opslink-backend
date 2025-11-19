import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },

  callsign: { type: String, required: true },
  status: { type: String, default: "10-7" },

  location: {
    lat: Number,
    lng: Number
  },

  metadata: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model("Unit", UnitSchema);
