const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

/**
 * Recalculate balances for all accounts based on opening balances + transaction entries
 */
const recalculateAccountBalances = async () => {
  const accounts = await Account.find().lean();
  const transactions = await Transaction.find().lean();

  // Create a map to hold net debit and net credit for each account
  const accountTotals = {};
  accounts.forEach(acc => {
    accountTotals[acc._id.toString()] = { debit: 0, credit: 0 };
  });

  transactions.forEach(txn => {
    if (txn.entries && Array.isArray(txn.entries)) {
      txn.entries.forEach(entry => {
        if (entry.account) {
          const accId = entry.account.toString();
          if (accountTotals[accId]) {
            accountTotals[accId].debit += entry.debit || 0;
            accountTotals[accId].credit += entry.credit || 0;
          }
        }
      });
    }
  });

  // Prepare bulk operations for fast single-roundtrip update
  const bulkOps = accounts.map(acc => {
    const accId = acc._id.toString();
    const totals = accountTotals[accId] || { debit: 0, credit: 0 };
    let newBalance = acc.openingBalance || 0;

    if (acc.accountType === 'Asset' || acc.accountType === 'Expense') {
      newBalance += (totals.debit - totals.credit);
    } else {
      // Liability, Equity, Revenue
      newBalance += (totals.credit - totals.debit);
    }

    const rounded = Math.round(newBalance * 100) / 100;
    return {
      updateOne: {
        filter: { _id: acc._id },
        update: { $set: { balance: rounded } },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Account.bulkWrite(bulkOps);
  }
};

/**
 * Validate double entry equation
 */
const validateDoubleEntry = (entries) => {
  if (!entries || entries.length < 2) {
    return { valid: false, message: 'Transaction must have at least 2 entries' };
  }

  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);

  const roundedDebit = Math.round(totalDebit * 100) / 100;
  const roundedCredit = Math.round(totalCredit * 100) / 100;

  if (Math.abs(roundedDebit - roundedCredit) > 0.01) {
    return {
      valid: false,
      message: `Imbalanced Transaction! Total Debit (${roundedDebit}) does not equal Total Credit (${roundedCredit})`,
    };
  }

  if (roundedDebit <= 0) {
    return { valid: false, message: 'Transaction amount must be greater than zero' };
  }

  return { valid: true, totalDebit: roundedDebit, totalCredit: roundedCredit };
};

/**
 * Generate Profit & Loss Data
 */
const getProfitAndLossData = async (startDate, endDate) => {
  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const accounts = await Account.find({ status: 'Active' });

  const revenueAccounts = accounts.filter(a => a.accountType === 'Revenue');
  const expenseAccounts = accounts.filter(a => a.accountType === 'Expense');

  const revenueBreakdown = revenueAccounts.map(a => ({
    id: a._id,
    code: a.accountCode,
    name: a.accountName,
    subCategory: a.subCategory,
    amount: a.balance,
  }));

  const expenseBreakdown = expenseAccounts.map(a => ({
    id: a._id,
    code: a.accountCode,
    name: a.accountName,
    subCategory: a.subCategory,
    amount: a.balance,
  }));

  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = Math.round((totalRevenue - totalExpenses) * 100) / 100;

  return {
    revenueBreakdown,
    expenseBreakdown,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit,
    isProfit: netProfit >= 0,
  };
};

/**
 * Generate Balance Sheet Statement
 */
const getBalanceSheetData = async (startDate, endDate) => {
  const pnl = await getProfitAndLossData(startDate, endDate);
  const accounts = await Account.find({ status: 'Active' });

  const assetAccounts = accounts.filter(a => a.accountType === 'Asset');
  const liabilityAccounts = accounts.filter(a => a.accountType === 'Liability');
  const equityAccounts = accounts.filter(a => a.accountType === 'Equity');

  // Categorize Assets
  const currentAssets = assetAccounts
    .filter(a => ['Cash', 'Bank', 'Accounts Receivable', 'Inventory'].includes(a.subCategory))
    .map(a => ({ name: a.accountName, code: a.accountCode, balance: a.balance }));

  const fixedAssets = assetAccounts
    .filter(a => ['Equipment', 'Property', 'Vehicles'].includes(a.subCategory))
    .map(a => ({ name: a.accountName, code: a.accountCode, balance: a.balance }));

  const otherAssets = assetAccounts
    .filter(a => !['Cash', 'Bank', 'Accounts Receivable', 'Inventory', 'Equipment', 'Property', 'Vehicles'].includes(a.subCategory))
    .map(a => ({ name: a.accountName, code: a.accountCode, balance: a.balance }));

  const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + a.balance, 0);
  const totalFixedAssets = fixedAssets.reduce((sum, a) => sum + a.balance, 0);
  const totalOtherAssets = otherAssets.reduce((sum, a) => sum + a.balance, 0);
  const totalAssets = Math.round((totalCurrentAssets + totalFixedAssets + totalOtherAssets) * 100) / 100;

  // Categorize Liabilities
  const currentLiabilities = liabilityAccounts
    .filter(a => ['Accounts Payable', 'Creditors', 'Taxes Payable'].includes(a.subCategory))
    .map(a => ({ name: a.accountName, code: a.accountCode, balance: a.balance }));

  const longTermLiabilities = liabilityAccounts
    .filter(a => ['Loans', 'Other Liabilities'].includes(a.subCategory))
    .map(a => ({ name: a.accountName, code: a.accountCode, balance: a.balance }));

  const totalCurrentLiabilities = currentLiabilities.reduce((sum, a) => sum + a.balance, 0);
  const totalLongTermLiabilities = longTermLiabilities.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = Math.round((totalCurrentLiabilities + totalLongTermLiabilities) * 100) / 100;

  // Equity
  const equityItems = equityAccounts.map(a => ({
    name: a.accountName,
    code: a.accountCode,
    subCategory: a.subCategory,
    balance: a.balance,
  }));

  const totalBaseEquity = equityItems.reduce((sum, a) => {
    // Drawings subtract from equity
    if (a.subCategory === 'Drawings') return sum - a.balance;
    return sum + a.balance;
  }, 0);

  const currentProfitLoss = pnl.netProfit;
  const totalEquity = Math.round((totalBaseEquity + currentProfitLoss) * 100) / 100;

  const totalLiabilitiesAndEquity = Math.round((totalLiabilities + totalEquity) * 100) / 100;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return {
    assets: {
      currentAssets,
      fixedAssets,
      otherAssets,
      totalCurrentAssets: Math.round(totalCurrentAssets * 100) / 100,
      totalFixedAssets: Math.round(totalFixedAssets * 100) / 100,
      totalOtherAssets: Math.round(totalOtherAssets * 100) / 100,
      totalAssets,
    },
    liabilities: {
      currentLiabilities,
      longTermLiabilities,
      totalCurrentLiabilities: Math.round(totalCurrentLiabilities * 100) / 100,
      totalLongTermLiabilities: Math.round(totalLongTermLiabilities * 100) / 100,
      totalLiabilities,
    },
    equity: {
      items: equityItems,
      currentProfitLoss,
      totalEquity,
    },
    totalLiabilitiesAndEquity,
    isBalanced,
    difference: Math.round(Math.abs(totalAssets - totalLiabilitiesAndEquity) * 100) / 100,
  };
};

/**
 * Generate Cash Flow Statement Data
 */
const getCashFlowData = async (startDate, endDate) => {
  const pnl = await getProfitAndLossData(startDate, endDate);

  const cashAccounts = await Account.find({
    subCategory: { $in: ['Cash', 'Bank'] },
    status: 'Active'
  });

  const openingCashBalance = cashAccounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0);
  const closingCashBalance = cashAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Calculate Cash Flows from transactions
  const transactions = await Transaction.find().populate('entries.account');
  const cashAccountIds = cashAccounts.map(a => a._id.toString());

  let operatingInflow = 0;
  let operatingOutflow = 0;
  let investingInflow = 0;
  let investingOutflow = 0;
  let financingInflow = 0;
  let financingOutflow = 0;

  transactions.forEach(txn => {
    let hasCash = false;
    let cashDebit = 0;
    let cashCredit = 0;

    txn.entries.forEach(entry => {
      if (entry.account && cashAccountIds.includes(entry.account._id.toString())) {
        hasCash = true;
        cashDebit += entry.debit || 0;
        cashCredit += entry.credit || 0;
      }
    });

    if (hasCash) {
      if (txn.transactionType === 'Income' || txn.transactionType === 'Journal') {
        operatingInflow += cashDebit;
        operatingOutflow += cashCredit;
      } else if (txn.transactionType === 'Expense') {
        operatingOutflow += cashCredit;
      } else if (txn.transactionType === 'Asset') {
        if (cashDebit > 0) investingInflow += cashDebit;
        if (cashCredit > 0) investingOutflow += cashCredit;
      } else if (txn.transactionType === 'Liability' || txn.transactionType === 'Equity') {
        if (cashDebit > 0) financingOutflow += cashDebit;
        if (cashCredit > 0) financingInflow += cashCredit;
      } else {
        operatingInflow += cashDebit;
        operatingOutflow += cashCredit;
      }
    }
  });

  const netOperating = operatingInflow - operatingOutflow;
  const netInvesting = investingInflow - investingOutflow;
  const netFinancing = financingInflow - financingOutflow;

  const totalCashInflow = operatingInflow + investingInflow + financingInflow;
  const totalCashOutflow = operatingOutflow + investingOutflow + financingOutflow;
  const netCashFlow = totalCashInflow - totalCashOutflow;

  return {
    openingCashBalance: Math.round(openingCashBalance * 100) / 100,
    operatingActivities: {
      inflow: Math.round(operatingInflow * 100) / 100,
      outflow: Math.round(operatingOutflow * 100) / 100,
      net: Math.round(netOperating * 100) / 100,
    },
    investingActivities: {
      inflow: Math.round(investingInflow * 100) / 100,
      outflow: Math.round(investingOutflow * 100) / 100,
      net: Math.round(netInvesting * 100) / 100,
    },
    financingActivities: {
      inflow: Math.round(financingInflow * 100) / 100,
      outflow: Math.round(financingOutflow * 100) / 100,
      net: Math.round(netFinancing * 100) / 100,
    },
    totalCashInflow: Math.round(totalCashInflow * 100) / 100,
    totalCashOutflow: Math.round(totalCashOutflow * 100) / 100,
    netCashFlow: Math.round(netCashFlow * 100) / 100,
    closingCashBalance: Math.round((openingCashBalance + netCashFlow) * 100) / 100,
  };
};

