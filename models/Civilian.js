import mongoose from "mongoose";

const CivilianSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },

  name: { type: String, required: true },
  dob: { type: String },
  address: { type: String },

  licenses: { type: Object, default: {} },
  flags: { type: Array, default: [] },
  warrants: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model("Civilian", CivilianSchema);
