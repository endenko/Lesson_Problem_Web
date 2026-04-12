
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { PlayCircle, Lock, ChevronRight, List, ArrowLeft, Clock, AlertTriangle, Loader2, Unlock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Lesson {
  id: string;
  lecture_id: string;
  title: string;
  video_url: string; // YouTube URL
  duration: string;
  is_free: boolean;
  order_index: number;
}

interface LectureDetailInfo {
  id: string;
  title: string;
  description: string;
}

export const LectureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, setLoginModalOpen } = useAuth(); // Lấy trạng thái đăng nhập và hàm mở modal
  
  const [lecture, setLecture] = useState<LectureDetailInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to extract YouTube ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const fetchLectureData = async () => {
      if (!id) return;
      setLoading(true);
      setErrorMsg(null);

      try {
        if (isSupabaseConfigured()) {
            // A. Fetch Lecture Info
            const { data: lec, error: lecError } = await supabase
                .from('lectures')
                .select('id, title, description')
                .eq('id', id)
                .single();
            
            if (lecError) throw lecError;
            setLecture(lec);

            // B. Fetch Lessons
            const { data: less, error: lessError } = await supabase
                .from('lecture_lessons')
                .select('*')
                .eq('lecture_id', id)
                .order('order_index', { ascending: true });

            if (lessError) throw lessError;

            setLessons(less || []);
            
            // Tự động chọn bài đầu tiên nếu có
            if (less && less.length > 0) {
                setCurrentLesson(less[0]);
            }
        } else {
             setErrorMsg("Chưa cấu hình Supabase.");
        }
      } catch (err: any) {
        console.error("Error loading lecture detail:", err);
        setErrorMsg("Không tìm thấy khóa học này hoặc có lỗi kết nối.");
      } finally {
        setLoading(false);
      }
    };

    fetchLectureData();
  }, [id]);

  // --- LOGIC QUAN TRỌNG: KIỂM TRA QUYỀN TRUY CẬP ---
  const handleSelectLesson = (lesson: Lesson) => {
    // Kiểm tra quyền: Bị khóa nếu không phải FREE và người dùng chưa đăng nhập
    const isLocked = !lesson.is_free && !isAuthenticated;
    
    if (isLocked) {
        // Nếu bài bị khóa, hiển thị xác nhận và mở modal đăng nhập nếu user đồng ý
        const userWantsToLogin = window.confirm("🔒 Bài học này dành riêng cho thành viên VIP.\n\nBạn có muốn đăng nhập để mở khóa nội dung này không?");
        if (userWantsToLogin) {
            setLoginModalOpen(true);
        }
        return;
    }
    
    // Nếu Free HOẶC Đã đăng nhập -> Cho phép xem
    setCurrentLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );
  }

  if (errorMsg || !lecture) {
    return (
        <div className="text-center py-20">
            <AlertTriangle className="mx-auto text-red-500 mb-3" size={48} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Không tìm thấy khóa học</h2>
            <p className="text-gray-500 mt-2">{errorMsg}</p>
            <Link to="/lectures" className="text-blue-600 hover:underline mt-4 inline-block">Quay lại danh sách</Link>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb / Back Button */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
         <Link to="/lectures" className="hover:text-blue-600 flex items-center gap-1">
             <ArrowLeft size={16} /> Danh sách bài giảng
         </Link>
         <ChevronRight size={14} />
         <span className="font-medium text-gray-800 dark:text-gray-200">{lecture.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT: Video Player */}
         <div className="lg:col-span-2 space-y-4">
             <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group">
                {currentLesson ? (
                    <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(currentLesson.video_url)}?autoplay=1&rel=0`}
                        title={currentLesson.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                    ></iframe>
                ) : (
                    <div className="flex items-center justify-center h-full text-white bg-slate-900">
                        <div className="text-center">
                            <PlayCircle size={64} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">
                                {lessons.length > 0 ? "Chọn một bài học để bắt đầu" : "Khóa học này chưa có video"}
                            </p>
                        </div>
                    </div>
                )}
             </div>

             <div className="bg-white p-6 rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentLesson?.title || lecture.title}
                    </h1>
                    {currentLesson && !currentLesson.is_free && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 flex items-center gap-1 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">
                            <Star size={12} fill="currentColor" /> Premium
                        </span>
                    )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {lecture.description}
                </p>
             </div>
         </div>

         {/* RIGHT: Playlist / Syllabus */}
         <div className="lg:col-span-1">
             <div className="bg-white rounded-lg shadow-sm border flex flex-col h-full max-h-[600px] dark:bg-dark-card dark:border-dark-border">
                 <div className="p-4 border-b bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
                     <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                         <List size={20} className="text-blue-600" />
                         Nội dung khóa học
                     </h3>
                     <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                         {lessons.length} bài học • {lessons.filter(l => l.is_free).length} Miễn phí
                     </p>
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                     {lessons.length === 0 ? (
                         <div className="text-center py-10 text-gray-500 text-sm">Chưa có bài học nào.</div>
                     ) : (
                         lessons.map((lesson, idx) => {
                             const isActive = currentLesson?.id === lesson.id;
                             
                             // LOGIC UI:
                             const isLocked = !lesson.is_free && !isAuthenticated;
                             const isPremium = !lesson.is_free;

                             return (
                                 <button
                                    key={lesson.id}
                                    onClick={() => handleSelectLesson(lesson)}
                                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 group relative
                                        ${isActive 
                                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                                            : 'hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent'
                                        }
                                        ${isLocked ? 'opacity-80 bg-gray-50 dark:bg-slate-900/50 cursor-pointer' : 'cursor-pointer'}
                                    `}
                                 >
                                     <div className="mt-1">
                                         {isActive ? (
                                             <PlayCircle size={18} className="text-blue-600 animate-pulse" />
                                         ) : isLocked ? (
                                             <Lock size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                                         ) : isPremium ? (
                                             <Unlock size={18} className="text-yellow-500" />
                                         ) : (
                                             <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-500 dark:border-slate-600">
                                                 {idx + 1}
                                             </div>
                                         )}
                                     </div>
                                     
                                     <div className="flex-1">
                                         <h4 className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                             {lesson.title}
                                         </h4>
                                         <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                             <span className="flex items-center gap-1">
                                                 <Clock size={12} /> {lesson.duration}
                                             </span>
                                             {!lesson.is_free && (
                                                <span className={`font-bold px-1.5 rounded text-[10px] border ${isLocked ? 'text-gray-500 border-gray-300 bg-gray-100' : 'text-yellow-600 border-yellow-300 bg-yellow-50'}`}>
                                                    {isLocked ? 'LOCKED' : 'PREMIUM'}
                                                </span>
                                             )}
                                         </div>
                                     </div>
                                 </button>
                             );
                         })
                     )}
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
