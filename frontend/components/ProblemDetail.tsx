
import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Send, List, User, CheckCircle2, ChevronRight, Clock, Database, Keyboard, Monitor, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { SubmissionArea } from './SubmissionArea';
import { useAuth } from '../context/AuthContext';

interface ExampleType {
  input: string;
  output: string;
  note?: string;
}

interface ProblemDetailType {
  id: string;
  name: string;
  code: string;
  score: number;
  description: string;
  input_format: string;
  output_format: string;
  examples: ExampleType[];
  hint?: string;
  time_limit?: string;
  memory_limit?: string;
  tags?: string[];
  author?: string;
}

export const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth(); // Lấy trạng thái đăng nhập
  const [problem, setProblem] = useState<ProblemDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submissionRef = useRef<HTMLDivElement>(null);

  const scrollToSubmission = () => {
    submissionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchProblemDetail = async () => {
        if (!isSupabaseConfigured()) {
            setErrorMsg("Chưa kết nối Supabase.");
            setLoading(false);
            return;
        }

        if (!id) return;

        try {
            let query = supabase.from('problems').select('*');

            // --- ĐOẠN SỬA LỖI QUAN TRỌNG ---
            // Kiểm tra xem 'id' trên URL là Số hay Chữ (Mã bài)
            
            if (/^\d+$/.test(id)) {
                // Nếu toàn là số (VD: 1, 20) -> Tìm theo ID
                query = query.eq('id', id);
            } else {
                // Nếu có chữ (VD: P001, P020) -> Tìm theo CODE
                query = query.eq('code', id);
            }
            // ---------------------------------

            const { data, error } = await query.single();

            if (error) throw error;

            if (data) {
                const mappedProblem: ProblemDetailType = {
                    id: data.id.toString(),
                    name: data.name,
                    code: data.code,
                    score: data.score || 100,
                    description: data.description || 'Chưa có mô tả.',
                    input_format: data.input_format || 'Chưa có mô tả input.',
                    output_format: data.output_format || 'Chưa có mô tả output.',
                    examples: data.examples || [],
                    tags: data.tags || [],
                    time_limit: '1.0s', 
                    memory_limit: '256M',
                    author: data.author || '23SPT'
                };
                setProblem(mappedProblem);
            } else {
                setErrorMsg("Không tìm thấy bài tập này.");
            }
        } catch (err: any) {
            console.error("Lỗi lấy chi tiết bài tập:", err.message || JSON.stringify(err));
            // Hiển thị lỗi cụ thể hơn để dễ debug
            setErrorMsg(err.message || "Không tìm thấy bài tập hoặc có lỗi xảy ra.");
        } finally {
            setLoading(false);
        }
    };

    fetchProblemDetail();
  }, [id]);

  if (loading) {
      return (
          <div className="flex justify-center items-center h-96">
              <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
      );
  }

  if (errorMsg || !problem) {
      return (
          <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
              <AlertTriangle className="text-red-500" size={64} />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lỗi tải dữ liệu</h2>
              <p className="text-gray-600 dark:text-gray-400">{errorMsg}</p>
              <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2">
                  <ArrowLeft size={16} /> Quay lại danh sách
              </Link>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
      
      {/* CỘT TRÁI: NỘI DUNG BÀI TẬP */}
      <div className="lg:col-span-3 space-y-6">
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-t-4 border-t-gray-800 dark:bg-dark-card dark:border-dark-border dark:border-t-gray-500 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
               <div className="flex items-center gap-3 mb-2">
                   <h1 className="text-3xl font-normal text-gray-800 dark:text-white">{problem.name}</h1>
                   <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600 font-mono">
                       {problem.code}
                   </span>
               </div>
               
               <div className="flex flex-wrap gap-0 border border-gray-300 rounded overflow-hidden text-sm dark:border-slate-600">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-900 border-r border-gray-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-slate-600">
                      <CheckCircle2 size={16} /> <strong>Điểm:</strong> {problem.score}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-900 border-r border-gray-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-slate-600">
                      <Clock size={16} /> <strong>Thời gian:</strong> {problem.time_limit}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200">
                      <Database size={16} /> <strong>Bộ nhớ:</strong> {problem.memory_limit}
                  </div>
               </div>
            </div>
            
            <button className="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium dark:text-red-400 transition-colors">
               <FileText size={20} />
               <span className="hidden sm:inline">Xem PDF</span>
            </button>
          </div>

          <div className="prose max-w-none text-gray-800 dark:text-gray-300 leading-relaxed space-y-6">
             <div dangerouslySetInnerHTML={{ __html: problem.description }} />
             
             {problem.input_format && (
                 <div className="space-y-2">
                     <h3 className="font-bold text-gray-900 dark:text-white text-lg">Input:</h3>
                     <div dangerouslySetInnerHTML={{ __html: problem.input_format }} />
                 </div>
             )}

             {problem.output_format && (
                 <div className="space-y-2">
                     <h3 className="font-bold text-gray-900 dark:text-white text-lg">Output:</h3>
                     <div dangerouslySetInnerHTML={{ __html: problem.output_format }} />
                 </div>
             )}
          </div>
        </div>

        {problem.examples && problem.examples.length > 0 && problem.examples.map((example, index) => (
            <div key={index} className="space-y-4">
                 <h3 className="font-bold text-gray-800 dark:text-white">Ví dụ {index + 1}:</h3>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="border border-blue-200 rounded overflow-hidden dark:border-blue-900 shadow-sm">
                       <div className="bg-blue-50 px-4 py-2 border-b border-blue-200 font-bold text-blue-800 flex items-center gap-2 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900">
                          <Keyboard size={16} /> Input
                       </div>
                       <div className="p-4 bg-white font-mono text-gray-800 dark:bg-dark-card dark:text-gray-300 whitespace-pre-wrap">
                          {example.input}
                       </div>
                    </div>

                    <div className="border border-blue-200 rounded overflow-hidden dark:border-blue-900 shadow-sm">
                       <div className="bg-blue-50 px-4 py-2 border-b border-blue-200 font-bold text-blue-800 flex items-center gap-2 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900">
                          <Monitor size={16} /> Output
                       </div>
                       <div className="p-4 bg-white font-mono text-gray-800 dark:bg-dark-card dark:text-gray-300 whitespace-pre-wrap">
                          {example.output}
                       </div>
                    </div>
                    
                    {example.note && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                            *Giải thích: {example.note}
                        </div>
                    )}
                 </div>
            </div>
        ))}

        {/* Truyền prop isGuest để kiểm tra quyền nộp bài */}
        <SubmissionArea ref={submissionRef} isGuest={!isAuthenticated} />
      </div>

      <div className="lg:col-span-1 space-y-6">
         <button 
            onClick={scrollToSubmission}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] hover:-translate-y-0.5"
         >
            <Send size={20} className="-rotate-45 mb-1" />
            <span className="text-lg">Nộp bài</span>
         </button>

         <div className="bg-white rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border overflow-hidden">
            <div className="divide-y dark:divide-slate-700">
               <Link to="/submissions" className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-slate-800 transition-colors">
                  <List size={18} />
                  <span className="font-medium text-sm">Tất cả bài nộp</span>
               </Link>
            </div>
         </div>

         <div className="bg-white rounded-lg shadow-sm border p-5 dark:bg-dark-card dark:border-dark-border space-y-5 transition-colors">
             <div>
                <h4 className="flex items-center gap-2 font-bold text-gray-800 dark:text-white mb-2">
                   <div className="p-1.5 bg-gray-100 rounded text-gray-600 dark:bg-slate-700 dark:text-gray-300"><User size={16} /></div>
                   Tác giả
                </h4>
                <p className="font-medium text-blue-600 dark:text-blue-400 pl-9">{problem.author}</p>
             </div>

             <div>
                <h4 className="flex items-center gap-2 font-bold text-gray-800 dark:text-white mb-2">
                   <div className="p-1.5 bg-gray-100 rounded text-gray-600 dark:bg-slate-700 dark:text-gray-300"><ChevronRight size={16} /></div>
                   Dạng bài
                </h4>
                <div className="pl-9 flex flex-wrap gap-1">
                   {problem.tags && problem.tags.length > 0 ? (
                       problem.tags.map(tag => (
                           <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border dark:bg-slate-800 dark:border-slate-600 dark:text-gray-300">
                               {tag}
                           </span>
                       ))
                   ) : (
                       <span className="text-xs text-gray-400 italic">Chưa phân loại</span>
                   )}
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};
