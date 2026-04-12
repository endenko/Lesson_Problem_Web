
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Edit, Trash2, Save, X, Search, Loader2, ListPlus } from 'lucide-react';
import { Problem } from '../../types';

// Extend Type for Admin usage (Supabase format compatibility)
interface AdminProblem extends Problem {
    description: string;
    input_format: string;
    output_format: string;
    hint: string;
    tags: string[];
    examples: { input: string; output: string; note?: string }[];
    test_cases?: any[]; // Hidden mostly
}

export const ManageProblems: React.FC = () => {
    const [problems, setProblems] = useState<AdminProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    // Form Data
    const initialFormState: Partial<AdminProblem> = {
        name: '', code: '', type: 'Standard', score: 100, 
        description: '', input_format: '', output_format: '', hint: '',
        tags: [], examples: [{ input: '', output: '' }]
    };
    const [formData, setFormData] = useState<Partial<AdminProblem>>(initialFormState);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('problems')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) console.error(error);
        if (data) setProblems(data as AdminProblem[]);
        setLoading(false);
    };

    const handleOpenModal = (problem?: AdminProblem) => {
        if (problem) {
            setEditMode(true);
            setFormData(problem);
        } else {
            setEditMode(false);
            setFormData({ ...initialFormState });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code) return alert("Vui lòng nhập tên và mã bài!");
        
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                updated_at: new Date().toISOString(),
                // Ensure examples is valid JSON
                examples: formData.examples
            };

            if (editMode && formData.id) {
                // UPDATE
                const { error } = await supabase
                    .from('problems')
                    .update(payload)
                    .eq('id', formData.id);
                if (error) throw error;
            } else {
                // CREATE
                const { error } = await supabase
                    .from('problems')
                    .insert([{ ...payload, created_at: new Date().toISOString() }]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchProblems();
        } catch (error: any) {
            alert("Lỗi lưu bài tập: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài tập này?")) return;
        
        const { error } = await supabase.from('problems').delete().eq('id', id);
        if (error) alert("Lỗi xóa: " + error.message);
        else fetchProblems();
    };

    // --- Example Handlers ---
    const addExample = () => {
        setFormData(prev => ({
            ...prev,
            examples: [...(prev.examples || []), { input: '', output: '' }]
        }));
    };
    
    const removeExample = (index: number) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples?.filter((_, i) => i !== index)
        }));
    };

    const updateExample = (index: number, field: 'input' | 'output' | 'note', value: string) => {
        const newExamples = [...(formData.examples || [])];
        newExamples[index] = { ...newExamples[index], [field]: value };
        setFormData(prev => ({ ...prev, examples: newExamples }));
    };

    // --- Tag Handlers ---
    const addTag = () => {
        if (!tagInput.trim()) return;
        if (!formData.tags?.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()]
            }));
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tag)
        }));
    };

    const filteredProblems = problems.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ListPlus className="text-blue-600" /> Quản lý Bài tập
                </h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Plus size={20} /> Thêm bài tập
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên hoặc mã bài..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold dark:bg-slate-900 dark:text-slate-400">
                            <tr>
                                <th className="p-4 border-b dark:border-slate-700">ID</th>
                                <th className="p-4 border-b dark:border-slate-700">Mã bài</th>
                                <th className="p-4 border-b dark:border-slate-700">Tên bài tập</th>
                                <th className="p-4 border-b dark:border-slate-700 text-center">Điểm</th>
                                <th className="p-4 border-b dark:border-slate-700">Tags</th>
                                <th className="p-4 border-b dark:border-slate-700 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                            ) : filteredProblems.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Không tìm thấy dữ liệu.</td></tr>
                            ) : (
                                filteredProblems.map(prob => (
                                    <tr key={prob.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono text-xs">#{prob.id}</td>
                                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{prob.code}</td>
                                        <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{prob.name}</td>
                                        <td className="p-4 text-center">{prob.score}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {prob.tags?.slice(0, 3).map(t => (
                                                    <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded border dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">{t}</span>
                                                ))}
                                                {prob.tags && prob.tags.length > 3 && <span className="text-xs text-slate-400">+{prob.tags.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button onClick={() => handleOpenModal(prob)} className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/30" title="Sửa"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(prob.id)} className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/30" title="Xóa"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center dark:bg-slate-900 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                {editMode ? `Chỉnh sửa: ${formData.name}` : 'Thêm bài tập mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Tên bài tập (*)</label>
                                    <input 
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Mã bài (Code) (*)</label>
                                    <input 
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Điểm số</label>
                                    <input 
                                        type="number"
                                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        value={formData.score} onChange={e => setFormData({...formData, score: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div>
                                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Đề bài (Mô tả chi tiết)</label>
                                <textarea 
                                    className="w-full h-32 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono text-sm"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Hỗ trợ HTML cơ bản..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Định dạng Input</label>
                                    <textarea 
                                        className="w-full h-24 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono text-sm"
                                        value={formData.input_format} onChange={e => setFormData({...formData, input_format: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Định dạng Output</label>
                                    <textarea 
                                        className="w-full h-24 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono text-sm"
                                        value={formData.output_format} onChange={e => setFormData({...formData, output_format: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Tags</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {formData.tags?.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm flex items-center gap-1 dark:bg-blue-900/40 dark:text-blue-300">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="hover:text-blue-900"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        placeholder="Nhập tag và ấn Enter hoặc nút Thêm"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTag()}
                                    />
                                    <button onClick={addTag} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">Thêm</button>
                                </div>
                            </div>

                            {/* Examples */}
                            <div>
                                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Ví dụ (Examples)</label>
                                {formData.examples?.map((ex, idx) => (
                                    <div key={idx} className="border p-4 rounded-lg mb-4 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 relative group">
                                        <button onClick={() => removeExample(idx)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"><Trash2 size={16} /></button>
                                        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Ví dụ #{idx + 1}</span>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs font-semibold mb-1">Input</div>
                                                <textarea 
                                                    className="w-full h-20 p-2 border rounded font-mono text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                                    value={ex.input} onChange={e => updateExample(idx, 'input', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold mb-1">Output</div>
                                                <textarea 
                                                    className="w-full h-20 p-2 border rounded font-mono text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                                                    value={ex.output} onChange={e => updateExample(idx, 'output', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addExample} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-600 font-bold transition-colors dark:border-slate-600">
                                    + Thêm ví dụ
                                </button>
                            </div>

                        </div>

                        <div className="p-5 border-t bg-slate-50 flex justify-end gap-3 dark:bg-slate-900 dark:border-slate-700">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-slate-800">Hủy bỏ</button>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {editMode ? 'Lưu thay đổi' : 'Tạo bài tập'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
