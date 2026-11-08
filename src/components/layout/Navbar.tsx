import React from 'react';
import { Sparkles, ShieldCheck, Database, Radio, RefreshCw, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { accounts, setActiveTab, exportDatabaseJson, addLog } = useApp();

  const onlineAccounts = accounts.filter(a => a.status === 'online' && a.isActive);
  const totalAccounts = accounts.length;

  const handleQuickBackup = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Milkyway_Zalo_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('success', 'Sao lưu nhanh', 'Đã tải xuống tệp dữ liệu sao lưu toàn hệ thống.');
  };

  return (
    <header className="relative z-20 h-16 border-b border-white/10 bg-[#070b1a]/80 backdrop-blur-md px-5 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3.5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 via-purple-600/30 to-blue-600/20 border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
          <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          <div className="absolute -inset-0.5 rounded-xl bg-[#D4AF37]/20 blur-sm -z-10" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F5E08F] via-[#D4AF37] to-[#AA820A]">
              MILKYWAY ZALO MANAGER
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              Desktop Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Hệ thống Quản lý Đa tài khoản & Tự động hóa CSKH Zalo
          </p>
        </div>
      </div>

      {/* Status Hub */}
      <div className="flex items-center space-x-4">
        {/* System Online Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Trực tuyến (Local Daemon)</span>
        </div>

        {/* Account Counter Indicator */}
        <button
          onClick={() => setActiveTab('accounts')}
          aria-label="Xem chi tiết danh sách tài khoản"
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 hover:border-[#D4AF37]/40 text-xs text-slate-200 transition-all hover:bg-slate-800/80 cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Tài khoản:</span>
          <span className="font-bold text-[#D4AF37]">
            {onlineAccounts.length}/{totalAccounts}
          </span>
          <span className="text-[10px] text-slate-400">Online</span>
        </button>

        {/* Quick Backup Action */}
        <button
          onClick={handleQuickBackup}
          title="Sao lưu nhanh toàn bộ CSDL sang tệp JSON"
          aria-label="Sao lưu nhanh cơ sở dữ liệu"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/10 hover:border-[#D4AF37]/40 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden sm:inline">Sao lưu nhanh</span>
        </button>

        {/* User / License Info */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600/30 to-purple-600/30 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-amber-200">
            MW
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-white flex items-center space-x-1">
              <span>Admin Pro</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="text-[10px] text-slate-400">Vĩnh viễn • Win 10/11</div>
          </div>
        </div>
      </div>
    </header>
  );
};
