import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form params
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0); // Đếm số lần đăng nhập sai
  
  // Quản lý trạng thái Popup lỗi (Dialog)
  const [errorPopup, setErrorPopup] = useState<{
    show: boolean;
    type: 'normal' | 'max_attempts' | 'register_error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'normal',
    title: '',
    message: ''
  });

  const { login, register, clearError } = useAuth();

  // Reset state khi mở/đóng modal
  useEffect(() => {
    if (isOpen) {
      clearError();
      setErrorPopup({ show: false, type: 'normal', title: '', message: '' });
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;

    setLoading(true);
    // Ẩn popup cũ
    setErrorPopup(prev => ({ ...prev, show: false }));

    try {
      if (isLogin) {
        // --- LOGIC ĐĂNG NHẬP ---
        await login(email, password);
        onClose();
        setLoginAttempts(0); // Reset số lần sai khi thành công
      } else {
        // --- LOGIC ĐĂNG KÝ ---
        await register(name, email, password);
        onClose();
      }
    } catch (err: any) {
      console.error("AuthModal Catch Error:", err);

      let errorMessage = err.message || "Đã xảy ra lỗi không xác định.";
      
      // Dịch lỗi sang tiếng Việt để hiển thị trên Popup
      if (errorMessage.includes("Invalid login credentials")) {
          errorMessage = "Sai tên đăng nhập hoặc mật khẩu.";
      } else if (errorMessage.includes("Database error")) {
          errorMessage = "Lỗi kết nối cơ sở dữ liệu.";
      } else if (errorMessage.includes("Email not confirmed")) {
          errorMessage = "Vui lòng xác thực email trước khi đăng nhập.";
      }

      if (isLogin) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          // Trường hợp sai quá 5 lần -> Gợi ý đăng ký
          setErrorPopup({
            show: true,
            type: 'max_attempts',
            title: 'Đăng nhập thất bại nhiều lần',
            message: 'Có vẻ bạn chưa có tài khoản hoặc đã quên mật khẩu. Bạn có muốn đăng ký tài khoản mới không?'
          });
        } else {
          // Trường hợp sai bình thường -> Thông báo lỗi chuẩn
          // QUAN TRỌNG: Phải set show: true ở đây để hiện Popup
          setErrorPopup({
            show: true,
            type: 'normal',
            title: 'Lỗi đăng nhập',
            message: errorMessage 
          });
        }
      } else {
        // Lỗi khi đăng ký
        if (errorMessage.includes("already registered")) {
            errorMessage = "Email này đã được sử dụng.";
        }
        setErrorPopup({
            show: true,
            type: 'register_error',
            title: 'Đăng ký thất bại',
            message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuyển sang trang đăng ký từ popup lỗi
  const switchToRegister = () => {
    setErrorPopup(prev => ({ ...prev, show: false }));
    setIsLogin(false);
    setLoginAttempts(0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative dark:bg-dark-card dark:border dark:border-slate-700">
        
        {/* --- ERROR POPUP DIALOG (OVERLAY) --- */}
        {/* Lớp phủ này nằm đè lên toàn bộ nội dung modal, chặn thao tác */}
        {errorPopup.show && (
             <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-200 dark:bg-slate-900/95">
                 <div className={`p-4 rounded-full mb-6 shadow-sm ${errorPopup.type === 'max_attempts' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                    {errorPopup.type === 'max_attempts' ? <AlertTriangle size={48} /> : <AlertCircle size={48} />}
                 </div>
                 
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{errorPopup.title}</h3>
                 <p className="text-base text-gray-600 mb-8 leading-relaxed dark:text-gray-300 px-2">{errorPopup.message}</p>

                 <div className="w-full flex flex-col gap-3">
                    {errorPopup.type === 'max_attempts' ? (
                        <>
                            <button 
                                onClick={switchToRegister}
                                className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                Đăng ký tài khoản mới
                            </button>
                            <button 
                                onClick={() => setErrorPopup(prev => ({...prev, show: false}))}
                                className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-base hover:bg-gray-50 transition-colors dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-800"
                            >
                                Thử lại
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setErrorPopup(prev => ({...prev, show: false}))}
                            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                        >
                            OK
                        </button>
                    )}
                 </div>
             </div>
        )}

        {/* HEADER */}
        <div className="bg-oj-blue p-5 flex justify-between items-center text-white dark:bg-blue-900">
          <h2 className="text-lg font-bold tracking-wide">{isLogin ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* MAIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5 dark:text-gray-300">Họ tên</label>
                 <div className="relative group">
                    <User className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400" 
                      placeholder="Nguyễn Văn A" 
                      value={name}
                      onChange={(e) => setName(e.target.value)} 
                      required
                    />
                 </div>
              </div>
            )}

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1.5 dark:text-gray-300">Email</label>
               <div className="relative group">
                  <Mail className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400" 
                    placeholder="user@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1.5 dark:text-gray-300">Mật khẩu</label>
               <div className="relative group">
                  <Lock className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    minLength={6}
                  />
               </div>
            </div>
            
            {isLogin && (
                <div className="flex justify-end">
                    <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400">Quên mật khẩu?</button>
                </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-oj-blue hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
            >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? 'Bạn chưa có tài khoản? ' : 'Bạn đã có tài khoản? '}
              <button 
                  onClick={() => {
                      setIsLogin(!isLogin);
                      setLoginAttempts(0);
                      setErrorPopup(prev => ({ ...prev, show: false }));
                  }}
                  className="text-blue-600 font-bold hover:underline ml-1 dark:text-blue-400"
              >
                  {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};