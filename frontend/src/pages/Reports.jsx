import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, PieChart, Banknote, BookOpen, TrendingUp, TrendingDown, ArrowRightLeft, FileSpreadsheet } from 'lucide-react';

const Reports = () => {
  const reportsList = [
    {
      title: 'Balance Sheet Statement',
      description: 'Comprehensive statement of financial position displaying Assets, Liabilities, Equity, and Retained Earnings.',
      path: '/balance-sheet',
      icon: Scale,
      color: 'indigo',
    },
    {
      title: 'Profit & Loss Statement',
      description: 'Income statement summarizing company revenue, operating expenses, and calculated net profit/loss.',
      path: '/profit-loss',
      icon: PieChart,
      color: 'emerald',
    },
    {
      title: 'Cash Flow Statement',
      description: 'Breakdown of cash inflows & outflows across operating, investing, and financing business activities.',
      path: '/cash-flow',
      icon: Banknote,
      color: 'cyan',
    },
    {
      title: 'Account Ledger Report',
      description: 'Detailed chronological transaction ledger for any individual account with running balances.',
      path: '/ledger',
      icon: BookOpen,
      color: 'purple',
    },
    {
      title: 'Income Statement & Sources',
      description: 'Filtered income statement detailing revenue sources, invoices, payment methods, and dates.',
      path: '/income',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      title: 'Expense Audit Report',
      description: 'Comprehensive expense audit breakdown by category, payment method, receipts, and dates.',
      path: '/expenses',
      icon: TrendingDown,
      color: 'rose',
    },
    {
      title: 'Double-Entry Transaction Report',
      description: 'General journal double-entry transaction log with debits and credits validation.',
      path: '/transactions',
      icon: ArrowRightLeft,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-400" /> Financial Reports & Audits Hub
        </h1>
        <p className="text-xs text-slate-400">Generate, view, print, and export official business financial statements</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((report, idx) => {
          const Icon = report.icon;
          return (
            <Link
              key={idx}
              to={report.path}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/60 w-fit text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{report.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>View & Export Statement</span>
                <span>&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
