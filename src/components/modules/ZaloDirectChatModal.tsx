import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Smile, 
  Paperclip, 
  Image as ImageIcon, 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Sparkles, 
  UserPlus, 
  Clock, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  Bot,
  Layers,
  ChevronDown,
  Trash2,
  PhoneCall,
  BellRing
} from 'lucide-react';
import { ZaloAccount, DirectChatConversation, DirectChatMessage, Contact } from '../../types';
import { useApp } from '../../context/AppContext';
import { playNotificationSound } from '../../utils/sound';

interface ZaloDirectChatModalProps {
  account: ZaloAccount;
  onClose: () => void;
}

const SAMPLE_INITIAL_CHATS: Record<string, DirectChatConversation[]> = {
  default: [
    {
      id: 'conv-1',
      accountId: 'acc-1',
      contactName: 'Nguyễn Thành Nam (BĐS)',
      contactPhone: '0988776655',
      contactAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
      isOnline: true,
      lastMessage: 'Dạ vâng, bên bạn gửi bảng giá căn hộ 3 phòng ngủ giúp mình nhé.',
      lastMessageTime: '14:45',
      unreadCount: 1,
      messages: [
        {
          id: 'm-1',
          sender: 'me',
          text: 'Chào anh Nam! Em bên tư vấn dự án nghỉ dưỡng, em xin phép gửi thông tin qua Zalo cho anh nhé ạ.',
          time: '14:30',
          status: 'seen',
        },
        {
          id: 'm-2',
          sender: 'contact',
          text: 'Chào bạn, dự án này tiến độ thanh toán thế nào bạn nhỉ?',
          time: '14:35',
          status: 'seen',
        },
        {
          id: 'm-3',
          sender: 'me',
          text: 'Dạ dự án có chính sách hỗ trợ lãi suất 0% trong 24 tháng đầu anh nhé. Em gửi anh tài liệu qua Zalo nhé.',
          time: '14:40',
          status: 'seen',
        },
        {
          id: 'm-4',
          sender: 'contact',
          text: 'Dạ vâng, bên bạn gửi bảng giá căn hộ 3 phòng ngủ giúp mình nhé.',
          time: '14:45',
          status: 'delivered',
        },
      ],
    },
    {
      id: 'conv-2',
      accountId: 'acc-1',
      contactName: 'Trần Thị Thu Hương (Spa)',
      contactPhone: '0912345678',
      contactAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80',
      isOnline: true,
      lastMessage: 'Ok em nhé, bên em cài đặt phần mềm mất bao lâu?',
      lastMessageTime: '11:20',
      unreadCount: 0,
      messages: [
        {
          id: 'm-20',
          sender: 'me',
          text: 'Chị Hương ơi, gói giải pháp CRM tự động hóa chăm sóc khách sạn/spa đã kích hoạt cho bên mình rồi ạ!',
          time: '11:15',
          status: 'seen',
        },
        {
          id: 'm-21',
          sender: 'contact',
          text: 'Ok em nhé, bên em cài đặt phần mềm mất bao lâu?',
          time: '11:20',
          status: 'seen',
        },
      ],
    },
    {
      id: 'conv-3',
      accountId: 'acc-1',
      contactName: 'Lê Hoàng Long',
      contactPhone: '0908123456',
      contactAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
      isOnline: false,
      lastMessage: 'Cảm ơn bạn, để mình nghiên cứu thêm nhé.',
      lastMessageTime: 'Hôm qua',
      unreadCount: 0,
      messages: [
        {
          id: 'm-30',
          sender: 'me',
          text: 'Chào anh Long, em gửi anh mã ưu đãi 20% cho thành viên hội thảo doanh nhân nhé.',
          time: '09:00',
          status: 'seen',
        },
        {
          id: 'm-31',
          sender: 'contact',
          text: 'Cảm ơn bạn, để mình nghiên cứu thêm nhé.',
          time: '10:15',
          status: 'seen',
        },
      ],
    },
    {
      id: 'conv-4',
      accountId: 'acc-1',
      contactName: 'Phạm Minh Đức (Shopee)',
      contactPhone: '0933998877',
      contactAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
      isOnline: true,
      lastMessage: 'Bạn hướng dẫn mình cách đồng bộ đơn hàng qua Zalo với',
      lastMessageTime: '08:15',
      unreadCount: 2,
      messages: [
        {
          id: 'm-40',
          sender: 'contact',
          text: 'Alo bên bạn có hỗ trợ gửi tin xác nhận đơn hàng tự động không?',
          time: '08:10',
          status: 'seen',
        },
        {
          id: 'm-41',
          sender: 'contact',
          text: 'Bạn hướng dẫn mình cách đồng bộ đơn hàng qua Zalo với',
          time: '08:15',
          status: 'delivered',
        },
      ],
    },
  ],
};

