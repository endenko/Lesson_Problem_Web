import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { Loader2, ShieldAlert } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminPermission = async () => {
      // 1. Kiểm tra đăng nhập cơ bản (Client State)
      if (!isAuthenticated || !currentUser) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        // 2. KIỂM TRA "THẺ BÀI" TRONG BẢNG ADMINS (Server Check)
        // Thay vì check bảng 'profiles', ta check thẳng vào bảng 'admins'
        // Đây là bảng chứa các sếp sòng (Gia Cát Lượng, Tào Tháo...)
        const { data: adminRecord, error } = await supabase
          .from('admins') // <--- QUAN TRỌNG: Check bảng admins
          .select('id, role')
          .eq('id', currentUser.id)
          .maybeSingle(); // Dùng maybeSingle để không báo lỗi đỏ nếu không tìm thấy

        if (error) {
          console.error("Lỗi kiểm tra quyền Admin:", error);
          setIsAuthorized(false);
        } else if (adminRecord) {
          // 3. Nếu tìm thấy ID trong bảng admins -> Cho phép vào
          setIsAuthorized(true);
        } else {
          // 4. Nếu không tìm thấy -> Không phải admin -> Chặn
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error("System Error:", err);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminPermission();
  }, [isAuthenticated, currentUser]);

  // --- GIAO DIỆN LOADING ---
  if (isLoading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-500 font-medium animate-pulse">Đang xác minh quyền lực...</p>
          </div>
      );
  }

  // --- GIAO DIỆN CHẶN (Nếu không được phép) ---
  if (!isAuthorized) {
    // Tùy chọn: Bạn có thể render một trang "403 Forbidden" đẹp mắt ở đây
    // Hoặc đơn giản là đá về trang chủ như hiện tại
    return <Navigate to="/" replace />;
  }

  // --- CHO PHÉP ĐI TIẾP ---
  return <Outlet />;
};