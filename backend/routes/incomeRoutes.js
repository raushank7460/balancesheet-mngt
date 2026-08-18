const express = require('express');
const router = express.Router();
const {
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getIncome)
  .post(protect, authorize('Admin', 'Accountant'), createIncome);

router.route('/:id')
  .put(protect, authorize('Admin', 'Accountant'), updateIncome)
  .delete(protect, authorize('Admin'), deleteIncome);

module.exports = router;
