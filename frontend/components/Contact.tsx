import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cảm ơn ${formData.name}! Tin nhắn của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm.`);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Liên hệ với chúng tôi</h1>
        <p className="text-gray-600 dark:text-gray-400">Bạn có câu hỏi hoặc cần hỗ trợ? Đừng ngần ngại gửi tin nhắn.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border dark:border-dark-border h-full">
            <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-white">Thông tin liên hệ</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">Địa chỉ</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tầng 12, Tòa nhà Công nghệ, Quận Cầu Giấy, Hà Nội, Việt Nam</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">support@codemaster.oj</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">admin@codemaster.oj</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">Hotline</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">(+84) 123 456 789</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-sm border dark:border-dark-border">
            <h3 className="font-bold text-xl mb-6 text-gray-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-blue-600" /> Gửi tin nhắn
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ tên</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chủ đề</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                  placeholder="Vấn đề bạn cần hỗ trợ..."
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nội dung</label>
                <textarea 
                  required
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-white resize-none"
                  placeholder="Chi tiết nội dung..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30">
                  <Send size={18} /> Gửi tin nhắn
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};