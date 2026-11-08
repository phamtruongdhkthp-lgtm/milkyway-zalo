import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  MessageSquareText, 
  MessagesSquare, 
  ContactRound, 
  ScrollText, 
  Settings,
  ChevronRight,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface NavItem {
  id: NavTab;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, accounts, campaigns, contacts } = useApp();

  const runningCampaigns = campaigns.filter(c => c.status === 'running').length;
  const qrRequiredAccounts = accounts.filter(a => a.status === 'qr_required').length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'Tổng quan & chỉ số',
      icon: LayoutDashboard,
    },
    {
      id: 'accounts',
      label: 'Quản lý tài khoản',
      sublabel: 'Đa tài khoản Zalo',
      icon: Users,
      badge: qrRequiredAccounts > 0 ? `${qrRequiredAccounts} cần QR` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'friend_requests',
      label: 'Kết bạn tự động',
      sublabel: 'Nhập danh sách TXT',
      icon: UserPlus,
    },
    {
      id: 'messaging',
      label: 'Chiến dịch nhắn tin',
      sublabel: 'Gửi tin theo file TXT',
      icon: MessageSquareText,
      badge: runningCampaigns > 0 ? `${runningCampaigns} Đang chạy` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'group_messaging',
      label: 'Nhắn tin nhóm',
      sublabel: 'Thành viên hội đồng Zalo',
      icon: MessagesSquare,
    },
    {
      id: 'crm',
      label: 'Quản lý khách hàng',
      sublabel: 'Mini CRM & Blacklist',
      icon: ContactRound,
      badge: contacts.length,
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    },
    {
      id: 'logs',
      label: 'Lịch sử hoạt động',
      sublabel: 'Nhật ký kiểm toán',
      icon: ScrollText,
    },
    {
      id: 'settings',
      label: 'Cài đặt & Đóng gói',
      sublabel: 'CSDL, API & Windows .exe',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-72 flex-shrink-0 z-20 flex flex-col justify-between border-r border-white/10 bg-[#070b1a]/90 backdrop-blur-xl h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Danh mục chức năng
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={`Chuyển tới ${item.label}`}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent text-white border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#D4AF37]/25 text-[#D4AF37]'
                      : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className={`text-xs font-semibold ${isActive ? 'text-[#F5E08F]' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 flex-shrink-0">
                {item.badge !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Anti-Ban & Compliance Assurance Footer Box */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-amber-950/30 to-purple-950/20 border border-[#D4AF37]/30 text-xs">
        <div className="flex items-center space-x-2 text-[#D4AF37] font-semibold mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>Anti-Ban Engine 3.0</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Tự động điều tiết tần suất giãn cách ngẫu nhiên và phân bổ xoay vòng tài khoản gửi.
        </p>
      </div>
    </aside>
  );
};
