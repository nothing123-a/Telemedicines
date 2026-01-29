// models/User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String, // ✅ Proper syntax!
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
    },
    surname: {
      type: String,
    },
    middleName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    emergencyNumber: {
      type: String,
    },
    birthdate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    language: {
      type: String,
      enum: ["en", "hi", "mr"],
      default: "en",
    },
    isPharmacist: {
      type: Boolean,
      default: false,
    },
    pharmacistDetails: {
      licenseNumber: String,
      pharmacyName: String,
      address: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);