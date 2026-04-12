import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Save, Loader2, User, FileText, Link as LinkIcon, Shield } from 'lucide-react';
import { User as UserType } from '../../types';

interface EditUserModalProps {
    user: UserType;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatar: '',
        role: 'user'
    });

    // Load dữ liệu cũ của user vào form khi mở modal
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                role: user.role || 'user'
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Cập nhật bảng profiles
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: formData.name,
                    bio: formData.bio,
                    avatar: formData.avatar,
                    role: formData.role
                })
                .eq('id', user.id);

            if (error) throw error;

            // Nếu đổi role, cần đồng bộ sang bảng admins
            if (formData.role === 'admin') {
                // Thêm vào bảng admins nếu chưa có
                await supabase.from('admins').upsert({ id: user.id, username: formData.name });
            } else {
                // Xóa khỏi bảng admins nếu bị hạ cấp
                await supabase.from('admins').delete().eq('id', user.id);
            }

            alert("Cập nhật thông tin thành công!");
            onSuccess(); // Refresh lại danh sách bên ngoài
            onClose();   // Đóng modal

        } catch (error: any) {
            alert("Lỗi cập nhật: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden dark:bg-slate-800 dark:border dark:border-slate-700">
                
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <User size={20} className="text-blue-600"/> 
                        Chỉnh sửa thành viên
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors">
                        <X size={20}/>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Tên hiển thị */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Tên hiển thị</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {/* Bio / Giới thiệu */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Giới thiệu (Bio)</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                placeholder="Viết vài dòng giới thiệu..."
                            />
                        </div>
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Link Avatar (URL)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                value={formData.avatar}
                                onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>
                        {formData.avatar && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                <span>Preview:</span>
                                <img src={formData.avatar} alt="Preview" className="w-8 h-8 rounded-full object-cover border"/>
                            </div>
                        )}
                    </div>

                    {/* Vai trò */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Vai trò hệ thống</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <select 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="user">User (Thành viên thường)</option>
                                <option value="admin">Admin (Quản trị viên)</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-4 flex gap-3 border-t dark:border-slate-700 mt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Lưu thay đổi
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};