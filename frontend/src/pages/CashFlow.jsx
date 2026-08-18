import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { formatCurrency } from '../utils/formatters';
import { Banknote, Printer, FileText, Download, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

const CashFlow = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { addToast } = useNotification();

  const fetchCashFlow = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/cash-flow', { params: { startDate, endDate } });
      setReport(res.data.data);
    } catch (error) {
      console.error(error);
      addToast('Failed to load Cash Flow statement', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlow();
  }, []);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    if (!report) return;
    const headers = ['Activity / Metric', 'Inflow ($)', 'Outflow ($)', 'Net Cash Flow ($)'];
    const rows = [
      ['Opening Cash Balance', '', '', formatCurrency(report.openingCashBalance)],
      [
        'Operating Activities',
        formatCurrency(report.operatingActivities.inflow),
        formatCurrency(report.operatingActivities.outflow),
        formatCurrency(report.operatingActivities.net),
      ],
      [
        'Investing Activities',
        formatCurrency(report.investingActivities.inflow),
        formatCurrency(report.investingActivities.outflow),
        formatCurrency(report.investingActivities.net),
      ],
      [
        'Financing Activities',
        formatCurrency(report.financingActivities.inflow),
        formatCurrency(report.financingActivities.outflow),
        formatCurrency(report.financingActivities.net),
      ],
      [
        'TOTAL NET CASH FLOW',
        formatCurrency(report.totalCashInflow),
        formatCurrency(report.totalCashOutflow),
        formatCurrency(report.netCashFlow),
      ],
      ['Closing Cash Balance', '', '', formatCurrency(report.closingCashBalance)],
    ];

    exportToPDF('Cash Flow Statement', headers, rows, 'Cash_Flow_Statement');
    addToast('PDF Cash Flow exported.', 'success', 'Export');
  };

  const handleExportExcel = () => {
    if (!report) return;
    const excelData = [
      { Metric: 'Opening Cash Balance', NetAmount: report.openingCashBalance },
      { Metric: 'Operating Activities', Inflow: report.operatingActivities.inflow, Outflow: report.operatingActivities.outflow, NetAmount: report.operatingActivities.net },
      { Metric: 'Investing Activities', Inflow: report.investingActivities.inflow, Outflow: report.investingActivities.outflow, NetAmount: report.investingActivities.net },
      { Metric: 'Financing Activities', Inflow: report.financingActivities.inflow, Outflow: report.financingActivities.outflow, NetAmount: report.financingActivities.net },
      { Metric: 'Total Cash Flows', Inflow: report.totalCashInflow, Outflow: report.totalCashOutflow, NetAmount: report.netCashFlow },
      { Metric: 'Closing Cash Balance', NetAmount: report.closingCashBalance },
    ];
    exportToExcel(excelData, 'Cash_Flow_Statement');
    addToast('Excel Cash Flow exported.', 'success', 'Export');
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-cyan-400" /> Cash Flow Statement
          </h1>
          <p className="text-xs text-slate-400">Statement of cash inflows and outflows across operating, investing, and financing activities</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchCashFlow}
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
          Loading Cash Flow statement...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 glass-panel max-w-4xl mx-auto">
          <div className="text-center pb-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white tracking-wide">EquiBalance Enterprise Solutions</h2>
            <h3 className="text-base font-semibold text-cyan-400 mt-1 uppercase tracking-widest">
              CASH FLOW STATEMENT
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              For Period: {startDate && endDate ? `${startDate} to ${endDate}` : 'All Cumulative Records'}
            </p>
          </div>

          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Opening Cash Balance</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                {formatCurrency(report.openingCashBalance)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
              <span className="text-emerald-400 font-semibold block uppercase text-[10px]">Total Cash Inflow</span>
              <span className="text-lg font-bold font-mono text-emerald-300 mt-1 block">
                {formatCurrency(report.totalCashInflow)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20">
              <span className="text-rose-400 font-semibold block uppercase text-[10px]">Total Cash Outflow</span>
              <span className="text-lg font-bold font-mono text-rose-300 mt-1 block">
                {formatCurrency(report.totalCashOutflow)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
              <span className="text-cyan-400 font-semibold block uppercase text-[10px]">Closing Cash Balance</span>
              <span className="text-lg font-bold font-mono text-cyan-300 mt-1 block">
                {formatCurrency(report.closingCashBalance)}
              </span>
            </div>
          </div>

          {/* Activities Breakdown Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cash Flow Breakdown by Activity</h4>
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                    <th className="py-3 px-4">Activity Category</th>
                    <th className="py-3 px-4 text-right">Inflow ($)</th>
                    <th className="py-3 px-4 text-right">Outflow ($)</th>
                    <th className="py-3 px-4 text-right">Net Cash Flow ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold">1. Cash Flow from Operating Activities</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">{formatCurrency(report.operatingActivities.inflow)}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">{formatCurrency(report.operatingActivities.outflow)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(report.operatingActivities.net)}</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold">2. Cash Flow from Investing Activities</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">{formatCurrency(report.investingActivities.inflow)}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">{formatCurrency(report.investingActivities.outflow)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(report.investingActivities.net)}</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold">3. Cash Flow from Financing Activities</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">{formatCurrency(report.financingActivities.inflow)}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">{formatCurrency(report.financingActivities.outflow)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">{formatCurrency(report.financingActivities.net)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlow;
