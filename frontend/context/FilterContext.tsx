
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  scoreRange: number;
  setScoreRange: (range: number) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  
  // New filters for Submissions
  submissionStatus: string;
  setSubmissionStatus: (status: string) => void;
  submissionLanguage: string;
  setSubmissionLanguage: (lang: string) => void;
  
  // New filter for Lectures
  selectedLectureTopic: string;
  setSelectedLectureTopic: (topic: string) => void;

  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Cập nhật mặc định là 1000 để hiển thị tất cả bài tập lúc đầu
  const [scoreRange, setScoreRange] = useState(1000);
  const [selectedType, setSelectedType] = useState('');
  
  // State for Submission Filters
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [submissionLanguage, setSubmissionLanguage] = useState('');

  // State for Lecture Filters
  const [selectedLectureTopic, setSelectedLectureTopic] = useState('Tất cả bài giảng');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setScoreRange(1000);
    setSelectedType('');
    setSubmissionStatus('');
    setSubmissionLanguage('');
    setSelectedLectureTopic('Tất cả bài giảng');
  };

  return (
    <FilterContext.Provider value={{ 
      searchQuery, setSearchQuery, 
      selectedTags, toggleTag,
      scoreRange, setScoreRange,
      selectedType, setSelectedType,
      submissionStatus, setSubmissionStatus,
      submissionLanguage, setSubmissionLanguage,
      selectedLectureTopic, setSelectedLectureTopic,
      resetFilters 
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
