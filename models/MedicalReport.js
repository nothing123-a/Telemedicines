import mongoose from 'mongoose';

const MedicalReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: null
  },
  analysis: {
    keyFindings: String,
    abnormalValues: String,
    recommendations: String,
    summary: String,
    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    nextSteps: String,
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.MedicalReport || mongoose.model('MedicalReport', MedicalReportSchema);