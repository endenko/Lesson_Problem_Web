
import React, { useState } from 'react';
import { Search, BookOpen, Tag, CheckCircle2, Trophy, Lock, AlertCircle, Unlock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';

export const LectureSidebar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { selectedLectureTopic, setSelectedLectureTopic } = useFilter(); // Sử dụng Context
  const [search, setSearch] = useState('');
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  // Danh sách chủ đề
  const topics = [
    "Tất cả bài giảng",
    "Algorithms", // Đã thêm theo yêu cầu
    "C++",
    "Python",
    "Java",
    "Front End",
    "Back End",
    "Cơ Sở Dữ Liệu",
    "Machine Learning",
    "Vision Machine",
    "Game Development",
    "DevOps",
    "Cyber Security",
    "Mobile Apps",
    "Cloud Computing",
    "Blockchain"
  ];

  // Danh sách các chủ đề MIỄN PHÍ (Xem được khi chưa đăng nhập)
  const freeTopics = ["Tất cả bài giảng", "C++", "Python", "Java", "Algorithms"];

  const handleTopicClick = (topic: string) => {
    // Kiểm tra quyền truy cập:
    // Nếu chưa đăng nhập VÀ chủ đề không nằm trong danh sách miễn phí -> Chặn
    if (!isAuthenticated && !freeTopics.includes(topic)) {
      setShowLoginWarning(true);
      setTimeout(() => setShowLoginWarning(false), 3000);
      return;
    }
    
    setSelectedLectureTopic(topic); // Cập nhật vào Context
    setShowLoginWarning(false);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. KHUNG TIẾN ĐỘ HỌC TẬP */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 dark:bg-dark-card dark:border-dark-border transition-colors">
        <div className="flex items-center gap-2 mb-3 text-oj-blue dark:text-blue-400">
            <Trophy size={20} className={isAuthenticated ? "text-yellow-500" : "text-gray-400"} />
            <h3 className="font-bold text-lg">Tiến độ học tập</h3>
        </div>
        
        <div className="space-y-4">
            {isAuthenticated ? (
                <>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-300">Đã hoàn thành</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">0/12 bài</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                            <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-md p-3 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0 dark:text-green-400" />
                            <div>
                                <p className="text-xs font-bold text-gray-800 dark:text-white">Bài học tiếp theo:</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 line-clamp-1">Lập trình C++ - Biến Hằng cơ bản</p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-2">
                    <div className="bg-gray-100 dark:bg-slate-800 p-3 rounded-full inline-block mb-2">
                        <Lock size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bạn chưa đăng nhập</p>
                    <p className="text-xs text-gray-500">Đăng nhập để lưu tiến độ học tập của bạn.</p>
                </div>
            )}
        </div>
      </div>

      {/* 2. KHUNG TÌM KIẾM & CHỦ ĐỀ */}
      <div className="bg-white p-5 rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border transition-colors">
        <div className="flex items-center gap-2 mb-4 text-oj-blue border-b pb-2 dark:text-blue-400 dark:border-dark-border">
          <Search size={20} />
          <h3 className="font-bold text-lg">Tìm kiếm bài giảng</h3>
        </div>

        <div className="space-y-5">
          {/* Search Input */}
          <div>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Nhập tên bài học..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          {/* Cảnh báo đăng nhập */}
          {showLoginWarning && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={16} />
                  <span>Vui lòng <strong>đăng nhập</strong> để học nâng cao!</span>
              </div>
          )}

          {/* Filter: Chủ đề (Tags) */}
          <div>
            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Tag size={16} className="text-gray-500" /> Chủ đề môn học
            </label>
            <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {topics.map((topic, idx) => {
                    const isActive = selectedLectureTopic === topic;
                    // Logic khóa mới: Chỉ khóa nếu KHÔNG nằm trong danh sách miễn phí
                    const isLocked = !isAuthenticated && !freeTopics.includes(topic);
                    
                    return (
                        <button 
                            key={idx}
                            onClick={() => handleTopicClick(topic)}
                            className={`px-3 py-2 text-sm rounded-md text-left transition-all flex items-center justify-between group
                                ${isActive && !isLocked
                                    ? 'bg-blue-600 text-white font-semibold shadow-md' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:pl-4 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700'
                                }`
                            }
                        >
                            <span className="flex items-center gap-2">
                                <BookOpen size={14} className={isActive && !isLocked ? "text-white" : "text-gray-400 group-hover:text-blue-500"} />
                                {topic}
                            </span>
                            
                            {isLocked ? (
                                <Lock size={12} className="text-gray-400 group-hover:text-red-500" />
                            ) : !isAuthenticated && topic !== "Tất cả bài giảng" ? (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Free</span>
                            ) : null}
                        </button>
                    );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
