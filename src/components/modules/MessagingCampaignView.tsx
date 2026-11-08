import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareText, 
  Upload, 
  FileText, 
  Send, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers,
  FileCode,
  ShieldAlert,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parsePhoneListFromText } from '../../utils/phoneValidator';
import { renderPersonalizedMessage } from '../../utils/templateParser';
import { MessageTask, ProcessingStatus } from '../../types';

// Preset marketing templates
const DEFAULT_TEMPLATES = [
  {
    name: 'Tri Ân & Tặng Voucher',
    content: '{Xin chào|Kính chào} {danh_xung} {ten_khach_hang}! Cảm ơn bạn đã luôn đồng hành cùng chúng tôi. Chúng tôi xin gửi tặng bạn mã ưu đãi {ma_voucher} giảm 25% cho đơn hàng trong tuần này. Chúc bạn một {thoi_gian} thật nhiều năng lượng!',
  },
  {
    name: 'CSKH & Khảo Sát Dịch Vụ',
    content: '{Chào|Xin chào} {danh_xung} {ten_khach_hang}, nhân dịp đầu tháng, bộ phận CSKH xin gửi lời chúc tốt đẹp nhất. Xin hỏi bạn có đang gặp khó khăn gì trong quá trình sử dụng dịch vụ không ạ? Cần hỗ trợ bạn cứ nhắn trực tiếp tại Zalo này nhé!',
  },
  {
    name: 'Giới Thiệu Sản Phẩm Mới',
    content: '{Kính gửi|Chào} {danh_xung} {ten_khach_hang}, bên em vừa cập nhật giải pháp mới giúp tối ưu vận hành tự động. Em xin phép gửi thông tin chi tiết qua Zalo để {danh_xung} tham khảo nhé. Chúc {danh_xung} công việc thuận lợi!',
  },
];

