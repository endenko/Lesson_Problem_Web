
import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Clock, User, PlayCircle, Filter } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { useFilter } from '../context/FilterContext';

interface Lecture {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  level: string;
  duration: string;
  author: string;
  created_at: string;
}

export const LectureList: React.FC = () => {
  const { selectedLectureTopic } = useFilter(); // Lấy chủ đề được chọn từ Context
  const [loading, setLoading] = useState(true);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true);
      
      if (isSupabaseConfigured()) {
          try {
            const { data, error } = await supabase
            .from('lectures')
            .select('*')
            .order('id', { ascending: true });

            if (error) throw error;

            if (data) {
                setLectures(data as Lecture[]);
            }
          } catch (err: any) {
              console.error("Lỗi fetch Lectures:", err.message || JSON.stringify(err));
              setErrorMsg(err.message || "Không thể tải danh sách bài giảng.");
          }
      } else {
          setErrorMsg("Chưa kết nối đến Supabase.");
      }

      setLoading(false);
    };

    fetchLectures();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300';
    }
  };

  // --- LOGIC LỌC BÀI GIẢNG (ĐÃ CẬP NHẬT) ---
  const filteredLectures = lectures.filter(lecture => {
      // 1. Nếu chọn "Tất cả bài giảng" -> Trả về true (lấy hết)
      if (selectedLectureTopic === "Tất cả bài giảng") return true;
      
      // 2. Nếu chọn chủ đề cụ thể
      if (lecture.tags && Array.isArray(lecture.tags)) {
          // Hàm chuẩn hóa chuỗi: Xóa khoảng trắng, dấu gạch nối và chuyển về chữ thường
          // VD: "Front End" -> "frontend", "Front-End" -> "frontend", "Algorithms" -> "algorithms"
          const normalize = (str: string) => str.toLowerCase().replace(/[\s-]/g, '');
          
          const targetTopic = normalize(selectedLectureTopic);

          return lecture.tags.some(tag => {
              const currentTag = normalize(tag);
              
              // So sánh trực tiếp (Sau khi đã chuẩn hóa)
              // Điều này giúp: "Front End" (Sidebar) tìm thấy "Frontend" (DB)
              if (currentTag === targetTopic) return true;

              // So sánh mở rộng cho các trường hợp đặc biệt (Aliases)
              if (targetTopic === 'algorithms' && (currentTag === 'algorithm' || currentTag === 'dsa' || currentTag === 'cấutrúcdữliệu' || currentTag === 'thuậttoán')) {
                  return true;
              }

              return false;
          });
      }
      return false;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end border-b pb-4 dark:border-dark-border transition-colors gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Thư viện Bài giảng</h2>
            <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600 dark:text-gray-400">Nâng cao kỹ năng lập trình và thuật toán của bạn</p>
                {selectedLectureTopic !== "Tất cả bài giảng" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/30 dark:text-blue-400">
                        <Filter size={10} /> {selectedLectureTopic}
                    </span>
                )}
            </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
             <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                <p className="text-gray-500">Đang tải kiến thức từ Database...</p>
             </div>
        ) : errorMsg ? (
             <div className="flex flex-col justify-center items-center h-64 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-900">
                <p className="text-red-600 dark:text-red-400 font-medium">{errorMsg}</p>
             </div>
        ) : filteredLectures.length === 0 ? (
             <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg border border-dashed dark:bg-dark-card dark:border-slate-700">
                <BookOpen className="text-gray-300 mb-3 dark:text-slate-600" size={48} />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có bài giảng nào thuộc chủ đề "{selectedLectureTopic}".</p>
                <div className="mt-2 text-xs text-gray-400">
                    Gợi ý: Thử kiểm tra lại Tags trong Database xem có khớp không (Ví dụ: "Frontend" vs "Front End")
                </div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-sm text-blue-600 hover:underline"
                >
                    Tải lại trang
                </button>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
                <Link 
                    to={`/lectures/${lecture.id}`} 
                    key={lecture.id} 
                    className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group h-full dark:bg-dark-card dark:border-dark-border transform hover:-translate-y-1 block"
                >
                   <div className="relative h-48 overflow-hidden bg-gray-200">
                       <img 
                         src={lecture.thumbnail || 'https://via.placeholder.com/400x200?text=Course'} 
                         alt={lecture.title}
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <PlayCircle className="text-white opacity-90" size={48} />
                       </div>
                       <span className={`absolute top-3 right-3 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${getLevelColor(lecture.level)}`}>
                           {lecture.level || 'Beginner'}
                       </span>
                   </div>

                   <div className="p-5 flex flex-col flex-grow space-y-4">
                       <div className="flex-grow">
                           <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                               {lecture.title}
                           </h3>
                           <p className="text-gray-600 text-sm line-clamp-3 dark:text-gray-400">
                               {lecture.description}
                           </p>
                       </div>

                       <div className="flex flex-wrap gap-2">
                           {lecture.tags && lecture.tags.map(tag => (
                               <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400">
                                   {tag}
                               </span>
                           ))}
                       </div>

                       <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                           <div className="flex items-center gap-1">
                               <Clock size={14} />
                               {lecture.duration || 'N/A'}
                           </div>
                           <div className="flex items-center gap-1">
                               <User size={14} />
                               {lecture.author || 'Admin'}
                           </div>
                       </div>
                   </div>
                </Link>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};
