import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import { supabase } from '../supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  // 1. Kiểm tra Session khi F5 hoặc mở web
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (session?.user) {
        // Delay nhẹ để tránh race condition với Trigger DB khi đăng ký mới
        setTimeout(() => fetchUserProfile(session.user.id, session.user.email!), 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Lấy thông tin User & Check quyền Admin
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // Lấy Profile (Tên, Avatar, Bio...)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Check bảng Admin gốc để xác định quyền lực thực sự
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      const finalRole = adminRecord ? 'admin' : (profile?.role || 'user');

      if (profile) {
        setCurrentUser({
          id: profile.id,
          email: profile.email || email,
          name: profile.name || email.split('@')[0],
          bio: profile.bio,
          avatar: profile.avatar, // <--- LẤY LINK ẢNH TỪ DB VỀ STATE
          passwordHash: '',
          role: finalRole as UserRole,
          createdAt: new Date(profile.created_at).getTime(),
          rating: profile.rating || 1200,
          solved: profile.solved || 0
        });
      } else {
        // Fallback nếu chưa có profile
        setCurrentUser({
           id: userId, email, name: email.split('@')[0], 
           role: adminRecord ? UserRole.ADMIN : UserRole.USER,
           createdAt: Date.now(), passwordHash: '', rating: 1200, solved: 0
        });
      }
    } catch (e) {
      console.error("Lỗi tải profile:", e);
    }
  };

  // 3. Hàm Update Profile (Hỗ trợ cả Avatar Link)
  const updateUser = async (data: { name?: string; bio?: string; avatar?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: "Chưa đăng nhập" };

    try {
      // Chỉ update những trường có dữ liệu gửi lên
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.bio !== undefined) updates.bio = data.bio;
      
      // QUAN TRỌNG: Nhận chuỗi URL (dù là link upload hay link mạng) và lưu vào DB
      if (data.avatar !== undefined) updates.avatar = data.avatar; 

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);
          
      if (error) throw error;

      // Cập nhật ngay lập tức vào State để giao diện đổi luôn
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 4. Các hàm Auth cơ bản
  const login = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
       if (error.message.includes('Invalid login')) setError('Sai email hoặc mật khẩu.');
       else setError(error.message);
       throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
    });
    if (error) {
        setError(error.message);
        throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    window.location.reload();
  };

  const changePassword = async (currentPass: string, newPass: string) => {
      if (!currentUser?.email) return { success: false, error: "Lỗi user" };
      // Verify mật khẩu cũ
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: currentUser.email, password: currentPass });
      if (signInError) return { success: false, error: "Mật khẩu cũ không đúng" };
      // Update mật khẩu mới
      const { error } = await supabase.auth.updateUser({ password: newPass });
      return error ? { success: false, error: error.message } : { success: true };
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, isAuthenticated: !!currentUser, 
      login, register, logout, updateUser, changePassword,
      error, clearError: () => setError(null),
      isLoginModalOpen, setLoginModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};