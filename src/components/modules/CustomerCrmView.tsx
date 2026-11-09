import React, { useState } from 'react';
import { 
  ContactRound, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  UserX, 
  UserCheck, 
  Tag, 
  X,
  Sparkles,
  PhoneCall,
  Calendar,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Contact } from '../../types';
import { downloadTxtFile, formatCrmContactsToTxt, getStandardContactSampleTxt } from '../../utils/txtFormat';

export const CustomerCrmView: React.FC = () => {
  const { 
    contacts, 
    accounts, 
    addContact, 
    updateContact, 
    deleteContact, 
    toggleOptOut, 
    importContactsFromTxt,
    addLog 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyOptOut, setOnlyOptOut] = useState<boolean>(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importTag, setImportTag] = useState('Data Mới');

  // Contact form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAccount, setFormAccount] = useState('');
  const [formTags, setFormTags] = useState('Khách VIP, Tiềm năng');
  const [formSource, setFormSource] = useState<Contact['source']>('manual');
  const [formFriendStatus, setFormFriendStatus] = useState<Contact['friendStatus']>('not_friend');
  const [formNotes, setFormNotes] = useState('');

  // Extract all unique tags
  const allTags = Array.from(
    new Set(contacts.flatMap(c => c.tags || []))
  );

  // Filtered contacts
  const filteredContacts = contacts.filter(c => {
    if (onlyOptOut && !c.isOptOut) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchNotes = (c.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchNotes) return false;
    }
    if (selectedTag !== 'all' && !(c.tags || []).includes(selectedTag)) return false;
    if (selectedStatus !== 'all' && c.friendStatus !== selectedStatus) return false;
    return true;
  });

  const openAddModal = () => {
    setFormName('');
    setFormPhone('');
    setFormAccount(accounts[0]?.id || '');
    setFormTags('Khách VIP');
    setFormSource('manual');
    setFormFriendStatus('not_friend');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhone.trim()) return;

    const normalized = formPhone.trim().replace(/\D/g, '');

    addContact({
      name: formName.trim() || `Khách hàng ${normalized.slice(-4)}`,
      phone: formPhone.trim(),
      normalizedPhone: normalized,
      zaloAccountRelated: formAccount || undefined,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      source: formSource,
      friendStatus: formFriendStatus,
      isOptOut: false,
      notes: formNotes.trim(),
    });

    setIsAddModalOpen(false);
  };

  const openEditModal = (c: Contact) => {
    setEditingContact(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormAccount(c.zaloAccountRelated || '');
    setFormTags(c.tags.join(', '));
    setFormSource(c.source);
    setFormFriendStatus(c.friendStatus);
    setFormNotes(c.notes || '');
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    const normalized = formPhone.trim().replace(/\D/g, '');

    updateContact(editingContact.id, {
      name: formName.trim(),
      phone: formPhone.trim(),
      normalizedPhone: normalized,
      zaloAccountRelated: formAccount || undefined,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      source: formSource,
      friendStatus: formFriendStatus,
      notes: formNotes.trim(),
    });

    setEditingContact(null);
  };

  const handleImportTxt = () => {
    if (!importText.trim()) return;
    const res = importContactsFromTxt(importText, importTag.trim() || 'TXT Import');
    alert(`Đã thêm thành công: ${res.added} khách hàng mới.\nTrùng lặp bỏ qua: ${res.duplicates}\nKhông hợp lệ: ${res.invalids}`);
    setIsImportModalOpen(false);
    setImportText('');
  };

  const handleMarkContacted = (id: string) => {
    const now = new Date().toLocaleString('sv-SE').replace('T', ' ');
    updateContact(id, { lastContactedAt: now });
    addLog('info', 'Tương tác CRM', `Đã cập nhật thời gian liên hệ mới nhất.`);
  };

  const exportContactsTxt = () => {
    const accountNamesMap = accounts.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {} as Record<string, string>);
    const content = formatCrmContactsToTxt(filteredContacts, accountNamesMap);
    const filename = `Danh_sach_Khach_hang_CRM_${new Date().toISOString().split('T')[0]}.txt`;
    downloadTxtFile(filename, content);
    addLog('info', 'Xuất File TXT', `Đã xuất ${filteredContacts.length} khách hàng ra file TXT chuẩn đồng nhất.`);
  };

  const handleDownloadSampleTxt = () => {
    const sample = getStandardContactSampleTxt();
    downloadTxtFile('Danh_sach_Khach_hang_Mau_Chuan.txt', sample);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ContactRound className="w-5 h-5 text-[#D4AF37]" />
            <span>Hệ Thống Quản Lý Khách Hàng (Mini CRM)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Lưu trữ danh bạ, phân loại phễu bán hàng, quản lý danh sách Opt-out từ chối nhận tin và ngăn gửi trùng chiến dịch qua file TXT chuẩn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSampleTxt}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white hover:border-[#D4AF37]/50 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            title="Tải file TXT mẫu chuẩn cấu trúc SĐT|Họ tên|Ghi chú"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>File TXT Mẫu</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-200 hover:text-white hover:border-[#D4AF37]/50 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#D4AF37]" />
            <span>Nhập File TXT</span>
          </button>

          <button
            onClick={exportContactsTxt}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-slate-200 hover:text-white hover:border-[#D4AF37]/50 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            title="Xuất toàn bộ danh sách khách hàng ra file TXT chuẩn đồng nhất"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Xuất File TXT</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên, số điện thoại, ghi chú..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Tag filter */}
          <div>
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">Tất cả nhóm thẻ ({contacts.length})</option>
              {allTags.map(tag => (
                <option key={tag} value={tag} className="bg-slate-900 text-white">
                  Thẻ: {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Friend Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="all" className="bg-slate-900 text-white">Mọi trạng thái kết bạn</option>
              <option value="friend" className="bg-slate-900 text-emerald-400">Đã là bạn bè</option>
              <option value="pending" className="bg-slate-900 text-amber-400">Đang chờ xác nhận</option>
              <option value="not_friend" className="bg-slate-900 text-slate-300">Chưa kết bạn</option>
            </select>
          </div>

          {/* Opt-out filter toggle */}
          <button
            onClick={() => setOnlyOptOut(prev => !prev)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all ${
              onlyOptOut
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Blacklist / Opt-out ({contacts.filter(c => c.isOptOut).length})</span>
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Nhóm / Thẻ</th>
                <th className="py-3 px-4">Tài khoản Zalo</th>
                <th className="py-3 px-4">Trạng thái kết bạn</th>
                <th className="py-3 px-4">Liên hệ gần nhất</th>
                <th className="py-3 px-4">Ghi chú</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(c => {
                  const acc = accounts.find(a => a.id === c.zaloAccountRelated);

                  return (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <span>{c.name}</span>
                          {c.isOptOut && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                              Opt-out
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Nguồn: {c.source === 'txt_import' ? 'Tệp TXT' : c.source === 'group' ? 'Nhóm Zalo' : 'Thủ công'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-amber-200">
                        {c.phone}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map(t => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {acc?.name || <span className="text-slate-500">Chưa gán</span>}
                      </td>

                      <td className="py-3 px-4">
                        {c.friendStatus === 'friend' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center space-x-1 w-max">
                            <UserCheck className="w-3 h-3" />
                            <span>Bạn bè</span>
                          </span>
                        ) : c.friendStatus === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center space-x-1 w-max">
                            <Clock className="w-3 h-3" />
                            <span>Chờ đồng ý</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Chưa kết bạn</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                        {c.lastContactedAt ? (
                          <span>{c.lastContactedAt}</span>
                        ) : (
                          <span className="text-slate-600">Chưa tương tác</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={c.notes}>
                        {c.notes || '-'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleMarkContacted(c.id)}
                            title="Đánh dấu vừa liên hệ"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          <button
                            onClick={() => toggleOptOut(c.id)}
                            title={c.isOptOut ? 'Bỏ khỏi Blacklist' : 'Đưa vào Blacklist Opt-out'}
                            className={`p-1.5 rounded-lg border ${
                              c.isOptOut
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-white/5'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(c)}
                            title="Sửa khách hàng"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Xóa khách hàng ${c.name}?`)) deleteContact(c.id);
                            }}
                            title="Xóa"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Contact Modal */}
      {(isAddModalOpen || editingContact) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass-card-gold rounded-2xl p-6 border border-[#D4AF37]/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ContactRound className="w-5 h-5 text-[#D4AF37]" />
                <span>{editingContact ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingContact(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingContact ? handleUpdateContact : handleCreateContact} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Họ và tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Tuấn Anh"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Số điện thoại Zalo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 0988776655"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tài khoản phụ trách
                  </label>
                  <select
                    value={formAccount}
                    onChange={e => setFormAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="" className="bg-slate-900">-- Không gán --</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id} className="bg-slate-900">
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Trạng thái kết bạn
                  </label>
                  <select
                    value={formFriendStatus}
                    onChange={e => setFormFriendStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="not_friend" className="bg-slate-900">Chưa kết bạn</option>
                    <option value="pending" className="bg-slate-900">Đang chờ</option>
                    <option value="friend" className="bg-slate-900">Bạn bè</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nhóm / Thẻ phân loại (ngăn cách bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="Khách VIP, Bất động sản, Tiềm năng..."
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ghi chú trao đổi & nhu cầu
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhu cầu khách hàng, lịch sử trao đổi..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs hover:brightness-110 cursor-pointer"
                >
                  {editingContact ? 'Cập Nhật' : 'Lưu Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import TXT Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg glass-card-gold rounded-2xl p-6 border border-[#D4AF37]/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-[#D4AF37]" />
                <span>Nhập Khách Hàng Từ Danh Sách TXT Vào CRM</span>
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gán thẻ mặc định cho tệp này:
                </label>
                <input
                  type="text"
                  value={importTag}
                  onChange={e => setImportTag(e.target.value)}
                  placeholder="Ví dụ: Data Triển Lãm 2026"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Dán nội dung TXT (Định dạng chuẩn: <span className="text-[#D4AF37] font-mono">SĐT|Họ tên|Ghi chú</span> hoặc mỗi dòng 1 SĐT):
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadSampleTxt}
                    className="text-[11px] text-[#D4AF37] hover:underline flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải file mẫu</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="0988776655|Nguyễn Thành Nam|Bất Động Sản VIP&#10;0912345678|Trần Thị Thu Hương|Spa Làm Đẹp&#10;0908123456|Lê Hoàng Long|Chủ Doanh Nghiệp&#10;0933998877"
                  className="w-full p-3 rounded-xl glass-input text-xs font-mono leading-relaxed"
                />

                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".txt"
                    id="crm-txt-upload"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const content = ev.target?.result as string;
                        if (content) setImportText(content);
                      };
                      reader.readAsText(file);
                    }}
                  />
                  <label
                    htmlFor="crm-txt-upload"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold cursor-pointer flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Chọn tệp .txt từ máy tính</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Chỉ chấp nhận file .txt chuẩn</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleImportTxt}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 cursor-pointer shadow-lg"
              >
                Xác Nhận Nhập TXT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
