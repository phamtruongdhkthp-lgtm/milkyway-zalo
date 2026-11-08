import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogView: React.FC = () => {
  const { logs, clearLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredLogs = logs.filter(l => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = l.action.toLowerCase().includes(q);
      const matchDetails = l.details.toLowerCase().includes(q);
      const matchAccount = (l.accountName || '').toLowerCase().includes(q);
      if (!matchAction && !matchDetails && !matchAccount) return false;
    }
    return true;
  });

  const exportLogsTxt = () => {
    const text = filteredLogs.map(l => 
      `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.accountName || 'SYSTEM'}] ${l.action}: ${l.details}`
    ).join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Milkyway_Zalo_Audit_Log_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ScrollText className="w-5 h-5 text-[#D4AF37]" />
            <span>Lịch Sử Hoạt Động & Nhật Ký Kiểm Toán Hệ Thống</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ghi nhận minh bạch mọi thao tác gửi tin, kết nối tài khoản, cảnh báo vi phạm và phát hiện bất thường.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportLogsTxt}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-200 hover:text-white hover:border-[#D4AF37]/50 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Xuất Nhật Ký (.txt)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa sạch toàn bộ nhật ký kiểm toán?')) clearLogs();
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Làm sạch</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm hành động, tên tài khoản, nội dung lỗi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs"
          >
            <option value="all" className="bg-slate-900 text-white">Tất cả mức độ ({logs.length})</option>
            <option value="info" className="bg-slate-900 text-blue-300">Thông tin (Info)</option>
            <option value="success" className="bg-slate-900 text-emerald-300">Thành công (Success)</option>
            <option value="warning" className="bg-slate-900 text-amber-300">Cảnh báo (Warning)</option>
            <option value="error" className="bg-slate-900 text-rose-300">Lỗi nghiêm trọng (Error)</option>
          </select>
        </div>
      </div>

      {/* Logs List Container */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-sans">
              Không có nhật ký hoạt động nào.
            </div>
          ) : (
            filteredLogs.map(l => {
              let icon = <Info className="w-4 h-4 text-blue-400" />;
              let badgeClass = 'bg-blue-500/15 text-blue-300 border-blue-500/30';

              if (l.level === 'success') {
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
                badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
              } else if (l.level === 'warning') {
                icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
                badgeClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
              } else if (l.level === 'error') {
                icon = <XCircle className="w-4 h-4 text-rose-400" />;
                badgeClass = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
              }

              return (
                <div key={l.id} className="p-3.5 hover:bg-white/5 transition-colors flex items-start space-x-3.5">
                  <div className="mt-0.5 flex-shrink-0">{icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-sans text-xs">
                          {l.action}
                        </span>
                        {l.accountName && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-[#D4AF37] border border-white/5">
                            {l.accountName}
                          </span>
                        )}
                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-sans font-bold ${badgeClass}`}>
                          {l.level}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{l.timestamp}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 font-sans text-xs leading-relaxed">
                      {l.details}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
