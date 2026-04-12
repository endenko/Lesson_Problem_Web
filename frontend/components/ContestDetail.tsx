
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Contest } from '../types';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Trophy, Users, AlertCircle, CheckCircle2, Lock, List, Play, ChevronRight, Timer, Medal } from 'lucide-react';

// Mock Data cho Bài tập trong kỳ thi
const MOCK_CONTEST_PROBLEMS = [
    { id: 'A', code: 'P001', name: 'Tổng hai số', score: 100, ac_rate: 85 },
    { id: 'B', code: 'P023', name: 'Chuỗi đối xứng', score: 100, ac_rate: 62 },
    { id: 'C', code: 'P055', name: 'Quy hoạch động cơ bản', score: 200, ac_rate: 45 },
    { id: 'D', code: 'P089', name: 'Đường đi ngắn nhất', score: 200, ac_rate: 30 },
    { id: 'E', code: 'P102', name: 'Luồng cực đại', score: 300, ac_rate: 12 },
];

// Mock Data cho Bảng xếp hạng
const MOCK_RANKING = [
    { rank: 1, user: 'red_coder_99', score: 900, penalty: 120, solved: 5, avatar: null },
    { rank: 2, user: 'algorithm_king', score: 850, penalty: 145, solved: 5, avatar: null },
    { rank: 3, user: 'bit_masker', score: 700, penalty: 90, solved: 4, avatar: null },
    { rank: 4, user: 'bug_hunter', score: 600, penalty: 110, solved: 3, avatar: null },
    { rank: 5, user: 'matrix_neo', score: 500, penalty: 80, solved: 3, avatar: null },
    { rank: 6, user: 'python_enjoyer', score: 400, penalty: 150, solved: 2, avatar: null },
    { rank: 7, user: 'cpp_master', score: 300, penalty: 60, solved: 2, avatar: null },
    { rank: 8, user: 'newbie_one', score: 100, penalty: 30, solved: 1, avatar: null },
];

