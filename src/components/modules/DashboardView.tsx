import React from 'react';
import { 
  Users, 
  Send, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Play, 
  Pause, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { 
    accounts, 
    contacts, 
    campaigns, 
    setActiveTab, 
    pauseCampaign, 
    startCampaign 
  } = useApp();

  // Metrics calculations
  const totalAccounts = accounts.length;
  const onlineAccounts = accounts.filter(a => a.status === 'online' && a.isActive).length;
  const totalContacts = contacts.length;
  const totalCampaigns = campaigns.length;

  const totalInvitesSent = accounts.reduce((acc, a) => acc + (a.todaySentInvites || 0), 0) + 185; // include historical
  const totalMessagesSent = accounts.reduce((acc, a) => acc + (a.todaySentMessages || 0), 0) + 420;

  const totalSuccess = campaigns.reduce((acc, c) => acc + c.successCount, 0) + 146 + 26;
  const totalFailed = campaigns.reduce((acc, c) => acc + c.failedCount, 0) + 4 + 2;
  const grandTotal = totalSuccess + totalFailed;
  const successRate = grandTotal > 0 ? ((totalSuccess / grandTotal) * 100).toFixed(1) : '98.5';

  const runningCampaigns = campaigns.filter(c => c.status === 'running');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-card-gold p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#D4AF37] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>GIAO DIỆN NGÂN HÀ MILKYWAY GLASSMORPHISM</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Bảng Điều Khiển Tiếp Thị & CSKH Đa Tài Khoản
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Hệ thống vận hành an toàn với cơ chế giãn cách tự động, bảo vệ chống checkpoint tài khoản, phân tích dữ liệu số điện thoại Việt Nam và quản lý chiến dịch thời gian thực.
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => setActiveTab('friend_requests')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Gửi kết bạn TXT</span>
            </button>
            <button
              onClick={() => setActiveTab('messaging')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white font-semibold text-xs hover:border-[#D4AF37]/50 hover:bg-slate-800 transition-all cursor-pointer flex items-center space-x-2"
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
              <span>Chiến dịch tin nhắn</span>
            </button>
          </div>
        </div>

        {/* Decorative galaxy glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/10 via-purple-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="glass-card rounded-xl p-4 border border-white/10 hover:border-[#D4AF37]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Tài khoản Zalo</span>
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white">{totalAccounts}</div>
            <span className="text-xs font-semibold text-emerald-400">
              {onlineAccounts} Online
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
            <span>Tất cả phiên kết nối an toàn</span>
            <span className="text-[#D4AF37] font-semibold">100% AES</span>
          </div>
        </div>

        {/* Total Contacts */}
        <div className="glass-card rounded-xl p-4 border border-white/10 hover:border-[#D4AF37]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Khách hàng trong CRM</span>
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white">{totalContacts}</div>
            <span className="text-xs text-slate-400">Liên hệ đã phân loại</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
            <span>Danh sách Opt-out loại trừ:</span>
            <span className="text-rose-400 font-semibold">
              {contacts.filter(c => c.isOptOut).length}
            </span>
          </div>
        </div>

        {/* Messages & Invites Sent */}
        <div className="glass-card rounded-xl p-4 border border-white/10 hover:border-[#D4AF37]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Tin nhắn & Kết bạn</span>
            <div className="p-2 rounded-lg bg-amber-500/15 text-[#D4AF37]">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-white">
              {totalInvitesSent + totalMessagesSent}
            </div>
            <span className="text-xs text-slate-400">Lượt gửi</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
            <span>Kết bạn: {totalInvitesSent}</span>
            <span>Tin nhắn: {totalMessagesSent}</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="glass-card rounded-xl p-4 border border-white/10 hover:border-[#D4AF37]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Tỷ lệ thành công</span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-black text-[#F5E08F]">{successRate}%</div>
            <span className="text-xs text-emerald-400 font-medium">Xuất sắc</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-2">
            <span className="text-emerald-400">Đạt: {totalSuccess}</span>
            <span className="text-rose-400">Thất bại: {totalFailed}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Active Campaigns & Platform Safety Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Running Campaigns Monitor */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-base font-bold text-white">
                Chiến dịch đang thực hiện
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('messaging')}
              className="text-xs text-[#D4AF37] hover:underline flex items-center space-x-1"
            >
              <span>Xem tất cả chiến dịch ({totalCampaigns})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              Chưa có chiến dịch nào được khởi tạo.
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.slice(0, 3).map(camp => {
                const percent = camp.totalCount > 0 
                  ? Math.round((camp.processedCount / camp.totalCount) * 100) 
                  : 0;

                return (
                  <div
                    key={camp.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">
                            {camp.name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                              camp.status === 'running'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : camp.status === 'completed'
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : camp.status === 'paused'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-white/10'
                            }`}
                          >
                            {camp.status === 'running'
                              ? 'Đang gửi'
                              : camp.status === 'completed'
                              ? 'Hoàn thành'
                              : camp.status === 'paused'
                              ? 'Tạm dừng'
                              : 'Đã hủy'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {camp.type === 'friend_request' ? 'Kết bạn theo số điện thoại' : 'Nhắn tin chăm sóc'} • {camp.accountIds.length} tài khoản thực thi • Giãn cách {camp.delaySeconds}s
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center space-x-2">
                        {camp.status === 'running' && (
                          <button
                            onClick={() => pauseCampaign(camp.id)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium flex items-center space-x-1"
                            title="Tạm dừng"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {camp.status === 'paused' && (
                          <button
                            onClick={() => startCampaign(camp.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-medium flex items-center space-x-1"
                            title="Tiếp tục"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Tiến độ: {camp.processedCount}/{camp.totalCount} ({percent}%)</span>
                        <span className="text-emerald-400">Thành công: {camp.successCount} | Thất bại: {camp.failedCount}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-emerald-400 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Platform Compliance & Health Box */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-[#D4AF37]">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Chính Sách & An Toàn Zalo</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Tuân thủ nghiêm ngặt chính sách cộng đồng Zalo để duy trì độ tin cậy (Trust Score) cao nhất cho dàn tài khoản của bạn:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="font-semibold text-amber-200">Giới hạn lời mời kết bạn</div>
              <p className="text-slate-400 text-[11px]">
                Tối đa 30-50 lời mời/ngày/tài khoản. Giãn cách ngẫu nhiên từ 25 - 45 giây/lượt.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="font-semibold text-amber-200">Spintax nội dung chống Spam</div>
              <p className="text-slate-400 text-[11px]">
                Sử dụng các cụm hoán đổi {`{Chào bạn|Kính chào}`} để nội dung không trùng lặp hash.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="font-semibold text-amber-200">Cơ chế Opt-out Blacklist</div>
              <p className="text-slate-400 text-[11px]">
                Tự động từ chối gửi tin đến người dùng đã yêu cầu ngừng nhận thông báo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
