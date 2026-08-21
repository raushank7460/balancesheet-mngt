const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { recalculateAccountBalances } = require('../services/accountingService');

// @desc    Get all accounts
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res, next) => {
  try {
    const { accountType, status, search } = req.query;

    let query = {};
    if (accountType) query.accountType = accountType;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { accountName: { $regex: search, $options: 'i' } },
        { accountCode: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
      ];
    }

    const accounts = await Account.find(query).sort({ accountCode: 1 });
    res.json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Create account
// @route   POST /api/accounts
// @access  Private (Admin, Accountant)
const createAccount = async (req, res, next) => {
  try {
    const { accountName, accountCode, accountType, subCategory, description, openingBalance, status } = req.body;

    const existingCode = await Account.findOne({ accountCode });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Account code '${accountCode}' is already in use`,
      });
    }

    const account = await Account.create({
      accountName,
      accountCode,
      accountType,
      subCategory,
      description,
      openingBalance: Number(openingBalance) || 0,
      balance: Number(openingBalance) || 0,
      status: status || 'Active',
    });

    await recalculateAccountBalances();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private (Admin, Accountant)
const updateAccount = async (req, res, next) => {
  try {
    let account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (req.body.accountCode && req.body.accountCode !== account.accountCode) {
      const codeExists = await Account.findOne({ accountCode: req.body.accountCode });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: `Account code '${req.body.accountCode}' already in use`,
        });
      }
    }

    account.accountName = req.body.accountName || account.accountName;
    account.accountCode = req.body.accountCode || account.accountCode;
    account.accountType = req.body.accountType || account.accountType;
    account.subCategory = req.body.subCategory || account.subCategory;
    account.description = req.body.description !== undefined ? req.body.description : account.description;
    account.openingBalance = req.body.openingBalance !== undefined ? Number(req.body.openingBalance) : account.openingBalance;
    account.status = req.body.status || account.status;

    await account.save();
    await recalculateAccountBalances();

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private (Admin)
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // Check if account has transactions
    const hasTransactions = await Transaction.findOne({ 'entries.account': req.params.id });
    if (hasTransactions) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account because it has active transaction entries',
      });
    }

    await account.deleteOne();
    await recalculateAccountBalances();

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};
