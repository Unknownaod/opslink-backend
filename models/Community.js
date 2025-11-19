import mongoose from "mongoose";

const RankSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { _id: true }); // allows rank._id

const MemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, default: "member" }, // owner | admin | member
  permissions: { type: [String], default: [] }
}, { _id: true });

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

  // Members with role + permissions
  members: { type: [MemberSchema], default: [] },

  // Ranks system (missing before)
  ranks: { type: [RankSchema], default: [] }

}, { timestamps: true });

export default mongoose.model("Community", CommunitySchema);
