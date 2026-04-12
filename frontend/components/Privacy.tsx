import React from 'react';
import { Lock, Eye, Database, Share2 } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border p-8 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b dark:border-slate-700 pb-4">
          <Lock className="text-blue-600 dark:text-blue-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Chính sách bảo mật</h1>
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p className="text-lg">
            Tại CodeMaster OJ, chúng tôi coi trọng sự riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-lg border dark:border-slate-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Database size={18} className="text-blue-500" /> Thu thập dữ liệu
              </h3>
              <p className="text-sm">
                Chúng tôi thu thập các thông tin cơ bản khi bạn đăng ký như: Tên, Email và các dữ liệu phát sinh trong quá trình sử dụng (Bài nộp, điểm số, lịch sử thi đấu).
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-lg border dark:border-slate-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Eye size={18} className="text-green-500" /> Sử dụng thông tin
              </h3>
              <p className="text-sm">
                Thông tin được sử dụng để: Xác thực tài khoản, xếp hạng thành tích, gửi thông báo về kỳ thi và cải thiện trải nghiệm người dùng trên hệ thống.
              </p>
            </div>
          </div>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Lock size={20} className="text-red-500" /> Bảo mật thông tin
            </h2>
            <p>
              Mật khẩu của bạn được mã hóa một chiều (Hashing) trước khi lưu vào cơ sở dữ liệu. Chúng tôi cam kết không bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Share2 size={20} className="text-purple-500" /> Cookie & Tracking
            </h2>
            <p>
              Hệ thống sử dụng Cookie để duy trì trạng thái đăng nhập và lưu các tùy chọn hiển thị (như Dark Mode). Bạn có thể tắt Cookie trên trình duyệt, nhưng một số tính năng có thể không hoạt động ổn định.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};