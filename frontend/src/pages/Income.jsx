import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import { Plus, Search, Filter, Trash2, Edit3, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';
import { useCurrency } from '../context/CurrencyContext';

const Income = () => {
  const { currencySymbol, formatCurrency: formatCurr } = useCurrency();
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const [source, setSource] = useState('Sales Revenue');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { hasRole } = useAuth();
  const { addToast } = useNotification();

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await api.get('/income', { params: { search: searchTerm, source: sourceFilter } });
      setIncomeRecords(res.data.data);
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
    fetchIncome();
    fetchAccountsList();
  }, [searchTerm, sourceFilter]);

  const openAddModal = () => {
    setEditingIncome(null);
    setSource('Sales Revenue');
    setAmount('');
    setDate(formatDateForInput(new Date()));
    setPaymentMethod('Bank Transfer');
    setDescription('');
    setReference('');

    const bank = accounts.find((a) => a.subCategory === 'Bank') || accounts.find((a) => a.accountType === 'Asset');
    const rev = accounts.find((a) => a.accountType === 'Revenue');

    setDebitAccountId(bank ? bank._id : '');
    setCreditAccountId(rev ? rev._id : '');
    setIsModalOpen(true);
  };

  const openEditModal = (inc) => {
    setEditingIncome(inc);
    setSource(inc.source);
    setAmount(inc.amount);
    setDate(formatDateForInput(inc.date));
    setPaymentMethod(inc.paymentMethod);
    setDescription(inc.description || '');
    setReference(inc.reference || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        source,
        amount: Number(amount),
        date,
        paymentMethod,
        description,
        reference,
        debitAccountId,
        creditAccountId,
      };

      if (editingIncome) {
        await api.put(`/income/${editingIncome._id}`, payload);
        addToast('Income record updated successfully', 'success', 'Updated');
      } else {
        await api.post('/income', payload);
        addToast('Income record & double-entry journal created!', 'success', 'Created');
      }

      setIsModalOpen(false);
      fetchIncome();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed.';
      addToast(msg, 'error', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record? Associated journal entries will be deleted as well.')) return;
    try {
      await api.delete(`/income/${id}`);
      addToast('Income record deleted.', 'success', 'Deleted');
      fetchIncome();
    } catch (error) {
      const msg = error.response?.data?.message || 'Delete failed.';
      addToast(msg, 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" /> Income Management
          </h1>
          <p className="text-xs text-slate-400">Track and manage business revenue & incoming payments</p>
        </div>

        {hasRole('Admin', 'Accountant') && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Income Entry
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Income ID, source, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Sources</option>
            <option value="Sales Revenue">Sales Revenue</option>
            <option value="Service Revenue">Service Revenue</option>
            <option value="Other Income">Other Income</option>
          </select>
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Income ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4 text-right">Amount ({currencySymbol})</th>
                {hasRole('Admin', 'Accountant') && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    Loading income records...
                  </td>
                </tr>
              ) : incomeRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No income entries found.
                  </td>
                </tr>
              ) : (
                incomeRecords.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{inc.incomeId}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(inc.date)}</td>
                    <td className="py-3 px-4 font-semibold text-white">{inc.source}</td>
                    <td className="py-3 px-4 text-slate-300">{inc.description || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {inc.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{inc.reference || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurr(inc.amount)}
                    </td>

                    {hasRole('Admin', 'Accountant') && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(inc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {hasRole('Admin') && (
                            <button
                              onClick={() => handleDelete(inc._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Income Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIncome ? 'Edit Income Record' : 'Record New Income'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Income Source *</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Sales Revenue">Sales Revenue</option>
                <option value="Service Revenue">Service Revenue</option>
                <option value="Other Income">Other Income</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount ({currencySymbol}) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-base font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {!editingIncome && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deposit To Account (Debit Asset)</label>
                <select
                  value={debitAccountId}
                  onChange={(e) => setDebitAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                >
                  {accounts
                    .filter((a) => a.accountType === 'Asset')
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountCode} - {acc.accountName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Credit Revenue Account</label>
                <select
                  value={creditAccountId}
                  onChange={(e) => setCreditAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                >
                  {accounts
                    .filter((a) => a.accountType === 'Revenue')
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountCode} - {acc.accountName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Website consulting services"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reference / Invoice #</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. INV-9002"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
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
              disabled={formLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingIncome ? 'Update Income' : 'Record Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Income;
