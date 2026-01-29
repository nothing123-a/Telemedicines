import mongoose from "mongoose";

const DoctorSessionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EscalationRequest',
    required: true
  },
  sessionType: {
    type: String,
    enum: ['chat', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  roomId: {
    type: String
  },
  feedback: {
    satisfied: Boolean,
    rating: Number,
    comment: String
  }
}, {
  timestamps: true
});

export default mongoose.models.DoctorSession || mongoose.model("DoctorSession", DoctorSessionSchema);