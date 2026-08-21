import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  CreditCard,
  Building,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { useCurrency } from '../context/CurrencyContext';

const Dashboard = () => {
  const { currencySymbol, formatCurrency: formatCurr } = useCurrency();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/dashboard');
      setMetrics(res.data.data);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading Financial Dashboard...</p>
      </div>
    );
  }

  const { summary, charts } = metrics;

  const PIE_COLORS = ['#6366f1', '#f43f5e', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Financial Dashboard</h1>
          <p className="text-xs text-slate-400">Real-time accounting overview & key metrics</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {/* Balance Sheet Verification Banner */}
      {!summary.isBalanced && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-3">
          <Scale className="w-5 h-5 shrink-0" />
          <span>
            <strong>Warning:</strong> Balance Sheet Equation imbalance detected! Total Assets does not match Liabilities + Equity. Please review journal entries.
          </span>
        </div>
      )}

      {/* Stat Cards Grid (8 Core Metrics required by prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={summary.totalAssets}
          icon={Building}
          color="indigo"
          subtitle="Cash, Inventory & Fixed Assets"
        />
        <StatCard
          title="Total Liabilities"
          value={summary.totalLiabilities}
          icon={CreditCard}
          color="rose"
          subtitle="Payables, Loans & Accruals"
        />
        <StatCard
          title="Total Equity"
          value={summary.totalEquity}
          icon={Scale}
          color="purple"
          subtitle="Owner Capital & Retained Earnings"
        />
        <StatCard
          title="Current Balance"
          value={summary.currentBalance}
          icon={Wallet}
          color="cyan"
          subtitle="Available Cash & Bank Balance"
        />
        <StatCard
          title="Total Income"
          value={summary.totalIncome}
          icon={TrendingUp}
          color="emerald"
          subtitle="Sales & Revenue Streams"
        />
        <StatCard
          title="Total Expenses"
          value={summary.totalExpenses}
          icon={TrendingDown}
          color="amber"
          subtitle="Payroll, Rent & Utilities"
        />
        <StatCard
          title="Net Profit / Loss"
          value={summary.netProfit}
          icon={summary.isProfit ? ArrowUpRight : ArrowDownRight}
          color={summary.isProfit ? 'emerald' : 'rose'}
          badgeText={summary.isProfit ? 'PROFIT' : 'LOSS'}
          subtitle="Total Income - Total Expenses"
        />
        <StatCard
          title="Transactions"
          value={summary.transactionCount}
          icon={DollarSign}
          isCurrency={false}
          color="indigo"
          subtitle="Total Double-Entry Journals"
        />
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Income vs Expenses Comparison
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [formatCurr(val), 'Amount']}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {charts.incomeVsExpense.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets vs Liabilities Pie Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" /> Capital Structure Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={charts.assetsVsLiabilities}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="amount"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.assetsVsLiabilities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [formatCurr(val), 'Value']}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Financial Trend Area Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Revenue & Expense Trend
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.monthlyTrends}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${currencySymbol}${val}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(val) => [formatCurr(val)]}
              />
              <Legend />
              <Area type="monotone" dataKey="income" name="Monthly Income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" name="Monthly Expense" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
