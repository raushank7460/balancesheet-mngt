const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { recalculateAccountBalances } = require('../services/accountingService');

const defaultAccounts = [
  // Assets
  { accountName: 'Cash', accountCode: '1010', accountType: 'Asset', subCategory: 'Cash', description: 'Physical cash on hand', openingBalance: 5000 },
  { accountName: 'Bank Account', accountCode: '1020', accountType: 'Asset', subCategory: 'Bank', description: 'Primary business checking account', openingBalance: 25000 },
  { accountName: 'Accounts Receivable', accountCode: '1030', accountType: 'Asset', subCategory: 'Accounts Receivable', description: 'Money owed by customers', openingBalance: 4000 },
  { accountName: 'Inventory', accountCode: '1040', accountType: 'Asset', subCategory: 'Inventory', description: 'Merchandise held for sale', openingBalance: 12000 },
  { accountName: 'Office Equipment', accountCode: '1510', accountType: 'Asset', subCategory: 'Equipment', description: 'Computers, printers, desks', openingBalance: 8000 },
  { accountName: 'Real Estate Property', accountCode: '1520', accountType: 'Asset', subCategory: 'Property', description: 'Office premises', openingBalance: 50000 },
  { accountName: 'Company Vehicles', accountCode: '1530', accountType: 'Asset', subCategory: 'Vehicles', description: 'Delivery vans and company cars', openingBalance: 15000 },
  { accountName: 'Other Assets', accountCode: '1990', accountType: 'Asset', subCategory: 'Other Assets', description: 'Prepaid expenses & deposits', openingBalance: 1000 },

  // Liabilities
  { accountName: 'Accounts Payable', accountCode: '2010', accountType: 'Liability', subCategory: 'Accounts Payable', description: 'Bills owed to suppliers', openingBalance: 3500 },
  { accountName: 'Bank Loan', accountCode: '2020', accountType: 'Liability', subCategory: 'Loans', description: 'Long-term commercial loan', openingBalance: 20000 },
  { accountName: 'Trade Creditors', accountCode: '2030', accountType: 'Liability', subCategory: 'Creditors', description: 'Short-term creditors', openingBalance: 1500 },
  { accountName: 'Taxes Payable', accountCode: '2040', accountType: 'Liability', subCategory: 'Taxes Payable', description: 'Accrued sales and income tax', openingBalance: 1200 },
  { accountName: 'Other Liabilities', accountCode: '2990', accountType: 'Liability', subCategory: 'Other Liabilities', description: 'Miscellaneous payables', openingBalance: 800 },

  // Equity
  { accountName: "Owner's Capital", accountCode: '3010', accountType: 'Equity', subCategory: "Owner's Capital", description: 'Initial owner investment', openingBalance: 80000 },
  { accountName: 'Retained Earnings', accountCode: '3020', accountType: 'Equity', subCategory: 'Retained Earnings', description: 'Accumulated prior profits', openingBalance: 10000 },
  { accountName: 'Owner Drawings', accountCode: '3030', accountType: 'Equity', subCategory: 'Drawings', description: 'Owner withdrawals', openingBalance: 5000 },

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
    // 1. Seed Accounts
    const accountCount = await Account.countDocuments();
    if (accountCount === 0) {
      console.log('Seeding default Chart of Accounts...');
      await Account.insertMany(defaultAccounts);
      console.log('Chart of Accounts seeded successfully!');
    }

    // 2. Seed Users
    const adminUser = await User.findOne({ email: 'admin@balancesheet.com' });
    if (!adminUser) {
      console.log('Seeding default Admin user...');
      await User.create({
        name: 'System Admin',
        email: 'admin@balancesheet.com',
        password: 'admin123',
        role: 'Admin',
        status: 'Active',
      });
      console.log('Default Admin created: admin@balancesheet.com / admin123');
    }

    const accountantUser = await User.findOne({ email: 'accountant@balancesheet.com' });
    if (!accountantUser) {
      console.log('Seeding default Accountant user...');
      await User.create({
        name: 'Senior Accountant',
        email: 'accountant@balancesheet.com',
        password: 'accountant123',
        role: 'Accountant',
        status: 'Active',
      });
      console.log('Default Accountant created: accountant@balancesheet.com / accountant123');
    }

    const standardUser = await User.findOne({ email: 'user@balancesheet.com' });
    if (!standardUser) {
      console.log('Seeding default View-only User...');
      await User.create({
        name: 'Business Manager',
        email: 'user@balancesheet.com',
        password: 'user123',
        role: 'User',
        status: 'Active',
      });
      console.log('Default User created: user@balancesheet.com / user123');
    }

    // 3. Seed Sample Transactions if empty
    const txnCount = await Transaction.countDocuments();
    if (txnCount === 0) {
      const bankAcc = await Account.findOne({ accountCode: '1020' });
      const salesAcc = await Account.findOne({ accountCode: '4010' });
      const rentAcc = await Account.findOne({ accountCode: '5020' });
      const salaryAcc = await Account.findOne({ accountCode: '5010' });
      const admin = await User.findOne({ email: 'admin@balancesheet.com' });

      if (bankAcc && salesAcc && rentAcc && salaryAcc && admin) {
        console.log('Seeding sample transactions...');
        // Sample Sale Transaction
        const txn1 = new Transaction({
          transactionId: 'TXN-10001',
          date: new Date(),
          description: 'Client Project Invoice Payment Received',
          transactionType: 'Income',
          reference: 'INV-2026-001',
          createdBy: admin._id,
          entries: [
            { account: bankAcc._id, debit: 15000, credit: 0 },
            { account: salesAcc._id, debit: 0, credit: 15000 },
          ],
        });
        await txn1.save();

        await Income.create({
          incomeId: 'INC-1001',
          source: 'Sales Revenue',
          amount: 15000,
          date: new Date(),
          paymentMethod: 'Bank Transfer',
          description: 'Client Project Invoice Payment Received',
          reference: 'INV-2026-001',
          createdBy: admin._id,
          transactionRef: txn1._id,
        });

        // Sample Rent Expense Transaction
        const txn2 = new Transaction({
          transactionId: 'TXN-10002',
          date: new Date(),
          description: 'Monthly Office Space Rent Payment',
          transactionType: 'Expense',
          reference: 'RENT-AUG-2026',
          createdBy: admin._id,
          entries: [
            { account: rentAcc._id, debit: 3500, credit: 0 },
            { account: bankAcc._id, debit: 0, credit: 3500 },
          ],
        });
        await txn2.save();

        await Expense.create({
          expenseId: 'EXP-1001',
          category: 'Rent',
          amount: 3500,
          date: new Date(),
          paymentMethod: 'Bank Transfer',
          description: 'Monthly Office Space Rent Payment',
          notes: 'Rent for HQ office space',
          createdBy: admin._id,
          transactionRef: txn2._id,
        });

        // Sample Salary Expense Transaction
        const txn3 = new Transaction({
          transactionId: 'TXN-10003',
          date: new Date(),
          description: 'Staff Payroll Disbursement',
          transactionType: 'Expense',
          reference: 'PAYROLL-AUG-2026',
          createdBy: admin._id,
          entries: [
            { account: salaryAcc._id, debit: 6000, credit: 0 },
            { account: bankAcc._id, debit: 0, credit: 6000 },
          ],
        });
        await txn3.save();

        await Expense.create({
          expenseId: 'EXP-1002',
          category: 'Salaries',
          amount: 6000,
          date: new Date(),
          paymentMethod: 'Bank Transfer',
          description: 'Staff Payroll Disbursement',
          notes: 'August staff salaries',
          createdBy: admin._id,
          transactionRef: txn3._id,
        });

        console.log('Sample transactions seeded!');
      }
    }

    // Recalculate account balances after seed
    await recalculateAccountBalances();
    console.log('Initial accounting recalculation complete!');
  } catch (error) {
    console.error('Error during data seeding:', error);
  }
};

module.exports = { seedInitialData };
