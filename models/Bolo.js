import mongoose from "mongoose";

const BoloSchema = new mongoose.Schema({
  communityId: mongoose.Schema.Types.ObjectId,
  type: String,      // person, vehicle
  description: String,
  plate: String
}, { timestamps: true });

export default mongoose.model("Bolo", BoloSchema);
