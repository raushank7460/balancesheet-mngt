import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BookOpen, Printer, FileText, Download, Calendar, Search, RefreshCw } from 'lucide-react';

const Ledger = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { addToast } = useNotification();

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data.data);
      if (res.data.data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(res.data.data[0]._id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLedger = async () => {
    if (!selectedAccountId) return;
    setLoading(true);
    try {
      const res = await api.get('/reports/ledger', {
        params: { accountId: selectedAccountId, startDate, endDate },
      });
      setLedgerData(res.data.data);
    } catch (error) {
      console.error(error);
      addToast('Failed to load Account Ledger statement', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchLedger();
    }
  }, [selectedAccountId, startDate, endDate]);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    if (!ledgerData) return;
    const headers = ['Date', 'Transaction ID', 'Description', 'Debit ($)', 'Credit ($)', 'Running Balance ($)'];
    const rows = ledgerData.ledgerEntries.map(e => [
      formatDate(e.date),
      e.transactionId,
      e.description,
      e.debit > 0 ? formatCurrency(e.debit) : '-',
      e.credit > 0 ? formatCurrency(e.credit) : '-',
      formatCurrency(e.balance),
    ]);

    exportToPDF(`Account Ledger - ${ledgerData.account.accountName}`, headers, rows, 'Account_Ledger');
    addToast('PDF Account Ledger exported.', 'success', 'Export');
  };

  const handleExportExcel = () => {
    if (!ledgerData) return;
    const excelData = ledgerData.ledgerEntries.map(e => ({
      Date: formatDate(e.date),
      TransactionID: e.transactionId,
      Description: e.description,
      Debit: e.debit,
      Credit: e.credit,
      RunningBalance: e.balance,
      Reference: e.reference || '-',
    }));

    exportToExcel(excelData, `Ledger_${ledgerData.account.accountCode}`);
    addToast('Excel Account Ledger exported.', 'success', 'Export');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" /> General Account Ledger
          </h1>
          <p className="text-xs text-slate-400">Chronological transaction history & running balance per account</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchLedger}
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

      {/* Account Selector & Date Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-4 text-xs no-print">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-slate-300 shrink-0">Select Account:</span>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full sm:w-64 py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
          >
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                [{acc.accountType}] {acc.accountCode} - {acc.accountName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Start:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">End:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
          />
        </div>
      </div>

      {/* Ledger Table Document */}
      {loading || !ledgerData ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
          Loading Ledger records...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 glass-panel">
          {/* Header Info Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-800 gap-2">
            <div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Code: {ledgerData.account.accountCode}
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide mt-1">
                {ledgerData.account.accountName}
              </h2>
              <p className="text-xs text-slate-400">
                Type: {ledgerData.account.accountType} | Category: {ledgerData.account.subCategory}
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 font-semibold block uppercase">Closing Balance</span>
              <span className="text-2xl font-bold font-mono text-indigo-400">
                {formatCurrency(ledgerData.closingBalance)}
              </span>
            </div>
          </div>

          {/* Table displaying required columns: Date | Description | Debit | Credit | Balance */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Txn ID</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Debit ($)</th>
                  <th className="py-3 px-4 text-right">Credit ($)</th>
                  <th className="py-3 px-4 text-right">Running Balance ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {ledgerData.ledgerEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-300">{entry.transactionId}</td>
                    <td className="py-3 px-4 font-medium text-white">{entry.description}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400 font-semibold">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-300">
                      {formatCurrency(entry.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
