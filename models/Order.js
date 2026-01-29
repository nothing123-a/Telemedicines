import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  items: [{
    _id: String,
    name: String,
    price: Number,
    quantity: Number,
    category: String
  }],
  total: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);