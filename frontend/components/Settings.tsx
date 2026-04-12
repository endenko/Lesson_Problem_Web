import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Camera, Loader2, CheckCircle2, AlertTriangle, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export const Settings: React.FC = () => {
  const { currentUser, updateUser, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  
  const [msg, setMsg] = useState({ type: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  // State Account
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // State Security
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatar || '');
    }
  }, [currentUser]);

  // Xử lý upload ảnh từ máy
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser?.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);
    setMsg({ type: '', content: '' });

    try {
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        setAvatarUrl(data.publicUrl);
        setMsg({ type: 'success', content: 'Tải ảnh lên thành công! Hãy bấm Lưu.' });
    } catch (error: any) {
        setMsg({ type: 'error', content: 'Lỗi tải ảnh: ' + error.message });
    } finally {
        setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (currentUser) {
      setIsSaving(true);
      setMsg({ type: '', content: '' });

      const result = await updateUser({ name, bio, avatar: avatarUrl });
      setIsSaving(false);
      
      if (result.success) {
        setMsg({ type: 'success', content: 'Đã cập nhật hồ sơ thành công!' });
      } else {
        setMsg({ type: 'error', content: result.error || 'Có lỗi xảy ra.' });
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      // ... (Logic đổi pass giữ nguyên như cũ) ...
      setMsg({ type: '', content: '' });
      if (!currentPass || !newPass || !confirmPass) {
          setMsg({ type: 'error', content: 'Vui lòng điền đủ thông tin.' }); return;
      }
      if (newPass !== confirmPass) {
          setMsg({ type: 'error', content: 'Mật khẩu mới không khớp.' }); return;
      }
      if (newPass.length < 6) {
          setMsg({ type: 'error', content: 'Mật khẩu phải > 6 ký tự.' }); return;
      }

      setIsSaving(true);
      // @ts-ignore
      const result = await changePassword(currentPass, newPass);
      setIsSaving(false);

      if (result.success) {
          setMsg({ type: 'success', content: 'Đổi mật khẩu thành công!' });
          setCurrentPass(''); setNewPass(''); setConfirmPass('');
      } else {
          setMsg({ type: 'error', content: result.error });
      }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <SettingsIcon className="text-gray-600 dark:text-gray-300" /> Cài đặt tài khoản
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin cá nhân và bảo mật.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
         {/* Sidebar */}
         <div className="md:col-span-1">
             <div className="bg-white dark:bg-dark-card border dark:border-dark-border rounded-lg shadow-sm overflow-hidden sticky top-24">
                 <button onClick={() => {setActiveTab('account'); setMsg({type:'', content:''})}} className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'account' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300'}`}>
                     <User size={18} /> Hồ sơ cá nhân
                 </button>
                 <button onClick={() => {setActiveTab('security'); setMsg({type:'', content:''})}} className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300'}`}>
                     <Lock size={18} /> Bảo mật
                 </button>
             </div>
         </div>

         {/* Content */}
         <div className="md:col-span-3">
             <div className="bg-white dark:bg-dark-card border dark:border-dark-border rounded-lg shadow-sm p-6 min-h-[400px]">
                 
                 {msg.content && (
                     <div className={`mb-6 px-4 py-3 rounded flex items-center gap-2 animate-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                         {msg.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
                         {msg.content}
                     </div>
                 )}

                 {/* TAB ACCOUNT */}
                 {activeTab === 'account' && (
                     <div className="space-y-8 animate-in fade-in duration-300">
                         <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b pb-2 dark:border-slate-700">Thông tin chung</h3>
                         
                         {/* --- KHU VỰC AVATAR (UPDATE: THÊM Ô NHẬP LINK) --- */}
                         <div className="flex flex-col sm:flex-row items-start gap-6">
                             <div className="relative group shrink-0">
                                 <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 dark:bg-slate-700 dark:border-slate-600">
                                     {avatarUrl ? (
                                         <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-4xl">
                                             {name?.charAt(0)?.toUpperCase()}
                                         </div>
                                     )}
                                     {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="text-white animate-spin" size={32} /></div>}
                                 </div>
                                 <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-transform hover:scale-110 border-2 border-white dark:border-slate-800" title="Tải ảnh lên">
                                     <Camera size={16} />
                                     <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                                 </label>
                             </div>
                             
                             <div className="flex-1 space-y-4 w-full">
                                 <div>
                                     <h4 className="font-bold text-xl text-gray-800 dark:text-white">{name}</h4>
                                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ảnh đại diện giúp nhận diện bạn tốt hơn.</p>
                                 </div>

                                 {/* Ô NHẬP LINK ẢNH */}
                                 <div className="relative max-w-md">
                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                         <LinkIcon size={16} className="text-gray-400" />
                                     </div>
                                     <input 
                                         type="text" 
                                         className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white transition-all"
                                         placeholder="Hoặc dán đường dẫn ảnh (URL) vào đây..."
                                         value={avatarUrl}
                                         onChange={(e) => setAvatarUrl(e.target.value)}
                                     />
                                 </div>
                             </div>
                         </div>

                         {/* Form Info */}
                         <div className="grid gap-6 max-w-xl">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên hiển thị</label>
                                 <input type="text" className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={name} onChange={(e) => setName(e.target.value)} />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                 <input type="email" className="w-full px-4 py-2.5 border rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-800 dark:border-slate-700 cursor-not-allowed" value={currentUser?.email || ''} disabled />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                 <textarea className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                             </div>
                             <div className="pt-2">
                                 <button onClick={handleUpdateProfile} disabled={isSaving || isUploading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30">
                                     {isSaving && <Loader2 size={18} className="animate-spin" />} Lưu thay đổi
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* TAB SECURITY */}
                 {activeTab === 'security' && (
                     <div className="space-y-8 animate-in fade-in duration-300">
                         <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b pb-2 dark:border-slate-700">Đổi mật khẩu</h3>
                         <form onSubmit={handleChangePassword} className="grid gap-6 max-w-xl">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu hiện tại</label>
                                 <div className="relative">
                                     <input type={showPass ? "text" : "password"} className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="Nhập mật khẩu cũ" />
                                     <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                                 <input type={showPass ? "text" : "password"} className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Ít nhất 6 ký tự" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nhập lại mật khẩu mới</label>
                                 <input type={showPass ? "text" : "password"} className="w-full px-4 py-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Xác nhận lại mật khẩu" />
                             </div>
                             <div className="pt-2">
                                 <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-500/30">
                                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                     {isSaving ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                 </button>
                             </div>
                         </form>
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};