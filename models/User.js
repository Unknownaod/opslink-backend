import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: { type: String },

  // BILLING FIELDS
  subscription: { type: String, default: "free" },       // free | premier
  stripeCustomerId: { type: String },
  subscriptionId: { type: String },
  planRenews: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },

  // COMMUNITIES
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
    default: []
  }

}, { timestamps: true });

export default mongoose.model("User", UserSchema);
