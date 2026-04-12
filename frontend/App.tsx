
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import { Navbar } from './components/Navbar';
import { ProblemList } from './components/ProblemList';
import { Sidebar } from './components/Sidebar';
import { LectureList } from './components/LectureList';
import { LectureSidebar } from './components/LectureSidebar';
import { AuthModal } from './components/AuthModal';
import { ContestList } from './components/ContestList';
import { SubmissionList } from './components/SubmissionList';
import { SubmissionSidebar } from './components/SubmissionSidebar';
import { ProblemDetail } from './components/ProblemDetail';
import { LectureDetail } from './components/LectureDetail';
import { ContestDetail } from './components/ContestDetail';
import { MemberList } from './components/MemberList';
import { Terms } from './components/Terms';
import { Privacy } from './components/Privacy';
import { Contact } from './components/Contact';
import { Achievements } from './components/Achievements';
import { ActivityHistory } from './components/ActivityHistory';
import { Settings } from './components/Settings';
import { Member } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ChatWidget } from './components/ChatWidget';

// Admin Components
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManageProblems } from './components/admin/ManageProblems';
import { ManageUsers } from './components/admin/ManageUsers';
import { ManageLectures } from './components/admin/ManageLectures';
import { ManageContests } from './components/admin/ManageContests';

const AppContent: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen } = useAuth();
  const location = useLocation();
  const [topRankers, setTopRankers] = useState<Member[]>([]);

  // Check if we are in admin section
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Page Logic
  const isSubmissionPage = location.pathname === '/submissions';
  const isLecturePage = location.pathname === '/lectures'; 
  const isProblemDetailPage = location.pathname.startsWith('/problem/');
  const isLectureDetailPage = location.pathname.startsWith('/lectures/');
  const isContestDetailPage = location.pathname.startsWith('/contest/');
  const isInfoPage = ['/terms', '/privacy', '/contact'].includes(location.pathname);
  const isProfilePage = ['/achievements', '/history', '/settings'].includes(location.pathname);
  
  // Các trang Full Width (không có Sidebar bên phải)
  const isFullWidthPage = isProblemDetailPage || isLectureDetailPage || isContestDetailPage || location.pathname === '/members' || isInfoPage || isProfilePage;

  useEffect(() => {
    const fetchTopRankers = async () => {
        if (!isSupabaseConfigured()) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, rating')
                .order('rating', { ascending: false })
                .limit(3);
            
            if (!error && data) {
                setTopRankers(data as Member[]);
            }
        } catch (e) {
            console.error(e);
        }
    };
    fetchTopRankers();
  }, []);

  // Nếu đang ở trang Admin, render riêng không dùng chung Layout chính
  if (isAdminRoute) {
    return (
        <div className="min-h-screen text-[#333] dark:text-dark-text transition-colors duration-300">
            <Routes>
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="problems" element={<ManageProblems />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="lectures" element={<ManageLectures />} />
                        <Route path="contests" element={<ManageContests />} />
                    </Route>
                </Route>
            </Routes>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-[#333] dark:text-dark-text transition-colors duration-300 relative">
      <Navbar />

      <main className="flex-grow container w-full px-6 lg:px-10 py-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className={isFullWidthPage ? "lg:col-span-12" : "lg:col-span-9 order-2 lg:order-1"}>
            <Routes>
              <Route path="/" element={<ProblemList />} />
              <Route path="/problem/:id" element={<ProblemDetail />} />
              <Route path="/lectures" element={<LectureList />} />
              <Route path="/lectures/:id" element={<LectureDetail />} />
              <Route path="/contests" element={<ContestList />} />
              <Route path="/contest/:id" element={<ContestDetail />} />
              <Route path="/submissions" element={<SubmissionList />} />
              <Route path="/members" element={<MemberList />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/history" element={<ActivityHistory />} />
              <Route path="/settings" element={<Settings />} />

              <Route path="*" element={
                  <div className="text-center py-20 bg-white dark:bg-dark-card rounded shadow border dark:border-dark-border transition-colors">
                    <h2 className="text-xl text-gray-500 dark:text-dark-text-muted">Trang này không tồn tại</h2>
                    <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">Về trang chủ</Link>
                  </div>
              } />
            </Routes>
          </div>

          {!isFullWidthPage && (
            <div className="lg:col-span-3 order-1 lg:order-2">
              {isSubmissionPage ? (
                <SubmissionSidebar />
              ) : isLecturePage ? (
                <LectureSidebar />
              ) : (
                <>
                  <Sidebar />
                  {topRankers.length > 0 && (
                  <div className="mt-6 bg-white dark:bg-dark-card p-4 rounded-lg shadow-sm border dark:border-dark-border transition-colors">
                      <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-2 border-b dark:border-dark-border pb-2">Top xếp hạng</h4>
                      <ul className="space-y-2 text-sm">
                          {topRankers.map((member) => (
                             <li key={member.id} className="flex justify-between">
                                 <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[140px]">{member.name}</span>
                                 <span className="text-gray-500 dark:text-gray-400">{member.rating} Rating</span>
                             </li>
                          ))}
                      </ul>
                  </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </main>

      <footer className="bg-white dark:bg-dark-card border-t dark:border-dark-border py-6 mt-8 transition-colors">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} CodeMaster Online Judge. All rights reserved.</p>
              <div className="mt-2 flex justify-center gap-4">
                  <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">Điều khoản</Link>
                  <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">Bảo mật</Link>
                  <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Liên hệ</Link>
              </div>
          </div>
      </footer>

      {/* GLOBAL CHAT WIDGET */}
      <ChatWidget />

      <AuthModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setLoginModalOpen(false)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
