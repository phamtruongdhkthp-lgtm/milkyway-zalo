import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ZaloAccount } from '../../types';

export const AccountManagerView: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    toggleAccountActive, 
    reconnectAccount,
    addLog
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ZaloAccount | null>(null);
  const [qrModalAccount, setQrModalAccount] = useState<ZaloAccount | null>(null);
  const [isQrSimulating, setIsQrSimulating] = useState(false);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);

  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [proxy, setProxy] = useState('');
  const [maxDailyInvites, setMaxDailyInvites] = useState(40);
  const [maxDailyMessages, setMaxDailyMessages] = useState(150);
  const [note, setNote] = useState('');

  const openAddModal = () => {
    setName('');
    setPhone('');
    setProxy('');
    setMaxDailyInvites(40);
    setMaxDailyMessages(150);
    setNote('');
    setIsAddModalOpen(true);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addAccount({
      name: name.trim(),
      phone: phone.trim(),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + accounts.length * 100}?auto=format&fit=crop&w=200&h=200&q=80`,
      status: 'online',
      isActive: true,
      lastActive: 'Vừa xong',
      maxDailyInvites: Number(maxDailyInvites),
      maxDailyMessages: Number(maxDailyMessages),
      proxy: proxy.trim() || 'Direct (Không dùng proxy)',
      note: note.trim() || 'Tài khoản vận hành mới',
      zaloId: `zalo_${phone.replace(/\D/g, '')}`,
    });

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
    await new Promise(r => setTimeout(r, 2000));
    updateAccount(qrModalAccount.id, {
      status: 'online',
      isActive: true,
      lastActive: 'Vừa xong',
      sessionEncrypted: 'aes-gcm-256:' + Math.random().toString(36).substring(2, 18)
    });
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

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tài Khoản Zalo</span>
        </button>
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
              <div className="p-2 rounded-lg bg-slate-900/80 border border-white/5 text-[10px] text-slate-400 flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-[#D4AF37]">
                  <KeyRound className="w-3 h-3" />
                  <span className="font-semibold">Phiên mã hóa:</span>
                </div>
                <span className="font-mono text-slate-300">{acc.sessionEncrypted.slice(0, 20)}...</span>
              </div>

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

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-card-gold rounded-2xl p-6 border border-[#D4AF37]/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#D4AF37]" />
                <span>Thêm Tài Khoản Zalo Mới</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
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
                  Cấu hình Proxy (IP riêng biệt, HTTP/SOCKS5)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 103.142.12.88:8080:user:pass (tùy chọn)"
                  value={proxy}
                  onChange={e => setProxy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nên dùng Proxy tĩnh sạch cho mỗi tài khoản để hạn chế checkpoint vị trí.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hạn mức kết bạn/ngày
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
                    Hạn mức tin nhắn/ngày
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
                  Ghi chú mục đích
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú phân công nhân sự hoặc loại khách hàng phụ trách..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer"
                >
                  Lưu Tài Khoản
                </button>
              </div>
            </form>
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
            <div className="p-4 rounded-2xl bg-white mx-auto w-52 h-52 flex flex-col items-center justify-center relative shadow-lg">
              {isQrSimulating ? (
                <div className="flex flex-col items-center space-x-2 text-slate-900">
                  <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mb-2" />
                  <span className="text-xs font-bold text-slate-800">Đang đồng bộ phiên...</span>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://zalo.me/s/milkyway-auth-session"
                    alt="Zalo QR Login"
                    className="w-44 h-44 object-contain"
                  />
                </div>
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
    </div>
  );
};
