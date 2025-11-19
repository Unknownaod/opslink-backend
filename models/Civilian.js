import mongoose from "mongoose";

const CivilianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, required: false },

  name: { type: String, required: true },
  dob: { type: String },
  address: { type: String },

  license: { type: String, default: "Valid" },

  notes: { type: String, default: "" },

  warrants: { type: [String], default: [] },

  vehicles: { type: [mongoose.Schema.Types.ObjectId], ref: "Vehicle", default: [] }

}, { timestamps: true });

export default mongoose.model("Civilian", CivilianSchema);
