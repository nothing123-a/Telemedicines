import mongoose from "mongoose";

const EscalationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    connectionType: {
      type: String,
      enum: ["chat", "video"],
    },
    connectionStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
    },
    triedDoctors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor"
    }],
    originalMessage: {
      type: String,
      default: "Emergency request"
    },
    isReEscalation: {
      type: Boolean,
      default: false
    },
    previousSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorSession"
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.EscalationRequest || mongoose.model("EscalationRequest", EscalationRequestSchema);