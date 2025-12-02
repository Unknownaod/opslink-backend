import mongoose from "mongoose";

const HistoryEntrySchema = new mongoose.Schema({
  type: { type: String, required: true }, // arrest | citation | warning | stop | query
  details: { type: String, required: true },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now }
}, { _id: true });

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now }
}, { _id: true });

const WarrantSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dateIssued: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, { _id: true });

const FlagSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dateAdded: { type: Date, default: Date.now }
}, { _id: true });


const CivilianSchema = new mongoose.Schema({

  // Community tie-in
  communityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true
  },

  // Owner user (important!)
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },

  // Identity
  name: { type: String, required: true, index: "text" },
  dob: { type: String },
  address: { type: String },
  phone: { type: String },

  // License system
  licenses: {
    driver:  { type: String, default: "none" }, // valid | suspended | none
    firearm: { type: String, default: "none" }, // valid | revoked | none
    boating: { type: String, default: "none" },
    pilot:   { type: String, default: "none" }
  },

  // Linked Vehicles
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }],

  // RMS data blocks
  warrants: { type: [WarrantSchema], default: [] },
  flags:    { type: [FlagSchema], default: [] },
  notes:    { type: [NoteSchema], default: [] },
  history:  { type: [HistoryEntrySchema], default: [] }

}, { timestamps: true });

CivilianSchema.index({ name: "text", phone: "text" });

export default mongoose.model("Civilian", CivilianSchema);
