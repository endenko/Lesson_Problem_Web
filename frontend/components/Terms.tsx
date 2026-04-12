import React from 'react';
import { ScrollText, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="bg-white dark:bg-dark-card border dark:border-dark-border p-8 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b dark:border-slate-700 pb-4">
          <ScrollText className="text-blue-600 dark:text-blue-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Điều khoản sử dụng</h1>
        </div>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <ShieldCheck size={20} className="text-green-600" /> 1. Giới thiệu chung
            </h2>
            <p>
              Chào mừng bạn đến với CodeMaster Online Judge. Khi truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <UserCheck size={20} className="text-blue-600" /> 2. Trách nhiệm người dùng
            </h2>
            <p className="mb-2">Khi tham gia CodeMaster, bạn cam kết:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Không gian lận, sao chép code của người khác trong các kỳ thi xếp hạng (Contest).</li>
              <li>Không thực hiện các hành vi tấn công hệ thống (DDoS, Spam submission, SQL Injection...).</li>
              <li>Không đăng tải nội dung đồi trụy, phản động hoặc vi phạm pháp luật Việt Nam.</li>
              <li>Giữ gìn văn hóa giao tiếp, không xúc phạm các thành viên khác.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-600" /> 3. Quyền sở hữu trí tuệ
            </h2>
            <p>
              Mọi nội dung bài tập, bài giảng và dữ liệu trên hệ thống thuộc bản quyền của CodeMaster OJ hoặc các tác giả đóng góp. Bạn có thể sử dụng cho mục đích học tập cá nhân nhưng không được phép sao chép thương mại mà không có sự đồng ý.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Từ chối trách nhiệm</h2>
            <p>
              CodeMaster OJ cung cấp dịch vụ "nguyên trạng". Chúng tôi không đảm bảo hệ thống sẽ hoạt động 100% không gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất dữ liệu nào do sự cố kỹ thuật khách quan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};