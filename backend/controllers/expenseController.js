const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { recalculateAccountBalances } = require('../services/accountingService');

// @desc    Get all expense records
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { search, category, startDate, endDate } = req.query;

    let query = {};
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { expenseId: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const expenseRecords = await Expense.find(query)
      .populate('createdBy', 'name email')
      .populate({
        path: 'transactionRef',
        populate: { path: 'entries.account', select: 'accountName accountCode' },
      })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: expenseRecords.length,
      data: expenseRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense record (with auto double-entry transaction)
// @route   POST /api/expenses
// @access  Private (Admin, Accountant)
const createExpense = async (req, res, next) => {
  try {
    const { category, amount, date, paymentMethod, description, notes, debitAccountId, creditAccountId } = req.body;

    if (!category || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid expense category and amount',
      });
    }

    // Default debit expense account if not provided
    let debitAcc = debitAccountId
      ? await Account.findById(debitAccountId)
      : await Account.findOne({ subCategory: category }) || await Account.findOne({ accountType: 'Expense' });

    // Default credit asset account if not provided
    let creditAcc = creditAccountId
      ? await Account.findById(creditAccountId)
      : await Account.findOne({ subCategory: paymentMethod === 'Cash' ? 'Cash' : 'Bank' });

    if (!creditAcc) {
      creditAcc = await Account.findOne({ accountType: 'Asset' });
    }

    if (!debitAcc || !creditAcc) {
      return res.status(400).json({
        success: false,
        message: 'Valid Debit (Expense) and Credit (Asset) accounts required for expense',
      });
    }

    // Generate expense ID
    const count = await Expense.countDocuments();
    const expenseId = `EXP-${1001 + count}`;

    // Create double-entry transaction
    const txnCount = await Transaction.countDocuments();
    const transactionId = `TXN-${10001 + txnCount}`;

    const transaction = await Transaction.create({
      transactionId,
      date: date || new Date(),
      description: `Expense: ${category} - ${description || 'No description'}`,
      transactionType: 'Expense',
      reference: expenseId,
      notes: notes || `Payment Method: ${paymentMethod}`,
      createdBy: req.user ? req.user._id : null,
      entries: [
        { account: debitAcc._id, debit: Number(amount), credit: 0 },
        { account: creditAcc._id, debit: 0, credit: Number(amount) },
      ],
    });

    const expense = await Expense.create({
      expenseId,
      category,
      amount: Number(amount),
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Bank Transfer',
      description: description || '',
      notes: notes || '',
      createdBy: req.user ? req.user._id : null,
      transactionRef: transaction._id,
    });

    await recalculateAccountBalances();

    res.status(201).json({
      success: true,
      message: 'Expense record created successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense record
// @route   PUT /api/expenses/:id
// @access  Private (Admin, Accountant)
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    const { category, amount, date, paymentMethod, description, notes } = req.body;

    expense.category = category || expense.category;
    expense.amount = amount ? Number(amount) : expense.amount;
    expense.date = date || expense.date;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    expense.description = description !== undefined ? description : expense.description;
    expense.notes = notes !== undefined ? notes : expense.notes;

    await expense.save();

    // Sync transaction
    if (expense.transactionRef) {
      const transaction = await Transaction.findById(expense.transactionRef);
      if (transaction) {
        transaction.date = expense.date;
        transaction.description = `Expense: ${expense.category} - ${expense.description}`;

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
      message: 'Expense record updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense record
// @route   DELETE /api/expenses/:id
// @access  Private (Admin)
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    if (expense.transactionRef) {
      await Transaction.findByIdAndDelete(expense.transactionRef);
    }

    await expense.deleteOne();
    await recalculateAccountBalances();

    res.json({
      success: true,
      message: 'Expense record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
