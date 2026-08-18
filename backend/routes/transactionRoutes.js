const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getTransactions)
  .post(protect, authorize('Admin', 'Accountant'), createTransaction);

router.route('/:id')
  .get(protect, getTransactionById)
  .put(protect, authorize('Admin', 'Accountant'), updateTransaction)
  .delete(protect, authorize('Admin'), deleteTransaction);

module.exports = router;
