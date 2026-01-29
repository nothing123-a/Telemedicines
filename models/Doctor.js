// models/Doctor.js

import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    specialty: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false, // offline by default
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
