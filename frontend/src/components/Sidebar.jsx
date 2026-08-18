import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  Banknote,
  BookOpen,
  FileSpreadsheet,
  Users,
  Settings,
  ShieldAlert,
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Chart of Accounts', path: '/accounts', icon: FolderKanban },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Income', path: '/income', icon: TrendingUp },
    { name: 'Expenses', path: '/expenses', icon: TrendingDown },
    { name: 'Balance Sheet', path: '/balance-sheet', icon: Scale },
    { name: 'Profit & Loss', path: '/profit-loss', icon: PieChart },
    { name: 'Cash Flow', path: '/cash-flow', icon: Banknote },
    { name: 'Account Ledger', path: '/ledger', icon: BookOpen },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'User Management', path: '/users', icon: Users });
  }

  navItems.push({ name: 'Settings', path: '/settings', icon: Settings });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                EquiBalance
              </h1>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
                Balance Sheet Hub
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => isOpen && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/80 text-white shadow-md shadow-indigo-600/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Role Footer Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <ShieldAlert className="w-3 h-3 text-indigo-400" />
                <span className="capitalize text-indigo-300 font-medium">{user?.role || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
