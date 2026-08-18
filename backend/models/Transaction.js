const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  debit: {
    type: Number,
    default: 0,
    min: 0,
  },
  credit: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  transactionType: {
    type: String,
    enum: ['Income', 'Expense', 'Asset', 'Liability', 'Equity', 'Transfer', 'Journal'],
    default: 'Journal',
  },
  entries: {
    type: [entrySchema],
    validate: {
      validator: function(entries) {
        if (!entries || entries.length < 2) return false;
        const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
        return Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
      },
      message: 'Total Debit must equal Total Credit and be greater than 0',
    },
  },
  reference: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
