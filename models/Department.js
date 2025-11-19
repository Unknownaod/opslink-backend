import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["police", "fire", "ems", "civ"], required: true }
}, { timestamps: true });

export default mongoose.model("Department", DepartmentSchema);
