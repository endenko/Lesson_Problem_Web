
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CẤU HÌNH SUPABASE
// Bạn cần lấy thông tin này tại: Supabase Dashboard -> Settings -> API
// ------------------------------------------------------------------

// THAY THẾ CHUỖI BÊN DƯỚI BẰNG URL DỰ ÁN CỦA BẠN
const SUPABASE_URL = 'https://afhgfdkozdwtjdsvldzj.supabase.co'; 

// THAY THẾ CHUỖI BÊN DƯỚI BẰNG API KEY (anon / public) CỦA BẠN
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaGdmZGtvemR3dGpkc3ZsZHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2Mjk1MzksImV4cCI6MjA4MDIwNTUzOX0.1qw9kWwtW52oxynQMP5DMGFVsQ3UGmpLcfu0fz1qDvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hàm kiểm tra xem đã cấu hình chưa (Dùng để hiển thị thông báo nhắc nhở)
export const isSupabaseConfigured = () => {
    return SUPABASE_URL.length > 0 && 
           SUPABASE_ANON_KEY.length > 0 &&
           // Fix: Cast to string to prevent "unintentional comparison" error when types don't overlap
           (SUPABASE_URL as string) !== 'YOUR_SUPABASE_URL';
}
