import React, { useState } from 'react';
import { 
  MessagesSquare, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Info,
  Clock,
  Sparkles,
  ExternalLink,
  Crown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { renderPersonalizedMessage } from '../../utils/templateParser';
import { GroupMember } from '../../types';

export const GroupMessagingView: React.FC = () => {
  const { groups, accounts, addLog, createCampaign } = useApp();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [filterOnlyNotFriends, setFilterOnlyNotFriends] = useState<boolean>(true);
  const [filterExcludeAdmins, setFilterExcludeAdmins] = useState<boolean>(true);
  const [filterExcludeOptOut, setFilterExcludeOptOut] = useState<boolean>(true);

  const [messageContent, setMessageContent] = useState<string>(
    '{Chào|Xin chào} bạn {ten_khach_hang}, mình cùng sinh hoạt trong nhóm {nhom_zalo}. Rất vui được biết bạn, mình gửi lời chào và kết nối để cùng học hỏi kinh nghiệm nhé!'
  );

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [dispatchResults, setDispatchResults] = useState<{ id: string; name: string; status: string; note: string }[]>([]);

  const currentGroup = groups.find(g => g.id === selectedGroupId);
  const assignedAccount = accounts.find(a => a.id === currentGroup?.accountId);

  // Filter members based on criteria
  const eligibleMembers = (currentGroup?.members || []).filter(member => {
    if (filterExcludeOptOut && member.isOptOut) return false;
    if (filterExcludeAdmins && (member.role === 'admin' || member.role === 'deputy')) return false;
    if (filterOnlyNotFriends && member.isFriend) return false;
    return true;
  });

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllEligible = () => {
    if (selectedMemberIds.length === eligibleMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(eligibleMembers.map(m => m.id));
    }
  };

  const handleSendGroupCampaign = async () => {
    if (selectedMemberIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thành viên trong nhóm để gửi tin.');
      return;
    }

    setIsSending(true);
    setDispatchResults([]);

    const targets = (currentGroup?.members || []).filter(m => selectedMemberIds.includes(m.id));
    const results: { id: string; name: string; status: string; note: string }[] = [];

    for (const member of targets) {
      await new Promise(r => setTimeout(r, 600));

      const isRestrictedByPrivacy = Math.random() < 0.15;
      if (isRestrictedByPrivacy) {
        results.push({
          id: member.id,
          name: member.name,
          status: 'needs_manual',
          note: 'Bị giới hạn bởi quyền riêng tư Zalo (Người này chặn tin nhắn từ người lạ cùng nhóm)',
        });
      } else {
        results.push({
          id: member.id,
          name: member.name,
          status: 'success',
          note: 'Đã gửi thông điệp thành công qua cửa sổ chat nhóm/cá nhân',
        });
      }
      setDispatchResults([...results]);
    }

    setIsSending(false);

    if (currentGroup) {
      createCampaign({
        name: `Nhắn tin Nhóm: ${currentGroup.name} (${targets.length} thành viên)`,
        type: 'group_message',
        accountIds: [currentGroup.accountId],
        totalCount: targets.length,
        messageTemplate: messageContent,
        delaySeconds: 30,
        maxPerDay: 50,
      });
    }

    addLog(
      'info',
      'Chiến dịch tin nhắn nhóm',
      `Đã xử lý gửi cho ${targets.length} thành viên nhóm [${currentGroup?.name}].`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <MessagesSquare className="w-5 h-5 text-[#D4AF37]" />
            <span>Gửi Tin Nhắn Đến Thành Viên Trong Nhóm Zalo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tiếp cận thành viên cùng hội nhóm kinh doanh, chăm sóc khách hàng trong nhóm cộng đồng với phân quyền minh bạch.
          </p>
        </div>
      </div>

      {/* Zalo Platform Group Policy Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-amber-950/20 border border-blue-500/30 text-xs space-y-2">
        <div className="flex items-center space-x-2 text-blue-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Quy Định & Giới Hạn Tương Tác Nhóm Của Zalo</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Theo chính sách quyền riêng tư Zalo, người dùng trong cùng nhóm có thể cài đặt <strong className="text-amber-200">"Chặn tin nhắn từ người lạ"</strong>. Khi hệ thống gặp trường hợp này, ứng dụng sẽ ghi nhận trạng thái <span className="text-amber-400 font-semibold">"Cần xác nhận"</span> và cung cấp tùy chọn tương tác thủ công hoặc gửi lời mời kết bạn trước, không tự ý can thiệp trái phép.
        </p>
      </div>

      {/* Main Grid: Group Selector & Member List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Group Selector & Filters */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <label className="block text-xs font-bold text-white">
            1. Chọn Nhóm Zalo Cần Triển Khai
          </label>

          <div className="space-y-2">
            {groups.map(grp => {
              const isSelected = selectedGroupId === grp.id;
              const acc = accounts.find(a => a.id === grp.accountId);

              return (
                <div
                  key={grp.id}
                  onClick={() => setSelectedGroupId(grp.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={grp.avatar}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {grp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>{grp.memberCount} thành viên</span>
                        <span>•</span>
                        <span className="text-[#D4AF37] font-semibold flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>{grp.myRole === 'admin' ? 'Trưởng nhóm' : grp.myRole === 'deputy' ? 'Phó nhóm' : 'Thành viên'}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        Acc phụ trách: {acc?.name || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Member Filters */}
          <div className="pt-3 border-t border-white/5 space-y-2.5">
            <label className="text-xs font-bold text-white block">
              2. Bộ Lọc Thành Viên Tiếp Cận
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterOnlyNotFriends}
                onChange={e => setFilterOnlyNotFriends(e.target.checked)}
                className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>Chỉ gửi người chưa là bạn bè</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterExcludeAdmins}
                onChange={e => setFilterExcludeAdmins(e.target.checked)}
                className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>Loại trừ Trưởng nhóm & Phó nhóm</span>
            </label>

            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterExcludeOptOut}
                onChange={e => setFilterExcludeOptOut(e.target.checked)}
                className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span>Loại trừ danh sách Opt-out Blacklist</span>
            </label>
          </div>
        </div>

        {/* Center & Right: Members Table & Message Composer */}
        <div className="lg:col-span-2 space-y-5">
          {/* Members Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span>Danh Sách Thành Viên Phù Hợp ({eligibleMembers.length} người)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Đã chọn: {selectedMemberIds.length}/{eligibleMembers.length} thành viên
                </p>
              </div>

              <button
                onClick={selectAllEligible}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer"
              >
                {selectedMemberIds.length === eligibleMembers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>

            {/* Members Table */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 w-10"></th>
                    <th className="py-2.5 px-3">Thành viên</th>
                    <th className="py-2.5 px-3">Vai trò nhóm</th>
                    <th className="py-2.5 px-3">Trạng thái bạn bè</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eligibleMembers.map(m => {
                    const isChecked = selectedMemberIds.includes(m.id);
                    return (
                      <tr
                        key={m.id}
                        onClick={() => toggleSelectMember(m.id)}
                        className={`hover:bg-white/5 transition-colors cursor-pointer ${
                          isChecked ? 'bg-[#D4AF37]/5' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={m.avatar}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-semibold text-white">{m.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {m.phoneMasked || m.zaloId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {m.role === 'admin' ? 'Trưởng nhóm' : m.role === 'deputy' ? 'Phó nhóm' : 'Thành viên'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {m.isFriend ? (
                            <span className="text-emerald-400 text-[11px] font-medium">Đã kết bạn</span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Chưa kết bạn</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Message Composer Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <label className="block text-xs font-bold text-white">
              3. Soạn Nội Dung Tin Nhắn Gửi Tới Thành Viên
            </label>

            <textarea
              rows={3}
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs leading-relaxed resize-none"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Gửi bằng tài khoản: <strong className="text-white">{assignedAccount?.name || 'Tài khoản Zalo'}</strong>
              </span>

              <button
                onClick={handleSendGroupCampaign}
                disabled={isSending || selectedMemberIds.length === 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 cursor-pointer flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Đang gửi...' : `Gửi Cho ${selectedMemberIds.length} Thành Viên`}</span>
              </button>
            </div>
          </div>

          {/* Dispatch Results Log */}
          {dispatchResults.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Kết Quả Gửi Tin Nhóm</span>
              </h4>

              <div className="space-y-2">
                {dispatchResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      {res.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="font-semibold text-white">{res.name}</span>
                    </div>
                    <span className="text-slate-300 text-[11px]">{res.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
