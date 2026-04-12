
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Database, AlertOctagon, Loader2, Filter, User, ChevronLeft, ChevronRight } from 'lucide-react';

// Định nghĩa Interface
interface Submission {
  id: string;
  status: string;
  time_taken: string;
  memory_taken: string;
  language: string;
  created_at: string;
  // Các trường join có thể null nếu data không khớp
  profiles: { name: string } | null;
  problems: { code: string, name: string } | null;
}

const ITEMS_PER_PAGE = 10;

export const SubmissionList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // Stats state
  const [stats, setStats] = useState({ total: 0, ac: 0, wa: 0, tle: 0, mle: 0, ce: 0 });

  useEffect(() => {
    const fetchData = async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // REQUEST 1: Lấy danh sách bài nộp để hiển thị bảng (Lấy 200 bài mới nhất để phân trang thoải mái)
            const listPromise = supabase
                .from('submissions')
                .select(`
                    *,
                    profiles (name),
                    problems (name, code)
                `)
                .order('created_at', { ascending: false })
                .limit(200);

            // REQUEST 2: Lấy toàn bộ status để tính thống kê chính xác (Giống Sidebar)
            const statsPromise = supabase
                .from('submissions')
                .select('status');

            // Chạy song song 2 request
            const [listResponse, statsResponse] = await Promise.all([listPromise, statsPromise]);

            // Xử lý dữ liệu bảng
            if (listResponse.error) throw listResponse.error;
            if (listResponse.data) {
                setSubmissions(listResponse.data as unknown as Submission[]);
            }

            // Xử lý dữ liệu thống kê (Tính trên TOÀN BỘ dữ liệu)
            if (statsResponse.error) throw statsResponse.error;
            if (statsResponse.data) {
                const newStats = { total: statsResponse.data.length, ac: 0, wa: 0, tle: 0, mle: 0, ce: 0 };
                
                statsResponse.data.forEach((sub: any) => {
                    const s = sub.status;
                    if (s === 'AC') newStats.ac++;
                    else if (s === 'WA') newStats.wa++;
                    else if (s === 'TLE') newStats.tle++;
                    else if (s === 'MLE') newStats.mle++;
                    else if (['CE', 'RE'].includes(s)) newStats.ce++;
                });
                setStats(newStats);
            }

        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSubmissions = submissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
      }
  };

  // Helper functions UI
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AC': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'WA': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'TLE': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'MLE': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'AC': return <CheckCircle2 size={16} />;
        case 'WA': return <XCircle size={16} />;
        case 'TLE': return <Clock size={16} />;
        case 'MLE': return <Database size={16} />;
        default: return <AlertTriangle size={16} />;
    }
  };

  if (loading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Danh sách Bài nộp</h2>
            <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Trạng thái chấm bài theo thời gian thực</p>
          </div>
      </div>
      
      {/* Cards Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Tổng số" value={stats.total} />
        <StatCard label="Accepted" value={stats.ac} color="green" />
        <StatCard label="Wrong Answer" value={stats.wa} color="red" />
        <StatCard label="Time Limit" value={stats.tle} color="yellow" />
        <StatCard label="Memory Limit" value={stats.mle} color="purple" />
        <StatCard label="CE / RE" value={stats.ce} color="gray" />
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden dark:bg-dark-card dark:border-dark-border flex flex-col">
        {submissions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <Database size={48} className="mb-2 opacity-50" />
                <p>Chưa có dữ liệu bài nộp.</p>
            </div>
        ) : (
            <>
                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-800 dark:text-gray-300 border-b dark:border-slate-700 sticky top-0">
                        <tr>
                            <th className="px-6 py-4 font-bold">ID</th>
                            <th className="px-6 py-4 font-bold">Thời gian</th>
                            <th className="px-6 py-4 font-bold">Người nộp</th>
                            <th className="px-6 py-4 font-bold">Bài tập</th>
                            <th className="px-6 py-4 font-bold text-center">Kết quả</th>
                            <th className="px-6 py-4 font-bold text-center">T.Gian</th>
                            <th className="px-6 py-4 font-bold text-center">Bộ nhớ</th>
                            <th className="px-6 py-4 font-bold text-center">Ngôn ngữ</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {currentSubmissions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-blue-50/50 transition-colors dark:hover:bg-slate-800/50">
                            <td className="px-6 py-4 font-mono text-gray-500 text-xs dark:text-gray-500 truncate max-w-[80px]" title={sub.id}>
                                #{sub.id.substring(0, 8)}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                {new Date(sub.created_at).toLocaleTimeString()} <br/>
                                <span className="text-xs opacity-75">{new Date(sub.created_at).toLocaleDateString()}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                    <User size={14} /> {sub.profiles?.name || 'Unknown User'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-800 dark:text-gray-200">
                                    {sub.problems?.name || 'Unknown Problem'}
                                </div>
                                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded dark:bg-slate-700 dark:text-gray-400">
                                    {sub.problems?.code || '---'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${getStatusStyle(sub.status)}`}>
                                    {getStatusIcon(sub.status)}
                                    <span>{sub.status}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-gray-400">{sub.time_taken || '-'}</td>
                            <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-gray-400">{sub.memory_taken || '-'}</td>
                            <td className="px-6 py-4 text-center">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border font-medium dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600">
                                    {sub.language}
                                </span>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* --- THANH ĐIỀU HƯỚNG / PAGINATION --- */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, submissions.length)} trong số {submissions.length} bài nộp
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700 dark:text-gray-300 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            
                            <span className="text-sm font-medium px-2 dark:text-gray-200">
                                Trang {currentPage} / {totalPages}
                            </span>

                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700 dark:text-gray-300 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

// Component phụ hiển thị Card thống kê cho gọn code
const StatCard = ({ label, value, color = 'black' }: { label: string, value: number, color?: string }) => {
    const colorClasses: any = {
        green: 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
        red: 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
        yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
        purple: 'bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
        gray: 'bg-gray-50 border-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300',
    };
    const defaultClass = 'bg-white border-gray-200 text-gray-800 dark:bg-dark-card dark:text-white';

    return (
        <div className={`p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center ${colorClasses[color] || defaultClass}`}>
            <span className="text-sm font-bold opacity-80">{label}</span>
            <span className="text-2xl font-bold mt-1">{value}</span>
        </div>
    );
};
