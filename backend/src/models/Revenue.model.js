import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['sponsorship', 'ad-revenue', 'affiliate', 'merchandise', 'subscription', 'donation', 'other'],
    required: true
  },
  source: {
    platform: String,
    brand: String,
    campaign: String
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'cancelled'],
    default: 'pending'
  },
  description: String,
  relatedContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  paymentDetails: {
    method: String,
    transactionId: String,
    invoice: String
  }
}, {
  timestamps: true
});

revenueSchema.index({ user: 1, date: -1 });

export default mongoose.model('Revenue', revenueSchema);
