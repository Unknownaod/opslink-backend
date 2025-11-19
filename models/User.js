import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: false },
  communities: [
    {
      communityId: mongoose.Schema.Types.ObjectId,
      role: { type: String, default: "member" }
    }
  ],
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
