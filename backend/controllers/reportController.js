const {
  getBalanceSheetData,
  getProfitAndLossData,
  getCashFlowData,
  getAccountLedger,
  recalculateAccountBalances,
} = require('../services/accountingService');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

// @desc    Get dashboard metrics & chart data
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardMetrics = async (req, res, next) => {
  try {
    const bs = await getBalanceSheetData();
    const pnl = await getProfitAndLossData();
    const transactionCount = await Transaction.countDocuments();

    // Calculate current liquid balance (Cash + Bank)
    const liquidAccounts = await Account.find({
      subCategory: { $in: ['Cash', 'Bank'] },
      status: 'Active',
    });
    const currentBalance = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);

    // Compute monthly trend data from transactions
    const transactions = await Transaction.find().sort({ date: 1 }).lean();
    const monthMap = {};

    transactions.forEach(txn => {
      const monthYear = new Date(txn.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthMap[monthYear]) {
        monthMap[monthYear] = { month: monthYear, income: 0, expense: 0, net: 0 };
      }

      if (txn.transactionType === 'Income') {
        const totalDebit = txn.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        monthMap[monthYear].income += totalDebit;
      } else if (txn.transactionType === 'Expense') {
        const totalDebit = txn.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        monthMap[monthYear].expense += totalDebit;
      }
    });

    const monthlyTrends = Object.values(monthMap).map(m => ({
      ...m,
      net: m.income - m.expense,
    }));

    const response = {
      success: true,
      data: {
        summary: {
          totalAssets: bs.assets.totalAssets,
          totalLiabilities: bs.liabilities.totalLiabilities,
          totalEquity: bs.equity.totalEquity,
          totalIncome: pnl.totalRevenue,
          totalExpenses: pnl.totalExpenses,
          netProfit: pnl.netProfit,
          isProfit: pnl.isProfit,
          currentBalance: Math.round(currentBalance * 100) / 100,
          transactionCount,
          isBalanced: bs.isBalanced,
        },
        charts: {
          incomeVsExpense: [
            { name: 'Income', amount: pnl.totalRevenue },
            { name: 'Expenses', amount: pnl.totalExpenses },
          ],
          assetsVsLiabilities: [
            { name: 'Assets', amount: bs.assets.totalAssets },
            { name: 'Liabilities', amount: bs.liabilities.totalLiabilities },
            { name: 'Equity', amount: bs.equity.totalEquity },
          ],
          monthlyTrends,
        },
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Balance Sheet Report
// @route   GET /api/reports/balance-sheet
// @access  Private
const getBalanceSheetReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getBalanceSheetData(startDate, endDate);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Profit & Loss Report
// @route   GET /api/reports/profit-loss
// @access  Private
const getProfitLossReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getProfitAndLossData(startDate, endDate);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Cash Flow Report
// @route   GET /api/reports/cash-flow
// @access  Private
const getCashFlowReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await getCashFlowData(startDate, endDate);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Account Ledger
// @route   GET /api/reports/ledger
// @access  Private
const getLedgerReport = async (req, res, next) => {
  try {
    const { accountId, startDate, endDate } = req.query;
    if (!accountId) {
      return res.status(400).json({ success: false, message: 'accountId query parameter is required' });
    }

    const data = await getAccountLedger(accountId, startDate, endDate);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Purge all transactions & income/expense & reset account balances to 0
// @route   POST /api/reports/reset-data
// @access  Private (Admin)
const resetData = async (req, res, next) => {
  try {
    await Transaction.deleteMany({});
    await Income.deleteMany({});
    await Expense.deleteMany({});
    await Account.updateMany({}, { $set: { openingBalance: 0, balance: 0 } });

    res.json({
      success: true,
      message: 'All transactions, income, expense records cleared and account balances reset to 0.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getBalanceSheetReport,
  getProfitLossReport,
  getCashFlowReport,
  getLedgerReport,
  resetData,
};
