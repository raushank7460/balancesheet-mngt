import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import { Plus, Search, Filter, Trash2, ArrowRightLeft, AlertCircle, CheckCircle2, PlusCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [accountIdFilter, setAccountIdFilter] = useState('');

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState('Journal');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  
  // Double Entry Lines
  const [entries, setEntries] = useState([
    { account: '', debit: 0, credit: 0 },
    { account: '', debit: 0, credit: 0 },
  ]);
  const [formLoading, setFormLoading] = useState(false);

  const { hasRole } = useAuth();
  const { addToast } = useNotification();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions', {
        params: { search: searchTerm, transactionType: typeFilter, accountId: accountIdFilter },
      });
      setTransactions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsList = async () => {
    try {
      const res = await api.get('/accounts', { params: { status: 'Active' } });
      setAccounts(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAccountsList();
  }, [searchTerm, typeFilter, accountIdFilter]);

  const openAddModal = () => {
    setDate(formatDateForInput(new Date()));
    setDescription('');
    setTransactionType('Journal');
    setReference('');
    setNotes('');

    const defaultAcc1 = accounts.length > 0 ? accounts[0]._id : '';
    const defaultAcc2 = accounts.length > 1 ? accounts[1]._id : defaultAcc1;

    setEntries([
      { account: defaultAcc1, debit: 1000, credit: 0 },
      { account: defaultAcc2, debit: 0, credit: 1000 },
    ]);
    setIsModalOpen(true);
  };

  const handleEntryChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = field === 'account' ? value : Number(value) || 0;
    setEntries(updated);
  };

  const addEntryRow = () => {
    setEntries([...entries, { account: accounts[0]?._id || '', debit: 0, credit: 0 }]);
  };

  const removeEntryRow = (index) => {
    if (entries.length <= 2) {
      addToast('A double-entry transaction requires at least 2 entries', 'warning', 'Validation');
      return;
    }
    setEntries(entries.filter((_, i) => i !== index));
  };

  // Calculate live total debits & credits
  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      addToast(`Imbalanced transaction! Total Debit ($${totalDebit}) must equal Total Credit ($${totalCredit})`, 'error', 'Accounting Error');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        date,
        description,
        transactionType,
        entries,
        reference,
        notes,
      };
      await api.post('/transactions', payload);
      addToast('Double-entry transaction posted successfully!', 'success', 'Posted');
      setIsModalOpen(false);
      fetchTransactions();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to post transaction.';
      addToast(msg, 'error', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this double-entry transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      addToast('Transaction deleted successfully.', 'success', 'Deleted');
      fetchTransactions();
    } catch (error) {
      const msg = error.response?.data?.message || 'Cannot delete transaction.';
      addToast(msg, 'error', 'Delete Error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Journal Transactions</h1>
          <p className="text-xs text-slate-400">Double-entry accounting general journal ledger</p>
        </div>

        {hasRole('Admin', 'Accountant') && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Transaction
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search TXN ID, description or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Equity">Equity</option>
            <option value="Transfer">Transfer</option>
            <option value="Journal">Journal</option>
          </select>

          <select
            value={accountIdFilter}
            onChange={(e) => setAccountIdFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.accountCode} - {acc.accountName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            Loading journal transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
            No transactions found matching your criteria.
          </div>
        ) : (
          transactions.map((txn) => {
            const txnAmount = txn.entries.reduce((sum, e) => sum + (e.debit || 0), 0);

            return (
              <div
                key={txn._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all"
              >
                {/* Txn Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {txn.transactionId}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{formatDate(txn.date)}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {txn.transactionType}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-bold text-white">
                      Total: {formatCurrency(txnAmount)}
                    </span>
                    {hasRole('Admin') && (
                      <button
                        onClick={() => handleDelete(txn._id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description & Reference */}
                <p className="text-xs font-semibold text-slate-200 mb-3">{txn.description}</p>
                {txn.reference && (
                  <p className="text-[11px] text-slate-400 mb-3">Ref: {txn.reference}</p>
                )}

                {/* Entries Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-slate-950/60 rounded-xl overflow-hidden border border-slate-800/60">
                    <thead>
                      <tr className="bg-slate-800/40 text-slate-400 font-semibold border-b border-slate-800/60">
                        <th className="py-2 px-3">Account</th>
                        <th className="py-2 px-3 text-right">Debit ($)</th>
                        <th className="py-2 px-3 text-right">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {txn.entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-2 px-3 font-medium text-slate-300">
                            {entry.account?.accountCode} - {entry.account?.accountName}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-400 font-semibold">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-indigo-400 font-semibold">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Double-Entry Transaction Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Double-Entry Transaction"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Transaction Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Transaction Type *</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Journal">Journal Entry</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Asset">Asset Purchase</option>
                <option value="Liability">Liability Loan</option>
                <option value="Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reference / Invoice #</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. INV-2026-09"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Office supplies purchase via bank transfer"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Double-Entry Lines */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-200">Double-Entry Journal Lines</h4>
              <button
                type="button"
                onClick={addEntryRow}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>

            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex-1 w-full">
                    <select
                      required
                      value={entry.account}
                      onChange={(e) => handleEntryChange(idx, 'account', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          [{acc.accountType}] {acc.accountCode} - {acc.accountName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-32">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Debit ($)"
                      value={entry.debit}
                      onChange={(e) => handleEntryChange(idx, 'debit', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-right"
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Credit ($)"
                      value={entry.credit}
                      onChange={(e) => handleEntryChange(idx, 'credit', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-indigo-400 font-mono text-right"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEntryRow(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Double-Entry Validation Live Bar */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isBalanced
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              {isBalanced ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
              <span>{isBalanced ? 'Balanced Double Entry (Total Debit = Total Credit)' : 'Imbalanced! Total Debit must equal Total Credit'}</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs font-bold">
              <span>Debit: {formatCurrency(totalDebit)}</span>
              <span>Credit: {formatCurrency(totalCredit)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || !isBalanced}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-40"
            >
              {formLoading ? 'Posting...' : 'Post Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
