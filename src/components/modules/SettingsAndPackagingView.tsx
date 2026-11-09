import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Terminal, 
  Download, 
  Upload, 
  Database, 
  ShieldCheck, 
  Server, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  BookOpen, 
  ExternalLink,
  Laptop,
  Monitor,
  Folder
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsAndPackagingView: React.FC = () => {
  const { exportDatabaseJson, importDatabaseJson, addLog } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadBackup = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Milkyway_Zalo_Full_Database_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('success', 'Xuất CSDL', 'Đã tải xuống bản sao lưu CSDL toàn diện.');
  };

  const handleRestoreDatabase = () => {
    if (!importJsonText.trim()) return;
    const ok = importDatabaseJson(importJsonText);
    if (ok) {
      alert('Khôi phục cơ sở dữ liệu thành công!');
      setImportJsonText('');
    } else {
      alert('Tệp dữ liệu không hợp lệ. Vui lòng kiểm tra lại cấu trúc JSON.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-[#D4AF37]" />
          <span>Cài Đặt Hệ Thống & Đóng Gói Ứng Dụng Windows (.exe)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tài liệu kiến trúc tích hợp Zalo hợp lệ, hướng dẫn biên dịch bộ cài đặt Windows 10/11 và cơ chế đồng bộ cơ sở dữ liệu.
        </p>
      </div>

      {/* Section 1: Zalo Integration Analysis & Platform Compliance */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2.5 text-[#D4AF37]">
          <BookOpen className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">
            1. Báo Cáo Phân Tích Kỹ Thuật: Khả Năng Tích Hợp Zalo
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Official API Analysis */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
            <div className="font-bold text-amber-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Zalo Official Account (OA & ZNS API)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Khả năng:</strong> Gửi thông báo dịch vụ (ZNS), tin nhắn chăm sóc khách hàng theo mẫu đăng ký trước và tương tác với người dùng đã nhấn quan tâm OA.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              <strong>Giới hạn kỹ thuật:</strong> Zalo <u>KHÔNG</u> cung cấp API chính thức để tài khoản cá nhân tự động quét và gửi lời mời kết bạn bằng số điện thoại hàng loạt mà không có sự đồng ý của đối tượng.
            </p>
          </div>

          {/* Desktop Automation Solution */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
              <Laptop className="w-4 h-4" />
              <span>Kiến Trúc Local Daemon Milkyway Zalo</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Giải pháp tối ưu:</strong> Chạy mô hình Desktop Client tại máy tính người dùng (Windows 10/11), bảo mật phiên đăng nhập qua mã hóa AES-256 nội bộ.
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              <strong>Bảo vệ Anti-Ban:</strong> Điều tiết giãn cách ngẫu nhiên (25-45s), spintax nội dung chống spam, và dừng khẩn cấp khi phát hiện giới hạn thao tác ngày (30-50 lời mời/ngày).
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Windows Packaging Guide */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2.5 text-[#D4AF37]">
          <Terminal className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">
            2. Hướng Dẫn Đóng Gói Bộ Cài Đặt Windows (.exe)
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Ứng dụng được thiết kế theo chuẩn mã nguồn mở, cho phép đóng gói thành phần mềm Desktop hoàn chỉnh bằng <strong>Electron</strong> hoặc <strong>Tauri</strong> để cài đặt trên mọi máy tính Windows 10/11.
        </p>

        {/* Step-by-step packaging commands */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
              <span>Cách 1: Đóng gói siêu nhẹ với Electron Builder (Khuyên dùng)</span>
              <button
                onClick={() => copyToClipboard(`npm install -D electron electron-builder\nnpm run build\nnpx electron-builder --win nsis`, 'electron')}
                className="flex items-center space-x-1 text-[#D4AF37] hover:underline"
              >
                {copiedKey === 'electron' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'electron' ? 'Đã sao chép' : 'Sao chép lệnh'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 leading-relaxed">
              npm install -D electron electron-builder{'\n'}
              npm run build{'\n'}
              npx electron-builder --win nsis
            </pre>
            <p className="text-[10px] text-slate-400 mt-2 font-sans">
              Kết quả tạo ra tệp: <span className="text-[#D4AF37]">dist/Milkyway-Zalo-Manager-Setup-1.0.0.exe</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
              <span>Cách 2: Đóng gói bản Portable chạy ngay không cần cài đặt</span>
              <button
                onClick={() => copyToClipboard(`npx electron-builder --win portable`, 'portable')}
                className="flex items-center space-x-1 text-[#D4AF37] hover:underline"
              >
                {copiedKey === 'portable' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'portable' ? 'Đã sao chép' : 'Sao chép lệnh'}</span>
              </button>
            </div>
            <pre className="text-amber-300 leading-relaxed">
              npx electron-builder --win portable
            </pre>
            <p className="text-[10px] text-slate-400 mt-2 font-sans">
              Tạo tệp đơn <span className="text-[#D4AF37]">Milkyway-Zalo-Portable.exe</span> có thể copy vào USB chạy trên mọi máy tính.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Dedicated Chrome Multi-Profile Architecture */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2.5 text-[#D4AF37]">
          <Monitor className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">
            3. Kiến Trúc Vận Hành Đa Trình Duyệt Chrome (Multi-Profile Automation)
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
            Chuẩn Zalo Desktop Tool
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Đúng theo cơ chế thực tế của các phần mềm marketing chuyên nghiệp trên Windows (như Simple Zalo, ZaloPlus), 
          ứng dụng <strong>không gộp chung phiên đăng nhập</strong> mà phân bổ <strong>mỗi tài khoản Zalo là 1 tiến trình Google Chrome độc lập hoàn toàn</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
            <span className="font-bold text-amber-200 block">1. Độc lập Thư mục Dữ liệu</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              --user-data-dir="C:\MilkywayZalo\Profiles\profile_..."
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mỗi tài khoản lưu Cookies, LocalStorage, IndexedDB và Cache riêng biệt. Khi mở nhiều tài khoản cùng lúc không bao giờ bị xung đột hoặc đè phiên.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
            <span className="font-bold text-emerald-300 block">2. Giao thức Điều khiển CDP</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              --remote-debugging-port=9222...
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mở cổng Chrome DevTools Protocol để ứng dụng quản trị gửi lệnh tự động hóa (gửi tin, kết bạn) chính xác qua Puppeteer/Playwright.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
            <span className="font-bold text-blue-300 block">3. Cách ly Proxy chống Ban</span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              --proxy-server="ip:port"
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mỗi profile Chrome có thể định tuyến qua một IP Proxy riêng. Zalo Server nhận diện mỗi tài khoản là một thiết bị và mạng Internet hoàn toàn khác nhau.
            </p>
          </div>
        </div>

        {/* Node.js / Electron child_process code sample */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
            <span>Mã nguồn khởi chạy tiến trình Chrome độc lập trong Electron / Node.js Local Daemon:</span>
            <button
              onClick={() => copyToClipboard(`const { spawn } = require('child_process');\n\nfunction launchZaloChrome(profileDir, port, proxy) {\n  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';\n  const args = [\n    \`--user-data-dir=\${profileDir}\`,\n    \`--remote-debugging-port=\${port}\`,\n    '--no-first-run',\n    '--no-default-browser-check',\n    '--app=https://chat.zalo.me'\n  ];\n  if (proxy) args.push(\`--proxy-server=\${proxy}\`);\n  \n  return spawn(chromePath, args, { detached: true, stdio: 'ignore' });\n}`, 'chrome_spawn')}
              className="flex items-center space-x-1 text-[#D4AF37] hover:underline"
            >
              {copiedKey === 'chrome_spawn' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'chrome_spawn' ? 'Đã sao chép' : 'Sao chép code'}</span>
            </button>
          </div>
          <pre className="text-blue-300 leading-relaxed overflow-x-auto text-[11px]">
{`const { spawn } = require('child_process');

function launchZaloChrome(profileDir, port, proxy) {
  const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
  const args = [
    \`--user-data-dir=\${profileDir}\`,
    \`--remote-debugging-port=\${port}\`,
    '--no-first-run',
    '--no-default-browser-check',
    '--app=https://chat.zalo.me'
  ];
  if (proxy) args.push(\`--proxy-server=\${proxy}\`);
  
  return spawn(chromePath, args, { detached: true, stdio: 'ignore' });
}`}
          </pre>
        </div>
      </div>

      {/* Section 4: Database Backup & Restore & VPS Scaling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Restore Box */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-[#D4AF37]">
            <Database className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">4. Sao Lưu & Khôi Phục Dữ Liệu</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Tải về toàn bộ danh sách tài khoản, khách hàng CRM, nhóm và lịch sử chiến dịch để sao lưu dự phòng hoặc chuyển sang máy tính khác.
          </p>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Download className="w-4 h-4" />
            <span>Tải Xuống Bản Sao Lưu Toàn Diện (.json)</span>
          </button>

          <div className="pt-2 border-t border-white/5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Dán chuỗi JSON sao lưu để khôi phục:
            </label>
            <textarea
              rows={3}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Dán nội dung JSON sao lưu vào đây..."
              className="w-full p-2.5 rounded-xl glass-input text-xs font-mono resize-none"
            />
            <button
              onClick={handleRestoreDatabase}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer"
            >
              Khôi Phục CSDL Từ Bản Sao Lưu
            </button>
          </div>
        </div>

        {/* VPS Scaling Box */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-[#D4AF37]">
            <Server className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">Mở Rộng Backend Lên VPS (24/7)</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Hệ thống hỗ trợ tách rời frontend React và backend Node.js (SQLite / PostgreSQL) để đưa lên VPS chạy liên tục 24/7:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="font-semibold text-amber-200 block">Cơ chế đồng bộ SQLite:</span>
              <span className="text-[11px] text-slate-400">
                Lưu trữ tập trung thông tin hàng ngàn khách hàng và hàng trăm chiến dịch không lo nghẽn mạng.
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="font-semibold text-amber-200 block">Cấu hình Proxy đa IP:</span>
              <span className="text-[11px] text-slate-400">
                Mỗi tài khoản Zalo gắn cố định với một IP dân cư tĩnh trên VPS để an toàn tuyệt đối.
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="font-semibold text-amber-200 block">Webhook & REST API:</span>
              <span className="text-[11px] text-slate-400">
                Cho phép kết nối trực tiếp với website, Landing Page hoặc CRM tổng của doanh nghiệp.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
