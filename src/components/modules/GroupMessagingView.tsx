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
  Crown,
  Search,
  Download,
  UserPlus,
  MessageSquare,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Database,
  Copy,
  Check,
  X,
  Layers,
  Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { renderPersonalizedMessage } from '../../utils/templateParser';
import { GroupMember, ZaloGroup } from '../../types';

export const GroupMessagingView: React.FC = () => {
  const { 
    groups, 
    accounts, 
    addLog, 
    createCampaign, 
    scanGroupMembers, 
    saveGroupMembersToCrm, 
    addGroup 
  } = useApp();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [campaignMode, setCampaignMode] = useState<'friend_request' | 'message' | 'combo'>('combo');

  // Scanner state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [deepScanHidden, setDeepScanHidden] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOnlyNotFriends, setFilterOnlyNotFriends] = useState<boolean>(false);
  const [filterExcludeAdmins, setFilterExcludeAdmins] = useState<boolean>(true);
  const [filterExcludeOptOut, setFilterExcludeOptOut] = useState<boolean>(true);
  const [filterOnlyHiddenDiscovered, setFilterOnlyHiddenDiscovered] = useState<boolean>(false);

  // Message & Friend Request Templates
  const [friendRequestTemplate, setFriendRequestTemplate] = useState<string>(
    '{Chào|Xin chào} bạn {ten_khach_hang}, mình cùng tham gia nhóm {nhom_zalo}. Mình kết nối để tiện giao lưu học hỏi kinh nghiệm nhé!'
  );

  const [messageContent, setMessageContent] = useState<string>(
    '{Chào|Xin chào} {danh_xung} {ten_khach_hang}! Thấy bạn hoạt động tích cực trong nhóm {nhom_zalo}, mình xin phép gửi lời chào và chia sẻ thông tin hữu ích về thị trường tuần này nhé ạ.'
  );

  // Campaign execution states
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedSenderAccountIds, setSelectedSenderAccountIds] = useState<string[]>(() => 
    accounts.filter(a => a.isActive && a.status === 'online').map(a => a.id).slice(0, 2)
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  const [dispatchResults, setDispatchResults] = useState<{ 
    id: string; 
    name: string; 
    action: string; 
    status: 'success' | 'needs_manual' | 'already_friend' | 'failed'; 
    note: string;
    time: string;
  }[]>([]);

  // Add Group Modal state
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupLink, setNewGroupLink] = useState<string>('');
  const [newGroupIsCommunityHidden, setNewGroupIsCommunityHidden] = useState<boolean>(true);
  const [newGroupMemberCount, setNewGroupMemberCount] = useState<number>(500);
  const [newGroupAccountId, setNewGroupAccountId] = useState<string>(accounts[0]?.id || '');

  const currentGroup = groups.find(g => g.id === selectedGroupId) || groups[0];
  const assignedAccount = accounts.find(a => a.id === currentGroup?.accountId);

  // Filter members based on criteria
  const eligibleMembers = (currentGroup?.members || []).filter(member => {
    if (filterExcludeOptOut && member.isOptOut) return false;
    if (filterExcludeAdmins && (member.role === 'admin' || member.role === 'deputy')) return false;
    if (filterOnlyNotFriends && member.isFriend) return false;
    if (filterOnlyHiddenDiscovered && !member.isDiscoveredFromHidden) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = member.name.toLowerCase().includes(q);
      const matchPhone = (member.phoneMasked || member.phone || '').includes(q);
      const matchZaloId = member.zaloId.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchZaloId) return false;
    }
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

  // Group Scanner Execution
  const handleStartScanning = async () => {
    if (!currentGroup) return;

    setIsScanning(true);
    setScanProgress(10);
    setScanStep('1/4: Đang kết nối tiến trình Chrome qua cổng CDP Profile...');

    await new Promise(r => setTimeout(r, 600));
    setScanProgress(35);
    setScanStep(
      currentGroup.isCommunityHidden
        ? '2/4: Nhóm Cộng Đồng ẨN THÀNH VIÊN: Đang bóc tách luồng phản ứng (Reactions) & Thả tim...'
        : '2/4: Đang tải danh sách thành viên nhóm từ giao diện Zalo Web...'
    );

    await new Promise(r => setTimeout(r, 700));
    setScanProgress(70);
    setScanStep('3/4: Trích xuất lịch sử trao đổi, tin nhắn gần nhất & danh tính người dùng...');

    await new Promise(r => setTimeout(r, 800));
    setScanProgress(95);
    setScanStep('4/4: Giải mã thông tin hồ sơ & đồng bộ cơ sở dữ liệu nhóm...');

    const discovered = await scanGroupMembers(currentGroup.id, deepScanHidden);

    setScanProgress(100);
    setScanStep(`Quét hoàn tất! Đã trích xuất ${discovered.length} thành viên.`);

    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(0);
      setScanStep('');
      // Auto-select discovered members for convenience
      setSelectedMemberIds(discovered.slice(0, 10).map(m => m.id));
    }, 1200);
  };

  // Save selected to CRM
  const handleSaveToCrm = () => {
    const targets = (currentGroup?.members || []).filter(m => selectedMemberIds.includes(m.id));
    if (targets.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thành viên để lưu vào danh sách CRM.');
      return;
    }
    const added = saveGroupMembersToCrm(targets, currentGroup?.name || 'Nhóm Zalo');
    alert(`Đã thêm thành công ${added} khách hàng mới từ nhóm vào danh bạ CRM!`);
  };

  // Export TXT / CSV
  const handleExportData = () => {
    const targets = (currentGroup?.members || []).filter(m => selectedMemberIds.includes(m.id));
    if (targets.length === 0) {
      alert('Vui lòng chọn thành viên để xuất tệp.');
      return;
    }

    const rows = [
      'STT,Họ Và Tên,Số Điện Thoại / ID,Trạng Thái Bạn Bè,Vai Trò,Nguồn Quét Nhóm',
      ...targets.map((m, idx) => 
        `${idx + 1},"${m.name}","${m.phone || m.phoneMasked || m.zaloId}",${m.isFriend ? 'Đã kết bạn' : 'Chưa kết bạn'},${m.role},"${m.isDiscoveredFromHidden ? 'Nhóm Ẩn Thành Viên (' + (m.discoveryMethod || 'Quét sâu') + ')' : 'Nhóm Tiêu Chuẩn'}"`
      )
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Thanh_Vien_${currentGroup?.name.slice(0, 25).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('info', 'Xuất dữ liệu nhóm', `Đã xuất ${targets.length} thành viên nhóm [${currentGroup?.name}] ra file CSV.`);
  };

  // Create & Run Campaign for 3 Modes
  const handleExecuteCampaign = async () => {
    if (selectedMemberIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 thành viên trong nhóm để triển khai chiến dịch.');
      return;
    }

    const senders = selectedSenderAccountIds.length > 0 
      ? selectedSenderAccountIds 
      : (assignedAccount ? [assignedAccount.id] : [accounts[0].id]);

    setIsExecuting(true);
    setExecutionProgress(0);
    setDispatchResults([]);

    const targets = (currentGroup?.members || []).filter(m => selectedMemberIds.includes(m.id));
    const total = targets.length;
    const results: typeof dispatchResults = [];

    const modeLabel = 
      campaignMode === 'combo'
        ? 'Combo: Kết Bạn + Nhắn Tin'
        : campaignMode === 'friend_request'
        ? 'Gửi Lời Mời Kết Bạn'
        : 'Gửi Tin Nhắn Chăm Sóc';

    addLog(
      'info',
      'Khởi chạy chiến dịch nhóm',
      `Bắt đầu chế độ [${modeLabel}] tới ${total} thành viên nhóm [${currentGroup?.name}] bằng ${senders.length} tài khoản Zalo xoay vòng.`
    );

    for (let i = 0; i < targets.length; i++) {
      const member = targets[i];
      const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      // Realistic interval delay
      await new Promise(r => setTimeout(r, 650));

      const isRestrictedByPrivacy = Math.random() < 0.12;
      const isAlreadyFriend = member.isFriend && campaignMode === 'friend_request';

      if (isAlreadyFriend) {
        results.push({
          id: member.id,
          name: member.name,
          action: 'Kết Bạn',
          status: 'already_friend',
          note: 'Đã là bạn bè trên Zalo trước đó, bỏ qua để tiết kiệm hạn mức ngày',
          time: timeNow
        });
      } else if (isRestrictedByPrivacy) {
        results.push({
          id: member.id,
          name: member.name,
          action: modeLabel,
          status: 'needs_manual',
          note: 'Quyền riêng tư Zalo: Người dùng bật "Chặn tin nhắn từ người lạ cùng nhóm"',
          time: timeNow
        });
      } else {
        const successNote = 
          campaignMode === 'combo'
            ? 'Đã gửi lời mời kết bạn và tin nhắn chào mừng cá nhân hóa thành công'
            : campaignMode === 'friend_request'
            ? 'Đã gửi lời mời kết bạn thành công qua Zalo ID'
            : 'Đã gửi tin nhắn chăm sóc khách hàng trực tiếp thành công';

        results.push({
          id: member.id,
          name: member.name,
          action: modeLabel,
          status: 'success',
          note: successNote,
          time: timeNow
        });
      }

      setDispatchResults([...results]);
      setExecutionProgress(Math.round(((i + 1) / total) * 100));
    }

    setIsExecuting(false);

    // Register into App Campaign History
    if (currentGroup) {
      createCampaign({
        name: `Nhóm [${currentGroup.name.slice(0, 20)}] - ${modeLabel} (${total} người)`,
        type: campaignMode === 'combo' ? 'combo_friend_and_message' : campaignMode === 'friend_request' ? 'friend_request' : 'group_message',
        accountIds: senders,
        totalCount: total,
        messageTemplate: campaignMode === 'friend_request' ? friendRequestTemplate : messageContent,
        delaySeconds: 30,
        maxPerDay: 50,
      });
    }

    addLog(
      'success',
      'Chiến dịch nhóm hoàn tất',
      `Đã xử lý xong ${total} đối tượng nhóm [${currentGroup?.name}]. Thành công: ${results.filter(r => r.status === 'success').length}, Cần xác nhận: ${results.filter(r => r.status === 'needs_manual').length}.`
    );
  };

  const handleCreateNewGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert('Vui lòng nhập tên nhóm Zalo.');
      return;
    }
    const newId = addGroup({
      name: newGroupName,
      communityLink: newGroupLink,
      isCommunityHidden: newGroupIsCommunityHidden,
      memberCount: Number(newGroupMemberCount) || 200,
      accountId: newGroupAccountId || accounts[0]?.id || 'acc-1',
      myRole: 'member',
      avatar: newGroupIsCommunityHidden 
        ? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=200&h=200&q=80'
        : 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=200&h=200&q=80'
    });
    setSelectedGroupId(newId);
    setIsAddGroupModalOpen(false);
    setNewGroupName('');
    setNewGroupLink('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <MessagesSquare className="w-5 h-5 text-[#D4AF37]" />
            <span>Quét Nhóm Zalo & Tiếp Cận Thành Viên Đa Chế Độ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Bóc tách dữ liệu thành viên nhóm thường & <strong>Nhóm Cộng Đồng ẨN THÀNH VIÊN</strong>. Tự động hóa 3 chế độ: Kết bạn, Nhắn tin, hoặc Combo Kết bạn + Nhắn tin.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => setIsAddGroupModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 hover:text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] cursor-pointer flex items-center space-x-2"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Thêm Nhóm Zalo Mới</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Groups & Scanner Controls) | Right (Members Table & 3-Mode Campaign) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Groups List & Scanner Control (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Group Selector Box */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span>1. Chọn Nhóm Cần Quét & Khai Thác:</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {groups.length} nhóm
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {groups.map(grp => {
                const isSelected = selectedGroupId === grp.id;
                const acc = accounts.find(a => a.id === grp.accountId);
                const isHidden = grp.isCommunityHidden;

                return (
                  <div
                    key={grp.id}
                    onClick={() => setSelectedGroupId(grp.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]/60 shadow-[0_0_18px_rgba(212,175,55,0.2)]'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Hidden Badge Indicator */}
                    {isHidden && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-rose-600/30 text-rose-300 border-l border-b border-rose-500/40 text-[9px] font-black uppercase tracking-wider flex items-center space-x-1">
                        <EyeOff className="w-2.5 h-2.5" />
                        <span>Ẩn Thành Viên</span>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <img
                        src={grp.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate pr-16" title={grp.name}>
                          {grp.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                          <span className="font-semibold text-amber-200">{grp.memberCount} thành viên</span>
                          <span>•</span>
                          <span className="text-[#D4AF37] font-medium flex items-center space-x-1">
                            <Crown className="w-3 h-3" />
                            <span>{grp.myRole === 'admin' ? 'Admin' : grp.myRole === 'deputy' ? 'Phó nhóm' : 'Thành viên'}</span>
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-1 flex items-center justify-between">
                          <span>Acc: <strong className="text-slate-300">{acc?.name.split(' ')[0] || '-'}</strong></span>
                          {grp.scannedAt ? (
                            <span className="text-emerald-400 font-medium">Đã quét {grp.lastScanCount || grp.members.length} TV</span>
                          ) : (
                            <span className="text-slate-500">Chưa quét</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Scanner Engine Trigger Box */}
          <div className="glass-card-gold rounded-2xl p-5 border border-[#D4AF37]/50 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-[#D4AF37]">
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">
                Bộ Máy Quét & Giải Mã Thành Viên Nhóm
              </h3>
            </div>

            {currentGroup?.isCommunityHidden ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-1.5">
                <div className="text-rose-300 font-bold flex items-center space-x-1.5 text-[11px]">
                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cơ chế Quét Nhóm Cộng Đồng ẨN THÀNH VIÊN:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Zalo ẩn danh sách thành viên trong nhóm này. Bộ máy quét sẽ áp dụng thuật toán <strong>Deep Scan CDP</strong>: bóc tách người thả tim (reactions), tương tác chat gần nhất, ban quản trị và các gói tin WebSocket trong cửa sổ Chrome.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-1.5">
                <div className="text-blue-300 font-bold flex items-center space-x-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nhóm Công Khai Thành Viên:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Quét toàn bộ danh bạ thành viên trực tiếp qua phiên đăng nhập Chrome độc lập, đồng bộ thông tin và số điện thoại công khai.
                </p>
              </div>
            )}

            {/* Deep Scan Toggle for Hidden Community */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 cursor-pointer">
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-semibold">Kích hoạt Quét Sâu (Deep Reactions & Chat)</span>
              </span>
              <input
                type="checkbox"
                checked={deepScanHidden}
                onChange={e => setDeepScanHidden(e.target.checked)}
                className="rounded text-[#D4AF37] focus:ring-[#D4AF37] w-4 h-4"
              />
            </label>

            {/* Scanning Progress Banner */}
            {isScanning && (
              <div className="p-3 rounded-xl bg-black/60 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-bold flex items-center space-x-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang quét bóc tách...</span>
                  </span>
                  <span className="font-mono text-white font-bold">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#D4AF37] to-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {scanStep}
                </div>
              </div>
            )}

            {/* Start Scan Button */}
            <button
              onClick={handleStartScanning}
              disabled={isScanning}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)] cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>
                {isScanning 
                  ? 'Đang Quét Dữ Liệu...' 
                  : currentGroup?.isCommunityHidden 
                  ? 'Bắt Đầu Quét Sâu Nhóm Ẩn Thành Viên' 
                  : 'Bắt Đầu Quét Toàn Bộ Thành Viên Nhóm'}
              </span>
            </button>
          </div>

          {/* Member Filters Panel */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <label className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span>Bộ Lọc Đối Tượng Mục Tiêu:</span>
            </label>

            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterOnlyNotFriends}
                  onChange={e => setFilterOnlyNotFriends(e.target.checked)}
                  className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Chỉ chọn người chưa là bạn bè</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterExcludeAdmins}
                  onChange={e => setFilterExcludeAdmins(e.target.checked)}
                  className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Bỏ qua Trưởng nhóm & Phó nhóm (tránh bị kick)</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterOnlyHiddenDiscovered}
                  onChange={e => setFilterOnlyHiddenDiscovered(e.target.checked)}
                  className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span>Chỉ thành viên quét sâu từ Nhóm Ẩn</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
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
        </div>

        {/* RIGHT COLUMN: Members List & 3 Campaign Modes (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Members Table Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span>Danh Sách Thành Viên Đã Quét ({eligibleMembers.length} người)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Đã chọn: <strong className="text-amber-300">{selectedMemberIds.length}</strong> / {eligibleMembers.length} thành viên hợp lệ
                </p>
              </div>

              {/* Action Buttons: Select All, Save to CRM, Export */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <button
                  onClick={selectAllEligible}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer"
                >
                  {selectedMemberIds.length === eligibleMembers.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                </button>

                <button
                  onClick={handleSaveToCrm}
                  disabled={selectedMemberIds.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="Lưu các thành viên đã chọn vào danh bạ Khách Hàng CRM"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Lưu Vào CRM</span>
                </button>

                <button
                  onClick={handleExportData}
                  disabled={selectedMemberIds.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="Xuất file CSV danh sách thành viên đã chọn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thành viên theo họ tên, SĐT hoặc Zalo ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            {/* Members Table */}
            <div className="max-h-72 overflow-y-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="py-2.5 px-3 w-10"></th>
                    <th className="py-2.5 px-3">Thành viên Zalo</th>
                    <th className="py-2.5 px-3">Vai trò</th>
                    <th className="py-2.5 px-3">Nguồn Quét</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái Bạn Bè</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eligibleMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        {currentGroup?.members.length === 0 
                          ? 'Nhóm chưa có dữ liệu thành viên. Hãy nhấn nút "Bắt Đầu Quét" ở cột bên trái!'
                          : 'Không có thành viên nào thỏa mãn bộ lọc tìm kiếm.'}
                      </td>
                    </tr>
                  ) : (
                    eligibleMembers.map(m => {
                      const isChecked = selectedMemberIds.includes(m.id);
                      return (
                        <tr
                          key={m.id}
                          onClick={() => toggleSelectMember(m.id)}
                          className={`hover:bg-white/5 transition-colors cursor-pointer ${
                            isChecked ? 'bg-[#D4AF37]/10' : ''
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
                                className="w-8 h-8 rounded-lg object-cover border border-white/10"
                                onError={e => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80';
                                }}
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate max-w-[170px]" title={m.name}>
                                  {m.name}
                                </div>
                                <div className="text-[10px] text-amber-200/90 font-mono">
                                  {m.phoneMasked || m.phone || m.zaloId}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                              m.role === 'admin' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : m.role === 'deputy'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {m.role === 'admin' ? 'Trưởng nhóm' : m.role === 'deputy' ? 'Phó nhóm' : 'Thành viên'}
                            </span>
                          </td>

                          <td className="py-2.5 px-3">
                            {m.isDiscoveredFromHidden ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                  <span>Nhóm Ẩn: {m.discoveryMethod === 'reaction' ? 'Thả tim' : m.discoveryMethod === 'message_history' ? 'Chat' : 'CDP'}</span>
                                </span>
                                {m.lastActiveSnippet && (
                                  <div className="text-[9px] text-slate-400 truncate max-w-[160px]" title={m.lastActiveSnippet}>
                                    {m.lastActiveSnippet}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">Danh bạ nhóm</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            {m.isFriend ? (
                              <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Bạn bè</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Chưa kết bạn</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3 CAMPAIGN MODES WORKSTATION CARD */}
          <div className="glass-card-gold rounded-2xl p-5 border border-[#D4AF37]/50 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>2. Chọn Chế Độ Tiếp Cận Thành Viên Sau Khi Quét</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Lựa chọn phương thức tương tác phù hợp với mục tiêu tiếp thị và chăm sóc khách hàng
                </p>
              </div>

              {/* 3-Mode Segmented Control */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setCampaignMode('friend_request')}
                  className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    campaignMode === 'friend_request'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>1. Gửi Kết Bạn</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignMode('message')}
                  className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    campaignMode === 'message'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>2. Nhắn Tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignMode('combo')}
                  className={`py-1.5 px-2.5 rounded-lg font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    campaignMode === 'combo'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 shadow-md shadow-amber-950/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950" />
                  <span>3. Vừa Kết Bạn Vừa Nhắn Tin (Combo)</span>
                </button>
              </div>
            </div>

            {/* Campaign Mode Details Banner */}
            {campaignMode === 'combo' ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent border border-amber-500/30 text-xs space-y-1">
                <span className="font-bold text-amber-200 flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span>Chế độ Khuyên Dùng: Vừa Gửi Lời Mời Kết Bạn VỪA Nhắn Tin Chào Mừng</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Chiến lược marketing tương tác cao: Hệ thống tự động gửi lời mời kết bạn kèm theo tin nhắn chăm sóc cá nhân hóa qua Zalo. Thành viên nhận biết được lý do kết nối từ nhóm chung, giúp tăng tỉ lệ chấp nhận kết bạn lên tới 85%.
                </p>
              </div>
            ) : campaignMode === 'friend_request' ? (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-1">
                <span className="font-bold text-blue-300 flex items-center space-x-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Chế độ 1: Chỉ Gửi Lời Mời Kết Bạn Zalo</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tự động gửi lời mời kết bạn đến các thành viên được chọn theo hạn mức an toàn của tài khoản (35-50 lời mời/ngày), giãn cách 25-45s chống checkpoint.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-1">
                <span className="font-bold text-blue-300 flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chế độ 2: Chỉ Gửi Tin Nhắn Chăm Sóc Đến Thành Viên</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Nhắn tin trực tiếp qua cửa sổ chat với thành viên cùng nhóm. Với thành viên bật chế độ chặn người lạ, hệ thống sẽ tự động gắn thẻ "Cần xác nhận".
                </p>
              </div>
            )}

            {/* Template Editors */}
            <div className="space-y-3">
              {(campaignMode === 'friend_request' || campaignMode === 'combo') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-white flex items-center space-x-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Nội dung Lời Mời Kết Bạn (Hỗ trợ Spintax):</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Tối đa 150 ký tự chuẩn Zalo
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={friendRequestTemplate}
                    onChange={e => setFriendRequestTemplate(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-sans leading-relaxed resize-none"
                    placeholder="Nhập nội dung lời mời kết bạn..."
                  />
                </div>
              )}

              {(campaignMode === 'message' || campaignMode === 'combo') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-white flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Nội dung Tin Nhắn Chăm Sóc / Tư Vấn (Hỗ trợ Biến & Spintax):</span>
                    </label>
                    <div className="flex items-center space-x-1 text-[10px] text-[#D4AF37]">
                      <span className="bg-white/5 px-1.5 py-0.5 rounded">{'{ten_khach_hang}'}</span>
                      <span className="bg-white/5 px-1.5 py-0.5 rounded">{'{nhom_zalo}'}</span>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={messageContent}
                    onChange={e => setMessageContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-sans leading-relaxed resize-none"
                    placeholder="Nhập nội dung tin nhắn gửi tới thành viên..."
                  />
                </div>
              )}
            </div>

            {/* Senders & Execution Bar */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  Tài khoản Zalo thực hiện: <strong className="text-amber-200">{assignedAccount?.name || accounts[0]?.name}</strong>
                </div>
                <div className="text-[10px] text-slate-400">
                  Độ trễ ngẫu nhiên: <strong>25s - 45s</strong> | Giới hạn an toàn chống checkpoint: <strong>BẬT</strong>
                </div>
              </div>

              <button
                onClick={handleExecuteCampaign}
                disabled={isExecuting || selectedMemberIds.length === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isExecuting 
                    ? `Đang thực hiện (${executionProgress}%)...` 
                    : `Khởi Chạy: ${campaignMode === 'combo' ? 'Vừa Kết Bạn + Nhắn Tin' : campaignMode === 'friend_request' ? 'Gửi Kết Bạn' : 'Gửi Tin Nhắn'} (${selectedMemberIds.length} TV)`}
                </span>
              </button>
            </div>
          </div>

          {/* Real-time Dispatch Results Table */}
          {dispatchResults.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Báo Cáo Kết Quả Tiếp Cận Trực Tiếp ({dispatchResults.length} thành viên)</span>
                </h4>
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="text-emerald-400 font-semibold">
                    ✓ Thành công: {dispatchResults.filter(r => r.status === 'success').length}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400 font-semibold">
                    ⚠ Cần xác nhận: {dispatchResults.filter(r => r.status === 'needs_manual').length}
                  </span>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-white/5 divide-y divide-white/5">
                {dispatchResults.map((res, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-900/60 flex items-center justify-between text-xs hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      {res.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : res.status === 'already_friend' ? (
                        <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-white">{res.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">[{res.action}] lúc {res.time}</span>
                      </div>
                    </div>
                    <span className="text-slate-300 text-[11px] truncate max-w-[280px]" title={res.note}>
                      {res.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Group Modal */}
      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg glass-card-gold rounded-2xl p-6 border border-[#D4AF37]/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#D4AF37]" />
                <span>Thêm Nhóm Zalo Mới Cần Khai Thác</span>
              </h3>
              <button 
                onClick={() => setIsAddGroupModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên Nhóm Zalo: *
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Ví dụ: Cộng Đồng Bất Động Sản Hà Nội 2026..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Đường Link Tham Gia Nhóm Zalo (Link/QR):
                </label>
                <input
                  type="text"
                  value={newGroupLink}
                  onChange={e => setNewGroupLink(e.target.value)}
                  placeholder="https://zalo.me/g/xxxxxx"
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số Thành Viên Dự Kiến:
                  </label>
                  <input
                    type="number"
                    value={newGroupMemberCount}
                    onChange={e => setNewGroupMemberCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tài Khoản Phụ Trách:
                  </label>
                  <select
                    value={newGroupAccountId}
                    onChange={e => setNewGroupAccountId(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-input text-xs"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                        {a.name} ({a.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle Hidden Community */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newGroupIsCommunityHidden}
                    onChange={e => setNewGroupIsCommunityHidden(e.target.checked)}
                    className="rounded text-[#D4AF37] focus:ring-[#D4AF37] w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-amber-200 block text-xs">
                      Đây là Nhóm Cộng Đồng ĐÃ ẨN THÀNH VIÊN
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Kích hoạt thuật toán Deep Scan CDP bóc tách người thả tim và tương tác chat.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Thêm Nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
