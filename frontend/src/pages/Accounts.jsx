import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import { Plus, Search, Filter, Edit3, Trash2, FolderKanban, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const subCategoryMap = {
  Asset: ['Cash', 'Bank', 'Accounts Receivable', 'Inventory', 'Equipment', 'Property', 'Vehicles', 'Other Assets'],
  Liability: ['Accounts Payable', 'Loans', 'Creditors', 'Taxes Payable', 'Other Liabilities'],
  Equity: ["Owner's Capital", 'Retained Earnings', 'Drawings'],
  Revenue: ['Sales Revenue', 'Service Revenue', 'Other Income'],
  Expense: ['Salaries', 'Rent', 'Electricity', 'Internet', 'Transportation', 'Office Expenses', 'Other Expenses'],
};

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Form fields
  const [accountName, setAccountName] = useState('');
  const [accountCode, setAccountCode] = useState('');
  const [accountType, setAccountType] = useState('Asset');
  const [subCategory, setSubCategory] = useState('Cash');
  const [description, setDescription] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [status, setStatus] = useState('Active');
  const [formLoading, setFormLoading] = useState(false);

  const { hasRole } = useAuth();
  const { addToast } = useNotification();

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts', {
        params: { accountType: filterType, search: searchTerm },
      });
      setAccounts(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [filterType, searchTerm]);

  const openAddModal = () => {
    setEditingAccount(null);
    setAccountName('');
    setAccountCode('');
    setAccountType('Asset');
    setSubCategory('Cash');
    setDescription('');
    setOpeningBalance(0);
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (acc) => {
    setEditingAccount(acc);
    setAccountName(acc.accountName);
    setAccountCode(acc.accountCode);
    setAccountType(acc.accountType);
    setSubCategory(acc.subCategory);
    setDescription(acc.description || '');
    setOpeningBalance(acc.openingBalance);
    setStatus(acc.status);
    setIsModalOpen(true);
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    if (subCategoryMap[type]) {
      setSubCategory(subCategoryMap[type][0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        accountName,
        accountCode,
        accountType,
        subCategory,
        description,
        openingBalance: Number(openingBalance),
        status,
      };

      if (editingAccount) {
        await api.put(`/accounts/${editingAccount._id}`, payload);
        addToast('Account updated successfully!', 'success', 'Saved');
      } else {
        await api.post('/accounts', payload);
        addToast('New Account added to Chart of Accounts!', 'success', 'Created');
      }

      setIsModalOpen(false);
      fetchAccounts();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed.';
      addToast(msg, 'error', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      addToast('Account deleted successfully.', 'success', 'Deleted');
      fetchAccounts();
    } catch (error) {
      const msg = error.response?.data?.message || 'Cannot delete account.';
      addToast(msg, 'error', 'Delete Error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Chart of Accounts</h1>
          <p className="text-xs text-slate-400">Manage business financial account categories & balances</p>
        </div>

        {hasRole('Admin', 'Accountant') && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Account
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by code, account name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Account Types</option>
            <option value="Asset">Assets</option>
            <option value="Liability">Liabilities</option>
            <option value="Equity">Equity</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expenses</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Account Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Opening Bal</th>
                <th className="py-3.5 px-4 text-right">Current Bal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                {hasRole('Admin', 'Accountant') && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    Loading accounts...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    No accounts found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => {
                  let badgeBg = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                  if (acc.accountType === 'Liability') badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (acc.accountType === 'Equity') badgeBg = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                  if (acc.accountType === 'Revenue') badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (acc.accountType === 'Expense') badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <tr key={acc._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{acc.accountCode}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {acc.accountName}
                        {acc.description && (
                          <span className="block text-[10px] text-slate-400 font-normal">{acc.description}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${badgeBg}`}>
                          {acc.accountType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{acc.subCategory}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatCurrency(acc.openingBalance)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                        {formatCurrency(acc.balance)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            acc.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {acc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(acc.createdAt)}</td>

                      {hasRole('Admin', 'Accountant') && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(acc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {hasRole('Admin') && (
                              <button
                                onClick={() => handleDelete(acc._id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Edit Chart of Account' : 'Add New Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Code *</label>
              <input
                type="text"
                required
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                placeholder="e.g. 1050"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Name *</label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Petty Cash"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Type *</label>
              <select
                value={accountType}
                onChange={(e) => handleAccountTypeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category / Sub-Category *</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {subCategoryMap[accountType]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Opening Balance ($)</label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief account notes..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;
