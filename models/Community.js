import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },

  name: { type: String, required: true },
  description: { type: String },

  settings: { type: Object, default: {} },

  // SONORAN-STYLE PERMISSION KEYS
  permissionKeys: {
    leo: { type: String },
    fire: { type: String },
    dispatch: { type: String },
    supervisor: { type: String },
    admin: { type: String }
  },

  // Members + their permissions
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      role: { type: String, default: "member" }, // owner | admin | member
      permissions: { type: Array, default: [] }  // ["leo", "dispatch"]
    }
  ]

}, { timestamps: true });

export default mongoose.model("Community", CommunitySchema);
