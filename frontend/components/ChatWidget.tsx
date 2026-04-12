
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Loader2, Shield, ChevronLeft, Image as ImageIcon, Paperclip, FileText, Download, File } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Message, User as UserType } from '../types';

export const ChatWidget: React.FC = () => {
  const { currentUser, isAuthenticated, setLoginModalOpen } = useAuth();
  
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'users'>('global');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null); // Người đang chat riêng
  
  // Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Typing State
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Scroll xuống cuối khi có tin nhắn mới hoặc đang nhập
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab, typingUsers, selectedUser]);

  // 2. Fetch danh sách người dùng để chat riêng
  useEffect(() => {
    if (isOpen && activeTab === 'users') {
        const fetchUsers = async () => {
            if (!isSupabaseConfigured()) return;
            const { data } = await supabase.from('profiles').select('*').neq('id', currentUser?.id); // Trừ bản thân
            if (data) setUsers(data as any[]);
        };
        fetchUsers();
    }
  }, [isOpen, activeTab, currentUser]);

  // 3. Fetch tin nhắn & Subscribe Realtime (Database + Typing)
  useEffect(() => {
    if (!isOpen || !isSupabaseConfigured()) return;

    setLoading(true);
    setTypingUsers(new Set()); // Reset typing status when switching chat

    // --- A. FETCH HISTORY (LƯU TRỮ TIN NHẮN) ---
    let query = supabase
        .from('messages')
        .select(`
            *,
            sender:profiles!sender_id(name, avatar) 
        `) 
        .order('created_at', { ascending: true });

    if (selectedUser) {
        // Chat riêng: Lấy tin nhắn giữa mình (sender/receiver) và họ (receiver/sender)
        // Cú pháp .or() của Supabase JS v2
        query = query.or(`and(sender_id.eq.${currentUser?.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser?.id})`);
    } else {
        // Chat chung: receiver_id là null
        query = query.is('receiver_id', null);
    }

    query.then(({ data, error }) => {
        if (!error && data) {
            const formattedMessages = data.map((msg: any) => ({
                ...msg,
                sender_name: msg.sender?.name || 'Unknown',
                sender_avatar: msg.sender?.avatar || null
            }));
            setMessages(formattedMessages);
        } else {
            console.error("Error fetching messages:", error);
            setMessages([]);
        }
        setLoading(false);
    });

    // --- B. REALTIME SUBSCRIPTION ---
    // Channel ID: Global hoặc Private (sort ID để đảm bảo 2 người cùng 1 room)
    const channelId = selectedUser 
        ? `chat:${[currentUser?.id, selectedUser.id].sort().join('-')}` 
        : 'chat:global';
    
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(channelId);
    channelRef.current = channel;

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          let shouldAdd = false;
          
          if (selectedUser) {
             // Logic Realtime cho Chat Riêng
             const isFromMeToHim = newMsg.sender_id === currentUser?.id && newMsg.receiver_id === selectedUser.id;
             const isFromHimToMe = newMsg.sender_id === selectedUser.id && newMsg.receiver_id === currentUser?.id;
             if (isFromMeToHim || isFromHimToMe) shouldAdd = true;
          } else {
             // Logic Realtime cho Chat Chung
             if (newMsg.receiver_id === null) shouldAdd = true;
          }

          if (shouldAdd) {
             const { data: senderProfile } = await supabase.from('profiles').select('name, avatar').eq('id', newMsg.sender_id).single();
             const msgWithProfile = { 
                 ...newMsg, 
                 sender_name: senderProfile?.name || 'User',
                 sender_avatar: senderProfile?.avatar || null
             };
             
             setMessages((prev) => [...prev, msgWithProfile]);
             
             if (newMsg.sender_id !== currentUser?.id) {
                 setTypingUsers(prev => {
                     const next = new Set(prev);
                     next.delete(newMsg.sender_id);
                     return next;
                 });
             }
             scrollToBottom();
          }
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
          if (payload.payload.userId === currentUser?.id) return;

          setTypingUsers(prev => {
              const next = new Set(prev);
              if (payload.payload.isTyping) {
                  next.add(payload.payload.userId);
              } else {
                  next.delete(payload.payload.userId);
              }
              return next;
          });
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [isOpen, selectedUser, currentUser]); // activeTab không cần ở đây vì selectedUser quyết định

  const sendTypingEvent = (isTyping: boolean) => {
      if (!channelRef.current || !currentUser) return;
      channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUser.id, isTyping }
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
      if (!currentUser) return;
      sendTypingEvent(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
          sendTypingEvent(false);
      }, 2000);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
      try {
          // Keep original extension
          const fileExt = file.name.split('.').pop();
          // Create a cleaner filename but keep it unique
          const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
              .from('chat-images')
              .upload(filePath, file);

          if (uploadError) {
              console.error("Upload error:", uploadError);
              return null;
          }

          const { data } = supabase.storage.from('chat-images').getPublicUrl(filePath);
          return data.publicUrl;
      } catch (error) {
          console.error("Upload exception:", error);
          return null;
      }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !currentUser) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTypingEvent(false);

    let fileUrl = null;
    
    if (selectedFile) {
        setIsUploading(true);
        fileUrl = await uploadFile(selectedFile);
        setIsUploading(false);
        if (!fileUrl && !newMessage.trim()) return;
    }

    const content = newMessage.trim();
    setNewMessage(''); 
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    const payload = {
        content: content,
        image_url: fileUrl,
        sender_id: currentUser.id,
        receiver_id: selectedUser ? selectedUser.id : null,
        created_at: new Date().toISOString()
    };

    await supabase.from('messages').insert([payload]);
    scrollToBottom();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const getAvatarUrl = (avatar: string | null | undefined, name: string) => {
      if (avatar) return avatar;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&color=fff&size=64&bold=true`;
  };

  const isImageFile = (url: string) => {
      return url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) != null;
  };
  
  const getFileNameFromUrl = (url: string) => {
      try {
          const parts = url.split('/');
          const uglyName = parts[parts.length - 1];
          const nameParts = uglyName.split('_');
          if (nameParts.length > 1 && !isNaN(Number(nameParts[0]))) {
              return nameParts.slice(1).join('_');
          }
          return uglyName;
      } catch (e) {
          return 'File đính kèm';
      }
  };

  // --- ACTIONS ---
  const handleSelectUser = (user: UserType) => {
      setMessages([]); // Clear messages immediately to avoid ghosting
      setSelectedUser(user);
  };

  const handleSwitchToGlobal = () => {
      setMessages([]); // Clear messages immediately
      setActiveTab('global');
      setSelectedUser(null);
  };

  const handleClose = () => {
      setIsOpen(false);
  };

  // --- RENDER UI ---

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 animate-bounce-slow flex items-center justify-center"
        title="Trò chuyện cộng đồng"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  // Determine which view to show
  const showMessages = selectedUser !== null || activeTab === 'global';
  const showUserList = selectedUser === null && activeTab === 'users';

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-[350px] sm:w-[380px] h-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      
      {/* HEADER */}
      <div className="bg-blue-600 p-3 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2">
           {selectedUser ? (
               <div className="flex items-center gap-2">
                   <button 
                        onClick={() => setSelectedUser(null)} 
                        className="hover:bg-blue-700 p-1.5 rounded mr-1 transition-colors flex items-center justify-center"
                   >
                        <ChevronLeft size={20} />
                   </button>
                   
                   <img 
                       src={getAvatarUrl(selectedUser.avatar, selectedUser.name)} 
                       alt="Avatar" 
                       className="w-8 h-8 rounded-full border-2 border-blue-400 object-cover"
                   />
                   <span className="font-bold text-sm truncate max-w-[150px]">{selectedUser.name}</span>
               </div>
           ) : (
               <div className="flex items-center gap-2">
                   <MessageCircle size={20} />
                   <span className="font-bold text-sm">Cộng đồng CodeMaster</span>
               </div>
           )}
        </div>
        <div className="flex gap-1">
            <button onClick={handleClose} className="p-1.5 hover:bg-blue-700 rounded transition-colors"><Minimize2 size={18} /></button>
            <button onClick={handleClose} className="p-1.5 hover:bg-blue-700 rounded transition-colors"><X size={18} /></button>
        </div>
      </div>

      {/* TABS (GLOBAL / USERS) - Hide when a user is selected */}
      {!selectedUser && (
          <div className="flex border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <button 
                onClick={handleSwitchToGlobal}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'global' ? 'text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-900' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                  Chat Chung
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600 bg-white dark:bg-slate-900' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                  Thành viên
              </button>
          </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 relative custom-scrollbar">
        
        {/* VIEW 1: USER LIST */}
        {showUserList && (
            <div className="divide-y dark:divide-slate-800">
                {users.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">Đang tải danh sách...</div>
                )}
                {users.map(u => (
                    <button 
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <div className="relative">
                            <img 
                                src={getAvatarUrl(u.avatar, u.name)} 
                                alt={u.name}
                                className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-700" 
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex items-center gap-1">
                                {u.name}
                                {u.role === 'admin' && <Shield size={12} className="text-blue-600" fill="currentColor" />}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{u.role}</p>
                        </div>
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/20">
                            <MessageCircle size={16} />
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* VIEW 2: MESSAGES */}
        {showMessages && (
            <div className="p-4 space-y-3 min-h-full flex flex-col justify-end">
                {!isAuthenticated && (
                     <div className="text-center py-4 text-xs text-gray-500 bg-gray-100 rounded mb-4 dark:bg-slate-800 dark:text-gray-400">
                         Đăng nhập để tham gia trò chuyện.
                     </div>
                )}
                
                {loading && <div className="flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>}
                
                {messages.length === 0 && !loading && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        {selectedUser ? "Hãy bắt đầu cuộc trò chuyện!" : "Chưa có tin nhắn nào. Hãy là người đầu tiên!"}
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const avatarUrl = getAvatarUrl(
                        isMe ? currentUser?.avatar : msg.sender_avatar, 
                        isMe ? currentUser?.name || 'Me' : msg.sender_name || 'User'
                    );
                    
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <img 
                                src={avatarUrl} 
                                alt="Avt" 
                                className="w-6 h-6 rounded-full object-cover mb-1 border border-gray-200 shrink-0" 
                            />

                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                {!isMe && (
                                    <span className="text-[10px] text-gray-500 ml-1 mb-0.5 dark:text-gray-400">
                                        {msg.sender_name}
                                    </span>
                                )}
                                <div 
                                    className={`px-3 py-2 rounded-xl text-sm break-words shadow-sm
                                        ${isMe 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200'
                                        }`}
                                >
                                    {msg.image_url && (
                                        <div className="mb-1 rounded-lg overflow-hidden border border-white/20">
                                            {isImageFile(msg.image_url) ? (
                                                <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                                                    <img 
                                                        src={msg.image_url} 
                                                        alt="attachment" 
                                                        className="max-w-full max-h-[200px] object-cover hover:scale-105 transition-transform cursor-pointer" 
                                                    />
                                                </a>
                                            ) : (
                                                <a href={msg.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/10 p-2 rounded hover:bg-black/20 transition-colors">
                                                    <div className="p-1.5 bg-white rounded text-blue-600 dark:bg-slate-700">
                                                        <File size={20} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold truncate max-w-[120px]">{getFileNameFromUrl(msg.image_url)}</span>
                                                        <span className="text-[10px] opacity-80 flex items-center gap-1">
                                                            <Download size={10} /> Tải xuống
                                                        </span>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {msg.content}
                                </div>
                                <span className="text-[9px] text-gray-400 mt-1 mx-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* TYPING INDICATOR */}
                {typingUsers.size > 0 && (
                    <div className="flex items-center gap-2 ml-1 animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-gray-200 dark:bg-slate-700 px-3 py-2 rounded-full rounded-bl-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-0"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                        </div>
                        <span className="text-xs text-gray-400 italic">Đang nhập...</span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
        )}

      </div>

      {/* INPUT AREA */}
      {showMessages && (
          <div className="bg-white border-t dark:bg-slate-900 dark:border-slate-700">
             {selectedFile && (
                 <div className="px-4 py-2 border-b dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-800">
                     <span className="text-xs text-gray-500 truncate max-w-[200px] flex items-center gap-1">
                         <Paperclip size={12} /> {selectedFile.name}
                     </span>
                     <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-red-500"><X size={14} /></button>
                 </div>
             )}

             {isAuthenticated ? (
                 <form onSubmit={handleSendMessage} className="flex gap-2 p-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect}
                    />
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                        title="Đính kèm tệp"
                    >
                        <Paperclip size={20} />
                    </button>

                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Nhập tin nhắn..." 
                        className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                    
                    <button 
                        type="submit" 
                        disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                 </form>
             ) : (
                 <div className="p-3">
                     <button 
                        onClick={() => setLoginModalOpen(true)}
                        className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-300"
                     >
                         Đăng nhập để chat
                     </button>
                 </div>
             )}
          </div>
      )}

    </div>
  );
};