const QUICK_RESPONSES = [
  'Dạ em chào anh/chị ạ! Em có thể hỗ trợ gì cho mình hôm nay ạ?',
  'Dạ vâng, em xin phép gửi thông tin chi tiết qua tài liệu đính kèm bên dưới nhé ạ.',
  'Dạ cảm ơn anh/chị đã quan tâm. Em gửi báo giá ưu đãi qua ngay đây ạ!',
  'Dạ anh/chị có tiện nghe máy không để em trao đổi nhanh trong 2 phút ạ?',
  'Dạ bên em có hỗ trợ cấu hình và cài đặt trực tiếp tận nơi anh/chị nhé.',
];

const AUTO_REPLIES = [
  'Dạ vâng em nhận được rồi ạ, cảm ơn bạn nhiều nhé!',
  'Ok bạn ơi, để mình xem qua tài liệu rồi nhắn lại nhé.',
  'Tư vấn thêm giúp mình chi phí gói nâng cấp với nhé!',
  'Cảm ơn bạn đã phản hồi nhanh nha, dịch vụ rất chu đáo.',
  'Cho mình xin số hotline kỹ thuật để bên mình tiện liên hệ nhé.',
];

export const ZaloDirectChatModal: React.FC<ZaloDirectChatModalProps> = ({ account, onClose }) => {
  const { contacts, updateAccount, addLog, setAccountUnreadCount } = useApp();

  const [conversations, setConversations] = useState<DirectChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(`milkyway_chat_${account.id}`);
      return saved ? JSON.parse(saved) : SAMPLE_INITIAL_CHATS.default;
    } catch {
      return SAMPLE_INITIAL_CHATS.default;
    }
  });

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || 'conv-1');
  const [inputText, setInputText] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [isQuickResponseOpen, setIsQuickResponseOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation object
  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const lastSyncedUnreadRef = useRef<number>(-1);

  // Save conversations to localStorage and sync unread count with AppContext
  useEffect(() => {
    try {
      localStorage.setItem(`milkyway_chat_${account.id}`, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Chat save error', e);
    }
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    if (lastSyncedUnreadRef.current !== totalUnread) {
      lastSyncedUnreadRef.current = totalUnread;
      setAccountUnreadCount(account.id, totalUnread);
    }
  }, [conversations, account.id, setAccountUnreadCount]);

  // Simulate an incoming message to an inactive conversation to test red avatar badge
  const handleSimulateIncomingToInactive = () => {
    const otherConvs = conversations.filter(c => c.id !== activeConvId);
    const target = otherConvs.length > 0
      ? otherConvs[Math.floor(Math.random() * otherConvs.length)]
      : conversations[0];

    if (!target) return;

    const sampleTexts = [
      'Chào bạn! Cho mình hỏi bảng giá gói dịch vụ CSKH tự động bên bạn với ạ.',
      'Dạ alo, dự án bên mình có chiết khấu thêm cho khách thanh toán sớm không?',
      'Sản phẩm này có hỗ trợ cài đặt trên máy tính Windows 11 không bạn?',
      'Bên bạn có xuất hóa đơn VAT điện tử cho doanh nghiệp không ạ?',
      'Cho mình xin tài liệu mẫu để chạy thử chiến dịch kết bạn nha!'
    ];
    const incomingText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newMsg: DirectChatMessage = {
      id: 'incoming-' + Date.now(),
      sender: 'contact',
      text: incomingText,
      time: timeNow,
      status: 'delivered',
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === target.id) {
          const isCurrent = c.id === activeConvId;
          return {
            ...c,
            unreadCount: isCurrent ? 0 : (c.unreadCount || 0) + 1,
            lastMessage: incomingText,
            lastMessageTime: timeNow,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    playNotificationSound();

    addLog(
      'info',
      'Tin nhắn mới đến',
      `Khách hàng [${target.contactName}] vừa gửi tin nhắn mới đến tài khoản ${account.name}: "${incomingText}"`,
      account.name
    );
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isTyping]);

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConv) return;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newMsg: DirectChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'me',
      text,
      time: now,
      status: 'sent',
    };

    // Update conversation
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: now,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Increment account sent count
    updateAccount(account.id, {
      todaySentMessages: (account.todaySentMessages || 0) + 1,
    });

    addLog(
      'info',
      'Gửi tin Zalo trực tiếp',
      `[${account.name}] đã gửi tin nhắn trực tiếp tới khách hàng ${activeConv.contactName} (${activeConv.contactPhone}).`,
      account.name
    );

    setInputText('');
    setIsQuickResponseOpen(false);

    // Simulate Delivered -> Seen ticks
    setTimeout(() => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              messages: c.messages.map(m => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m)),
            };
          }
          return c;
        })
      );
    }, 800);

    setTimeout(() => {
      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              messages: c.messages.map(m => (m.id === newMsg.id ? { ...m, status: 'seen' } : m)),
            };
          }
          return c;
        })
      );
    }, 1600);

    // Simulate Realistic Customer Auto-Reply
    setTimeout(() => {
      setIsTyping(true);
    }, 1800);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const replyMsg: DirectChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'contact',
        text: replyText,
        time: replyTime,
        status: 'seen',
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              lastMessage: replyText,
              lastMessageTime: replyTime,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 3800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (filterTab === 'unread' && c.unreadCount === 0) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        c.contactName.toLowerCase().includes(q) ||
        c.contactPhone.includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      {/* Main Zalo Window Container */}
      <div className="w-full max-w-5xl h-[88vh] rounded-2xl glass-card-gold border border-[#D4AF37]/50 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative">
        {/* Zalo Desktop Top App Header */}
        <div className="h-14 bg-gradient-to-r from-[#0068ff]/30 via-slate-900/90 to-[#D4AF37]/20 border-b border-white/10 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Account Avatar with Red Notification Badge */}
            <div className="relative">
              <img
                src={account.avatar}
                alt={account.name}
                className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-md"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
                }}
              />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
              {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-slate-900 shadow-[0_0_10px_rgba(225,29,72,0.9)] animate-pulse z-10"
                  title="Tổng tin nhắn chưa đọc"
                >
                  {conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                </span>
              )}
            </div>

            {/* Zalo Icon Badge */}
            <div className="w-9 h-9 rounded-xl bg-[#0068ff] flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(0,104,255,0.4)]">
              Z
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  Zalo Chat Client • {account.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Trực Tuyến</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                SĐT: <strong className="text-amber-200">{account.phone}</strong> • Phiên: {account.sessionEncrypted.slice(0, 16)}...
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300">
              <span className="text-slate-400">Tin nhắn hôm nay:</span>
              <span className="font-bold text-[#D4AF37] font-mono">{account.todaySentMessages}/{account.maxDailyMessages}</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng cửa sổ Chat Zalo"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body: Split Left (Conversations) & Right (Active Chat) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Conversation Sidebar */}
          <div className="w-80 border-r border-white/10 bg-slate-950/70 flex flex-col flex-shrink-0">
            {/* Search Box */}
            <div className="p-3 border-b border-white/5 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè, tin nhắn..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              {/* Tabs with Test Incoming Message button */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      filterTab === 'all'
                        ? 'bg-[#0068ff]/20 text-[#0068ff] border border-[#0068ff]/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tất cả ({conversations.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('unread')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                      filterTab === 'unread'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Chưa đọc</span>
                    {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black">
                        {conversations.filter(c => c.unreadCount > 0).length}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSimulateIncomingToInactive}
                  title="Mô phỏng tin nhắn mới đến từ khách hàng để kiểm tra số thông báo đỏ trên avatar"
                  className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <BellRing className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>+ Tin mới</span>
                </button>
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {filteredConversations.map(conv => {
                const isActive = conv.id === activeConv?.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      // Clear unread
                      setConversations(prev =>
                        prev.map(c => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                      );
                    }}
                    className={`p-3 flex items-start space-x-3 cursor-pointer transition-colors relative ${
                      isActive
                        ? 'bg-[#0068ff]/15 border-l-4 border-l-[#0068ff]'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.contactAvatar}
                        alt={conv.contactName}
                        className="w-11 h-11 rounded-full object-cover border border-white/10"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80';
                        }}
                      />
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      )}
                      {/* Red Notification Number Badge on Contact Avatar */}
                      {conv.unreadCount > 0 && (
                        <span
                          className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-[#0B1021] shadow-[0_0_12px_rgba(225,29,72,0.9)] animate-bounce z-10"
                          title={`${conv.unreadCount} tin nhắn mới chưa đọc`}
                        >
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">
                          {conv.contactName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 truncate font-sans">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                        <span>{conv.contactPhone}</span>
                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px]">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Active Chat Room */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-[#070c1d]/90 relative">
              {/* Active Contact Header */}
              <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={activeConv.contactAvatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    {activeConv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{activeConv.contactName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Zalo Contact
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>{activeConv.isOnline ? 'Vừa mới truy cập' : 'Hoạt động 1 giờ trước'}</span>
                      <span>•</span>
                      <span className="font-mono text-amber-200">{activeConv.contactPhone}</span>
                    </p>
                  </div>
                </div>

                {/* Call / Action Icons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert(`Đang kết nối cuộc gọi thoại Zalo tới ${activeConv.contactName} (${activeConv.contactPhone})...`)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-[#0068ff]/20 text-slate-300 hover:text-[#0068ff] transition-all cursor-pointer"
                    title="Gọi thoại Zalo"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => alert(`Đang mở cuộc gọi Video Call Zalo tới ${activeConv.contactName}...`)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-[#0068ff]/20 text-slate-300 hover:text-[#0068ff] transition-all cursor-pointer"
                    title="Gọi Video Zalo"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => alert(`Chi tiết thông tin khách hàng ${activeConv.contactName} trong Mini CRM.`)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                    title="Thông tin hội thoại"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Stream Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Security Tag */}
                <div className="flex justify-center my-2">
                  <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/5 text-[10px] text-slate-400 flex items-center space-x-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Tin nhắn được mã hóa và truyền trực tiếp qua giao thức Zalo Desktop</span>
                  </div>
                </div>

                {/* Date separator */}
                <div className="flex justify-center my-1">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-slate-900/60 text-slate-400 font-medium">
                    Hôm nay
                  </span>
                </div>

                {/* Messages */}
                {activeConv.messages.map(msg => {
                  const isMe = msg.sender === 'me';

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={activeConv.contactAvatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover mb-1 border border-white/10"
                        />
                      )}

                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-md relative ${
                          isMe
                            ? 'bg-gradient-to-r from-[#0068ff] to-[#0052cc] text-white rounded-br-none border border-white/15'
                            : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-white/10 backdrop-blur-sm'
                        }`}
                      >
                        <p className="text-xs leading-relaxed font-sans whitespace-pre-wrap select-text">
                          {msg.text}
                        </p>

                        <div
                          className={`flex items-center justify-end space-x-1 text-[10px] mt-1 ${
                            isMe ? 'text-blue-100/80' : 'text-slate-400'
                          }`}
                        >
                          <span className="font-mono">{msg.time}</span>
                          {isMe && (
                            <>
                              {msg.status === 'sent' && <Check className="w-3 h-3" />}
                              {msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                              {msg.status === 'seen' && (
                                <span title="Đã xem">
                                  <CheckCheck className="w-3 h-3 text-[#D4AF37]" />
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2 text-slate-400 text-xs">
                    <img
                      src={activeConv.contactAvatar}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-[11px] flex items-center space-x-1.5 border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1 text-slate-300 font-medium">Đang soạn tin...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Drawer */}
              {isQuickResponseOpen && (
                <div className="border-t border-white/10 bg-slate-900/95 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#D4AF37] font-bold">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Mẫu trả lời nhanh CSKH</span>
                    </span>
                    <button
                      onClick={() => setIsQuickResponseOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_RESPONSES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(tmpl)}
                        className="text-left p-2 rounded-xl bg-slate-800 hover:bg-[#0068ff]/20 border border-white/5 text-xs text-slate-200 hover:text-white transition-all cursor-pointer"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Composer Footer */}
              <div className="p-3 border-t border-white/10 bg-slate-950/80 space-y-2 flex-shrink-0">
                {/* Zalo mini-toolbar icons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setInputText(prev => prev + ' 😊')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#D4AF37] hover:bg-white/5 cursor-pointer"
                      title="Chèn biểu cảm Sticker/Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const fakeImg = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80';
                        handleSendMessage(`[Hình ảnh đính kèm: Bảng giá & Thiết kế] ${fakeImg}`);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0068ff] hover:bg-white/5 cursor-pointer"
                      title="Gửi hình ảnh"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSendMessage('📄 [Tệp đính kèm: Tai_lieu_du_an_2026.pdf (2.4 MB)]');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0068ff] hover:bg-white/5 cursor-pointer"
                      title="Gửi tệp đính kèm"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsQuickResponseOpen(prev => !prev)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 cursor-pointer flex items-center space-x-1"
                      title="Mẫu trả lời nhanh CSKH"
                    >
                      <Zap className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[10px] font-semibold text-[#D4AF37] hidden sm:inline">Mẫu nhanh</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-500 font-sans">
                    Nhấn Enter để gửi, Shift+Enter để xuống dòng
                  </span>
                </div>

                {/* Input box & Send Button */}
                <div className="flex items-end space-x-2">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Nhập tin nhắn gửi tới ${activeConv.contactName}...`}
                    className="flex-1 p-2.5 rounded-xl glass-input text-xs leading-relaxed resize-none font-sans"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#0068ff] to-[#0052cc] text-white hover:brightness-110 shadow-[0_0_15px_rgba(0,104,255,0.4)] disabled:opacity-40 transition-all cursor-pointer flex-shrink-0"
                    title="Gửi tin nhắn Zalo"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-600 mb-2" />
              <p className="text-sm">Chọn một hội thoại để bắt đầu nhắn tin trực tiếp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