/**
 * Generate Account Ledger
 */
const getAccountLedger = async (accountId, startDate, endDate) => {
  const account = await Account.findById(accountId);
  if (!account) return null;

  const query = { 'entries.account': accountId };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(query)
    .populate('createdBy', 'name')
    .sort({ date: 1, createdAt: 1 });

  let runningBalance = account.openingBalance || 0;
  const ledgerEntries = [];

  // Add Opening Balance Entry
  ledgerEntries.push({
    date: startDate ? new Date(startDate) : account.createdAt,
    transactionId: 'INIT-BAL',
    description: 'Opening Balance',
    debit: 0,
    credit: 0,
    balance: runningBalance,
    reference: '-',
  });

  transactions.forEach(txn => {
    const entry = txn.entries.find(e => e.account.toString() === accountId.toString());
    if (entry) {
      const debit = entry.debit || 0;
      const credit = entry.credit || 0;

      if (account.accountType === 'Asset' || account.accountType === 'Expense') {
        runningBalance += (debit - credit);
      } else {
        runningBalance += (credit - debit);
      }

      ledgerEntries.push({
        date: txn.date,
        transactionId: txn.transactionId,
        description: txn.description,
        debit,
        credit,
        balance: Math.round(runningBalance * 100) / 100,
        reference: txn.reference || '-',
        createdBy: txn.createdBy ? txn.createdBy.name : 'System',
      });
    }
  });

  return {
    account,
    openingBalance: account.openingBalance,
    closingBalance: Math.round(runningBalance * 100) / 100,
    ledgerEntries,
  };
};

module.exports = {
  recalculateAccountBalances,
  validateDoubleEntry,
  getProfitAndLossData,
  getBalanceSheetData,
  getCashFlowData,
  getAccountLedger,
};
