import React from 'react';
import { History, Calendar, GitCommit, CheckCircle, XCircle } from 'lucide-react';

export const ActivityHistory: React.FC = () => {
  // Mock data cho heatmap (1 năm = 52 tuần x 7 ngày)
  const generateHeatmapData = () => {
    const data = [];
    for (let i = 0; i < 364; i++) {
        const intensity = Math.random();
        let colorClass = 'bg-gray-100 dark:bg-slate-800'; // 0
        if (intensity > 0.9) colorClass = 'bg-green-600'; // High
        else if (intensity > 0.7) colorClass = 'bg-green-400';
        else if (intensity > 0.4) colorClass = 'bg-green-200 dark:bg-green-900/50';
        
        data.push(colorClass);
    }
    return data;
  };

  const heatmap = generateHeatmapData();

  const activities = [
    { id: 1, type: 'AC', problem: 'Quy hoạch động cơ bản', time: '2 giờ trước', icon: <CheckCircle className="text-green-500" size={18} /> },
    { id: 2, type: 'WA', problem: 'Đồ thị vô hướng', time: '5 giờ trước', icon: <XCircle className="text-red-500" size={18} /> },
    { id: 3, type: 'Contest', problem: 'Tham gia Weekly Contest 380', time: '1 ngày trước', icon: <Trophy className="text-yellow-500" size={18} /> },
    { id: 4, type: 'AC', problem: 'Tìm kiếm nhị phân', time: '2 ngày trước', icon: <CheckCircle className="text-green-500" size={18} /> },
    { id: 5, type: 'Login', problem: 'Đăng nhập hệ thống', time: '3 ngày trước', icon: <User className="text-blue-500" size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <History className="text-blue-600" /> Lịch sử hoạt động
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Theo dõi quá trình luyện tập và đóng góp của bạn.</p>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border p-6 rounded-lg shadow-sm overflow-x-auto">
         <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={18} /> Bản đồ nhiệt (Heatmap)
         </h3>
         <div className="min-w-[800px]">
             <div className="grid grid-rows-7 grid-flow-col gap-1">
                 {heatmap.map((color, index) => (
                    <div 
                        key={index} 
                        className={`w-3 h-3 rounded-sm ${color} hover:ring-2 ring-gray-400 transition-all`} 
                        title="12 submissions"
                    ></div>
                 ))}
             </div>
             <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400 justify-end">
                <span>Ít</span>
                <div className="w-3 h-3 bg-gray-100 dark:bg-slate-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 dark:bg-green-900/50 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                <span>Nhiều</span>
             </div>
         </div>
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border rounded-lg shadow-sm overflow-hidden">
         <div className="p-6 border-b dark:border-dark-border">
             <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <GitCommit size={18} /> Hoạt động gần đây
             </h3>
         </div>
         <div className="divide-y dark:divide-slate-700">
             {activities.map(act => (
                 <div key={act.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                     <div className="bg-gray-100 dark:bg-slate-700 p-2 rounded-full">
                        {act.icon}
                     </div>
                     <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{act.problem}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Trạng thái: {act.type}</p>
                     </div>
                     <span className="text-xs text-gray-400 whitespace-nowrap">{act.time}</span>
                 </div>
             ))}
         </div>
         <div className="p-4 bg-gray-50 dark:bg-slate-800/50 text-center">
             <button className="text-sm text-blue-600 font-medium hover:underline dark:text-blue-400">Xem toàn bộ lịch sử</button>
         </div>
      </div>
    </div>
  );
};
// Helper imports for mock
import { Trophy, User } from 'lucide-react';
