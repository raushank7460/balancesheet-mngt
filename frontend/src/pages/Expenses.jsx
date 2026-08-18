import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import { Plus, Search, Filter, Trash2, Edit3, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';

const categoryList = ['Salaries', 'Rent', 'Electricity', 'Internet', 'Transportation', 'Office Expenses', 'Other Expenses'];

const Expenses = () => {
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [category, setCategory] = useState('Office Expenses');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { hasRole } = useAuth();
  const { addToast } = useNotification();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses', { params: { search: searchTerm, category: categoryFilter } });
      setExpenseRecords(res.data.data);
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
    fetchExpenses();
    fetchAccountsList();
  }, [searchTerm, categoryFilter]);

  const openAddModal = () => {
    setEditingExpense(null);
    setCategory('Office Expenses');
    setAmount('');
    setDate(formatDateForInput(new Date()));
    setPaymentMethod('Bank Transfer');
    setDescription('');
    setNotes('');

    const expAcc = accounts.find((a) => a.accountType === 'Expense');
    const bankAcc = accounts.find((a) => a.subCategory === 'Bank') || accounts.find((a) => a.accountType === 'Asset');

    setDebitAccountId(expAcc ? expAcc._id : '');
    setCreditAccountId(bankAcc ? bankAcc._id : '');
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDate(formatDateForInput(exp.date));
    setPaymentMethod(exp.paymentMethod);
    setDescription(exp.description || '');
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        description,
        notes,
        debitAccountId,
        creditAccountId,
      };

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, payload);
        addToast('Expense record updated successfully', 'success', 'Updated');
      } else {
        await api.post('/expenses', payload);
        addToast('Expense record & double-entry journal created!', 'success', 'Created');
      }

      setIsModalOpen(false);
      fetchExpenses();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed.';
      addToast(msg, 'error', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense entry? Corresponding journal entry will be removed.')) return;
    try {
      await api.delete(`/expenses/${id}`);
      addToast('Expense record deleted.', 'success', 'Deleted');
      fetchExpenses();
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
            <TrendingDown className="w-6 h-6 text-rose-400" /> Expense Management
          </h1>
          <p className="text-xs text-slate-400">Track and manage business operational expenses & outflows</p>
        </div>

        {hasRole('Admin', 'Accountant') && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Expense Entry
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search Expense ID, category, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Expense ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Amount ($)</th>
                {hasRole('Admin', 'Accountant') && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    Loading expense records...
                  </td>
                </tr>
              ) : expenseRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenseRecords.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">{exp.expenseId}</td>
                    <td className="py-3 px-4 text-slate-400">{formatDate(exp.date)}</td>
                    <td className="py-3 px-4 font-semibold text-white">{exp.category}</td>
                    <td className="py-3 px-4 text-slate-300">{exp.description || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{exp.notes || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(exp.amount)}
                    </td>

                    {hasRole('Admin', 'Accountant') && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {hasRole('Admin') && (
                            <button
                              onClick={() => handleDelete(exp._id)}
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

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 font-mono text-base font-bold focus:outline-none focus:border-indigo-500"
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

          {!editingExpense && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Debit Expense Account</label>
                <select
                  value={debitAccountId}
                  onChange={(e) => setDebitAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                >
                  {accounts
                    .filter((a) => a.accountType === 'Expense')
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.accountCode} - {acc.accountName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Paid From Account (Credit Asset)</label>
                <select
                  value={creditAccountId}
                  onChange={(e) => setCreditAccountId(e.target.value)}
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
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. August office rent"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Notes / Receipt Ref</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Receipt #88312"
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
