import React, { useState, forwardRef } from 'react';
import { Code, Upload, Loader2, Play, RefreshCw, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type TestCaseResult = 'AC' | 'WA' | 'TLE';
type JudgeStatus = 'idle' | 'waiting' | 'judging' | 'finished';

interface SubmissionAreaProps {
  isGuest?: boolean;
}

export const SubmissionArea = forwardRef<HTMLDivElement, SubmissionAreaProps>((props, ref) => {
  const { isGuest } = props;
  const { setLoginModalOpen } = useAuth(); // Lấy hàm mở modal đăng nhập từ context
  
  // State quản lý toàn bộ việc nộp bài và chấm bài
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('C++14 (g++ 5.4.0)');
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>('idle');
  const [testCases, setTestCases] = useState<TestCaseResult[]>([]);
  const [finalScore, setFinalScore] = useState(0);

  // Xử lý khi bấm vào lớp phủ khóa (cho Guest)
  const handleLockedClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Ngăn chặn sự kiện mặc định nếu có
    
    // Hiển thị hộp thoại Confirm
    const userWantsToLogin = window.confirm("🔒 Tính năng nộp bài yêu cầu đăng nhập.\n\nBạn có muốn đăng nhập ngay bây giờ để tiếp tục không?");
    
    if (userWantsToLogin) {
        setLoginModalOpen(true);
    }
  };

  // Hàm bắt đầu chấm bài
  const handleJudge = () => {
    // Logic chặn người dùng chưa đăng nhập (đề phòng gọi hàm trực tiếp)
    if (isGuest) {
        handleLockedClick();
        return;
    }

    if (judgeStatus === 'waiting' || judgeStatus === 'judging') return;

    // 1. Reset trạng thái & Chuyển sang Waiting
    setJudgeStatus('waiting');
    setTestCases([]);
    setFinalScore(0);

    // 2. Giả lập compiling (1.5s) -> Chuyển sang Judging
    setTimeout(() => {
      setJudgeStatus('judging');
      runTestCases();
    }, 1500);
  };

  // Hàm nộp lại (Reset)
  const resetJudge = () => {
      setJudgeStatus('idle');
      setTestCases([]);
      setFinalScore(0);
  };

  // Hàm chạy giả lập từng test case
  const runTestCases = () => {
    let currentTest = 0;
    const totalTests = 10;
    const results: TestCaseResult[] = [];

    const interval = setInterval(() => {
      currentTest++;
      
      // Logic random kết quả: 80% AC, 10% WA, 10% TLE
      const rand = Math.random();
      let result: TestCaseResult = 'AC';
      if (rand > 0.9) result = 'TLE';
      else if (rand > 0.8) result = 'WA';

      results.push(result);
      setTestCases([...results]); // Update UI realtime

      if (currentTest >= totalTests) {
        clearInterval(interval);
        finishJudging(results);
      }
    }, 400); // 400ms mỗi test
  };

  // Hàm kết thúc chấm
  const finishJudging = (results: TestCaseResult[]) => {
    setJudgeStatus('finished');
    const acCount = results.filter(r => r === 'AC').length;
    setFinalScore(acCount * 10);
  };

  return (
    <div ref={ref} className="pt-4">
         <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2 dark:text-blue-400">
                <Code size={24} /> Nộp bài giải
            </h3>
            
            {/* Cảnh báo nhỏ nếu là khách */}
            {isGuest && (
                <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-md border border-orange-200 flex items-center gap-1 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">
                    <AlertCircle size={12} /> Chế độ xem trước
                </div>
            )}
         </div>
         
         {/* Main Editor Container */}
         <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden dark:border-slate-600 bg-white dark:bg-dark-card flex flex-col relative group">
             
             {/* ========================================================= */}
             {/* KHUNG KẾT QUẢ (Overlay lên trên hoặc chèn vào đầu)        */}
             {/* ========================================================= */}
             {judgeStatus !== 'idle' && (
                <div className="bg-gray-50 border-b border-gray-200 p-4 animate-in slide-in-from-top-2 duration-300 dark:bg-slate-800 dark:border-slate-600">
                    {/* Header trạng thái */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            {/* Trạng thái: Waiting */}
                            {judgeStatus === 'waiting' && (
                                <>
                                    <Loader2 size={24} className="animate-spin text-blue-600" />
                                    <span className="font-bold text-lg text-blue-700 dark:text-blue-400">Đang chờ chấm... (Pending)</span>
                                </>
                            )}
                            {/* Trạng thái: Judging */}
                            {judgeStatus === 'judging' && (
                                <>
                                    <Loader2 size={24} className="animate-spin text-blue-600" />
                                    <span className="font-bold text-lg text-blue-700 dark:text-blue-400">Đang chấm bài... {Math.round((testCases.length / 10) * 100)}%</span>
                                </>
                            )}
                            {/* Trạng thái: Finished */}
                            {judgeStatus === 'finished' && (
                                <>
                                    {finalScore === 100 ? (
                                        <div className="p-1 bg-green-100 rounded-full"><CheckCircle2 size={24} className="text-green-600" /></div>
                                    ) : (
                                        <div className="p-1 bg-orange-100 rounded-full"><AlertCircle size={24} className="text-orange-600" /></div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                                            Kết quả: <span className={finalScore === 100 ? 'text-green-600' : 'text-orange-600'}>{finalScore}/100</span>
                                        </h3>
                                        <p className="text-xs text-gray-500">Đã chấm xong lúc {new Date().toLocaleTimeString()}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {/* Nút đóng bảng kết quả (chỉ hiện khi xong) */}
                        {judgeStatus === 'finished' && (
                            <button onClick={resetJudge} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 dark:hover:bg-slate-700 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Grid Test Cases (Xanh/Đỏ) */}
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-2">
                         {testCases.map((result, index) => (
                            <div key={index} className="flex flex-col items-center animate-in zoom-in duration-300">
                                <div 
                                    className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm shadow-sm
                                        ${result === 'AC' ? 'bg-green-500 text-white' : 
                                          result === 'WA' ? 'bg-red-500 text-white' : 
                                          'bg-yellow-500 text-white'}`}
                                >
                                    {result}
                                </div>
                                <span className="text-[10px] mt-1 text-gray-500 font-mono">#{index + 1}</span>
                            </div>
                        ))}
                        {/* Placeholder cho các test chưa chạy */}
                        {Array.from({ length: 10 - testCases.length }).map((_, i) => (
                            <div key={`placeholder-${i}`} className="flex flex-col items-center opacity-30">
                                <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center dark:bg-slate-700">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                </div>
                                <span className="text-[10px] mt-1 text-gray-400 font-mono">#{testCases.length + i + 1}</span>
                            </div>
                        ))}
                    </div>

                     {/* Logs giả lập */}
                    {judgeStatus === 'finished' && (
                         <div className="mt-3 text-xs text-gray-600 font-mono bg-white p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-gray-400">
                             &gt; Compilation successful. 0 errors.<br/>
                             &gt; Execution time: 0.12s | Memory: 1.4MB <br/>
                         </div>
                    )}
                </div>
             )}

             {/* ========================================================= */}
             {/* PHẦN EDITOR (Code Input)                                  */}
             {/* ========================================================= */}
             <div className="bg-gray-100 border-b p-1 flex justify-between items-center dark:bg-slate-800 dark:border-slate-600">
                <div className="text-xs text-gray-500 px-2 dark:text-gray-400">source.cpp</div>
             </div>

             <div className="relative flex-grow">
                {/* Số dòng giả */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 border-r text-right pr-2 pt-2 text-gray-400 font-mono text-sm select-none dark:bg-slate-800 dark:border-slate-700">
                    1<br/>2<br/>3<br/>4<br/>5
                </div>
                
                {/* Textarea Code */}
                <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`w-full h-64 pl-10 pr-2 pt-2 font-mono text-sm resize-y focus:outline-none dark:bg-dark-card dark:text-gray-200 ${isGuest ? 'blur-[2px]' : ''}`}
                    placeholder={isGuest ? "" : "// Nhập code của bạn tại đây..."}
                    readOnly={judgeStatus === 'waiting' || judgeStatus === 'judging' || isGuest}
                />

                {/* OVERLAY KHÓA DÀNH CHO GUEST */}
                {isGuest && (
                    <div 
                        onClick={handleLockedClick}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-100/40 backdrop-blur-[1px] cursor-pointer hover:bg-gray-100/50 transition-colors"
                        title="Bấm để mở khóa"
                    >
                        <div className="bg-white p-3 rounded-full shadow-lg mb-2 dark:bg-slate-700">
                            <Lock size={32} className="text-gray-400 dark:text-gray-300" />
                        </div>
                        <div className="bg-white/90 px-4 py-2 rounded shadow-sm text-sm font-semibold text-gray-600 dark:bg-slate-800 dark:text-gray-300">
                            Đăng nhập để làm bài
                        </div>
                    </div>
                )}
             </div>

             {/* Bottom Toolbar (Ngôn ngữ, Nút nộp) */}
             <div className="bg-gray-50 border-t p-3 flex flex-wrap gap-3 items-center justify-between dark:bg-slate-800 dark:border-slate-700">
                 <div className="flex-1 min-w-[200px]">
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50"
                        disabled={judgeStatus !== 'idle' || isGuest}
                    >
                        <optgroup label="C / C++">
                            <option value="C++11">C++11 (g++ 4.9.2)</option>
                            <option value="C++14">C++14 (g++ 5.4.0)</option>
                            <option value="C++17">C++17 (g++ 9.2.0)</option>
                            <option value="C++20">C++20 (g++ 11.2.0)</option>
                            <option value="C">C (gcc 9.2.0)</option>
                        </optgroup>
                        <optgroup label="Java">
                            <option value="Java 8">Java 8 (OpenJDK 1.8)</option>
                            <option value="Java 11">Java 11 (OpenJDK 11)</option>
                            <option value="Java 17">Java 17 (OpenJDK 17)</option>
                        </optgroup>
                        <optgroup label="Python">
                            <option value="Python 2">Python 2.7.18</option>
                            <option value="Python 3">Python 3.10.6</option>
                            <option value="PyPy 3">PyPy 3 (7.3.9)</option>
                        </optgroup>
                        <optgroup label="Other">
                            <option value="Pascal">Pascal (FPC 3.2.2)</option>
                            <option value="Go">Go (1.18.3)</option>
                            <option value="C#">C# (Mono 6.12)</option>
                            <option value="NodeJS">Node.js (v16.15.0)</option>
                            <option value="Rust">Rust (1.61.0)</option>
                        </optgroup>
                    </select>
                 </div>

                 <div className="flex items-center gap-2">
                    <label 
                        className={`cursor-pointer px-3 py-1.5 border rounded bg-white hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-600 transition-colors ${judgeStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                             if (isGuest) handleLockedClick(e);
                        }}
                    >
                        <Upload size={14} />
                        <span>Chọn tệp</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            disabled={judgeStatus !== 'idle' || isGuest} 
                        />
                    </label>
                 </div>
                 
                 <div>
                    {judgeStatus === 'finished' ? (
                         <button 
                            onClick={resetJudge}
                            className="bg-gray-600 text-white px-6 py-1.5 rounded font-bold text-sm shadow hover:bg-gray-700 transition-colors flex items-center gap-2"
                         >
                             <RefreshCw size={16} /> Nộp lại
                         </button>
                    ) : (
                        <button 
                            onClick={handleJudge}
                            disabled={judgeStatus === 'waiting' || judgeStatus === 'judging'}
                            className={`
                                ${isGuest ? 'bg-gray-500 hover:bg-gray-600 cursor-pointer' : 'bg-[#005a8d] hover:bg-[#004a75] dark:bg-blue-600 dark:hover:bg-blue-500'} 
                                text-white px-6 py-1.5 rounded font-bold text-sm shadow 
                                disabled:opacity-70 transition-colors flex items-center gap-2
                            `}
                        >
                            {/* Hiển thị Icon khác nhau tùy trạng thái */}
                            {judgeStatus === 'waiting' || judgeStatus === 'judging' ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : isGuest ? (
                                <Lock size={16} />
                            ) : (
                                <Play size={16} fill="currentColor" />
                            )}
                            
                            {/* Text khác nhau */}
                            {isGuest ? 'Đăng nhập để nộp' : 'Nộp bài!'}
                        </button>
                    )}
                 </div>
             </div>
         </div>
    </div>
  );
});

SubmissionArea.displayName = 'SubmissionArea';