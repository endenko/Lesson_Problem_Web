import React from 'react';
import { Trophy, Medal, Star, Target, Zap, Crown, Flame, Code, BookOpen, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Achievements: React.FC = () => {
  const { currentUser } = useAuth();

  // Dữ liệu mặc định nếu chưa đăng nhập
  const stats = {
      rank: currentUser?.rank || 9999,
      rating: currentUser?.rating || 1200, // Mặc định 1200 cho người mới (thay vì 0 để giống rating ELO)
      solved: currentUser?.solved || 0
  };

  // Tính toán % so với mốc rating cao thủ (ví dụ 3000)
  const progressPercent = Math.min((stats.rating / 3000) * 100, 100);

  // Danh sách 9 huy hiệu với điều kiện mở khóa
  const badges = [
    { 
        id: 1, 
        name: "Người mới bắt đầu", 
        desc: "Đăng ký tài khoản thành công", 
        condition: true, // Luôn mở khóa khi có tk
        icon: <UserBadge />, 
        color: "text-blue-500", 
        bg: "bg-blue-100 dark:bg-blue-900/30" 
    },
    { 
        id: 2, 
        name: "Chiến thần Code", 
        desc: "Giải được 10 bài tập", 
        condition: stats.solved >= 10, 
        icon: <Trophy size={32} />, 
        color: "text-yellow-500", 
        bg: "bg-yellow-100 dark:bg-yellow-900/30" 
    },
    { 
        id: 3, 
        name: "Thợ săn thuật toán", 
        desc: "Rating đạt 1400+", 
        condition: stats.rating >= 1400, 
        icon: <Target size={32} />, 
        color: "text-red-500", 
        bg: "bg-red-100 dark:bg-red-900/30" 
    },
    { 
        id: 4, 
        name: "Cú đêm", 
        desc: "Nộp bài lúc 3 giờ sáng", 
        condition: false, // Tạm thời khóa
        icon: <Star size={32} />, 
        color: "text-indigo-500", 
        bg: "bg-indigo-100 dark:bg-indigo-900/30" 
    },
    { 
        id: 5, 
        name: "Kẻ hủy diệt Bug", 
        desc: "10 bài AC liên tiếp", 
        condition: false, 
        icon: <Zap size={32} />, 
        color: "text-purple-500", 
        bg: "bg-purple-100 dark:bg-purple-900/30" 
    },
    { 
        id: 6, 
        name: "Vua tốc độ", 
        desc: "AC trong 1 phút", 
        condition: false, 
        icon: <Medal size={32} />, 
        color: "text-green-500", 
        bg: "bg-green-100 dark:bg-green-900/30" 
    },
    { 
        id: 7, 
        name: "Huyền thoại", 
        desc: "Top 1 Bảng xếp hạng", 
        condition: stats.rank === 1, 
        icon: <Crown size={32} />, 
        color: "text-orange-500", 
        bg: "bg-orange-100 dark:bg-orange-900/30" 
    },
    { 
        id: 8, 
        name: "Kiên trì", 
        desc: "Đăng nhập 7 ngày liên tiếp", 
        condition: false, 
        icon: <Flame size={32} />, 
        color: "text-rose-500", 
        bg: "bg-rose-100 dark:bg-rose-900/30" 
    },
    { 
        id: 9, 
        name: "Học giả", 
        desc: "Hoàn thành 1 khóa học", 
        condition: false, 
        icon: <BookOpen size={32} />, 
        color: "text-cyan-500", 
        bg: "bg-cyan-100 dark:bg-cyan-900/30" 
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Thành tích cá nhân
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Bộ sưu tập huy hiệu và thống kê thành tích của bạn.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Stats Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-dark-card border dark:border-dark-border p-6 rounded-lg shadow-sm">
             <h3 className="font-bold text-gray-800 dark:text-white mb-4">Tổng quan</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Xếp hạng</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">#{stats.rank}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Rating</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{stats.rating}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Đã giải</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{stats.solved}</span>
                </div>
                
                <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Tiến độ Rank</span>
                        <span className="text-blue-600 font-bold">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
                
                <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-1 italic">
                    {stats.rating < 1400 ? "Hãy cố gắng luyện tập thêm!" : "Bạn đang làm rất tốt!"}
                </p>
             </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="md:col-span-3">
           <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
               <span>Bộ sưu tập huy hiệu</span>
               <span className="text-sm font-normal text-gray-500">Đã mở khóa: {badges.filter(b => b.condition).length}/{badges.length}</span>
           </h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div 
                    key={badge.id} 
                    className={`bg-white dark:bg-dark-card border dark:border-dark-border p-6 rounded-lg shadow-sm flex flex-col items-center text-center transition-all group relative overflow-hidden
                        ${badge.condition 
                            ? 'hover:shadow-md cursor-pointer' 
                            : 'opacity-70 bg-gray-50 dark:bg-slate-800/50 grayscale-[0.8] hover:grayscale-0'
                        }`}
                >
                    {/* Icon */}
                    <div className={`p-4 rounded-full mb-3 transition-transform duration-300 group-hover:scale-110 
                        ${badge.condition ? `${badge.bg} ${badge.color}` : 'bg-gray-200 dark:bg-slate-700 text-gray-400'}`}>
                        {badge.condition ? badge.icon : <Lock size={32} />}
                    </div>
                    
                    {/* Info */}
                    <h4 className={`font-bold mb-1 ${badge.condition ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                        {badge.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{badge.desc}</p>

                    {/* Ribbon nếu mới mở khóa (Demo) */}
                    {badge.condition && badge.id === 1 && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    )}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for custom icon
const UserBadge = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);