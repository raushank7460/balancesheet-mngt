import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-6">
        <Scale className="w-16 h-16 text-indigo-400" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404 - Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">
        The requested financial statement or page route does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
