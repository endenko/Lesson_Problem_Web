
import React, { useEffect, useState } from 'react';
import { Search, PieChart, Loader2, Filter } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useFilter } from '../context/FilterContext';

export const SubmissionSidebar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    AC: 0,
    WA: 0,
    TLE: 0,
    MLE: 0,
    CE: 0,
    other: 0
  });

  const { setSubmissionStatus, setSubmissionLanguage } = useFilter();

  // State quản lý bộ lọc (Local state cho input)
  const [statusFilter, setStatusFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  // Màu sắc chuẩn cho từng trạng thái
  const COLORS = {
    AC: '#22c55e',  // Green
    WA: '#ef4444',  // Red
    TLE: '#eab308', // Yellow
    MLE: '#a855f7', // Purple
    CE: '#6b7280',  // Gray
    other: '#3b82f6' // Blue
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('status');

        if (error) throw error;

        if (data) {
          const newStats = {
            total: data.length,
            AC: 0, WA: 0, TLE: 0, MLE: 0, CE: 0, other: 0
          };

          data.forEach((sub: any) => {
            const s = sub.status;
            if (s === 'AC') newStats.AC++;
            else if (s === 'WA') newStats.WA++;
            else if (s === 'TLE') newStats.TLE++;
            else if (s === 'MLE') newStats.MLE++;
            else if (s === 'CE') newStats.CE++;
            else newStats.other++;
          });

          setStats(newStats);
        }
      } catch (error) {
        console.error('Error fetching submission stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Hàm tạo chuỗi gradient cho biểu đồ tròn
  const getPieChartBackground = () => {
    if (stats.total === 0) return '#e5e7eb';

    let currentPercent = 0;
    const parts = [];

    const addPart = (count: number, color: string) => {
      if (count > 0) {
        const percent = (count / stats.total) * 100;
        const endPercent = currentPercent + percent;
        parts.push(`${color} ${currentPercent}% ${endPercent}%`);
        currentPercent = endPercent;
      }
    };

    addPart(stats.AC, COLORS.AC);
    addPart(stats.WA, COLORS.WA);
    addPart(stats.TLE, COLORS.TLE);
    addPart(stats.MLE, COLORS.MLE);
    addPart(stats.CE, COLORS.CE);
    addPart(stats.other, COLORS.other);

    return `conic-gradient(${parts.join(', ')})`;
  };

  const handleFilter = () => {
      setSubmissionStatus(statusFilter);
      setSubmissionLanguage(languageFilter);
  };

  const getPercent = (count: number) => {
      return stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
  };

  // Danh sách hiển thị thống kê (Đã Việt hóa)
  const statItems = [
      { label: 'Chấp nhận (AC)', count: stats.AC, color: COLORS.AC },
      { label: 'Sai kết quả (WA)', count: stats.WA, color: COLORS.WA },
      { label: 'Quá thời gian (TLE)', count: stats.TLE, color: COLORS.TLE },
      { label: 'Quá bộ nhớ (MLE)', count: stats.MLE, color: COLORS.MLE },
      { label: 'Lỗi biên dịch (CE)', count: stats.CE, color: COLORS.CE },
      { label: 'Lỗi khác', count: stats.other, color: COLORS.other },
  ];

  return (
    <div className="space-y-6">
      {/* CARD 1: LỌC BÀI NỘP */}
      <div className="bg-white p-4 rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border transition-colors">
        <div className="flex items-center gap-2 mb-4 text-oj-blue border-b pb-2 dark:text-blue-400 dark:border-dark-border">
          <Search size={20} />
          <h3 className="font-bold text-lg">Lọc bài nộp</h3>
        </div>

        <div className="space-y-4">
          {/* Kết quả chấm */}
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-800 dark:text-gray-200">Trạng thái</label>
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-left px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:border-slate-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="AC">Accepted (AC)</option>
              <option value="WA">Wrong Answer (WA)</option>
              <option value="TLE">Time Limit Exceeded (TLE)</option>
              <option value="MLE">Memory Limit Exceeded (MLE)</option>
              <option value="CE">Compilation Error (CE)</option>
            </select>
          </div>

          {/* Ngôn ngữ */}
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-800 dark:text-gray-200">Ngôn ngữ</label>
            <select 
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full text-left px-3 py-2 border rounded-md text-sm bg-white hover:bg-gray-50 transition-colors dark:bg-slate-900 dark:border-slate-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả ngôn ngữ</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="Pascal">Pascal</option>
              <option value="Go">Go</option>
              <option value="NodeJS">Node.js</option>
            </select>
          </div>

          {/* Nút Lọc - Full Width */}
          <div className="pt-2">
            <button 
                onClick={handleFilter}
                className="w-full bg-oj-blue text-white py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-md"
            >
              <Filter size={16} /> Lọc kết quả
            </button>
          </div>
        </div>
      </div>

      {/* CARD 2: THỐNG KÊ */}
      <div className="bg-white p-4 rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border transition-colors">
        <div className="flex items-center gap-2 mb-4 text-oj-blue border-b pb-2 dark:text-blue-400 dark:border-dark-border">
          <PieChart size={20} />
          <h3 className="font-bold text-lg">Thống kê</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            {/* Biểu đồ tròn */}
            <div 
              style={{
                background: getPieChartBackground(),
                borderRadius: '50%',
                width: '160px',
                height: '160px',
              }} 
              className="mb-6 shadow-inner relative group cursor-pointer transition-transform hover:scale-105 ring-4 ring-gray-50 dark:ring-slate-800"
            >
               {/* Center text showing total */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white dark:bg-slate-800 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tổng số</span>
                      <span className="text-2xl font-extrabold text-gray-800 dark:text-white">{stats.total}</span>
                  </div>
               </div>
            </div>
            
            {/* Danh sách thống kê chi tiết */}
            <div className="w-full space-y-3">
                {statItems.map((item) => {
                    if (item.label === 'Lỗi khác' && item.count === 0) return null;
                    const percent = getPercent(item.count);
                    
                    return (
                        <div key={item.label} className="flex items-center justify-between text-sm group cursor-default p-1 hover:bg-gray-50 rounded dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-3 h-3 rounded-full shadow-sm" 
                                    style={{background: item.color}}
                                ></div>
                                <span className="text-gray-700 font-medium dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                                    {item.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800 dark:text-gray-100">{item.count}</span>
                                <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-slate-700 dark:text-gray-400 px-1.5 py-0.5 rounded min-w-[35px] text-center font-mono">
                                    {percent}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
