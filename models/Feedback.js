import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorSession',
    required: true
  },
  satisfied: {
    type: Boolean,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    default: ""
  },
  sessionType: {
    type: String,
    enum: ['chat', 'video'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);