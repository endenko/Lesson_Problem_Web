
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Trophy, Plus, Edit, Trash2, Save, X, Search, Loader2, Calendar, Clock } from 'lucide-react';
import { Contest } from '../../types';

export const ManageContests: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form Data
    const initialFormState = { 
        id: '', 
        title: '', 
        description: '', 
        start_time: '', 
        end_time: '',
        participants_count: 0
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contests')
            .select('*')
            .order('start_time', { ascending: false });
        
        if (data) setContests(data as Contest[]);
        setLoading(false);
    };

    const handleOpenModal = (contest?: Contest) => {
        if (contest) {
            // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm) for input
            const formatForInput = (isoString: string) => {
                if (!isoString) return '';
                const date = new Date(isoString);
                // Adjust for timezone offset if needed, or use simple substring if stored as UTC but wanted in local
                // Simple trick for local time input:
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
                return localISOTime;
            };

            setFormData({
                id: contest.id,
                title: contest.title,
                description: contest.description || '',
                start_time: formatForInput(contest.start_time),
                end_time: formatForInput(contest.end_time),
                participants_count: contest.participants_count || 0
            });
        } else {
            setFormData({ ...initialFormState, start_time: '', end_time: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.start_time || !formData.end_time) {
            return alert("Vui lòng nhập đầy đủ Tên, Thời gian bắt đầu và kết thúc.");
        }

        if (new Date(formData.start_time) >= new Date(formData.end_time)) {
            return alert("Thời gian kết thúc phải sau thời gian bắt đầu.");
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
            };

            if (formData.id) {
                // Update
                const { error } = await supabase.from('contests').update(payload).eq('id', formData.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase.from('contests').insert([payload]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchContests();
        } catch (error: any) {
            alert("Lỗi lưu kỳ thi: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa kỳ thi này?")) return;
        const { error } = await supabase.from('contests').delete().eq('id', id);
        if (error) alert("Lỗi xóa: " + error.message);
        else fetchContests();
    };

    const filteredContests = contests.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    // Helper formatter
    const formatDate = (iso: string) => new Date(iso).toLocaleString('vi-VN');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Trophy className="text-yellow-600" /> Quản lý Kỳ thi
                </h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                    <Plus size={20} /> Tạo kỳ thi
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm kỳ thi..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white" 
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                            <th className="p-4 border-b dark:border-slate-700">Tên kỳ thi</th>
                            <th className="p-4 border-b dark:border-slate-700">Bắt đầu</th>
                            <th className="p-4 border-b dark:border-slate-700">Kết thúc</th>
                            <th className="p-4 border-b dark:border-slate-700 text-center">Trạng thái</th>
                            <th className="p-4 border-b dark:border-slate-700 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                        ) : filteredContests.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có dữ liệu kỳ thi.</td></tr>
                        ) : (
                            filteredContests.map(c => {
                                const now = new Date();
                                const start = new Date(c.start_time);
                                const end = new Date(c.end_time);
                                let statusBadge;
                                if (now < start) statusBadge = <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded border border-blue-200">Sắp tới</span>;
                                else if (now >= start && now <= end) statusBadge = <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded border border-green-200 animate-pulse">Đang diễn ra</span>;
                                else statusBadge = <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">Kết thúc</span>;

                                return (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{c.title}</td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(c.start_time)}</td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(c.end_time)}</td>
                                        <td className="p-4 text-center">{statusBadge}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => handleOpenModal(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/30"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/30"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b flex justify-between items-center dark:border-slate-700">
                            <h2 className="text-xl font-bold dark:text-white">{formData.id ? 'Cập nhật Kỳ thi' : 'Tạo Kỳ thi mới'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-500 hover:text-red-500 transition-colors" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1 dark:text-white">Tên kỳ thi</label>
                                <input 
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                    value={formData.title} 
                                    onChange={e => setFormData({...formData, title: e.target.value})} 
                                    placeholder="VD: Weekly Contest #100"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-white flex items-center gap-1"><Calendar size={14} /> Bắt đầu</label>
                                    <input 
                                        type="datetime-local"
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm"
                                        value={formData.start_time} 
                                        onChange={e => setFormData({...formData, start_time: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-white flex items-center gap-1"><Clock size={14} /> Kết thúc</label>
                                    <input 
                                        type="datetime-local"
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white text-sm"
                                        value={formData.end_time} 
                                        onChange={e => setFormData({...formData, end_time: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 dark:text-white">Mô tả ngắn</label>
                                <textarea 
                                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-600 dark:text-white h-24 resize-none"
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Thông tin về kỳ thi, quy định, giải thưởng..."
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl dark:bg-slate-900 dark:border-slate-700">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-800">Hủy</button>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving} 
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManageContests;