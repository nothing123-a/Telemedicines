import mongoose from "mongoose";

const PrivateDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrivateDocumentUser',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: String,
  fileSize: Number,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'uploaded'
  }
}, {
  timestamps: true,
  collection: 'documents'
});

export default mongoose.models.Document || mongoose.model("Document", PrivateDocumentSchema);