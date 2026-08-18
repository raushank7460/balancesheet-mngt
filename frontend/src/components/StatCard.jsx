import React from 'react';
import { formatCurrency } from '../utils/formatters';

const StatCard = ({ title, value, icon: Icon, isCurrency = true, color = 'indigo', subtitle, badgeText }) => {
  const colorStyles = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-600/5',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-600/5',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-600/5',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      className={`relative p-5 rounded-2xl border ${currentStyle.border} bg-gradient-to-br ${currentStyle.bg} backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${currentStyle.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {isCurrency ? formatCurrency(value) : value}
        </h3>
        {badgeText && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-2 text-xs text-slate-400 font-medium">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
