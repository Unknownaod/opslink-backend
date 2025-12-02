import mongoose from "mongoose";

/* ============================================================
   RANKS — now support optional department linkage
============================================================ */
const RankSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // OPTIONAL — if present, rank only applies to a single department
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    default: null
  }

}, { _id: true });


/* ============================================================
   COMMUNITY MEMBERSHIP — stores permissions + role
============================================================ */
const MemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },

  // owner | admin | member
  role: { type: String, default: "member" },

  // Permission flags: ["leo","dispatch","fire","supervisor","admin"]
  permissions: {
    type: [String],
    default: []
  }

}, { _id: true });


/* ============================================================
   COMMUNITY — main schema
============================================================ */
const CommunitySchema = new mongoose.Schema({

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },

  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  settings: {
    type: Object,
    default: {}
  },

  /* ================================
     SONORAN-STYLE PERMISSION KEYS
     Auto-grants permissions when claimed
  ================================= */
  permissionKeys: {
    leo: { type: String, default: null },
    fire: { type: String, default: null },
    ems: { type: String, default: null },
    dispatch: { type: String, default: null },
    supervisor: { type: String, default: null },
    admin: { type: String, default: null }
  },

  /* ================================
     MEMBERS + ASSIGNED PERMISSIONS
  ================================= */
  members: {
    type: [MemberSchema],
    default: []
  },

  /* ================================
     RANKS — now properly linked
  ================================= */
  ranks: {
    type: [RankSchema],
    default: []
  }

}, { timestamps: true });

export default mongoose.model("Community", CommunitySchema);
