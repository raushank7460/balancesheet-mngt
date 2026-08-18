const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
  },
  accountCode: {
    type: String,
    required: [true, 'Account code is required'],
    unique: true,
    trim: true,
  },
  accountType: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
  },
  subCategory: {
    type: String,
    required: [true, 'Sub category is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Account', accountSchema);
