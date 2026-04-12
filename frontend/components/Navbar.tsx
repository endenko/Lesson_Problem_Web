import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FileCode, Users, Trophy, BookOpen, Moon, Sun, UserCircle, LogOut, ChevronDown, Puzzle, Settings, History, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const { isAuthenticated, currentUser, logout, setLoginModalOpen } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeClass = "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-blue-700 bg-blue-50 font-bold transition-all dark:bg-blue-900/30 dark:text-blue-400";
  const inactiveClass = "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all font-medium dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-blue-400";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md border-b sticky top-0 z-50 dark:bg-dark-card dark:border-dark-border transition-colors duration-300">
      <div className="w-full px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-4 flex-1 justify-start">
              <div className="animate-[spin_10s_linear_infinite] text-blue-500 shrink-0">
                <svg width="42" height="42" viewBox="-10.5 -9.45 21 18.9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="0" cy="0" r="2" fill="currentColor"></circle>
                  <g stroke="currentColor" strokeWidth="1" fill="none">
                    <ellipse rx="10" ry="4.5"></ellipse>
                    <ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse>
                    <ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse>
                  </g>
                </svg>
              </div>
              
              <div className="flex flex-col shrink-0">
                <Link to="/" className="flex flex-col">
                    <span className="text-3xl font-extrabold text-oj-blue tracking-tight leading-none dark:text-blue-400 transition-colors">CodeMaster</span>
                    <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase pl-0.5 dark:text-gray-400">Online Judge</span>
                </Link>
              </div>
          </div>

          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 shrink-0">
                <NavLink to="/" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  <Puzzle size={18} />
                  <span>BÀI TẬP</span>
                </NavLink>

                <NavLink to="/submissions" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  <FileCode size={18} />
                  <span>BÀI NỘP</span>
                </NavLink>
                
                <NavLink to="/lectures" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  <BookOpen size={18} />
                  <span>BÀI GIẢNG</span>
                </NavLink>

                <NavLink to="/members" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  <Users size={18} />
                  <span>THÀNH VIÊN</span>
                </NavLink>

                <NavLink to="/contests" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                  <Trophy size={18} />
                  <span>KỲ THI</span>
                </NavLink>
          </nav>

          <div className="flex items-center justify-end gap-3 flex-1">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors dark:text-yellow-400 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isAuthenticated && currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all group dark:hover:bg-slate-700 dark:hover:border-slate-600"
                >
                  {/* --- HIỂN THỊ AVATAR (UPDATE) --- */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow transition-shadow overflow-hidden border border-slate-200 dark:border-slate-600">
                    {currentUser.avatar ? (
                        <img 
                            src={currentUser.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => (e.currentTarget.style.display = 'none')} 
                        />
                    ) : (
                        <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  {/* -------------------------------- */}

                  <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-sm font-bold text-gray-700 leading-tight max-w-[120px] truncate dark:text-gray-200">{currentUser.name}</span>
                      <span className="text-[11px] text-gray-500 font-medium leading-tight dark:text-gray-400 capitalize">{currentUser.role}</span>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 dark:bg-dark-card dark:border-dark-border">
                    <div className="px-4 py-3 border-b bg-gray-50/50 dark:bg-slate-900/50 dark:border-dark-border">
                      <p className="text-sm font-bold text-gray-900 truncate dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 truncate dark:text-gray-400">{currentUser.email}</p>
                    </div>
                    
                    <div className="py-1">
                        {/* LINK ADMIN - CHỈ HIỆN NẾU LÀ ADMIN */}
                        {currentUser.role === UserRole.ADMIN && (
                            <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="flex px-4 py-2 text-sm text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 items-center gap-3 transition-colors border-l-4 border-purple-600 mb-1 dark:bg-purple-900/20 dark:text-purple-300">
                                <LayoutDashboard size={18} /> Trang Quản Trị
                            </Link>
                        )}

                        <Link to="/achievements" onClick={() => setIsDropdownOpen(false)} className="flex px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 items-center gap-3 transition-colors dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-blue-400">
                            <Trophy size={18} /> Thành tích
                        </Link>
                        <Link to="/history" onClick={() => setIsDropdownOpen(false)} className="flex px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 items-center gap-3 transition-colors dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-blue-400">
                            <History size={18} /> Lịch sử hoạt động
                        </Link>
                        <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="flex px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 items-center gap-3 transition-colors dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-blue-400">
                            <Settings size={18} /> Cài đặt hệ thống
                        </Link>
                    </div>

                    <div className="border-t py-1 dark:border-dark-border">
                        <button 
                        onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors dark:hover:bg-red-900/20"
                        >
                        <LogOut size={18} /> Đăng xuất
                        </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-2 bg-oj-blue text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-800 transition-transform active:scale-95 shadow-md shadow-blue-900/10 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <span>Đăng nhập</span>
                <UserCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};