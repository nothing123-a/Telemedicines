import mongoose from "mongoose";

const DrPrescriptionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientName: String,
  doctorId: {
    type: String,
    required: true
  },
  doctorName: String,
  sessionId: String,
  medicines: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    duration: String
  }],
  instructions: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  availability: {
    type: String,
    enum: ['pending', 'available', 'unavailable'],
    default: 'pending'
  },
  pharmacistId: String,
  availabilityUpdatedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

DrPrescriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.DrPrescription || mongoose.model("DrPrescription", DrPrescriptionSchema);