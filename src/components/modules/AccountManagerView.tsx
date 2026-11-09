import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  QrCode, 
  Power, 
  RefreshCw, 
  ShieldCheck, 
  KeyRound, 
  Globe, 
  Send, 
  UserPlus,
  AlertCircle,
  CheckCircle,
  X,
  MessageSquare,
  BellRing,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ZaloAccount } from '../../types';
import { ZaloDirectChatModal } from './ZaloDirectChatModal';
import { ZaloQrCode } from '../common/ZaloQrCode';
import { playNotificationSound } from '../../utils/sound';

export const AccountManagerView: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    toggleAccountActive, 
    reconnectAccount,
    addLog,
    simulateIncomingMessage
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoginMethod, setAddLoginMethod] = useState<'qr' | 'password'>('qr');
  const [editingAccount, setEditingAccount] = useState<ZaloAccount | null>(null);
  const [qrModalAccount, setQrModalAccount] = useState<ZaloAccount | null>(null);
  const [chatAccount, setChatAccount] = useState<ZaloAccount | null>(null);
  const [isQrSimulating, setIsQrSimulating] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);

  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [proxy, setProxy] = useState('');
  const [maxDailyInvites, setMaxDailyInvites] = useState(40);
  const [maxDailyMessages, setMaxDailyMessages] = useState(150);
  const [note, setNote] = useState('');

  // QR Login specific state
  const [qrCountdown, setQrCountdown] = useState(120);
  const [isQrExpired, setIsQrExpired] = useState(false);
  const [qrSessionSeed, setQrSessionSeed] = useState('zalo_auth_' + Date.now());

  // Countdown timer for QR code in Add Modal
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isAddModalOpen && addLoginMethod === 'qr' && !isQrExpired && !isAuthenticating) {
      timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            setIsQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAddModalOpen, addLoginMethod, isQrExpired, isAuthenticating]);

  const openAddModal = () => {
    setAddLoginMethod('qr');
    setQrSessionSeed('zalo_session_' + Date.now());
    setQrCountdown(120);
    setIsQrExpired(false);
    setIsAuthenticating(false);
    setName(`Zalo Vận Hành 0${accounts.length + 1}`);
    setPhone('09' + Math.floor(10000000 + Math.random() * 90000000));
    setPassword('');
    setShowPassword(false);
    setProxy('');
    setMaxDailyInvites(40);
    setMaxDailyMessages(150);
    setNote('');
    setIsAddModalOpen(true);
  };

  const handleRefreshQr = () => {
    setQrSessionSeed('zalo_session_' + Date.now() + '_' + Math.random());
    setQrCountdown(120);
    setIsQrExpired(false);
  };

  const handleSelectPresetProfile = (preset: { name: string; phone: string; role: string }) => {
    setName(preset.name);
    setPhone(preset.phone);
    setNote(preset.role);
  };

  const handleQrLoginSubmit = async () => {
    setIsAuthenticating(true);
    addLog('info', 'Xác thực mã QR', 'Đang kết nối bắt tay với ứng dụng Zalo trên điện thoại...', name || 'Tài khoản mới');

    // Simulate 1.6s real mobile app Zalo handshake and session derivation
    await new Promise(r => setTimeout(r, 1600));

    const finalName = name.trim() || `Zalo Vận Hành 0${accounts.length + 1}`;
    const finalPhone = phone.trim() || ('09' + Math.floor(10000000 + Math.random() * 90000000));
    const randomAvatar = `https://images.unsplash.com/photo-${1534528741775 + (accounts.length + 3) * 110}?auto=format&fit=crop&w=200&h=200&q=80`;

    addAccount({
      name: finalName,
      phone: finalPhone,
      avatar: randomAvatar,
      status: 'online',
      isActive: true,
      lastActive: 'Vừa xong',
      maxDailyInvites: Number(maxDailyInvites),
      maxDailyMessages: Number(maxDailyMessages),
      proxy: proxy.trim() || 'Direct (Không dùng proxy)',
      note: note.trim() || 'Đăng nhập qua Quét mã QR Zalo',
      zaloId: `zalo_${finalPhone.replace(/\D/g, '')}`,
      unreadCount: 0
    });

    playNotificationSound();
    addLog('success', 'Đăng nhập QR thành công', `Tài khoản ${finalName} (${finalPhone}) đã đăng nhập và đồng bộ phiên an toàn.`, finalName);

    setIsAuthenticating(false);
    setIsAddModalOpen(false);
  };

  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) return;

    setIsAuthenticating(true);
    addLog('info', 'Xác thực mật khẩu', `Đang gửi yêu cầu đăng nhập tài khoản Zalo ${phone}...`, name || phone);

    // Simulate 1.6s secure Zalo login server verification & checkpoint checks
    await new Promise(r => setTimeout(r, 1600));

    const finalName = name.trim() || `Zalo User (${phone.slice(-4)})`;
    const randomAvatar = `https://images.unsplash.com/photo-${1507003211169 + (accounts.length + 5) * 115}?auto=format&fit=crop&w=200&h=200&q=80`;

    addAccount({
      name: finalName,
      phone: phone.trim(),
      avatar: randomAvatar,
      status: 'online',
      isActive: true,
      lastActive: 'Vừa xong',
      maxDailyInvites: Number(maxDailyInvites),
      maxDailyMessages: Number(maxDailyMessages),
      proxy: proxy.trim() || 'Direct (Không dùng proxy)',
      note: note.trim() || 'Đăng nhập bằng Mật khẩu Zalo',
      zaloId: `zalo_${phone.replace(/\D/g, '')}`,
      unreadCount: 0
    });

    playNotificationSound();
    addLog('success', 'Đăng nhập Mật khẩu thành công', `Tài khoản ${finalName} (${phone}) đã kết nối thành công qua giao thức bảo mật.`, finalName);

    setIsAuthenticating(false);
    setIsAddModalOpen(false);
  };

  const openEditModal = (acc: ZaloAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setPhone(acc.phone);
    setProxy(acc.proxy || '');
    setMaxDailyInvites(acc.maxDailyInvites);
    setMaxDailyMessages(acc.maxDailyMessages);
    setNote(acc.note || '');
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    updateAccount(editingAccount.id, {
      name: name.trim(),
      phone: phone.trim(),
      proxy: proxy.trim(),
      maxDailyInvites: Number(maxDailyInvites),
      maxDailyMessages: Number(maxDailyMessages),
      note: note.trim(),
    });

    setEditingAccount(null);
  };

  const handleReconnect = async (id: string) => {
    setReconnectingId(id);
    await reconnectAccount(id);
    setReconnectingId(null);
  };

  const handleSimulateQrScan = async () => {
    if (!qrModalAccount) return;
    setIsQrSimulating(true);

    // Simulate mobile Zalo app confirmation
    await new Promise(r => setTimeout(r, 1800));
    updateAccount(qrModalAccount.id, {
      status: 'online',
      isActive: true,
      lastActive: 'Vừa xong',
      sessionEncrypted: 'aes-gcm-256:' + Math.random().toString(36).substring(2, 18)
    });
    playNotificationSound();
    addLog('success', 'Đăng nhập QR thành công', `Tài khoản ${qrModalAccount.name} đã xác thực thành công qua ứng dụng di động.`, qrModalAccount.name);

    setIsQrSimulating(false);
    setQrModalAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <span>Quản Lý Danh Sách Đa Tài Khoản Zalo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý độc lập nhiều phiên đăng nhập, chống checkpoint bằng cấu hình Proxy riêng biệt và mã hóa token phiên AES-GCM.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => simulateIncomingMessage()}
            title="Mô phỏng tin nhắn mới đến từ khách hàng ngẫu nhiên để kiểm tra số thông báo đỏ và chuông báo"
            className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] cursor-pointer flex items-center space-x-2"
          >
            <BellRing className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Mô Phỏng Tin Nhắn Mới Đến</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer flex items-center space-x-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tài Khoản Zalo</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const isOnline = acc.status === 'online';
          const isReconnecting = reconnectingId === acc.id || acc.status === 'connecting';
          const isQrRequired = acc.status === 'qr_required';

          return (
            <div
              key={acc.id}
              className={`rounded-2xl p-5 transition-all relative overflow-hidden ${
                acc.isActive
                  ? 'glass-card border-white/10 hover:border-[#D4AF37]/50'
                  : 'bg-slate-900/40 border-white/5 opacity-65'
              }`}
            >
              {/* Top Row: Avatar, Name, Phone & Power Switch */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/15"
                      onError={e => {
                        // Fallback avatar
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80';
                      }}
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#070b1a] ${
                        isOnline
                          ? 'bg-emerald-500'
                          : isQrRequired
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      title={acc.status}
                    />
                    {/* Red Notification Number Badge on Avatar */}
                    {acc.unreadCount !== undefined && acc.unreadCount > 0 && (
                      <div
                        className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center border-2 border-[#070b1a] shadow-[0_0_12px_rgba(225,29,72,0.9)] animate-pulse z-10"
                        title={`${acc.unreadCount} tin nhắn mới chưa đọc`}
                      >
                        {acc.unreadCount > 99 ? '99+' : acc.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate" title={acc.name}>
                      {acc.name}
                    </h3>
                    <div className="text-xs font-mono text-amber-200/90 font-medium">
                      {acc.phone}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ID: {acc.zaloId || acc.id}
                    </div>
                  </div>
                </div>

                {/* Power Toggle Button */}
                <button
                  onClick={() => toggleAccountActive(acc.id)}
                  title={acc.isActive ? 'Tắt tài khoản' : 'Bật tài khoản'}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    acc.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border-white/10 hover:text-slate-300'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Status & Session Details */}
              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                  <span className="text-slate-400">Trạng thái kết nối:</span>
                  <span
                    className={`font-semibold flex items-center space-x-1 ${
                      isOnline
                        ? 'text-emerald-400'
                        : isQrRequired
                        ? 'text-amber-400'
                        : isReconnecting
                        ? 'text-blue-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isReconnecting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Đang kết nối lại...</span>
                      </>
                    ) : isOnline ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Trực tuyến (Hoạt động)</span>
                      </>
                    ) : isQrRequired ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Cần quét mã QR</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Mất kết nối</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                  <span className="text-slate-400">Hoạt động gần nhất:</span>
                  <span className="text-slate-300">{acc.lastActive}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                  <span className="text-slate-400">Hạn mức lời mời / ngày:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {acc.todaySentInvites} / {acc.maxDailyInvites}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                  <span className="text-slate-400">Tin nhắn hôm nay:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {acc.todaySentMessages} / {acc.maxDailyMessages}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] py-1">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Proxy:</span>
                  </span>
                  <span className="text-slate-300 font-mono truncate max-w-[160px]" title={acc.proxy}>
                    {acc.proxy || 'Direct'}
                  </span>
                </div>
              </div>

              {/* Security token banner */}
              <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 text-[10px] text-slate-400 flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-[#D4AF37]">
                  <KeyRound className="w-3 h-3" />
                  <span className="font-semibold">Phiên mã hóa:</span>
                </div>
                <span className="font-mono text-slate-300">{acc.sessionEncrypted.slice(0, 20)}...</span>
              </div>

              {/* Direct Zalo Chat Workstation Trigger Button */}
              <button
                onClick={() => setChatAccount(acc)}
                aria-label={`Mở khung nhắn tin trực tiếp Zalo cho ${acc.name}`}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0068ff]/25 via-blue-900/40 to-[#D4AF37]/20 border border-[#0068ff]/50 hover:border-[#0068ff] text-xs font-bold text-white hover:brightness-110 transition-all flex items-center justify-between cursor-pointer shadow-[0_0_15px_rgba(0,104,255,0.25)] mb-3 group"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-[#0068ff] flex items-center justify-center text-[11px] font-black text-white shadow-sm group-hover:scale-105 transition-transform">
                    Z
                  </div>
                  <span className="text-white group-hover:text-blue-100">Khung Nhắn Tin Zalo</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0068ff]/30 text-blue-200 border border-[#0068ff]/50">
                    Live
                  </span>
                </div>
                {acc.unreadCount !== undefined && acc.unreadCount > 0 ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-md shadow-rose-950 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span>{acc.unreadCount} tin mới</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-200">
                    Mở Chat
                  </span>
                )}
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {isQrRequired ? (
                  <button
                    onClick={() => setQrModalAccount(acc)}
                    className="col-span-2 py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Quét QR Đăng Nhập</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleReconnect(acc.id)}
                    disabled={isReconnecting}
                    className="py-2 px-2.5 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700/80 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin text-[#D4AF37]' : ''}`} />
                    <span>Kiểm tra</span>
                  </button>
                )}

                <button
                  onClick={() => openEditModal(acc)}
                  className="py-2 px-2.5 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700/80 border border-white/10 text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Sửa</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xóa tài khoản ${acc.name}?`)) {
                      deleteAccount(acc.id);
                    }
                  }}
                  className="py-2 px-2.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer"
                  title="Xóa tài khoản"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal - Multi-method Zalo Login */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-card-gold rounded-2xl p-6 border border-[#D4AF37]/45 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Thêm Tài Khoản Zalo Vào Hệ Thống</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lựa chọn phương thức xác thực an toàn chuẩn Zalo Desktop
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Login Method Segmented Control / Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setAddLoginMethod('qr')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  addLoginMethod === 'qr'
                    ? 'bg-gradient-to-r from-[#0068ff] to-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>1. Quét Mã QR Zalo (Khuyên dùng)</span>
              </button>

              <button
                type="button"
                onClick={() => setAddLoginMethod('password')}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  addLoginMethod === 'password'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 shadow-lg shadow-amber-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>2. Đăng Nhập Với Mật Khẩu</span>
              </button>
            </div>

            {/* TAB 1: QR CODE LOGIN */}
            {addLoginMethod === 'qr' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Left Column: QR Code Display & Scan instructions */}
                  <div className="md:col-span-6 flex flex-col items-center text-center p-4 rounded-xl bg-slate-900/60 border border-white/10">
                    <div className="mb-2">
                      <ZaloQrCode
                        value={qrSessionSeed}
                        size={180}
                        isExpired={isQrExpired}
                        onRefresh={handleRefreshQr}
                      />
                    </div>

                    {/* Countdown and Refresh */}
                    <div className="flex items-center justify-between w-full max-w-[210px] text-[11px] mt-1 text-slate-400">
                      <span className="flex items-center space-x-1">
                        <span>Hiệu lực:</span>
                        <span className={`font-mono font-bold ${qrCountdown < 20 ? 'text-rose-400 animate-pulse' : 'text-[#D4AF37]'}`}>
                          {qrCountdown}s
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleRefreshQr}
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Làm mới</span>
                      </button>
                    </div>

                    {/* Step Instructions */}
                    <div className="w-full text-left mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-[#0068ff]/30 text-blue-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                        <span>Mở ứng dụng <strong>Zalo</strong> trên điện thoại</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-[#0068ff]/30 text-blue-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                        <span>Bấm biểu tượng <strong>Quét mã QR</strong> ở góc trên bên phải</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-[#0068ff]/30 text-blue-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                        <span>Hướng camera vào mã trên và bấm <strong>Đăng nhập</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Account Configuration & Session Binding */}
                  <div className="md:col-span-6 space-y-3">
                    {/* Quick Profile Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-medium text-slate-300">
                          Chọn nhanh tài khoản Zalo mẫu:
                        </label>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { name: 'Nguyễn Hoàng Nam', phone: '0988567123', role: 'Zalo Sale BĐS & Tài chính' },
                          { name: 'Trần Mai Anh', phone: '0912345678', role: 'Zalo CSKH & Marketing' },
                          { name: 'Lê Quốc Bảo', phone: '0977889900', role: 'Zalo Telesale Miền Bắc' }
                        ].map((preset) => (
                          <button
                            key={preset.phone}
                            type="button"
                            onClick={() => handleSelectPresetProfile(preset)}
                            className={`p-2 rounded-lg text-left border transition-all text-xs cursor-pointer flex items-center justify-between ${
                              name === preset.name
                                ? 'bg-[#0068ff]/20 border-[#0068ff] text-white shadow-sm'
                                : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                            }`}
                          >
                            <span className="font-semibold">{preset.name}</span>
                            <span className="font-mono text-[11px] text-amber-200/90">{preset.phone}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Tên gợi nhớ trên phần mềm:
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ví dụ: Zalo CSKH Miền Nam 01"
                        className="w-full px-3 py-1.5 rounded-xl glass-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Số điện thoại Zalo:
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0988123456"
                        className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Proxy riêng (IP:Port:User:Pass - tùy chọn):
                      </label>
                      <input
                        type="text"
                        value={proxy}
                        onChange={e => setProxy(e.target.value)}
                        placeholder="103.142.12.88:8080 (hoặc để trống dùng Direct)"
                        className="w-full px-3 py-1.5 rounded-xl glass-input text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Kết bạn/ngày</label>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={maxDailyInvites}
                          onChange={e => setMaxDailyInvites(Number(e.target.value))}
                          className="w-full px-2.5 py-1 rounded-lg glass-input text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Tin nhắn/ngày</label>
                        <input
                          type="number"
                          min="10"
                          max="300"
                          value={maxDailyMessages}
                          onChange={e => setMaxDailyMessages(Number(e.target.value))}
                          className="w-full px-2.5 py-1 rounded-lg glass-input text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Guarantee Notice */}
                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-200/90 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Phiên đăng nhập QR được mã hóa khóa <strong>AES-GCM 256-bit</strong>. An toàn tuyệt đối, không yêu cầu cung cấp mật khẩu Zalo cá nhân.
                  </span>
                </div>

                {/* Action Buttons for QR */}
                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isAuthenticating}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleQrLoginSubmit}
                    disabled={isAuthenticating || isQrExpired}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0068ff] via-blue-600 to-[#D4AF37] text-white font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,104,255,0.4)] flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang đồng bộ phiên Zalo...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Xác Nhận Đã Quét Trên Điện Thoại</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PASSWORD LOGIN */}
            {addLoginMethod === 'password' && (
              <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Số điện thoại đăng nhập Zalo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 0988123456"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mật khẩu Zalo *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập mật khẩu tài khoản Zalo"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-9 rounded-xl glass-input text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tên gợi nhớ tài khoản *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Zalo CSKH Miền Nam 01"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Cấu hình Proxy (IP:Port:User:Pass - tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="103.142.12.88:8080:user:pass"
                      value={proxy}
                      onChange={e => setProxy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hạn mức kết bạn / ngày
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={maxDailyInvites}
                      onChange={e => setMaxDailyInvites(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Hạn mức tin nhắn / ngày
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={maxDailyMessages}
                      onChange={e => setMaxDailyMessages(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ghi chú mục đích sử dụng
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú phân công nhân sự hoặc danh sách khách hàng phụ trách..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                {/* Password Security Note */}
                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span>
                    Chính sách bảo mật: Mật khẩu chỉ dùng để cấp token phiên và <strong>không bao giờ lưu trữ dưới dạng văn bản thuần</strong> trên ổ cứng.
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isAuthenticating}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Đang xác thực bảo mật...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Đăng Nhập Bằng Mật Khẩu</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-card-gold rounded-2xl p-6 border border-[#D4AF37]/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                <span>Chỉnh Sửa Thông Tin Tài Khoản</span>
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tên tài khoản
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Proxy
                </label>
                <input
                  type="text"
                  value={proxy}
                  onChange={e => setProxy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hạn mức kết bạn/ngày
                  </label>
                  <input
                    type="number"
                    value={maxDailyInvites}
                    onChange={e => setMaxDailyInvites(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hạn mức tin nhắn/ngày
                  </label>
                  <input
                    type="number"
                    value={maxDailyMessages}
                    onChange={e => setMaxDailyMessages(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer"
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated QR Code Authentication Modal */}
      {qrModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-sm glass-card-gold rounded-2xl p-6 border border-[#D4AF37]/50 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                <span>Quét Mã QR Zalo</span>
              </h3>
              <button
                onClick={() => setQrModalAccount(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Mở ứng dụng Zalo trên điện thoại của tài khoản <span className="font-bold text-amber-200">{qrModalAccount.name}</span> ({qrModalAccount.phone}), chọn biểu tượng <span className="text-[#D4AF37]">Quét mã QR</span>.
            </p>

            {/* Generated QR Matrix Simulation */}
            <div className="flex flex-col items-center justify-center relative">
              {isQrSimulating ? (
                <div className="p-8 rounded-2xl bg-slate-900/90 border border-white/10 w-52 h-52 flex flex-col items-center justify-center text-white">
                  <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mb-2" />
                  <span className="text-xs font-bold text-slate-200">Đang đồng bộ phiên...</span>
                </div>
              ) : (
                <ZaloQrCode
                  value={qrModalAccount.sessionEncrypted || qrModalAccount.phone}
                  size={180}
                />
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              Mã QR có hiệu lực trong <span className="text-[#D4AF37] font-semibold">120 giây</span>. Không chia sẻ mã này cho người khác.
            </div>

            <div className="pt-2">
              <button
                onClick={handleSimulateQrScan}
                disabled={isQrSimulating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
              >
                {isQrSimulating ? 'Đang xác nhận trên điện thoại...' : 'Xác nhận Đã Quét Trên App'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Zalo Chat Messenger Workstation Modal */}
      {chatAccount && (
        <ZaloDirectChatModal
          account={chatAccount}
          onClose={() => setChatAccount(null)}
        />
      )}
    </div>
  );
};
