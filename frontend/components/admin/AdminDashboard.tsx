
import React from 'react';
import { Users, FileCode, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tổng quan hệ thống</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng User</p>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">1,234</h3>
                  </div>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                      <Users size={24} />
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp size={16} className="mr-1" /> +12% tháng này
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bài tập</p>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">450</h3>
                  </div>
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                      <FileCode size={24} />
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-slate-500">
                  5 bài mới tuần này
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submissions</p>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">89.5k</h3>
                  </div>
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 size={24} />
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                  AC Rate: 42%
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Server Load</p>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">24%</h3>
                  </div>
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                      <AlertTriangle size={24} />
                  </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                  Hệ thống ổn định
              </div>
          </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-500">Khu vực biểu đồ thống kê chi tiết (Đang cập nhật)</p>
      </div>
    </div>
  );
};
