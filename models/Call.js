import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, required: true },

  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },

  priority: { type: Number, default: 3 },
  status: { type: String, default: "active" },

  attachedUnits: [{ type: mongoose.Schema.Types.ObjectId }]
}, { timestamps: true });

export default mongoose.model("Call", CallSchema);