export const MessagingCampaignView: React.FC = () => {
  const { 
    accounts, 
    contacts, 
    campaigns, 
    createCampaign, 
    updateCampaign, 
    startCampaign, 
    pauseCampaign, 
    stopCampaign, 
    addLog,
    updateAccount 
  } = useApp();

  const activeAccounts = accounts.filter(a => a.status === 'online' && a.isActive);

  // Form State
  const [campaignName, setCampaignName] = useState<string>('Chiến dịch CSKH Tháng 11');
  const [inputText, setInputText] = useState<string>(`0988776655, Anh Nam VIP
0912345678, Chị Thu Hương
0908123456, Lê Long
0933998877, Minh Đức
0977665544, Mai Phương
0868112244, Tuấn Anh`);

  const [messageTemplate, setMessageTemplate] = useState<string>(DEFAULT_TEMPLATES[0].content);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    activeAccounts.length > 0 ? [activeAccounts[0].id] : []
  );
  const [delaySeconds, setDelaySeconds] = useState<number>(25);
  const [maxPerDay, setMaxPerDay] = useState<number>(100);

  // Parsing report
  const [parseReport, setParseReport] = useState(() => parsePhoneListFromText(inputText));

  // Active run state
  const [tasks, setTasks] = useState<MessageTask[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  const phoneFileRef = useRef<HTMLInputElement>(null);
  const templateFileRef = useRef<HTMLInputElement>(null);
  const runTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setParseReport(parsePhoneListFromText(inputText));
  }, [inputText]);

  const handlePhoneFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (text) {
        setInputText(text);
        addLog('info', 'Tải danh sách gửi tin', `Đã tải ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (text) {
        setMessageTemplate(text);
        addLog('info', 'Tải mẫu tin nhắn', `Đã nhập nội dung từ file mẫu: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleToggleAccount = (id: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Preview message with first contact
  const previewSample = renderPersonalizedMessage(
    messageTemplate,
    {
      name: parseReport.validContacts[0]?.name || 'Nguyễn Văn A',
      phone: parseReport.validContacts[0]?.normalized || '0988776655',
      salutation: 'Anh/Chị',
      voucher: 'SALE30',
    },
    0
  );

  // Start campaign execution
  const handleLaunchCampaign = () => {
    if (parseReport.validContacts.length === 0) {
      alert('Không có số điện thoại hợp lệ nào!');
      return;
    }
    if (selectedAccountIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tài khoản Zalo gửi tin.');
      return;
    }

    // Prepare tasks with blacklist opt-out filter check
    const initialTasks: MessageTask[] = parseReport.validContacts.map((c, idx) => {
      const assignedAccountId = selectedAccountIds[idx % selectedAccountIds.length];

      // Check if phone is in CRM blacklist
      const crmContact = contacts.find(con => con.normalizedPhone === c.normalized);
      const isBlacklisted = crmContact?.isOptOut;

      const rendered = renderPersonalizedMessage(
        messageTemplate,
        {
          name: c.name || `Khách hàng ${c.normalized.slice(-4)}`,
          phone: c.normalized,
          salutation: 'Anh/Chị',
        },
        idx
      );

      return {
        id: 'msg-task-' + idx + '-' + Date.now(),
        phone: c.normalized,
        normalizedPhone: c.normalized,
        contactName: c.name || `Khách hàng ${c.normalized.slice(-4)}`,
        renderedMessage: rendered,
        status: isBlacklisted ? 'opt_out' : 'pending',
        accountId: assignedAccountId,
        error: isBlacklisted ? 'Khách hàng trong danh sách Opt-out (Blacklist)' : undefined,
      };
    });

    const newCampId = createCampaign(
      {
        name: campaignName.trim() || `Chiến dịch gửi tin ${new Date().toLocaleDateString('vi-VN')}`,
        type: 'txt_message',
        accountIds: selectedAccountIds,
        totalCount: initialTasks.length,
        messageTemplate,
        delaySeconds,
        maxPerDay,
      },
      initialTasks
    );

    setActiveCampaignId(newCampId);
    setTasks(initialTasks);
    setCurrentIndex(0);
    setIsProcessing(true);
    setIsPaused(false);
    startCampaign(newCampId);
  };

  // Campaign execution loop
  useEffect(() => {
    if (!isProcessing || isPaused) return;

    if (currentIndex >= tasks.length) {
      setIsProcessing(false);
      if (activeCampaignId) {
        updateCampaign(activeCampaignId, {
          status: 'completed',
          completedAt: new Date().toLocaleTimeString('vi-VN'),
        });
      }
      addLog('success', 'Hoàn tất chiến dịch', 'Toàn bộ tin nhắn trong chiến dịch đã được gửi đi.');
      return;
    }

    const currentTask = tasks[currentIndex];

    // If opt-out, skip immediately
    if (currentTask.status === 'opt_out') {
      setCurrentIndex(prev => prev + 1);
      return;
    }

    runTimerRef.current = setTimeout(() => {
      // Simulate real dispatch result
      const isFailed = Math.random() < 0.04;
      const newStatus: ProcessingStatus = isFailed ? 'failed' : 'success';
      const errorMsg = isFailed ? 'Không thể gửi (Chặn tin nhắn từ người lạ)' : undefined;

      setTasks(prev =>
        prev.map((t, idx) => {
          if (idx === currentIndex) {
            return {
              ...t,
              status: newStatus,
              processedAt: new Date().toLocaleTimeString('vi-VN'),
              error: errorMsg,
            };
          }
          return t;
        })
      );

      // Increment campaign stats
      if (activeCampaignId) {
        const camp = campaigns.find(c => c.id === activeCampaignId);
        if (camp) {
          updateCampaign(activeCampaignId, {
            processedCount: (camp.processedCount || 0) + 1,
            successCount: (camp.successCount || 0) + (newStatus === 'success' ? 1 : 0),
            failedCount: (camp.failedCount || 0) + (newStatus === 'failed' ? 1 : 0),
          });
        }
      }

      // Increment account counter
      const acc = accounts.find(a => a.id === currentTask.accountId);
      if (acc && newStatus === 'success') {
        updateAccount(acc.id, {
          todaySentMessages: (acc.todaySentMessages || 0) + 1,
        });
      }

      setCurrentIndex(prev => prev + 1);
    }, delaySeconds * 1000 * 0.12); // speedy demonstration rate

    return () => {
      if (runTimerRef.current) clearTimeout(runTimerRef.current);
    };
  }, [isProcessing, isPaused, currentIndex, tasks, delaySeconds, activeCampaignId]);

  const handlePauseCampaign = () => {
    setIsPaused(true);
    if (activeCampaignId) pauseCampaign(activeCampaignId);
  };

  const handleResumeCampaign = () => {
    setIsPaused(false);
    if (activeCampaignId) startCampaign(activeCampaignId);
  };

  const handleStopCampaign = () => {
    setIsProcessing(false);
    setIsPaused(false);
    if (runTimerRef.current) clearTimeout(runTimerRef.current);
    if (activeCampaignId) stopCampaign(activeCampaignId);
  };

  const exportReport = () => {
    if (tasks.length === 0) return;
    const header = 'Số điện thoại,Tên khách hàng,Tài khoản gửi,Nội dung tin,Trạng thái,Thời gian gửi,Lỗi\n';
    const rows = tasks.map(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const cleanMsg = t.renderedMessage.replace(/"/g, '""').replace(/\n/g, ' ');
      return `"${t.normalizedPhone}","${t.contactName || ''}","${acc?.name || ''}","${cleanMsg}","${t.status}","${t.processedAt || ''}","${t.error || ''}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_Chien_dich_Nhan_tin_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processedCount = tasks.filter(t => t.status !== 'pending').length;
  const successCount = tasks.filter(t => t.status === 'success').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const optOutCount = tasks.filter(t => t.status === 'opt_out').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <MessageSquareText className="w-5 h-5 text-[#D4AF37]" />
            <span>Chiến Dịch Nhắn Tin Tự Động Theo File TXT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Triển khai chiến dịch chăm sóc khách hàng hàng loạt, cá nhân hóa nội dung thông minh và xoay vòng tài khoản gửi chống khóa.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".txt,.csv"
            ref={phoneFileRef}
            onChange={handlePhoneFileUpload}
            className="hidden"
          />
          <button
            onClick={() => phoneFileRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-200 hover:text-white hover:border-[#D4AF37]/50 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#D4AF37]" />
            <span>Tải DS Số (TXT)</span>
          </button>

          <input
            type="file"
            accept=".txt"
            ref={templateFileRef}
            onChange={handleTemplateFileUpload}
            className="hidden"
          />
          <button
            onClick={() => templateFileRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-200 hover:text-white hover:border-[#D4AF37]/50 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-[#D4AF37]" />
            <span>Tải Mẫu Tin (TXT)</span>
          </button>
        </div>
      </div>

      {/* Grid: Setup Campaign & Send Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Campaign Setup & Phone List */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">
              Tên chiến dịch tiếp thị
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="Ví dụ: Tri ân khách hàng tháng 11"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>Danh sách số điện thoại nhận tin (TXT / Nhập trực tiếp)</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono font-medium">
                {parseReport.validContacts.length} số hợp lệ
              </span>
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Quick template selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Chọn mẫu tin nhắn có sẵn:</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessageTemplate(tmpl.content)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    messageTemplate === tmpl.content
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F5E08F]'
                      : 'bg-slate-900/60 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Template Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              Nội dung tin nhắn (Hỗ trợ Spintax & Biến cá nhân hóa)
            </label>
            <textarea
              rows={4}
              value={messageTemplate}
              onChange={e => setMessageTemplate(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs leading-relaxed resize-none"
            />
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
              <span className="text-slate-300">Biến:</span>
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{ten_khach_hang}`}</code>
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{so_dien_thoai}`}</code>
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{danh_xung}`}</code>
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{ma_voucher}`}</code>
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{thoi_gian}`}</code>
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-[#D4AF37]">{`{Chào|Kính chào}`}</code>
            </div>
          </div>
        </div>

        {/* Right Col: Account Dispatch & Dispatch Guard */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Cấu Hình Gửi & Xoay Vòng Tài Khoản</span>
          </h3>

          {/* Account checklist */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 block">
              Chọn dàn tài khoản gửi tin (Round-Robin):
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {activeAccounts.map(acc => {
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
                    <span className="text-[10px] font-mono text-emerald-300">
                      {acc.todaySentMessages}/{acc.maxDailyMessages}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Thời gian giãn cách:</span>
                <span className="font-bold text-[#D4AF37] font-mono">{delaySeconds}s / tin</span>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={delaySeconds}
                onChange={e => setDelaySeconds(Number(e.target.value))}
                className="w-full accent-[#D4AF37]"
              />
              <span className="text-[10px] text-slate-500">
                Khuyến nghị: 25s - 45s để tài khoản an toàn tuyệt đối
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Giới hạn tin/ngày/tài khoản:</span>
                <span className="font-bold text-white font-mono">{maxPerDay} tin</span>
              </div>
              <input
                type="number"
                min="20"
                max="250"
                value={maxPerDay}
                onChange={e => setMaxPerDay(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-mono"
              />
            </div>
          </div>

          {/* Opt-out Protection Badge */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-amber-300 font-semibold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Chống Vi Phạm & Blacklist Tự Động</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Hệ thống tự động tra cứu danh sách từ chối nhận tin (Opt-out) trong CRM và bỏ qua trước khi gửi.
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview & Action Bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
        {/* Preview box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-[#D4AF37]/20 flex items-start space-x-3 text-xs">
          <Eye className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
              Xem trước tin nhắn thực tế gửi tới {parseReport.validContacts[0]?.name || 'Khách hàng'}:
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">{previewSample}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            {!isProcessing ? (
              <button
                onClick={handleLaunchCampaign}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Khởi Chạy Chiến Dịch ({parseReport.validContacts.length} số)</span>
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={handleResumeCampaign}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tiếp tục</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseCampaign}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Tạm dừng</span>
                  </button>
                )}
                <button
                  onClick={handleStopCampaign}
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
              onClick={exportReport}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Xuất Báo Cáo Chiến Dịch</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Task Monitor Table */}
      {tasks.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Nhật Ký Gửi Tin Nhắn Thời Gian Thực</span>
                {isProcessing && !isPaused && (
                  <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Đã xử lý: {processedCount}/{tasks.length} • Thành công: {successCount} • Thất bại: {failedCount} • Loại trừ Opt-out: {optOutCount}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Người nhận</th>
                  <th className="py-3 px-4">Tài khoản gửi</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Nội dung tin nhắn</th>
                  <th className="py-3 px-4">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {tasks.map(t => {
                  const acc = accounts.find(a => a.id === t.accountId);

                  let badge = (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-sans">
                      Chờ gửi
                    </span>
                  );

                  if (t.status === 'success') {
                    badge = (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đã gửi</span>
                      </span>
                    );
                  } else if (t.status === 'failed') {
                    badge = (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
                        <XCircle className="w-3 h-3" />
                        <span>Thất bại</span>
                      </span>
                    );
                  } else if (t.status === 'opt_out') {
                    badge = (
                      <span className="px-2 py-0.5 rounded-full bg-rose-900/40 text-rose-300 border border-rose-500/30 text-[10px] font-sans font-semibold flex items-center space-x-1 w-max">
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
                        {acc?.name || '-'}
                      </td>
                      <td className="py-2.5 px-4">
                        {badge}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-300 max-w-xs truncate" title={t.renderedMessage}>
                        {t.renderedMessage}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        {t.processedAt || '-'}
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
