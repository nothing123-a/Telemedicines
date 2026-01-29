import mongoose from "mongoose";

// Delete existing model to force recreation
if (mongoose.models.Medicine) {
  delete mongoose.models.Medicine;
}

const MedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    manufacturer: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      default: '',
    },
    stockStatus: {
      type: String,
      enum: ["in-stock", "out-of-stock", "we-dont-sell"],
      default: "in-stock"
    },
    restockDate: {
      type: String,
      default: '',
    },
    pharmacistId: {
      type: String,
      default: "temp_id"
    },
    pharmacyName: {
      type: String,
      default: "Test Pharmacy"
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Medicine", MedicineSchema);