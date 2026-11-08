import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Filter, 
  ShieldCheck, 
  Sparkles,
  Clock,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parsePhoneListFromText, normalizeVietnamesePhone } from '../../utils/phoneValidator';
import { renderPersonalizedMessage } from '../../utils/templateParser';
import { FriendRequestTask, ProcessingStatus } from '../../types';

export const FriendRequestView: React.FC = () => {
  const { accounts, contacts, createCampaign, addLog, updateAccount } = useApp();

  // Active online accounts
  const activeAccounts = accounts.filter(a => a.status === 'online' && a.isActive);

  // Input states
  const [inputText, setInputText] = useState<string>(`0988776655, Anh Nam VIP
0912345678, Chị Hương Spa
0908123456, Lê Long BĐS
0933998877, Minh Đức
+84988776655, (Số trùng lặp kiểm tra)
0123456789, (Số đầu mạng không hợp lệ)
0977665544, Mai Phương
0868112244, Tuấn Anh`);

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    activeAccounts.length > 0 ? [activeAccounts[0].id] : []
  );

  const [greetingMessage, setGreetingMessage] = useState<string>(
    '{Chào|Xin chào} {danh_xung} {ten_khach_hang}! Mình kết nối trên Zalo để tiện trao đổi thông tin hợp tác nhé ạ.'
  );

  const [delaySeconds, setDelaySeconds] = useState<number>(20);
  const [maxPerDay, setMaxPerDay] = useState<number>(35);

  // Analysis state
  const [parseReport, setParseReport] = useState(() => parsePhoneListFromText(inputText));

  // Execution states
  const [tasks, setTasks] = useState<FriendRequestTask[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [previewSample, setPreviewSample] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-analyze when inputText changes
  useEffect(() => {
    const report = parsePhoneListFromText(inputText);
    setParseReport(report);
  }, [inputText]);

  // Update sample message preview
  useEffect(() => {
    const sample = renderPersonalizedMessage(
      greetingMessage,
      {
        name: parseReport.validContacts[0]?.name || 'Nguyễn Văn A',
        phone: parseReport.validContacts[0]?.normalized || '0988776655',
        salutation: 'Anh/Chị',
      },
      0
    );
    setPreviewSample(sample);
  }, [greetingMessage, parseReport]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        addLog('info', 'Tải file TXT', `Đã nhập danh sách từ tệp: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleToggleAccount = (id: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Start processing tasks queue
  const handleStartQueue = () => {
    if (parseReport.validContacts.length === 0) {
      alert('Không có số điện thoại hợp lệ nào để gửi!');
      return;
    }
    if (selectedAccountIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tài khoản Zalo để thực hiện gửi.');
      return;
    }

    // Prepare tasks
    const initialTasks: FriendRequestTask[] = parseReport.validContacts.map((c, idx) => {
      const assignedAccountId = selectedAccountIds[idx % selectedAccountIds.length];
      
      // Check if contact was previously already friends or pending in CRM
      const crmMatch = contacts.find(con => con.normalizedPhone === c.normalized);
      const isAlreadyFriend = crmMatch?.friendStatus === 'friend';
      const isPending = crmMatch?.friendStatus === 'pending';
      const isOptOut = crmMatch?.isOptOut;

      let initStatus: ProcessingStatus = 'pending';
      let initError: string | undefined = undefined;

      if (isOptOut) {
        initStatus = 'opt_out';
        initError = 'Nằm trong danh sách Blacklist từ chối nhận tin';
      } else if (isAlreadyFriend) {
        initStatus = 'already_sent';
        initError = 'Đã là bạn bè trên Zalo';
      } else if (isPending) {
        initStatus = 'already_sent';
        initError = 'Đã gửi lời mời trước đó';
      }

      return {
        id: 'task-' + idx + '-' + Date.now(),
        phone: c.normalized,
        normalizedPhone: c.normalized,
        contactName: c.name || `Khách hàng ${c.normalized.slice(-4)}`,
        status: initStatus,
        accountId: assignedAccountId,
        note: greetingMessage,
        error: initError,
      };
    });

    setTasks(initialTasks);
    setCurrentIndex(0);
    setIsProcessing(true);
    setIsPaused(false);

    createCampaign(
      {
        name: `Kết bạn TXT - ${new Date().toLocaleDateString('vi-VN')} (${initialTasks.length} số)`,
        type: 'friend_request',
        accountIds: selectedAccountIds,
        totalCount: initialTasks.length,
        messageTemplate: greetingMessage,
        delaySeconds,
        maxPerDay,
      },
      initialTasks
    );

    addLog('info', 'Khởi chạy kết bạn tự động', `Bắt đầu gửi ${initialTasks.length} lời mời với ${selectedAccountIds.length} tài khoản Zalo.`);
  };

  // Step-by-step processing loop
  useEffect(() => {
    if (!isProcessing || isPaused) return;

    if (currentIndex >= tasks.length) {
      setIsProcessing(false);
      addLog('success', 'Hoàn tất kết bạn', 'Đã xử lý xong toàn bộ danh sách kết bạn.');
      return;
    }

    const currentTask = tasks[currentIndex];

    // If task is already flagged (e.g. opt-out or already friend), skip to next
    if (currentTask.status !== 'pending') {
      setCurrentIndex(prev => prev + 1);
      return;
    }

    // Set delay timer to simulate realistic human delay & platform safety
    timerRef.current = setTimeout(() => {
      // Simulate real Zalo result: 92% success, 5% privacy block, 3% not registered
      const rand = Math.random();
      let outcomeStatus: ProcessingStatus = 'success';
      let errorMsg: string | undefined = undefined;

      if (rand < 0.05) {
        outcomeStatus = 'needs_confirm';
        errorMsg = 'Người dùng chặn nhận lời mời từ người lạ (Cần thao tác qua SĐT)';
      } else if (rand < 0.08) {
        outcomeStatus = 'failed';
        errorMsg = 'Số điện thoại chưa kích hoạt Zalo';
      }

      setTasks(prev =>
        prev.map((t, idx) => {
          if (idx === currentIndex) {
            return {
              ...t,
              status: outcomeStatus,
              processedAt: new Date().toLocaleTimeString('vi-VN'),
              error: errorMsg,
            };
          }
          return t;
        })
      );

      // Increment account invite count
      const acc = accounts.find(a => a.id === currentTask.accountId);
      if (acc && outcomeStatus === 'success') {
        updateAccount(acc.id, {
          todaySentInvites: (acc.todaySentInvites || 0) + 1,
        });
      }

      setCurrentIndex(prev => prev + 1);
    }, delaySeconds * 1000 * 0.15); // scaled interval for snappy preview

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isProcessing, isPaused, currentIndex, tasks, delaySeconds]);

  const handlePause = () => {
    setIsPaused(true);
    addLog('warning', 'Tạm dừng gửi kết bạn', 'Tiến trình kết bạn đã tạm dừng.');
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsProcessing(false);
    setIsPaused(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    addLog('warning', 'Hủy tiến trình kết bạn', 'Đã dừng tiến trình gửi kết bạn.');
  };

  const exportResultCsv = () => {
    if (tasks.length === 0) return;
    const header = 'Số điện thoại,Tên,Tài khoản gửi,Trạng thái,Thời gian,Ghi chú lỗi\n';
    const rows = tasks.map(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      return `"${t.normalizedPhone}","${t.contactName || ''}","${acc?.name || ''}","${t.status}","${t.processedAt || ''}","${t.error || ''}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ket_ban_Zalo_Ket_qua_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Metrics for current run
  const successCount = tasks.filter(t => t.status === 'success').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const alreadySentCount = tasks.filter(t => t.status === 'already_sent').length;
  const needsConfirmCount = tasks.filter(t => t.status === 'needs_confirm').length;
  const optOutCount = tasks.filter(t => t.status === 'opt_out').length;
  const processedCount = tasks.filter(t => t.status !== 'pending').length;

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title & Guidelines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#D4AF37]" />
            <span>Tự Động Gửi Lời Mời Kết Bạn Từ File TXT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Phân tích số điện thoại Việt Nam, lọc trùng, tuân thủ giới hạn kết bạn an toàn của Zalo và theo dõi trạng thái từng số.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".txt,.csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-200 hover:text-white hover:border-[#D4AF37]/50 text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#D4AF37]" />
            <span>Tải file TXT lên</span>
          </button>
        </div>
      </div>

      {/* Step 1 & 2: Input Box & Phone Analysis Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Phone Input Area */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span>Danh sách số điện thoại (Nhập trực tiếp hoặc tải TXT)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {parseReport.totalLines} dòng dữ liệu
            </span>
          </div>

          <textarea
            rows={7}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="0988776655, Nguyễn Văn A&#10;0912345678, Trần Thị B&#10;0903334444"
            className="w-full p-3 rounded-xl glass-input text-xs font-mono leading-relaxed resize-none"
          />

          {/* Analysis Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <div className="text-[10px] text-emerald-400/80 font-medium uppercase">Hợp lệ & Sẵn sàng</div>
              <div className="text-xl font-black">{parseReport.validContacts.length}</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <div className="text-[10px] text-amber-400/80 font-medium uppercase">Số trùng lặp</div>
              <div className="text-xl font-black">{parseReport.duplicateCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              <div className="text-[10px] text-rose-400/80 font-medium uppercase">Số không hợp lệ</div>
              <div className="text-xl font-black">{parseReport.invalidCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
              <div className="text-[10px] text-blue-400/80 font-medium uppercase">Đã chuẩn hóa 10 số</div>
              <div className="text-xl font-black">100%</div>
            </div>
          </div>
        </div>

        {/* Right: Sender Account & Rate Limit Configuration */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Chọn Tài Khoản & Cấu Hình Gửi</span>
          </h3>

          {/* Account checkboxes */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 block">
              Tài khoản Zalo thực thi (xoay vòng ngẫu nhiên):
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {activeAccounts.length === 0 ? (
                <div className="text-xs text-rose-400 p-2 bg-rose-500/10 rounded-lg">
                  Không có tài khoản nào Online. Vui lòng kích hoạt trong mục Quản lý tài khoản.
                </div>
              ) : (
                activeAccounts.map(acc => {
                  const isChecked = selectedAccountIds.includes(acc.id);
                  return (
                    <label
                      key={acc.id}
                      className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-white'
                          : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAccount(acc.id)}
                        className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37]"
                      />
                      <img
                        src={acc.avatar}
                        alt=""
                        className="w-5 h-5 rounded-md object-cover"
                      />
                      <span className="truncate flex-1 font-medium">{acc.name}</span>
                      <span className="text-[10px] font-mono text-amber-200">
                        {acc.todaySentInvites}/{acc.maxDailyInvites}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Rate Limit / Delay Configuration */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Giãn cách an toàn (giây):</span>
                <span className="font-bold text-[#D4AF37] font-mono">{delaySeconds}s / lượt</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={delaySeconds}
                onChange={e => setDelaySeconds(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
              <span className="text-[10px] text-slate-500">Khuyên dùng: 20s - 45s để tránh checkpoint Zalo</span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Giới hạn tối đa/ngày/acc:</span>
                <span className="font-bold text-white font-mono">{maxPerDay} lời mời</span>
              </div>
              <input
                type="number"
                min="10"
                max="50"
                value={maxPerDay}
                onChange={e => setMaxPerDay(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Message Content & Personalized Preview */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Nội dung lời mời kết bạn (Hỗ trợ Spintax & Cá nhân hóa)</span>
          </label>
          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
            <span>Biến hỗ trợ:</span>
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{ten_khach_hang}`}</code>
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{danh_xung}`}</code>
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{Xin chào|Chào bạn}`}</code>
          </div>
        </div>

        <textarea
          rows={3}
          value={greetingMessage}
          onChange={e => setGreetingMessage(e.target.value)}
          placeholder="{Chào|Xin chào} {danh_xung} {ten_khach_hang}! Mình kết nối Zalo nhé..."
          className="w-full p-3 rounded-xl glass-input text-xs leading-relaxed resize-none"
        />

        {/* Live Preview Box */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-[#D4AF37]/20 flex items-start space-x-3 text-xs">
          <Eye className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block mb-0.5">
              Xem trước nội dung gửi mẫu:
            </span>
            <p className="text-slate-200 italic font-medium">"{previewSample}"</p>
          </div>
        </div>

        {/* Execution Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center space-x-2">
            {!isProcessing ? (
              <button
                onClick={handleStartQueue}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt Đầu Gửi Kết Bạn ({parseReport.validContacts.length} số)</span>
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={handleResume}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tiếp tục</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Tạm dừng</span>
                  </button>
                )}
                <button
                  onClick={handleStop}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng hẳn</span>
                </button>
              </>
            )}
          </div>

          {tasks.length > 0 && (
            <button
              onClick={exportResultCsv}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Xuất Báo Cáo CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Step 4: Results Table & Live Monitor */}
      {tasks.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Tiến Độ Thực Thi Lời Mời Kết Bạn</span>
                {isProcessing && !isPaused && (
                  <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Đã xử lý: {processedCount}/{tasks.length} • Thành công: {successCount} • Thất bại: {failedCount} • Đã gửi trước: {alreadySentCount}
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg glass-input text-xs"
              >
                <option value="all" className="bg-slate-900 text-white">Tất cả ({tasks.length})</option>
                <option value="success" className="bg-slate-900 text-emerald-400">Thành công ({successCount})</option>
                <option value="failed" className="bg-slate-900 text-rose-400">Thất bại ({failedCount})</option>
                <option value="already_sent" className="bg-slate-900 text-blue-400">Đã gửi trước đó ({alreadySentCount})</option>
                <option value="needs_confirm" className="bg-slate-900 text-amber-400">Cần xác nhận ({needsConfirmCount})</option>
                <option value="opt_out" className="bg-slate-900 text-rose-300">Opt-out Blacklist ({optOutCount})</option>
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Tài khoản gửi</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Ghi chú / Thông báo lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredTasks.map((t, idx) => {
                  const acc = accounts.find(a => a.id === t.accountId);

                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-sans">
                      Chờ xử lý
                    </span>
                  );

                  if (t.status === 'success') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Thành công</span>
                      </span>
                    );
                  } else if (t.status === 'failed') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
                        <XCircle className="w-3 h-3" />
                        <span>Thất bại</span>
                      </span>
                    );
                  } else if (t.status === 'already_sent') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
                        <Clock className="w-3 h-3" />
                        <span>Đã gửi trước đó</span>
                      </span>
                    );
                  } else if (t.status === 'needs_confirm') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Cần xác nhận</span>
                      </span>
                    );
                  } else if (t.status === 'opt_out') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full bg-rose-900/40 text-rose-400 border border-rose-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
                        <XCircle className="w-3 h-3" />
                        <span>Opt-out</span>
                      </span>
                    );
                  }

                  return (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-white">
                        {t.normalizedPhone}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-200">
                        {t.contactName || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-300">
                        {acc?.name || 'Tài khoản Zalo'}
                      </td>
                      <td className="py-2.5 px-4">
                        {statusBadge}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        {t.processedAt || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                        {t.error || (t.status === 'success' ? 'Đã gửi lời mời hợp lệ' : '-')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
