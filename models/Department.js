import mongoose from "mongoose";

/* ============================================================
   DEPARTMENT MODEL (ALIGNMENT FIXED)
   Matches UI, permissions, ranks, and units
============================================================ */
const DepartmentSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Community"
  },

  name: { type: String, required: true },

  // Unified department types that match UI + permissions + units
  type: {
    type: String,
    enum: ["leo", "fire", "ems", "dispatch"], // 🔥 FIXED
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Department", DepartmentSchema);
