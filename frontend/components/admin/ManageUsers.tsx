import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Loader2, Shield, User, Users, MoreVertical, Edit, Trash2, Key, UserPlus, X } from 'lucide-react';
import { User as UserType } from '../../types';
import { EditUserModal } from './EditUserModal';

// Component con: Menu Dropdown cho từng dòng
const UserActionMenu = ({ user, onAction }: { user: UserType, onAction: (type: string, user: UserType) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
                <MoreVertical size={18} />
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1 text-sm overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right dark:bg-slate-800 dark:border-slate-700">
                        <button 
                            onClick={() => { onAction('toggle_role', user); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Shield size={16} className="text-purple-500" />
                            {user.role === 'admin' ? 'Hạ cấp User' : 'Set Admin'}
                        </button>
                        <button 
                            onClick={() => { onAction('edit', user); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Edit size={16} className="text-blue-500" />
                            Sửa thông tin
                        </button>
                        <button 
                            onClick={() => { onAction('reset_password', user); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Key size={16} className="text-orange-500" />
                            Reset Mật khẩu
                        </button>
                        <div className="border-t border-slate-100 my-1 dark:border-slate-700"></div>
                        <button 
                            onClick={() => { onAction('delete', user); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-600 dark:hover:bg-red-900/20"
                        >
                            <Trash2 size={16} />
                            Xóa tài khoản
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // State cho form tạo mới
    const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) console.error(error);
        // @ts-ignore
        if (data) setUsers(data);
        setLoading(false);
    };

    // --- XỬ LÝ CÁC HÀNH ĐỘNG ---
    const handleAction = async (type: string, user: UserType) => {
        if (type === 'edit') {
            setEditingUser(user);
            return;
        }
        if (type === 'toggle_role') {
            const newRole = user.role === 'admin' ? 'user' : 'admin';
            if (!window.confirm(`Bạn có chắc muốn đổi quyền của ${user.name} thành ${newRole.toUpperCase()}?`)) return;

            // 1. Cập nhật bảng profiles
            const { error: profileErr } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
            
            // 2. Cập nhật bảng admins (Thêm vào hoặc Xóa đi)
            if (newRole === 'admin') {
                await supabase.from('admins').insert({ id: user.id, username: user.name, role: 'moderator' });
            } else {
                await supabase.from('admins').delete().eq('id', user.id);
            }

            if (profileErr) alert("Lỗi: " + profileErr.message);
            else fetchUsers();
        }

        if (type === 'delete') {
            if (!window.confirm(`CẢNH BÁO: Hành động này không thể hoàn tác!\nBạn có chắc muốn xóa tài khoản ${user.email}?`)) return;
            
            // Gọi RPC function (nếu có) hoặc xóa thủ công (Admin logs, admins, profiles, auth)
            // Ở đây ta xóa profile, trigger DB sẽ lo phần còn lại hoặc ta xóa lần lượt
            await supabase.from('admin_logs').delete().eq('admin_id', user.id); // Xóa log trước nếu là admin
            await supabase.from('admins').delete().eq('id', user.id);
            const { error } = await supabase.from('profiles').delete().eq('id', user.id);
            
            // Lưu ý: Xóa auth.users cần dùng Supabase Admin API ở Backend (Edge Function),
            // Client side không xóa được auth.users. Ở đây ta chỉ xóa profile để user không đăng nhập được vào App.
            
            if (error) alert("Lỗi xóa: " + error.message);
            else {
                alert("Đã xóa thông tin người dùng thành công.");
                fetchUsers();
            }
        }

        if (type === 'reset_password') {
            alert("Tính năng gửi email reset mật khẩu sẽ được cập nhật sau.");
        }
    };

    // --- TẠO USER MỚI ---
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: { data: { full_name: newUser.name } }
            });

            if (error) throw error;

            if (data.user) {
                // Nếu muốn set admin ngay lập tức
                if (newUser.role === 'admin') {
                    await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
                    await supabase.from('admins').insert({ id: data.user.id, username: newUser.name });
                }
                alert("Tạo tài khoản thành công!");
                setShowCreateModal(false);
                setNewUser({ email: '', password: '', name: '', role: 'user' });
                fetchUsers();
            }
        } catch (err: any) {
            alert("Lỗi tạo user: " + err.message);
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.email?.toLowerCase().includes(search.toLowerCase()) || 
        u.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Users size={28} className="text-blue-600" /> Quản lý Người dùng
                </h1>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                    <UserPlus size={18} /> Cấp tài khoản
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700 min-h-[400px]">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                            <th className="p-4 border-b dark:border-slate-700">User</th>
                            <th className="p-4 border-b dark:border-slate-700">Email</th>
                            <th className="p-4 border-b dark:border-slate-700">Vai trò</th>
                            <th className="p-4 border-b dark:border-slate-700 text-center">Solved</th>
                            <th className="p-4 border-b dark:border-slate-700 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Không tìm thấy user.</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{user.email}</td>
                                    <td className="p-4">
                                        {user.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                <Shield size={12} /> ADMIN
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                <User size={12} /> USER
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-400">{user.solved || 0}</td>
                                    <td className="p-4 text-right">
                                        <UserActionMenu user={user} onAction={handleAction} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL TẠO USER */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 dark:bg-slate-800 border dark:border-slate-700">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Cấp tài khoản mới</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Họ và tên</label>
                                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Email đăng nhập</label>
                                <input required type="email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Mật khẩu</label>
                                <input required type="password" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} minLength={6} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Vai trò</label>
                                <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                    value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                    <option value="user">Thành viên (User)</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">Hủy</button>
                                <button type="submit" disabled={creating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2">
                                    {creating && <Loader2 size={16} className="animate-spin" />} Tạo tài khoản
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* 4. CHÈN MODAL SỬA USER VÀO CUỐI CÙNG */}
            {editingUser && (
                <EditUserModal 
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        fetchUsers(); // Tải lại danh sách sau khi sửa xong
                        setEditingUser(null);
                    }}
                />
            )}
        </div>
    );
};