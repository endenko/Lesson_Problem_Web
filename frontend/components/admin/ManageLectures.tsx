
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Edit, Trash2, Save, X, Search, Loader2, BookOpen, Video, GripVertical } from 'lucide-react';
import { Lecture } from '../../types';

interface Lesson {
    id?: string;
    title: string;
    video_url: string;
    duration: string;
    is_free: boolean;
    order_index: number;
}

interface AdminLecture extends Lecture {
    lessons?: Lesson[];
}

export const ManageLectures: React.FC = () => {
    const [lectures, setLectures] = useState<AdminLecture[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<Partial<AdminLecture>>({
        title: '', description: '', thumbnail: '', tags: [], level: 'Beginner', author: 'Admin'
    });
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchLectures();
    }, []);

    const fetchLectures = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('lectures').select('*').order('id', { ascending: true });
        if (data) setLectures(data as AdminLecture[]);
        setLoading(false);
    };

    const handleOpenModal = async (lecture?: AdminLecture) => {
        if (lecture) {
            setFormData(lecture);
            // Fetch lessons for this lecture
            const { data } = await supabase.from('lecture_lessons').select('*').eq('lecture_id', lecture.id).order('order_index');
            setLessons(data || []);
        } else {
            setFormData({ title: '', description: '', thumbnail: '', tags: [], level: 'Beginner', author: 'Admin' });
            setLessons([]);
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title) return alert("Vui lòng nhập tên bài giảng!");
        setIsSaving(true);
        try {
            let lectureId = formData.id;

            // 1. Save Lecture Info
            const lecturePayload = {
                title: formData.title,
                description: formData.description,
                thumbnail: formData.thumbnail,
                tags: formData.tags,
                level: formData.level,
                author: formData.author
            };

            if (lectureId) {
                await supabase.from('lectures').update(lecturePayload).eq('id', lectureId);
            } else {
                const { data, error } = await supabase.from('lectures').insert([lecturePayload]).select().single();
                if (error) throw error;
                lectureId = data.id;
            }

            // 2. Save Lessons (Simplified: Delete old, Insert new)
            // Note: In production, better to use Upsert with IDs to preserve history if needed.
            if (lectureId) {
                // Delete existing (simplified strategy)
                if (formData.id) {
                     await supabase.from('lecture_lessons').delete().eq('lecture_id', lectureId);
                }

                // Insert new
                if (lessons.length > 0) {
                    const lessonPayload = lessons.map((l, idx) => ({
                        lecture_id: lectureId,
                        title: l.title,
                        video_url: l.video_url,
                        duration: l.duration,
                        is_free: l.is_free,
                        order_index: idx
                    }));
                    const { error: lessonError } = await supabase.from('lecture_lessons').insert(lessonPayload);
                    if (lessonError) throw lessonError;
                }
            }

            setIsModalOpen(false);
            fetchLectures();
        } catch (error: any) {
            alert("Lỗi lưu dữ liệu: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài giảng này và toàn bộ bài học con?")) return;
        await supabase.from('lectures').delete().eq('id', id); // Cascade delete should be set in DB, otherwise delete lessons first
        fetchLectures();
    };

    // --- Sub-form Handlers ---
    const addLesson = () => {
        setLessons([...lessons, { title: 'Bài học mới', video_url: '', duration: '10:00', is_free: false, order_index: lessons.length }]);
    };
    const updateLesson = (index: number, field: keyof Lesson, value: any) => {
        const newLessons = [...lessons];
        newLessons[index] = { ...newLessons[index], [field]: value };
        setLessons(newLessons);
    };
    const removeLesson = (index: number) => {
        setLessons(lessons.filter((_, i) => i !== index));
    };

    const addTag = () => {
        if (tagInput && !formData.tags?.includes(tagInput)) {
            setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput] }));
            setTagInput('');
        }
    };

    const filteredLectures = lectures.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen className="text-blue-600" /> Quản lý Bài giảng
                </h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm">
                    <Plus size={20} /> Thêm khóa học
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input type="text" placeholder="Tìm kiếm bài giảng..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <Loader2 className="animate-spin mx-auto text-blue-600" /> : filteredLectures.map(lec => (
                    <div key={lec.id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
                        <div className="h-32 bg-gray-200 relative">
                             {lec.thumbnail && <img src={lec.thumbnail} alt={lec.title} className="w-full h-full object-cover" />}
                             <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">{lec.level}</span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 truncate dark:text-white">{lec.title}</h3>
                            <div className="flex gap-1 mb-3 flex-wrap">
                                {lec.tags?.map(t => <span key={t} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 dark:bg-slate-700 dark:text-gray-300">{t}</span>)}
                            </div>
                            <div className="flex justify-end gap-2 border-t pt-3 dark:border-slate-700">
                                <button onClick={() => handleOpenModal(lec)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(lec.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center dark:bg-slate-900 dark:border-slate-700">
                            <h2 className="text-xl font-bold dark:text-white">{formData.id ? 'Sửa khóa học' : 'Tạo khóa học mới'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-500" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-bold mb-1 dark:text-white">Tên khóa học</label>
                                    <input className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-bold mb-1 dark:text-white">Thumbnail URL</label>
                                    <input className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-1 dark:text-white">Mô tả</label>
                                    <textarea className="w-full h-20 px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-white">Tags</label>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {formData.tags?.map(t => <span key={t} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded flex items-center gap-1">{t} <button onClick={() => setFormData(prev => ({...prev, tags: prev.tags?.filter(tag => tag !== t)}))}><X size={10} /></button></span>)}
                                    </div>
                                    <div className="flex gap-1">
                                        <input className="flex-1 px-2 py-1 border rounded text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Thêm tag..." />
                                        <button onClick={addTag} className="px-3 py-1 bg-slate-200 rounded text-sm dark:bg-slate-700 dark:text-white">Add</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 dark:text-white">Cấp độ</label>
                                    <select className="w-full px-3 py-2 border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Lessons Manager */}
                            <div className="border-t pt-4 dark:border-slate-700">
                                <h3 className="font-bold text-lg mb-3 dark:text-white flex items-center gap-2"><Video size={20} /> Danh sách bài học</h3>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {lessons.map((lesson, idx) => (
                                        <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded border dark:bg-slate-800 dark:border-slate-700">
                                            <span className="text-slate-400 font-bold w-6 text-center">{idx+1}</span>
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <input className="px-2 py-1 border rounded text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="Tên bài học" value={lesson.title} onChange={e => updateLesson(idx, 'title', e.target.value)} />
                                                <input className="px-2 py-1 border rounded text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="YouTube URL" value={lesson.video_url} onChange={e => updateLesson(idx, 'video_url', e.target.value)} />
                                                <div className="flex gap-2">
                                                    <input className="w-20 px-2 py-1 border rounded text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder="Time" value={lesson.duration} onChange={e => updateLesson(idx, 'duration', e.target.value)} />
                                                    <label className="flex items-center gap-1 text-xs cursor-pointer dark:text-white">
                                                        <input type="checkbox" checked={lesson.is_free} onChange={e => updateLesson(idx, 'is_free', e.target.checked)} /> Free
                                                    </label>
                                                </div>
                                            </div>
                                            <button onClick={() => removeLesson(idx)} className="text-red-500 hover:bg-red-100 p-1.5 rounded"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addLesson} className="mt-3 text-sm text-blue-600 font-bold hover:underline">+ Thêm bài học mới</button>
                            </div>
                        </div>

                        <div className="p-5 border-t bg-slate-50 flex justify-end gap-3 dark:bg-slate-900 dark:border-slate-700">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800">Hủy</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg">
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
