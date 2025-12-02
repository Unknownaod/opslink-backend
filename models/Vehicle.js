import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    // Optional owner link
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Civilian",
      required: false
    },

    plate: { type: String, required: true, index: true },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    color: { type: String, default: "" },
    year: { type: String, default: "" },

    stolen: { type: Boolean, default: false },
    bolo: { type: Boolean, default: false },

    // Flexible future flags (NCIC, Felony warrant vehicle, etc.)
    flags: { type: [String], default: [] }
  },

  { timestamps: true }
);

// Ensure no duplicate plates in a community
VehicleSchema.index({ communityId: 1, plate: 1 }, { unique: true });

export default mongoose.model("Vehicle", VehicleSchema);
