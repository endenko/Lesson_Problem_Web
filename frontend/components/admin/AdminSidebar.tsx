
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, FileCode, BookOpen, Users, Trophy, LogOut, Home, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium mb-1.5 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed h-full z-20 shadow-2xl">
        {/* Header Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950 shrink-0">
           <Link to="/admin" className="text-xl font-bold text-white tracking-wide flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-extrabold text-white shadow-lg">A</div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Admin</span>
           </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            
            {/* Group 1 */}
            <div>
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tổng quan</p>
                <NavLink to="/admin" end className={navItemClass}>
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>
            </div>

            {/* Group 2 */}
            <div>
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Quản lý Học tập</p>
                <NavLink to="/admin/problems" className={navItemClass}>
                    <FileCode size={18} /> Bài tập (Problems)
                </NavLink>
                <NavLink to="/admin/lectures" className={navItemClass}>
                    <BookOpen size={18} /> Bài giảng (Lectures)
                </NavLink>
                <NavLink to="/admin/contests" className={navItemClass}>
                    <Trophy size={18} /> Kỳ thi (Contests)
                </NavLink>
            </div>

            {/* Group 3 */}
            <div>
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Hệ thống</p>
                <NavLink to="/admin/users" className={navItemClass}>
                    <Users size={18} /> Người dùng (Users)
                </NavLink>
                <NavLink to="/settings" className={navItemClass}>
                    <Settings size={18} /> Cài đặt chung
                </NavLink>
            </div>

        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors font-medium text-sm">
                <Home size={18} /> Xem trang chủ
            </Link>
            <button 
                onClick={() => { logout(); window.location.href='/'; }} 
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors font-medium text-sm"
            >
                <LogOut size={18} /> Đăng xuất
            </button>
        </div>
    </aside>
  );
};
