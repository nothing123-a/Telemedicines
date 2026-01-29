import mongoose from "mongoose";

const PrivateDocumentUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String
}, {
  timestamps: true,
  collection: 'private_document_users'
});

export default mongoose.models.PrivateDocumentUser || mongoose.model("PrivateDocumentUser", PrivateDocumentUserSchema);