import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    height: Number,
    weight: Number,
    chest: Number,
    leftBicep: Number,
    rightBicep: Number,
    waist: Number,
    leftThigh: Number,
    rightThigh: Number,
    leftCalf: Number,
    rightCalf: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Measurement ||
  mongoose.model("Measurement", measurementSchema);
