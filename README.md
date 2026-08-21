Build a complete **Balance Sheet Management System** using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.
#pink
## 1. Project Overview

Create a professional web application where businesses can manage their financial accounts, income, expenses, assets, liabilities, and generate balance sheets.

The system should have a clean, responsive dashboard and a secure REST API.

### Technology Stack

Frontend:

* React.js
* Vite
* React Router DOM
* Axios
* Tailwind CSS
* Recharts

Backend:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt.js
* dotenv
* CORS

Architecture:

* MVC architecture
* RESTful APIs
* Separate frontend and backend
* Environment variables for sensitive configuration

---

## 2. Authentication & Authorization

Implement secure authentication.

Features:

* User registration
* User login
* Logout
* JWT-based authentication
* Password hashing using bcrypt
* Get logged-in user profile
* Update profile
* Change password

User roles:

* Admin
* Accountant
* User

Permissions:

* Admin can manage users and all financial data.
* Accountant can create, update, and manage financial transactions.
* User can view their financial information and reports.

Protect private API routes using authentication middleware.

---

## 3. Dashboard

Create a professional dashboard showing:

* Total Assets
* Total Liabilities
* Total Equity
* Total Income
* Total Expenses
* Net Profit/Loss
* Current Balance
* Number of Transactions

Add charts using Recharts:

* Income vs Expenses
* Assets vs Liabilities
* Monthly revenue
* Monthly expenses
* Profit/Loss trend

Dashboard should update dynamically whenever transactions are added, updated, or deleted.

---

## 4. Chart of Accounts

Create a Chart of Accounts module.

Account categories:

### Assets

* Cash
* Bank
* Accounts Receivable
* Inventory
* Equipment
* Property
* Vehicles
* Other Assets

### Liabilities

* Accounts Payable
* Loans
* Creditors
* Taxes Payable
* Other Liabilities

### Equity

* Owner's Capital
* Retained Earnings
* Drawings

### Revenue

* Sales Revenue
* Service Revenue
* Other Income

### Expenses

* Salaries
* Rent
* Electricity
* Internet
* Transportation
* Office Expenses
* Other Expenses

Each account should have:

* Account name
* Account code
* Account type
* Description
* Opening balance
* Current balance
* Status
* Created date

---

## 5. Transactions

Create a complete transaction management system.

Transaction fields:

* Transaction ID
* Date
* Description
* Account
* Transaction type
* Debit
* Credit
* Amount
* Reference
* Notes
* Created by

Transaction types:

* Income
* Expense
* Asset
* Liability
* Equity
* Transfer

Implement double-entry accounting logic.

For every transaction:

**Total Debit must equal Total Credit.**

Prevent users from creating invalid transactions.

---

## 6. Balance Sheet

Create a dedicated Balance Sheet page.

The balance sheet should display:

### Assets

* Current Assets
* Fixed Assets
* Other Assets
* Total Assets

### Liabilities

* Current Liabilities
* Long-term Liabilities
* Total Liabilities

### Equity

* Owner's Capital
* Retained Earnings
* Current Profit/Loss
* Total Equity

At the bottom display:

**Total Liabilities + Equity**

The system must validate:

**Total Assets = Total Liabilities + Total Equity**

Show a clear warning if the balance sheet is not balanced.

Allow users to select:

* Start Date
* End Date
* Financial Year

Add buttons:

* Generate Report
* Print
* Download PDF
* Export Excel

---

## 7. Profit & Loss Statement

Create a Profit & Loss page.

Display:

Revenue:

* Sales
* Services
* Other Income
* Total Revenue

Expenses:

* Salaries
* Rent
* Utilities
* Transportation
* Other Expenses
* Total Expenses

Calculate:

**Net Profit = Total Revenue - Total Expenses**

If expenses are greater than revenue, show Net Loss.

---

## 8. Cash Flow

Create a Cash Flow Statement.

Sections:

* Operating Activities
* Investing Activities
* Financing Activities

Display:

* Opening Cash Balance
* Cash Inflow
* Cash Outflow
* Net Cash Flow
* Closing Cash Balance

---

## 9. Expense Management

Create an expense management module.

Features:

* Add expense
* Edit expense
* Delete expense
* View expense
* Filter by category
* Filter by date
* Search expenses

Expense fields:

* Expense ID
* Category
* Amount
* Date
* Payment method
* Description
* Receipt
* Notes

---

## 10. Income Management

Create an income management module.

Features:

* Add income
* Edit income
* Delete income
* View income
* Search income
* Filter by date
* Filter by source

Income fields:

* Income ID
* Source
* Amount
* Date
* Payment method
* Description
* Reference

---

## 11. Reports

Create a Reports module.

Reports should include:

* Balance Sheet
* Profit & Loss
* Cash Flow Statement
* Income Report
* Expense Report
* Transaction Report
* Account Ledger

Allow filtering by:

* Date range
* Account
* Category
* Transaction type

Add:

* Print
* PDF export
* Excel export

---

## 12. Account Ledger

Create an account ledger page.

