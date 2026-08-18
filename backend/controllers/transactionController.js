const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const { validateDoubleEntry, recalculateAccountBalances } = require('../services/accountingService');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { search, startDate, endDate, accountId, transactionType } = req.query;

    let query = {};
    if (transactionType) query.transactionType = transactionType;

    if (accountId) {
      query['entries.account'] = accountId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];
    }

    const transactions = await Transaction.find(query)
      .populate('entries.account', 'accountName accountCode accountType subCategory')
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('entries.account', 'accountName accountCode accountType subCategory')
      .populate('createdBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction (Double Entry)
// @route   POST /api/transactions
// @access  Private (Admin, Accountant)
const createTransaction = async (req, res, next) => {
  try {
    const { date, description, transactionType, entries, reference, notes } = req.body;

    // Validate double-entry constraint
    const validation = validateDoubleEntry(entries);
    if (!validation.valid) {
      await Notification.create({
        title: 'Failed Transaction Attempt',
        message: validation.message,
        type: 'error',
        createdBy: req.user ? req.user._id : null,
      });

      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Generate transactionId
    const count = await Transaction.countDocuments();
    const transactionId = `TXN-${10001 + count}`;

    const transaction = await Transaction.create({
      transactionId,
      date: date || new Date(),
      description,
      transactionType: transactionType || 'Journal',
      entries,
      reference: reference || '',
      notes: notes || '',
      createdBy: req.user ? req.user._id : null,
    });

    await recalculateAccountBalances();

    await Notification.create({
      title: 'Successful Transaction',
      message: `Transaction ${transactionId} ($${validation.totalDebit}) created successfully.`,
      type: 'success',
      createdBy: req.user ? req.user._id : null,
    });

    const populatedTxn = await Transaction.findById(transaction._id)
      .populate('entries.account', 'accountName accountCode accountType')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: populatedTxn,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private (Admin, Accountant)
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { date, description, transactionType, entries, reference, notes } = req.body;

    if (entries) {
      const validation = validateDoubleEntry(entries);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }
      transaction.entries = entries;
    }

    transaction.date = date || transaction.date;
    transaction.description = description || transaction.description;
    transaction.transactionType = transactionType || transaction.transactionType;
    transaction.reference = reference !== undefined ? reference : transaction.reference;
    transaction.notes = notes !== undefined ? notes : transaction.notes;

    await transaction.save();
    await recalculateAccountBalances();

    const updatedTxn = await Transaction.findById(transaction._id)
      .populate('entries.account', 'accountName accountCode accountType')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTxn,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private (Admin)
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    await recalculateAccountBalances();

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