export const ContestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, setLoginModalOpen, currentUser } = useAuth();
  
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'ranking'>('overview');
  
  // State giả lập
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [contestStatus, setContestStatus] = useState<'upcoming' | 'running' | 'ended'>('upcoming');

  useEffect(() => {
    const fetchContest = async () => {
        if (!id) return;
        setLoading(true);

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase
                .from('contests')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) setContest(data);
        } else {
            // Fallback nếu không có DB, tạo data giả dựa trên ID
            setContest({
                id: id,
                title: `Weekly Contest #${id}`,
                description: 'Kỳ thi lập trình hàng tuần nhằm rèn luyện kỹ năng giải thuật.',
                start_time: new Date(Date.now() + 3600000).toISOString(), // Bắt đầu sau 1h
                end_time: new Date(Date.now() + 10800000).toISOString(),
                participants_count: 150
            });
        }
        setLoading(false);
    };

    fetchContest();
  }, [id]);

  // Timer Logic
  useEffect(() => {
      if (!contest) return;

      const interval = setInterval(() => {
          const now = new Date().getTime();
          const start = new Date(contest.start_time).getTime();
          const end = new Date(contest.end_time).getTime();

          let targetTime = 0;
          let status: 'upcoming' | 'running' | 'ended' = 'upcoming';

          if (now < start) {
              status = 'upcoming';
              targetTime = start;
          } else if (now >= start && now <= end) {
              status = 'running';
              targetTime = end;
          } else {
              status = 'ended';
              targetTime = 0;
          }

          setContestStatus(status);

          if (targetTime > 0) {
              const distance = targetTime - now;
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          } else {
              setTimeLeft('00h 00m 00s');
          }

      }, 1000);

      return () => clearInterval(interval);
  }, [contest]);

  const handleRegister = () => {
      if (!isAuthenticated) {
          setLoginModalOpen(true);
          return;
      }
      // Giả lập call API đăng ký
      const confirm = window.confirm("Bạn xác nhận muốn đăng ký tham gia kỳ thi này?");
      if (confirm) {
          setIsRegistered(true);
      }
  };

  if (loading) {
      return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!contest) {
      return <div className="text-center py-20 text-gray-500">Không tìm thấy kỳ thi.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER CARD */}
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border rounded-xl shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-900 to-blue-700 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="absolute bottom-6 left-6 text-white">
                   <div className="flex items-center gap-2 mb-2">
                        {contestStatus === 'upcoming' && <span className="bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded border border-blue-400">Sắp diễn ra</span>}
                        {contestStatus === 'running' && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded border border-green-400 animate-pulse">Đang diễn ra</span>}
                        {contestStatus === 'ended' && <span className="bg-gray-500/80 text-white text-xs px-2 py-0.5 rounded border border-gray-400">Đã kết thúc</span>}
                   </div>
                   <h1 className="text-3xl font-bold">{contest.title}</h1>
              </div>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-blue-600" />
                      <div>
                          <p className="text-xs text-gray-400">Bắt đầu</p>
                          <p className="font-semibold">{new Date(contest.start_time).toLocaleString('vi-VN')}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Clock size={18} className="text-blue-600" />
                      <div>
                          <p className="text-xs text-gray-400">Kết thúc</p>
                          <p className="font-semibold">{new Date(contest.end_time).toLocaleString('vi-VN')}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      <div>
                          <p className="text-xs text-gray-400">Thí sinh</p>
                          <p className="font-semibold">{contest.participants_count || 150}</p>
                      </div>
                  </div>
              </div>

              {/* ACTION AREA */}
              <div className="flex items-center gap-4">
                  {contestStatus !== 'ended' && (
                      <div className="text-center px-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {contestStatus === 'upcoming' ? 'Bắt đầu trong' : 'Còn lại'}
                          </p>
                          <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Timer size={20} /> {timeLeft}
                          </div>
                      </div>
                  )}
                  
                  {isRegistered ? (
                      <button disabled className="bg-green-100 text-green-700 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 cursor-default border border-green-200">
                          <CheckCircle2 size={20} /> Đã đăng ký
                      </button>
                  ) : contestStatus === 'ended' ? (
                      <button disabled className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 cursor-not-allowed border border-gray-200">
                          Đã kết thúc
                      </button>
                  ) : (
                      <button 
                        onClick={handleRegister}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
                      >
                          Đăng ký tham gia
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b dark:border-dark-border">
          <nav className="flex gap-6">
              <button 
                  onClick={() => setActiveTab('overview')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                  <AlertCircle size={16} /> Tổng quan
              </button>
              <button 
                  onClick={() => setActiveTab('problems')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'problems' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                  <List size={16} /> Danh sách bài tập
              </button>
              <button 
                  onClick={() => setActiveTab('ranking')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ranking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                  <Trophy size={16} /> Bảng xếp hạng
              </button>
          </nav>
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[400px]">
          {activeTab === 'overview' && (
              <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-sm border dark:border-dark-border space-y-6">
                  <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Mô tả kỳ thi</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {contest.description || "Không có mô tả chi tiết."}
                      </p>
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Quy định</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                          <li>Thí sinh phải đăng nhập để nộp bài.</li>
                          <li>Nghiêm cấm sao chép code, chia sẻ lời giải trong quá trình thi.</li>
                          <li>Hệ thống chấm bài tự động. Kết quả sẽ được cập nhật lên bảng xếp hạng ngay lập tức.</li>
                          <li>Mỗi lần nộp sai (WA) sẽ bị phạt 5 phút vào tổng thời gian (nếu bài đó cuối cùng được AC).</li>
                      </ul>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-300">
                      <strong>Lưu ý:</strong> Bảng xếp hạng sẽ bị đóng băng 60 phút trước khi kỳ thi kết thúc để tăng tính kịch tính.
                  </div>
              </div>
          )}

          {activeTab === 'problems' && (
              <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border dark:border-dark-border overflow-hidden">
                  {!isRegistered && contestStatus !== 'ended' ? (
                      <div className="text-center py-20">
                          <Lock size={48} className="mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Nội dung bị khóa</h3>
                          <p className="text-gray-500 mb-4">Bạn cần đăng ký tham gia kỳ thi để xem danh sách bài tập.</p>
                          <button onClick={handleRegister} className="text-blue-600 hover:underline font-bold">Đăng ký ngay</button>
                      </div>
                  ) : contestStatus === 'upcoming' ? (
                      <div className="text-center py-20">
                          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Kỳ thi chưa bắt đầu</h3>
                          <p className="text-gray-500">Hãy quay lại khi đồng hồ đếm ngược kết thúc.</p>
                      </div>
                  ) : (
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold dark:bg-slate-900 dark:text-gray-400">
                              <tr>
                                  <th className="px-6 py-4">#</th>
                                  <th className="px-6 py-4">Tên bài tập</th>
                                  <th className="px-6 py-4 text-center">Điểm</th>
                                  <th className="px-6 py-4 text-center">AC Rate</th>
                                  <th className="px-6 py-4 text-right">Thao tác</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-700">
                              {MOCK_CONTEST_PROBLEMS.map((prob) => (
                                  <tr key={prob.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                      <td className="px-6 py-4 font-bold text-gray-500">{prob.id}</td>
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-gray-800 dark:text-white mb-0.5">{prob.name}</div>
                                          <div className="text-xs text-gray-500 font-mono">{prob.code}</div>
                                      </td>
                                      <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">{prob.score}</td>
                                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">{prob.ac_rate}%</td>
                                      <td className="px-6 py-4 text-right">
                                          <Link 
                                            to={`/problem/${prob.code}`}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700"
                                          >
                                              Làm bài <ChevronRight size={14} />
                                          </Link>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          )}

          {activeTab === 'ranking' && (
              <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border dark:border-dark-border overflow-hidden">
                  <div className="p-4 bg-yellow-50 border-b border-yellow-100 text-yellow-800 text-sm flex items-center justify-between dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-400">
                      <span className="flex items-center gap-2"><Trophy size={16} /> Bảng xếp hạng trực tuyến</span>
                      <span className="text-xs opacity-70">Cập nhật: Vừa xong</span>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold dark:bg-slate-900 dark:text-gray-400">
                              <tr>
                                  <th className="px-6 py-4 text-center w-16">Hạng</th>
                                  <th className="px-6 py-4">Thí sinh</th>
                                  <th className="px-6 py-4 text-center">Tổng điểm</th>
                                  <th className="px-6 py-4 text-center">Phạt (phút)</th>
                                  <th className="px-6 py-4 text-center">Bài giải</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-700">
                              {MOCK_RANKING.map((user) => (
                                  <tr key={user.rank} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${user.user === currentUser?.name ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                      <td className="px-6 py-4 text-center">
                                          {user.rank === 1 ? <Medal size={24} className="mx-auto text-yellow-500" fill="currentColor" /> :
                                           user.rank === 2 ? <Medal size={24} className="mx-auto text-slate-400" fill="currentColor" /> :
                                           user.rank === 3 ? <Medal size={24} className="mx-auto text-orange-400" fill="currentColor" /> :
                                           <span className="font-bold text-gray-500">{user.rank}</span>}
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                                                  {user.user.charAt(0).toUpperCase()}
                                              </div>
                                              <span className={`font-medium ${user.user === currentUser?.name ? 'text-blue-600 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                                                  {user.user} {user.user === currentUser?.name && '(Bạn)'}
                                              </span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">{user.score}</td>
                                      <td className="px-6 py-4 text-center text-sm text-gray-500 font-mono">{user.penalty}</td>
                                      <td className="px-6 py-4 text-center">
                                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded dark:bg-green-900/30 dark:text-green-400">
                                              {user.solved}/5
                                          </span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
