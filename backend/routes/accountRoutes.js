const express = require('express');
const router = express.Router();
const {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getAccounts)
  .post(protect, authorize('Admin', 'Accountant'), createAccount);

router.route('/:id')
  .get(protect, getAccountById)
  .put(protect, authorize('Admin', 'Accountant'), updateAccount)
  .delete(protect, authorize('Admin'), deleteAccount);

module.exports = router;
