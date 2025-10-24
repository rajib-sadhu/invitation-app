import mongoose, { Schema, models } from "mongoose";

const InvitationSchema = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    area: { type: String, required: true },
    phone: String,
    people: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Invitation =
  models.Invitation || mongoose.model("Invitation", InvitationSchema);
