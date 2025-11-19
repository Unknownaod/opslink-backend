import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  subscription: { type: String, default: "free" },
  stripeCustomerId: { type: String },
  subscriptionId: { type: String },
  planRenews: { type: Date }


  communities: {
    type: [
      {
        communityId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Community",
          required: true 
        },
        role: { type: String, default: "member" }
      }
    ],
    default: []     // 🚀 FIXES your 500 error forever
  },

}, { timestamps: true });

export default mongoose.model("User", UserSchema);

