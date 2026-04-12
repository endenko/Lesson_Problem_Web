
import React from 'react';
import { Search, Filter, Shuffle, Tag, X, RotateCcw } from 'lucide-react';
import { useFilter } from '../context/FilterContext';

export const Sidebar: React.FC = () => {
  const { 
    searchQuery, setSearchQuery, 
    selectedTags, toggleTag, 
    scoreRange, setScoreRange,
    selectedType, setSelectedType,
    resetFilters
  } = useFilter();

  const availableTags = [
    "Array", "String", "DP", "Math", "Graph", 
    "Greedy", "Sorting", "Tree", "Bit Manipulation", 
    "Two Pointers", "Binary Search", "Recursion"
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border dark:bg-dark-card dark:border-dark-border transition-colors">
      <div className="flex items-center justify-between mb-4 text-oj-blue border-b pb-2 dark:text-blue-400 dark:border-dark-border">
        <div className="flex items-center gap-2">
            <Search size={20} />
            <h3 className="font-bold text-lg">Tìm kiếm</h3>
        </div>
        <button 
            onClick={resetFilters} 
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 dark:text-gray-400 dark:hover:text-red-400"
            title="Đặt lại bộ lọc"
        >
            <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <input 
            type="text" 
            placeholder="Tìm bài tập..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:focus:ring-blue-400"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-300">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600" />
            Hiển thị dạng bài
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer dark:text-gray-300">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600" />
            Hiển thị hướng dẫn
          </label>
        </div>

        {/* Tag Filter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-1 dark:text-gray-300">
            <Tag size={14} /> Tags
          </label>
          
          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 animate-in zoom-in duration-200">
                  {tag}
                  <X size={12} className="cursor-pointer hover:text-blue-900 dark:hover:text-blue-100" onClick={() => toggleTag(tag)} />
                </span>
              ))}
            </div>
          )}

          <div className="max-h-32 overflow-y-auto border rounded p-2 custom-scrollbar dark:border-slate-600 dark:bg-slate-900">
             <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 text-xs rounded border transition-colors
                      ${selectedTags.includes(tag) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-700'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Author Filter */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Tác giả</label>
          <button className="w-full text-left px-3 py-2 border rounded text-sm text-blue-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-600 dark:text-blue-400 dark:hover:bg-slate-800">
            Các tác giả...
          </button>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Loại</label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
          >
            <option value="">Tất cả</option>
            <option value="Standard">Standard (Cơ bản)</option>
            <option value="DP">Dynamic Programming (Quy hoạch động)</option>
            <option value="Graph">Graph Theory (Đồ thị)</option>
            <option value="String">String Processing (Chuỗi)</option>
            <option value="Math">Mathematics (Toán học)</option>
            <option value="DS">Data Structures (CTDL)</option>
            <option value="Geometry">Geometry (Hình học)</option>
            <option value="Adhoc">Ad-hoc (Tư duy)</option>
          </select>
        </div>

        {/* Score Slider */}
        <div>
           <label className="block text-sm font-semibold mb-2 text-gray-700 flex justify-between dark:text-gray-300">
              <span>Điểm tối đa</span>
              <span className="text-gray-500 font-normal dark:text-gray-400">{scoreRange}</span>
           </label>
           <div className="flex items-center gap-2">
             <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
             <input 
                type="range" 
                min="0" 
                max="1000"
                step="10"
                value={scoreRange}
                onChange={(e) => setScoreRange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:bg-slate-700"
             />
             <span className="text-xs text-gray-500 dark:text-gray-400">1000</span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 bg-oj-blue text-white py-2 px-4 rounded text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-1 dark:bg-blue-700 dark:hover:bg-blue-600">
             <Filter size={16} /> Lọc
          </button>
          <button className="flex-1 bg-teal-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-1 dark:bg-teal-700 dark:hover:bg-teal-600">
             <Shuffle size={16} /> Ngẫu nhiên
          </button>
        </div>
      </div>
    </div>
  );
};
