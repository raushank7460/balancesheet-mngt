const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getExpenses)
  .post(protect, authorize('Admin', 'Accountant'), createExpense);

router.route('/:id')
  .put(protect, authorize('Admin', 'Accountant'), updateExpense)
  .delete(protect, authorize('Admin'), deleteExpense);

module.exports = router;
