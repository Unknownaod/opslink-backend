import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },

  name: { type: String, required: true },
  description: { type: String },

  settings: { type: Object, default: {} },

  // NEW: Member system
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      role: { type: String, default: "member" } // owner | admin | member
    }
  ]

}, { timestamps: true });

export default mongoose.model("Community", CommunitySchema);
