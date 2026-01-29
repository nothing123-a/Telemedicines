import mongoose from "mongoose";

const RoutineDoctorRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  connectionType: {
    type: String,
    enum: ["chat", "video"],
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending",
  },
  doctorId: {
    type: String,
  },
  doctorName: {
    type: String,
  },
  roomId: {
    type: String,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  acceptedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  passedBy: [{
    doctorId: String,
    passedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.RoutineDoctorRequest || 
  mongoose.model("RoutineDoctorRequest", RoutineDoctorRequestSchema);