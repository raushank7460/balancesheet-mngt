const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  incomeId: {
    type: String,
    required: true,
    unique: true,
  },
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Cheque', 'Other'],
    default: 'Bank Transfer',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  reference: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  transactionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Income', incomeSchema);
