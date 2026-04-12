
import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Member } from '../types';
import { Award, Medal, Loader2, Trophy } from 'lucide-react';
import { MOCK_MEMBERS } from '../constants';

const MemberAvatar: React.FC<{ src: string | null; name: string; className: string }> = ({ src, name, className }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(src);
    const [hasError, setHasError] = useState(false);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=128&bold=true`;

    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
    }, [src]);

    return (
        <img 
            src={!hasError && imgSrc ? imgSrc : fallbackUrl} 
            alt={name} 
            className={className}
            onError={() => setHasError(true)}
        />
    );
};

export const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      // 1. Try Supabase
      if (isSupabaseConfigured()) {
          try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('rating', { ascending: false })
                .limit(100);

            if (error) throw error;

            if (data && data.length > 0) {
                const formattedData = data.map((item: any, index: number) => ({
                    id: item.id,
                    rank: index + 1,
                    name: item.name || item.email.split('@')[0],
                    avatar: item.avatar,
                    quote: item.quote,
                    rating: item.rating || 0,
                    solved: item.solved || 0,
                    country: item.country || 'VN'
                }));
                setMembers(formattedData);
                setLoading(false);
                return;
            }
          } catch (err: any) {
              console.warn("Lỗi fetch Members (có thể do Policy Recursion), dùng Mock Data", err.message || JSON.stringify(err));
          }
      }

      // 2. Fallback Mock Data
      setMembers(MOCK_MEMBERS);
      setUsingMockData(true);
      setLoading(false);
    };

    fetchMembers();
  }, []);
  
  // Helper for mock state setter which was misnamed in original file
  const setUsingMockData = setUsingMock;

  const topMembers = members.slice(0, 5);
  const otherMembers = members.slice(5);

  if (loading) {
     return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
     );
  }

  return (
    <div className="space-y-12 pb-10">
      
      {/* Thông báo nếu đang dùng Mock */}
      {usingMock && (
          <div className="text-center text-xs text-orange-500 bg-orange-50 py-2 border-b border-orange-100 dark:bg-orange-900/20 dark:border-orange-900">
              Hệ thống đang bảo trì kết nối cơ sở dữ liệu. Hiển thị danh sách mẫu.
          </div>
      )}

      {/* --- HERO SECTION: TOP RANKING --- */}
      {topMembers.length > 0 && (
      <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl -z-10 opacity-90 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-yellow-500/20 blur-[100px] rounded-full"></div>
          </div>

          <div className="px-2 py-12 md:py-16 text-center">
              <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2 drop-shadow-sm uppercase tracking-wider">
                  Bảng Vàng Thành Tích
              </h2>
              <p className="text-blue-100 font-medium mb-12 max-w-2xl mx-auto">
                  Vinh danh những lập trình viên xuất sắc nhất.
              </p>

              <div className="flex flex-wrap md:flex-nowrap justify-center items-end gap-3 md:gap-4">
                  {topMembers.map((member) => {
                      let cardStyle = "";
                      let ringColor = "";
                      let badgeColor = "";
                      let heightClass = "";
                      let orderClass = "";

                      if (member.rank === 1) {
                          cardStyle = "bg-gradient-to-b from-yellow-500 to-yellow-700 shadow-yellow-500/50 scale-105 z-20";
                          ringColor = "ring-yellow-300";
                          badgeColor = "text-yellow-100";
                          heightClass = "h-[310px] w-[210px]"; 
                          orderClass = "order-3"; 
                      } else if (member.rank === 2) {
                          cardStyle = "bg-gradient-to-b from-slate-300 to-slate-500 shadow-slate-400/50 z-10";
                          ringColor = "ring-slate-200";
                          badgeColor = "text-slate-100";
                          heightClass = "h-[270px] w-[180px]";
                          orderClass = "order-2"; 
                      } else if (member.rank === 3) {
                          cardStyle = "bg-gradient-to-b from-orange-400 to-orange-700 shadow-orange-500/50 z-10";
                          ringColor = "ring-orange-300";
                          badgeColor = "text-orange-100";
                          heightClass = "h-[270px] w-[180px]";
                          orderClass = "order-4";
                      } else {
                          cardStyle = "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20";
                          ringColor = "ring-blue-300/50";
                          badgeColor = "text-blue-100";
                          heightClass = "h-[240px] w-[160px]";
                          orderClass = member.rank === 4 ? "order-1" : "order-5";
                      }

                      return (
                          <div 
                            key={member.id} 
                            className={`${orderClass} ${heightClass} ${cardStyle} rounded-2xl shadow-xl flex flex-col items-center p-3 transition-all duration-300 hover:-translate-y-2 relative group shrink-0`}
                          >
                              <div className="absolute -top-4">
                                  {member.rank <= 3 ? (
                                      <div className="relative">
                                          <Trophy size={member.rank === 1 ? 44 : 36} className={member.rank === 1 ? 'text-yellow-300 drop-shadow-lg' : member.rank === 2 ? 'text-slate-300' : 'text-orange-300'} fill="currentColor" />
                                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] font-bold text-black text-[10px]">
                                              {member.rank}
                                          </span>
                                      </div>
                                  ) : (
                                      <div className="bg-blue-900/80 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold border border-blue-500 text-sm">
                                          {member.rank}
                                      </div>
                                  )}
                              </div>

                              <div className={`mt-8 mb-2 rounded-full p-1 bg-white/20 ${member.rank === 1 ? 'animate-pulse' : ''}`}>
                                  <MemberAvatar 
                                      src={member.avatar} 
                                      name={member.name} 
                                      className={`rounded-full object-cover border-4 ${ringColor} ${member.rank === 1 ? 'w-20 h-20' : 'w-16 h-16'}`}
                                  />
                              </div>

                              <h3 className={`font-bold text-center leading-tight mb-1 truncate w-full px-1 ${member.rank <= 3 ? 'text-white text-base' : 'text-blue-100 text-sm'}`}>
                                  {member.name}
                              </h3>
                              {member.rank <= 5 && member.quote && (
                                  <p className={`text-[10px] text-center italic opacity-80 mb-2 line-clamp-2 px-1 ${badgeColor}`}>
                                      "{member.quote}"
                                  </p>
                              )}

                              <div className="mt-auto bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm border border-white/10 flex items-center gap-2 w-full justify-center">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[9px] uppercase text-white/60 font-semibold tracking-wider">Rating</span>
                                      <span className="font-bold text-white text-xs">{member.rating}</span>
                                  </div>
                                  <div className="w-px h-5 bg-white/20"></div>
                                  <div className="flex flex-col items-center">
                                      <span className="text-[9px] uppercase text-white/60 font-semibold tracking-wider">Solved</span>
                                      <span className="font-bold text-white text-xs">{member.solved}</span>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
      )}

      {/* --- LIST SECTION: TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden dark:bg-dark-card dark:border-dark-border">
          <div className="p-6 border-b flex justify-between items-center dark:border-dark-border bg-slate-900 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  BẢNG XẾP HẠNG THÀNH VIÊN
              </h3>
          </div>
          
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-800 text-slate-300 text-sm uppercase">
                      <tr>
                          <th className="px-6 py-4 font-bold w-20 text-center">#</th>
                          <th className="px-6 py-4 font-bold">THÀNH VIÊN</th>
                          <th className="px-6 py-4 font-bold text-center">RATING</th>
                          <th className="px-6 py-4 font-bold text-center">BÀI GIẢI</th>
                          <th className="px-6 py-4 font-bold text-center">QUỐC GIA</th>
                          <th className="px-6 py-4 font-bold text-right">THÀNH TÍCH</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                      {otherMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-blue-50/50 transition-colors group dark:hover:bg-slate-700/30">
                              <td className="px-6 py-4 text-center font-bold text-gray-500 dark:text-gray-400">
                                  {member.rank}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 dark:bg-slate-600">
                                           <MemberAvatar 
                                              src={member.avatar} 
                                              name={member.name}
                                              className="w-full h-full object-cover"
                                           />
                                      </div>
                                      <div>
                                          <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors dark:text-gray-200 dark:group-hover:text-blue-400">
                                              {member.name}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">Member</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <span className="font-bold text-orange-600 dark:text-orange-400">{member.rating}</span>
                              </td>
                              <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-gray-300">
                                  {member.solved}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                                      {member.country}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-1">
                                      <Medal size={16} className="text-gray-400" />
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {otherMembers.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-4 text-gray-500">Chưa có dữ liệu</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
