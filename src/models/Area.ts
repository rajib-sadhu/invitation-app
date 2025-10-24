import mongoose, { Schema, models } from "mongoose";

const AreaSchema = new Schema({
  name: { type: String, required: true },
});

export const Area = models.Area || mongoose.model("Area", AreaSchema);
