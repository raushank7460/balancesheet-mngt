import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../context/CurrencyContext';
import {
  Scale,
  Calendar,
  Printer,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Building,
  CreditCard,
  PieChart,
  RefreshCw,
} from 'lucide-react';

const BalanceSheet = () => {
  const { currencySymbol, formatCurrency: formatCurr } = useCurrency();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { addToast } = useNotification();

  const fetchBalanceSheet = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/balance-sheet', {
        params: { startDate, endDate },
      });
      setReport(res.data.data);
    } catch (error) {
      console.error(error);
      addToast('Failed to load Balance Sheet report', 'error', 'Report Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  const handleYearChange = (year) => {
    setFinancialYear(year);
    if (year === '2025-2026') {
      setStartDate('2025-04-01');
      setEndDate('2026-03-31');
    } else if (year === '2026-2027') {
      setStartDate('2026-04-01');
      setEndDate('2027-03-31');
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!report) return;

    const headers = ['Category / Account', `Amount (${currencySymbol})`];
    const rows = [
      ['--- ASSETS ---', ''],
      ...report.assets.currentAssets.map(a => [`  ${a.name} (${a.code})`, formatCurr(a.balance)]),
      ['Total Current Assets', formatCurr(report.assets.totalCurrentAssets)],
      ...report.assets.fixedAssets.map(a => [`  ${a.name} (${a.code})`, formatCurr(a.balance)]),
      ['Total Fixed Assets', formatCurr(report.assets.totalFixedAssets)],
      ...report.assets.otherAssets.map(a => [`  ${a.name} (${a.code})`, formatCurr(a.balance)]),
      ['TOTAL ASSETS', formatCurr(report.assets.totalAssets)],
      ['', ''],
      ['--- LIABILITIES ---', ''],
      ...report.liabilities.currentLiabilities.map(l => [`  ${l.name} (${l.code})`, formatCurr(l.balance)]),
      ['Total Current Liabilities', formatCurr(report.liabilities.totalCurrentLiabilities)],
      ...report.liabilities.longTermLiabilities.map(l => [`  ${l.name} (${l.code})`, formatCurr(l.balance)]),
      ['TOTAL LIABILITIES', formatCurr(report.liabilities.totalLiabilities)],
      ['', ''],
      ['--- EQUITY ---', ''],
      ...report.equity.items.map(e => [`  ${e.name} (${e.code})`, formatCurr(e.balance)]),
      ['Current Profit / Loss', formatCurr(report.equity.currentProfitLoss)],
      ['TOTAL EQUITY', formatCurr(report.equity.totalEquity)],
      ['', ''],
      ['TOTAL LIABILITIES & EQUITY', formatCurr(report.totalLiabilitiesAndEquity)],
    ];

    exportToPDF(`Balance Sheet Statement (${financialYear})`, headers, rows, 'Balance_Sheet_Report');
    addToast('PDF Report generated and downloaded.', 'success', 'Export');
  };

  const handleExportExcel = () => {
    if (!report) return;

    const excelData = [
      { Category: 'ASSETS - Current Assets', Amount: report.assets.totalCurrentAssets },
      ...report.assets.currentAssets.map(a => ({ Category: `  ${a.name}`, Amount: a.balance })),
      { Category: 'ASSETS - Fixed Assets', Amount: report.assets.totalFixedAssets },
      ...report.assets.fixedAssets.map(a => ({ Category: `  ${a.name}`, Amount: a.balance })),
      { Category: 'TOTAL ASSETS', Amount: report.assets.totalAssets },
      { Category: 'LIABILITIES - Current', Amount: report.liabilities.totalCurrentLiabilities },
      ...report.liabilities.currentLiabilities.map(l => ({ Category: `  ${l.name}`, Amount: l.balance })),
      { Category: 'LIABILITIES - Long Term', Amount: report.liabilities.totalLongTermLiabilities },
      ...report.liabilities.longTermLiabilities.map(l => ({ Category: `  ${l.name}`, Amount: l.balance })),
      { Category: 'TOTAL LIABILITIES', Amount: report.liabilities.totalLiabilities },
      { Category: 'EQUITY - Owner Equity & Retained Earnings', Amount: report.equity.totalEquity },
      { Category: 'TOTAL LIABILITIES & EQUITY', Amount: report.totalLiabilitiesAndEquity },
    ];

    exportToExcel(excelData, 'Balance_Sheet_Statement');
    addToast('Excel spreadsheet exported successfully.', 'success', 'Export');
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-400" /> Balance Sheet Statement
          </h1>
          <p className="text-xs text-slate-400">Statement of financial position as of selected date</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchBalanceSheet}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Generate Report
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" /> Print
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* Date & Financial Year Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-4 text-xs no-print">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">Financial Year:</span>
          <select
            value={financialYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold"
          >
            <option value="All">All Time (Cumulative)</option>
            <option value="2026-2027">FY 2026 - 2027</option>
            <option value="2025-2026">FY 2025 - 2026</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Start Date:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">End Date:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
          />
        </div>
      </div>

      {/* Balance Equation Indicator Status Banner */}
      {report && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            report.isBalanced
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {report.isBalanced ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <span>
              {report.isBalanced
                ? 'Balance Sheet Balanced: Total Assets = Total Liabilities + Total Equity'
                : `Balance Sheet Imbalanced! Discrepancy Difference: ${formatCurrency(report.difference)}`}
            </span>
          </div>

          <div className="font-mono text-sm">
            {currencySymbol}{report.assets.totalAssets} = {currencySymbol}{report.totalLiabilitiesAndEquity}
          </div>
        </div>
      )}

      {/* Main Statement Document */}
      {loading || !report ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
          Loading Balance Sheet Report...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 glass-panel">
          {/* Document Printable Header */}
          <div className="text-center pb-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white tracking-wide">EquiBalance Enterprise Solutions</h2>
            <h3 className="text-base font-semibold text-indigo-400 mt-1 uppercase tracking-widest">
              BALANCE SHEET STATEMENT
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Financial Period: {financialYear} {startDate && endDate ? `(${startDate} to ${endDate})` : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ASSETS SECTION */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-indigo-500/30 text-indigo-400 font-bold text-sm uppercase">
                <Building className="w-4 h-4" /> Assets
              </div>

              {/* Current Assets */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Assets</h4>
                <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
                  {report.assets.currentAssets.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40 last:border-0">
                      <span className="text-slate-300">{item.name} ({item.code})</span>
                      <span className="font-mono text-slate-200">{formatCurrency(item.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 text-indigo-300 border-t border-slate-700">
                    <span>Total Current Assets</span>
                    <span className="font-mono">{formatCurrency(report.assets.totalCurrentAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Assets */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fixed Assets</h4>
                <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
                  {report.assets.fixedAssets.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40 last:border-0">
                      <span className="text-slate-300">{item.name} ({item.code})</span>
                      <span className="font-mono text-slate-200">{formatCurrency(item.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 text-indigo-300 border-t border-slate-700">
                    <span>Total Fixed Assets</span>
                    <span className="font-mono">{formatCurrency(report.assets.totalFixedAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Other Assets */}
              {report.assets.otherAssets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Other Assets</h4>
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
                    {report.assets.otherAssets.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span className="text-slate-300">{item.name}</span>
                        <span className="font-mono text-slate-200">{formatCurrency(item.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Assets Summary Box */}
              <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex justify-between items-center text-sm font-bold text-white">
                <span className="uppercase tracking-wider">TOTAL ASSETS</span>
                <span className="font-mono text-indigo-400 text-base">{formatCurrency(report.assets.totalAssets)}</span>
              </div>
            </div>

            {/* LIABILITIES & EQUITY SECTION */}
            <div className="space-y-6">
              {/* LIABILITIES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-rose-500/30 text-rose-400 font-bold text-sm uppercase">
                  <CreditCard className="w-4 h-4" /> Liabilities
                </div>

                {/* Current Liabilities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Liabilities</h4>
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
                    {report.liabilities.currentLiabilities.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40 last:border-0">
                        <span className="text-slate-300">{item.name} ({item.code})</span>
                        <span className="font-mono text-slate-200">{formatCurrency(item.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 text-rose-300 border-t border-slate-700">
                      <span>Total Current Liabilities</span>
                      <span className="font-mono">{formatCurrency(report.liabilities.totalCurrentLiabilities)}</span>
                    </div>
                  </div>
                </div>

                {/* Long-term Liabilities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Long-term Liabilities</h4>
                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
                    {report.liabilities.longTermLiabilities.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40 last:border-0">
                        <span className="text-slate-300">{item.name} ({item.code})</span>
                        <span className="font-mono text-slate-200">{formatCurrency(item.balance)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 text-rose-300 border-t border-slate-700">
                      <span>Total Long-term Liabilities</span>
                      <span className="font-mono">{formatCurrency(report.liabilities.totalLongTermLiabilities)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-bold text-slate-200">
                  <span>TOTAL LIABILITIES</span>
                  <span className="font-mono text-rose-400">{formatCurrency(report.liabilities.totalLiabilities)}</span>
                </div>
              </div>

              {/* EQUITY */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-500/30 text-purple-400 font-bold text-sm uppercase">
                  <PieChart className="w-4 h-4" /> Owner's Equity
                </div>

                <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs">
                  {report.equity.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40 last:border-0">
                      <span className="text-slate-300">{item.name} ({item.code})</span>
                      <span className="font-mono text-slate-200">{formatCurrency(item.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 text-emerald-400 font-semibold">
                    <span>Current Profit / Loss (Net Income)</span>
                    <span className="font-mono">{formatCurrency(report.equity.currentProfitLoss)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 text-purple-300 border-t border-slate-700">
                    <span>TOTAL EQUITY</span>
                    <span className="font-mono">{formatCurrency(report.equity.totalEquity)}</span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities + Equity Summary Box */}
              <div className="p-4 rounded-xl bg-purple-600/10 border border-purple-500/30 flex justify-between items-center text-sm font-bold text-white">
                <span className="uppercase tracking-wider">TOTAL LIABILITIES + EQUITY</span>
                <span className="font-mono text-purple-400 text-base">{formatCurrency(report.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheet;
