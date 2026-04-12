
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800 font-sans dark:bg-slate-900 dark:text-slate-200">
      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen transition-all p-8 bg-slate-50 dark:bg-slate-900">
         <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
         </div>
      </main>
    </div>
  );
};
