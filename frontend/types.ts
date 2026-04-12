
export interface Problem {
  id: string;
  name: string;
  code: string;
  type: string;
  score: number;
  acRate: number; // Percentage
  acCount: number;
  tags?: string[]; // Added tags
  description?: string; // Optional for detail mock
  input_format?: string;
  output_format?: string;
  examples?: any[];
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tags?: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced' | string; // Relaxed type
  duration?: string;
  author?: string;
}

export interface Contest {
  id: string;
  title: string;
  description?: string;
  start_time: string; // ISO String (Supabase column)
  end_time: string;   // ISO String (Supabase column)
  participants_count?: number;
  status?: 'upcoming' | 'running' | 'ended'; // Computed on client
}

export type SubmissionStatus = 'AC' | 'WA' | 'TLE' | 'MLE' | 'CE' | 'RE';

export interface Submission {
  id: string;
  problemName: string;
  problemCode: string;
  userName: string;
  status: SubmissionStatus;
  time: string; // e.g. "0.05s"
  memory: string; // e.g. "4.2MB"
  language: string;
  submittedAt: string;
}

export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string; // Thêm bio
  passwordHash: string; // Trong thực tế, không lưu plain text
  role: UserRole;
  createdAt: number;
  // Stats for achievements
  rating?: number;
  solved?: number;
  rank?: number;
  avatar?: string | null; // Add Avatar support for User type
}

export interface Member {
  id: string;
  rank: number;
  name: string;
  avatar: string | null;
  quote: string;
  rating: number;
  solved: number;
  country: string;
}

export interface Message {
  id: number;
  content: string;
  image_url?: string; // Thêm trường hỗ trợ hình ảnh
  sender_id: string;
  receiver_id: string | null; // null = Global chat
  created_at: string;
  // Join fields
  sender_name?: string; // Logic sẽ tự map từ profiles
  sender_avatar?: string; // Logic sẽ tự map
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  // Cập nhật: Trả về Promise để component biết khi nào update xong
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>; 
  error: string | null;
  clearError: () => void;
  // Quản lý Modal Đăng nhập toàn cục
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;
}
