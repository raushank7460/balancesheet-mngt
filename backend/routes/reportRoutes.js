const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getBalanceSheetReport,
  getProfitLossReport,
  getCashFlowReport,
  getLedgerReport,
  resetData,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardMetrics);
router.get('/balance-sheet', protect, getBalanceSheetReport);
router.get('/profit-loss', protect, getProfitLossReport);
router.get('/cash-flow', protect, getCashFlowReport);
router.get('/ledger', protect, getLedgerReport);
router.post('/reset-data', protect, resetData);

module.exports = router;
