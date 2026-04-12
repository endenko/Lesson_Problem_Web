
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Problem } from '../types';
import { Loader2, AlertTriangle, FilterX, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { useFilter } from '../context/FilterContext';
import { MOCK_PROBLEMS } from '../constants';

interface ExtendedProblem extends Problem {
    tags?: string[];
}

const ITEMS_PER_PAGE = 15;

export const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<ExtendedProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const { searchQuery, selectedTags, scoreRange, selectedType } = useFilter();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags, scoreRange, selectedType]);

  useEffect(() => {
    const fetchProblems = async () => {
      // 1. Thử lấy từ Supabase
      if (isSupabaseConfigured()) {
          try {
            const { data, error } = await supabase
                .from('problems')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                const formattedData = data.map((item: any) => ({
                    id: item.id.toString(),
                    name: item.name,
                    code: item.code,
                    type: item.type,
                    score: item.score,
                    acRate: item.ac_rate,
                    acCount: item.ac_count,
                    tags: item.tags || [] 
                }));
                setProblems(formattedData);
                setUsingMockData(false);
                setLoading(false);
                return; // Thành công, thoát
            }
          } catch (err: any) {
              console.warn("Lỗi Supabase (ProblemList), chuyển sang Mock Data:", err.message || JSON.stringify(err));
              // Không return, để chạy xuống fallback bên dưới
          }
      }

      // 2. Fallback: Sử dụng Mock Data
      setProblems(MOCK_PROBLEMS);
      setUsingMockData(true);
      setLoading(false);
    };

    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScore = (p.score || 0) <= scoreRange;
      const matchesTags = selectedTags.length === 0 || 
                          (p.tags && p.tags.length > 0 && selectedTags.every(tag => p.tags!.includes(tag)));
      const matchesType = !selectedType || (p.type && p.type.toLowerCase().includes(selectedType.toLowerCase()));
      return matchesSearch && matchesScore && matchesTags && matchesType;
  });

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden dark:bg-dark-card dark:border-dark-border transition-colors flex flex-col min-h-[600px]">
      
      {/* Thông báo nếu đang dùng Mock Data */}
      {usingMockData && (
          <div className="bg-yellow-50 text-yellow-800 px-4 py-2 text-xs flex items-center justify-center gap-2 border-b border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900">
              <Database size={12} />
              <span>Đang hiển thị dữ liệu mẫu do không kết nối được Database.</span>
          </div>
      )}

      {(searchQuery || selectedTags.length > 0 || scoreRange < 1000 || selectedType) && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
              <span>Tìm thấy <strong>{filteredProblems.length}</strong> bài tập phù hợp.</span>
          </div>
      )}

      {filteredProblems.length === 0 ? (
        <div className="text-center py-20">
            <FilterX size={48} className="mx-auto text-gray-300 mb-3 dark:text-slate-600" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy bài tập nào phù hợp.</p>
        </div>
      ) : (
        <>
            <div className="overflow-x-auto flex-grow custom-scrollbar">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-white uppercase bg-oj-blue dark:bg-blue-900 transition-colors sticky top-0 z-10">
                    <tr>
                    <th scope="col" className="px-6 py-3 font-bold whitespace-nowrap">Bài tập</th>
                    <th scope="col" className="px-6 py-3 text-center font-bold whitespace-nowrap">Mã bài</th>
                    <th scope="col" className="px-6 py-3 text-center font-bold whitespace-nowrap">Loại</th>
                    <th scope="col" className="px-6 py-3 text-center font-bold whitespace-nowrap">Điểm</th>
                    <th scope="col" className="px-6 py-3 text-center font-bold whitespace-nowrap">AC %</th>
                    <th scope="col" className="px-6 py-3 text-center font-bold whitespace-nowrap">AC #</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedProblems.map((problem, index) => (
                    <tr 
                        key={problem.id} 
                        className={`border-b hover:bg-blue-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-700/50 
                            ${index % 2 === 0 ? 'bg-white dark:bg-dark-card' : 'bg-gray-50 dark:bg-slate-800/50'}`}
                    >
                        <td className="px-6 py-3">
                            <Link to={`/problem/${problem.id}`} className="text-blue-600 hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium block text-base">
                                {problem.name}
                            </Link>
                            {problem.tags && problem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {problem.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-3 text-center">
                        <Link to={`/problem/${problem.id}`} className="text-blue-500 hover:underline dark:text-blue-400 font-mono">
                            {problem.code}
                        </Link>
                        </td>
                        <td className="px-6 py-3 text-center text-gray-600 dark:text-gray-400">{problem.type}</td>
                        <td className="px-6 py-3 text-center text-gray-600 dark:text-gray-400 font-bold">{problem.score}</td>
                        <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-xs w-8 text-right">{problem.acRate}%</span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-slate-600">
                            <div className="h-full bg-green-500" style={{ width: `${problem.acRate}%` }}></div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-3 text-center text-blue-600 font-medium dark:text-blue-400">{problem.acCount}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 dark:bg-slate-800/50 dark:border-slate-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                        Hiển thị {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredProblems.length)}
                    </span>
                    <div className="flex items-center gap-2 mx-auto sm:mx-0">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-slate-700 dark:text-gray-300"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="text-sm font-medium dark:text-gray-300">
                            Trang {currentPage} / {totalPages}
                        </div>
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-slate-700 dark:text-gray-300"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
      )}
    </div>
  );
};
