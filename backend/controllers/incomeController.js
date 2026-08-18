const Income = require('../models/Income');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { recalculateAccountBalances } = require('../services/accountingService');

// @desc    Get all income records
// @route   GET /api/income
// @access  Private
const getIncome = async (req, res, next) => {
  try {
    const { search, source, startDate, endDate } = req.query;

    let query = {};
    if (source) query.source = source;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { incomeId: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
      ];
    }

    const incomeRecords = await Income.find(query)
      .populate('createdBy', 'name email')
      .populate({
        path: 'transactionRef',
        populate: { path: 'entries.account', select: 'accountName accountCode' },
      })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: incomeRecords.length,
      data: incomeRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create income record (with auto double-entry transaction)
// @route   POST /api/income
// @access  Private (Admin, Accountant)
const createIncome = async (req, res, next) => {
  try {
    const { source, amount, date, paymentMethod, description, reference, debitAccountId, creditAccountId } = req.body;

    if (!source || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid source and amount',
      });
    }

    // Default target cash/bank account if not provided
    let debitAcc = debitAccountId
      ? await Account.findById(debitAccountId)
      : await Account.findOne({ subCategory: paymentMethod === 'Cash' ? 'Cash' : 'Bank' });

    if (!debitAcc) {
      debitAcc = await Account.findOne({ accountType: 'Asset' });
    }

    // Default target revenue account if not provided
    let creditAcc = creditAccountId
      ? await Account.findById(creditAccountId)
      : await Account.findOne({ accountName: source }) || await Account.findOne({ accountType: 'Revenue' });

    if (!debitAcc || !creditAcc) {
      return res.status(400).json({
        success: false,
        message: 'Valid Debit (Asset) and Credit (Revenue) accounts required for income',
      });
    }

    // Generate income ID
    const count = await Income.countDocuments();
    const incomeId = `INC-${1001 + count}`;

    // Create double-entry transaction
    const txnCount = await Transaction.countDocuments();
    const transactionId = `TXN-${10001 + txnCount}`;

    const transaction = await Transaction.create({
      transactionId,
      date: date || new Date(),
      description: `Income: ${source} - ${description || 'No description'}`,
      transactionType: 'Income',
      reference: reference || incomeId,
      notes: `Payment Method: ${paymentMethod}`,
      createdBy: req.user ? req.user._id : null,
      entries: [
        { account: debitAcc._id, debit: Number(amount), credit: 0 },
        { account: creditAcc._id, debit: 0, credit: Number(amount) },
      ],
    });

    const income = await Income.create({
      incomeId,
      source,
      amount: Number(amount),
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Bank Transfer',
      description: description || '',
      reference: reference || '',
      createdBy: req.user ? req.user._id : null,
      transactionRef: transaction._id,
    });

    await recalculateAccountBalances();

    res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income record
// @route   PUT /api/income/:id
// @access  Private (Admin, Accountant)
const updateIncome = async (req, res, next) => {
  try {
    let income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    const { source, amount, date, paymentMethod, description, reference } = req.body;

    income.source = source || income.source;
    income.amount = amount ? Number(amount) : income.amount;
    income.date = date || income.date;
    income.paymentMethod = paymentMethod || income.paymentMethod;
    income.description = description !== undefined ? description : income.description;
    income.reference = reference !== undefined ? reference : income.reference;

    await income.save();

    // Sync underlying transaction if present
    if (income.transactionRef) {
      const transaction = await Transaction.findById(income.transactionRef);
      if (transaction) {
        transaction.date = income.date;
        transaction.description = `Income: ${income.source} - ${income.description}`;
        transaction.reference = income.reference;

        if (amount) {
          transaction.entries[0].debit = Number(amount);
          transaction.entries[1].credit = Number(amount);
        }
        await transaction.save();
      }
    }

    await recalculateAccountBalances();

    res.json({
      success: true,
      message: 'Income record updated successfully',
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income record
// @route   DELETE /api/income/:id
// @access  Private (Admin)
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found' });
    }

    if (income.transactionRef) {
      await Transaction.findByIdAndDelete(income.transactionRef);
    }

    await income.deleteOne();
    await recalculateAccountBalances();

    res.json({
      success: true,
      message: 'Income record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
};
