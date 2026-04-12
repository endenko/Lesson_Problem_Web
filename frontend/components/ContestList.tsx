
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowRight, Trophy, Loader2, Timer, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Contest } from '../types';
import { Link } from 'react-router-dom';

export const ContestList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [pastContests, setPastContests] = useState<Contest[]>([]);

  useEffect(() => {
    const fetchContests = async () => {
        setLoading(true);
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('contests')
                .select('*')
                .order('start_time', { ascending: true }); // Sắp xếp theo thời gian bắt đầu

            if (error) throw error;

            if (data) {
                const now = new Date();
                const upcoming: Contest[] = [];
                const past: Contest[] = [];

                data.forEach((c: Contest) => {
                    const endTime = new Date(c.end_time);
                    
                    if (endTime > now) {
                        upcoming.push(c);
                    } else {
                        past.push(c);
                    }
                });

                // Sắp xếp lại: Upcoming (Cái nào sắp diễn ra nhất lên đầu), Past (Cái nào mới hết lên đầu)
                upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
                past.sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime());

                setActiveContests(upcoming);
                setPastContests(past);
            }
        } catch (err) {
            console.error("Lỗi tải kỳ thi:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchContests();
  }, []);

  // Helper tính thời gian còn lại hoặc thời lượng
  const getDuration = (start: string, end: string) => {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      const diffMs = e - s;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`;
  };

  const getStatus = (start: string, end: string) => {
      const now = new Date().getTime();
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();

      if (now < s) return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
      if (now >= s && now <= e) return { label: 'Đang diễn ra', color: 'bg-green-100 text-green-700 animate-pulse dark:bg-green-900/30 dark:text-green-400' };
      return { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400' };
  };

  if (loading) {
      return (
         <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
            <p className="text-gray-500">Đang cập nhật dữ liệu kỳ thi...</p>
         </div>
      );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b pb-4 dark:border-dark-border">
         <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
             <Trophy size={28} />
         </div>
         <div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Kỳ thi lập trình</h2>
             <p className="text-gray-600 dark:text-gray-400">Thử thách kỹ năng, leo bảng xếp hạng và nhận giải thưởng.</p>
         </div>
      </div>

      {/* SECTION 1: UPCOMING / RUNNING */}
      <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Timer className="text-blue-600" /> Đang & Sắp diễn ra
          </h3>
          
          {activeContests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-dashed text-center dark:bg-dark-card dark:border-slate-700">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-3 dark:text-slate-600" />
                  <p className="text-gray-500 font-medium dark:text-gray-400">Hiện không có kỳ thi nào sắp tới.</p>
                  <p className="text-sm text-gray-400">Hãy quay lại sau để cập nhật lịch thi mới nhất.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeContests.map(contest => {
                      const status = getStatus(contest.start_time, contest.end_time);
                      return (
                          <div key={contest.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all dark:bg-dark-card dark:border-dark-border flex flex-col">
                              <div className="p-6 flex-1">
                                  <div className="flex justify-between items-start mb-4">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.color}`}>
                                          {status.label}
                                      </span>
                                      {/* Mock Participants Count if DB is empty */}
                                      <div className="flex items-center gap-1 text-gray-500 text-sm dark:text-gray-400">
                                          <Users size={16} />
                                          <span>{contest.participants_count || 0}</span>
                                      </div>
                                  </div>
                                  
                                  <h4 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 dark:text-white">
                                      {contest.title}
                                  </h4>
                                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 dark:text-gray-400">
                                      {contest.description || "Tham gia ngay để thử thách bản thân với bộ đề chuẩn quốc tế."}
                                  </p>

                                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                      <div className="flex items-center gap-1">
                                          <Calendar size={16} />
                                          {new Date(contest.start_time).toLocaleDateString('vi-VN')}
                                      </div>
                                      <div className="flex items-center gap-1">
                                          <Clock size={16} />
                                          {getDuration(contest.start_time, contest.end_time)}
                                      </div>
                                  </div>
                              </div>
                              <div className="p-4 bg-gray-50 border-t dark:bg-slate-800 dark:border-slate-700">
                                  <button className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-blue-500/20 shadow-lg">
                                      Đăng ký tham gia <ArrowRight size={18} />
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>

      {/* SECTION 2: PAST CONTESTS */}
      <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="text-gray-500" /> Đã kết thúc
          </h3>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden dark:bg-dark-card dark:border-dark-border">
              <div className="divide-y dark:divide-slate-700">
                  {pastContests.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chưa có lịch sử kỳ thi nào.</div>
                  ) : (
                      pastContests.map(contest => (
                          <div key={contest.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 dark:hover:bg-slate-800/50">
                              <div>
                                  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                                      {contest.title}
                                  </h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                      <span>Bắt đầu: {new Date(contest.start_time).toLocaleString('vi-VN')}</span>
                                      <span className="hidden md:inline">•</span>
                                      <span>Thời lượng: {getDuration(contest.start_time, contest.end_time)}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4 shrink-0">
                                  <div className="text-right hidden md:block">
                                      <div className="text-sm font-bold text-gray-800 dark:text-white">{contest.participants_count || 0}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Thí sinh</div>
                                  </div>
                                  <Link to={`/contest/${contest.id}`} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-gray-700 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700">
                                      Xem kết quả
                                  </Link>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
