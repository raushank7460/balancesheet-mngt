import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Toast Notification Renderer */}
      <Toast />

      {/* Responsive Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-600">
          EquiBalance Accounting & Balance Sheet System &copy; {new Date().getFullYear()} — Enterprise Double-Entry Accounting
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
