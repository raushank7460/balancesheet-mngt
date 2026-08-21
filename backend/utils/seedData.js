const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { recalculateAccountBalances } = require('../services/accountingService');

const defaultAccounts = [
  // Assets
  { accountName: 'Cash', accountCode: '1010', accountType: 'Asset', subCategory: 'Cash', description: 'Physical cash on hand', openingBalance: 0 },
  { accountName: 'Bank Account', accountCode: '1020', accountType: 'Asset', subCategory: 'Bank', description: 'Primary business checking account', openingBalance: 0 },
  { accountName: 'Accounts Receivable', accountCode: '1030', accountType: 'Asset', subCategory: 'Accounts Receivable', description: 'Money owed by customers', openingBalance: 0 },
  { accountName: 'Inventory', accountCode: '1040', accountType: 'Asset', subCategory: 'Inventory', description: 'Merchandise held for sale', openingBalance: 0 },
  { accountName: 'Office Equipment', accountCode: '1510', accountType: 'Asset', subCategory: 'Equipment', description: 'Computers, printers, desks', openingBalance: 0 },
  { accountName: 'Real Estate Property', accountCode: '1520', accountType: 'Asset', subCategory: 'Property', description: 'Office premises', openingBalance: 0 },
  { accountName: 'Company Vehicles', accountCode: '1530', accountType: 'Asset', subCategory: 'Vehicles', description: 'Delivery vans and company cars', openingBalance: 0 },
  { accountName: 'Other Assets', accountCode: '1990', accountType: 'Asset', subCategory: 'Other Assets', description: 'Prepaid expenses & deposits', openingBalance: 0 },

  // Liabilities
  { accountName: 'Accounts Payable', accountCode: '2010', accountType: 'Liability', subCategory: 'Accounts Payable', description: 'Bills owed to suppliers', openingBalance: 0 },
  { accountName: 'Bank Loan', accountCode: '2020', accountType: 'Liability', subCategory: 'Loans', description: 'Long-term commercial loan', openingBalance: 0 },
  { accountName: 'Trade Creditors', accountCode: '2030', accountType: 'Liability', subCategory: 'Creditors', description: 'Short-term creditors', openingBalance: 0 },
  { accountName: 'Taxes Payable', accountCode: '2040', accountType: 'Liability', subCategory: 'Taxes Payable', description: 'Accrued sales and income tax', openingBalance: 0 },
  { accountName: 'Other Liabilities', accountCode: '2990', accountType: 'Liability', subCategory: 'Other Liabilities', description: 'Miscellaneous payables', openingBalance: 0 },

  // Equity
  { accountName: "Owner's Capital", accountCode: '3010', accountType: 'Equity', subCategory: "Owner's Capital", description: 'Initial owner investment', openingBalance: 0 },
  { accountName: 'Retained Earnings', accountCode: '3020', accountType: 'Equity', subCategory: 'Retained Earnings', description: 'Accumulated prior profits', openingBalance: 0 },
  { accountName: 'Owner Drawings', accountCode: '3030', accountType: 'Equity', subCategory: 'Drawings', description: 'Owner withdrawals', openingBalance: 0 },

  // Revenue
  { accountName: 'Sales Revenue', accountCode: '4010', accountType: 'Revenue', subCategory: 'Sales Revenue', description: 'Revenue from product sales', openingBalance: 0 },
  { accountName: 'Service Revenue', accountCode: '4020', accountType: 'Revenue', subCategory: 'Service Revenue', description: 'Revenue from consulting & services', openingBalance: 0 },
  { accountName: 'Other Income', accountCode: '4030', accountType: 'Revenue', subCategory: 'Other Income', description: 'Interest, dividends, miscellaneous', openingBalance: 0 },

  // Expenses
  { accountName: 'Staff Salaries', accountCode: '5010', accountType: 'Expense', subCategory: 'Salaries', description: 'Employee wages & benefits', openingBalance: 0 },
  { accountName: 'Office Rent', accountCode: '5020', accountType: 'Expense', subCategory: 'Rent', description: 'Building lease payment', openingBalance: 0 },
  { accountName: 'Electricity Utility', accountCode: '5030', accountType: 'Expense', subCategory: 'Electricity', description: 'Electric power bill', openingBalance: 0 },
  { accountName: 'Internet & Telecom', accountCode: '5040', accountType: 'Expense', subCategory: 'Internet', description: 'Broadband and mobile lines', openingBalance: 0 },
  { accountName: 'Transportation & Travel', accountCode: '5050', accountType: 'Expense', subCategory: 'Transportation', description: 'Fuel, taxis, and freight', openingBalance: 0 },
  { accountName: 'General Office Supplies', accountCode: '5060', accountType: 'Expense', subCategory: 'Office Expenses', description: 'Paper, ink, consumables', openingBalance: 0 },
  { accountName: 'Other Miscellaneous Expenses', accountCode: '5090', accountType: 'Expense', subCategory: 'Other Expenses', description: 'Sundry expenses', openingBalance: 0 },
];

const seedInitialData = async () => {
  try {
    // 1. Seed Accounts if empty (Clean standard chart with 0 balances)
    const accountCount = await Account.countDocuments();
    if (accountCount === 0) {
      console.log('Initializing Chart of Accounts...');
      await Account.insertMany(defaultAccounts);
      console.log('Chart of Accounts initialized successfully!');
    }

    // 2. Seed Default Admin User if none exists
    const adminUser = await User.findOne({ email: 'admin@balancesheet.com' });
    if (!adminUser) {
      console.log('Creating initial Admin user...');
      await User.create({
        name: 'System Admin',
        email: 'admin@balancesheet.com',
        password: 'admin123',
        role: 'Admin',
        status: 'Active',
      });
      console.log('Default Admin ready: admin@balancesheet.com / admin123');
    }
  } catch (error) {
    console.error('Error during data initialization:', error);
  }
};

module.exports = { seedInitialData };
