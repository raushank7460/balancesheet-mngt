import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../context/CurrencyContext';
import {
  PieChart,
  Printer,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

const ProfitLoss = () => {
  const { currencySymbol, formatCurrency: formatCurr } = useCurrency();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { addToast } = useNotification();

  const fetchPnlReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/profit-loss', {
        params: { startDate, endDate },
      });
      setReport(res.data.data);
    } catch (error) {
      console.error(error);
      addToast('Failed to load Profit & Loss statement', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPnlReport();
  }, []);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    if (!report) return;
    const headers = ['Category / Account', `Amount (${currencySymbol})`];
    const rows = [
      ['--- REVENUE ---', ''],
      ...report.revenueBreakdown.map(r => [`  ${r.name} (${r.code})`, formatCurr(r.amount)]),
      ['TOTAL REVENUE', formatCurr(report.totalRevenue)],
      ['', ''],
      ['--- OPERATING EXPENSES ---', ''],
      ...report.expenseBreakdown.map(e => [`  ${e.name} (${e.code})`, formatCurr(e.amount)]),
      ['TOTAL EXPENSES', formatCurr(report.totalExpenses)],
      ['', ''],
      [report.isProfit ? 'NET PROFIT' : 'NET LOSS', formatCurr(report.netProfit)],
    ];

    exportToPDF('Profit and Loss Statement', headers, rows, 'Profit_Loss_Statement');
    addToast('PDF Profit & Loss exported.', 'success', 'Export');
  };

  const handleExportExcel = () => {
    if (!report) return;
    const excelData = [
      ...report.revenueBreakdown.map(r => ({ Section: 'Revenue', Account: r.name, Code: r.code, Amount: r.amount })),
      { Section: 'Summary', Account: 'TOTAL REVENUE', Code: '', Amount: report.totalRevenue },
      ...report.expenseBreakdown.map(e => ({ Section: 'Expense', Account: e.name, Code: e.code, Amount: e.amount })),
      { Section: 'Summary', Account: 'TOTAL EXPENSES', Code: '', Amount: report.totalExpenses },
      { Section: 'Final Result', Account: report.isProfit ? 'NET PROFIT' : 'NET LOSS', Code: '', Amount: report.netProfit },
    ];
    exportToExcel(excelData, 'Profit_Loss_Statement');
    addToast('Excel Profit & Loss exported.', 'success', 'Export');
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PieChart className="w-6 h-6 text-emerald-400" /> Profit & Loss Statement (Income Statement)
          </h1>
          <p className="text-xs text-slate-400">Statement of financial performance revenue, expenses & net earnings</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchPnlReport}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
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

      {/* Date Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center gap-4 text-xs no-print">
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

      {/* Document Body */}
      {loading || !report ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
          Loading Profit & Loss statement...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 glass-panel max-w-4xl mx-auto">
          <div className="text-center pb-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white tracking-wide">EquiBalance Enterprise Solutions</h2>
            <h3 className="text-base font-semibold text-emerald-400 mt-1 uppercase tracking-widest">
              PROFIT & LOSS STATEMENT
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              For Period: {startDate && endDate ? `${startDate} to ${endDate}` : 'All Cumulative Records'}
            </p>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Operating Revenue
            </h4>
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-xs">
              {report.revenueBreakdown.map((rev) => (
                <div key={rev.id} className="flex justify-between py-1.5 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-300 font-medium">{rev.name} ({rev.code})</span>
                  <span className="font-mono text-slate-200">{formatCurrency(rev.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-slate-700 font-bold text-sm text-emerald-400">
                <span>TOTAL REVENUE</span>
                <span className="font-mono">{formatCurrency(report.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> Operating Expenses
            </h4>
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-xs">
              {report.expenseBreakdown.map((exp) => (
                <div key={exp.id} className="flex justify-between py-1.5 border-b border-slate-800/40 last:border-0">
                  <span className="text-slate-300 font-medium">{exp.name} ({exp.code})</span>
                  <span className="font-mono text-slate-200">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-slate-700 font-bold text-sm text-rose-400">
                <span>TOTAL EXPENSES</span>
                <span className="font-mono">{formatCurrency(report.totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Final Net Profit / Loss Calculation Box */}
          <div
            className={`p-6 rounded-2xl border flex items-center justify-between shadow-2xl ${
              report.isProfit
                ? 'bg-gradient-to-r from-emerald-950 to-slate-900 border-emerald-500/30'
                : 'bg-gradient-to-r from-rose-950 to-slate-900 border-rose-500/30'
            }`}
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Result</span>
              <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                {report.isProfit ? (
                  <>
                    <ArrowUpRight className="w-6 h-6 text-emerald-400" /> NET PROFIT
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-6 h-6 text-rose-400" /> NET LOSS
                  </>
                )}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-white">
                {formatCurrency(report.netProfit)}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">Total Revenue minus Operating Expenses</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitLoss;
