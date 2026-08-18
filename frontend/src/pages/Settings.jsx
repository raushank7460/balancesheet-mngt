import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { Settings as SettingsIcon, Sliders, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const [currency, setCurrency] = useState('USD');
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [strictDoubleEntry, setStrictDoubleEntry] = useState(true);
  const [autoRecalculate, setAutoRecalculate] = useState(true);

  const { addToast } = useNotification();

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System preferences saved successfully!', 'success', 'Settings Saved');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-400" /> System Settings & Preferences
        </h1>
        <p className="text-xs text-slate-400">Configure accounting preferences, system rules, and financial standards</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Accounting Rules Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-400" /> General Financial Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Base Reporting Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Active Financial Year</label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
              >
                <option value="2026-2027">FY 2026 - 2027 (April - March)</option>
                <option value="2025-2026">FY 2025 - 2026 (April - March)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accounting Integrity Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Accounting Integrity & Security Rules
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={strictDoubleEntry}
                onChange={(e) => setStrictDoubleEntry(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Strict Double-Entry Enforcement</span>
                <span className="text-slate-400 text-[11px]">Prevent saving any transaction where Total Debit does not equal Total Credit.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRecalculate}
                onChange={(e) => setAutoRecalculate(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Automatic Balance Recalculation</span>
                <span className="text-slate-400 text-[11px]">Recompute account ledger balances dynamically upon transaction postings.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/20"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