For every account display:

| Date | Description | Debit | Credit | Balance |

Calculate the running balance automatically.

Users should be able to select an account and date range.

---

## 13. User Management

Admin dashboard should include:

* View users
* Add user
* Edit user
* Delete user
* Activate/deactivate user
* Assign role
* Search users

Roles:

* Admin
* Accountant
* User

---

## 14. Notifications

Create a notification system for:

* Successful transaction
* Failed transaction
* Balance sheet mismatch
* New user
* Report generated
* Important financial alerts

---

## 15. Database Models

Create appropriate Mongoose models.

Minimum models:

### User

* name
* email
* password
* role
* status
* createdAt

### Account

* accountName
* accountCode
* accountType
* description
* openingBalance
* balance
* status
* createdAt

### Transaction

* transactionId
* date
* description
* entries
* reference
* notes
* createdBy
* createdAt

### TransactionEntry

* account
* debit
* credit

### Income

* incomeId
* source
* amount
* date
* paymentMethod
* description
* createdBy

### Expense

* expenseId
* category
* amount
* date
* paymentMethod
* description
* createdBy

---

## 16. Backend API

Create REST APIs following MVC architecture.

Example:

Authentication:

* POST /api/auth/register
* POST /api/auth/login
* GET /api/auth/profile
* PUT /api/auth/profile
* PUT /api/auth/change-password

Accounts:

* GET /api/accounts
* GET /api/accounts/:id
* POST /api/accounts
* PUT /api/accounts/:id
* DELETE /api/accounts/:id

Transactions:

* GET /api/transactions
* GET /api/transactions/:id
* POST /api/transactions
* PUT /api/transactions/:id
* DELETE /api/transactions/:id

Income:

* GET /api/income
* POST /api/income
* PUT /api/income/:id
* DELETE /api/income/:id

Expenses:

* GET /api/expenses
* POST /api/expenses
* PUT /api/expenses/:id
* DELETE /api/expenses/:id

Reports:

* GET /api/reports/balance-sheet
* GET /api/reports/profit-loss
* GET /api/reports/cash-flow
* GET /api/reports/ledger

Users:

* GET /api/users
* POST /api/users
* PUT /api/users/:id
* DELETE /api/users/:id

---

## 17. Frontend Pages

Create these pages:

* Login
* Register
* Dashboard
* Profile
* Accounts
* Add Account
* Transactions
* Add Transaction
* Income
* Expenses
* Balance Sheet
* Profit & Loss
* Cash Flow
* Ledger
* Reports
* Users
* Settings
* 404 Page

Create a reusable layout containing:

* Sidebar
* Navbar
* User profile menu
* Notifications
* Logout button

---

## 18. UI/UX Requirements

Use a modern professional accounting dashboard design.

Requirements:

* Fully responsive
* Mobile friendly
* Clean sidebar
* Cards for financial summaries
* Tables with pagination
* Search
* Filters
* Sorting
* Loading states
* Error states
* Empty states
* Confirmation dialogs
* Toast notifications
* Form validation
* Proper currency formatting

Use reusable React components.

---

## 19. Security

Implement:

* JWT authentication
* bcrypt password hashing
* Protected routes
* Role-based authorization
* Input validation
* MongoDB injection protection
* CORS configuration
* Environment variables
* Secure error handling
* Do not expose passwords or JWT secrets
* Do not commit `.env` to GitHub

Create:

`.env`

Example variables:

MONGO_URI=
JWT_SECRET=
PORT=
CLIENT_URL=

---

## 20. Project Structure

Use this structure:

backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── uploads/
├── app.js
├── server.js
├── package.json
└── .env

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── context/
│   ├── services/
│   ├── utils/
│   ├── routes/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js

---

## 21. Important Accounting Logic

Implement proper accounting calculations.

The system must maintain:

**Assets = Liabilities + Equity**

And:

**Equity = Capital + Retained Earnings + Net Profit - Drawings**

Also:

**Net Profit = Revenue - Expenses**

For every double-entry transaction:

**Total Debit = Total Credit**

Do not calculate financial statements only from frontend values. All important calculations should be performed/validated on the backend.

---

## 22. Error Handling

Create centralized backend error handling.

Return consistent API responses:

```json
{
  "success": false,
  "message": "Transaction could not be created",
  "error": "Validation error"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {}
}
```

---

## 23. Development Requirements

Build the project step-by-step.

First create:

1. Backend setup
2. MongoDB connection
3. Models
4. Controllers
5. Routes
6. Authentication
7. Middleware
8. Accounting logic
9. Frontend setup
10. Authentication UI
11. Dashboard
12. Account management
13. Transaction management
14. Financial reports
15. Admin panel
16. PDF/Excel export
17. Testing
18. Deployment

Do not generate fake or incomplete functionality.

All buttons and forms should work with the backend API.

Use proper validation on both frontend and backend.

Provide complete code for every required file and clearly explain where each file should be created.

The final application should be production-ready, scalable, maintainable, and suitable for a real-world **Balance Sheet Management System**.
