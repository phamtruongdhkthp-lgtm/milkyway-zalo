/**
 * Standardized TXT File Format Utility for Milkyway Zalo Marketing Tool
 * Đồng nhất 1 định dạng file TXT duy nhất xuyên suốt toàn bộ hệ thống:
 * Cấu trúc phân cách chuẩn: [SĐT / Zalo ID] | [Họ Tên] | [Thông tin phụ / Ghi chú]
 */

export const STANDARD_TXT_DELIMITER = '|';

/**
 * Trigger download of a TXT file with UTF-8 BOM encoding for perfect Vietnamese character support
 */
export function downloadTxtFile(filename: string, content: string): void {
  // \uFEFF is UTF-8 Byte Order Mark (BOM) ensuring Notepad and Windows apps display Vietnamese accents perfectly
  const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Ensure .txt extension
  a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Standard sample TXT template for customers & phone lists
 */
export function getStandardContactSampleTxt(): string {
  return `# ========================================================
# FILE TXT CHUẨN ĐỒNG NHẤT - HỆ THỐNG ZALO MARKETING TOOL
# Quy tắc định dạng: Số_Điện_Thoại|Họ_Và_Tên|Nhãn_Hoặc_Ghi_Chú
# (Hệ thống cũng hỗ trợ nếu dòng chỉ có mỗi số điện thoại)
# ========================================================
0988776655|Nguyễn Thành Nam|Bất Động Sản VIP
0912345678|Trần Thị Thu Hương|Spa Làm Đẹp Hà Nội
0908123456|Lê Hoàng Long|Chủ Doanh Nghiệp F&B
0933998877|Phạm Minh Đức|Bán Hàng Shopee TMĐT
0977665544|Đặng Mai Phương|Mỹ Phẩm Triển Lãm
0944112233|Hoàng Thị Bích Ngọc|Khách VIP Đà Nẵng
0868112244|Bùi Anh Tuấn|F&B Nhượng Quyền
0903112233|Vũ Đình Trọng|Nhà Đầu Tư Tiềm Năng
`;
}

/**
 * Format Customer CRM contacts into unified standard TXT
 */
export function formatCrmContactsToTxt(contacts: Array<{
  name: string;
  phone: string;
  zaloAccountRelated?: string;
  tags?: string[];
  source?: string;
  friendStatus?: string;
  isOptOut?: boolean;
  lastContactedAt?: string;
  notes?: string;
}>, accountNamesMap?: Record<string, string>): string {
  const header = `# ========================================================
# DANH BẠ KHÁCH HÀNG CRM - MILKYWAY ZALO TOOL
# Xuất ngày: ${new Date().toLocaleString('vi-VN')}
# Định dạng chuẩn: Số_điện_thoại|Họ_và_tên|Tài_khoản_phụ_trách|Nhóm_thẻ|Nguồn|Trạng_thái_kết_bạn|Từ_chối_tin|Liên_hệ_gần_nhất|Ghi_chú
# ========================================================\n`;

  const lines = contacts.map(c => {
    const accName = c.zaloAccountRelated ? (accountNamesMap?.[c.zaloAccountRelated] || c.zaloAccountRelated) : '-';
    const tagsStr = (c.tags || []).join(';');
    const sourceStr = c.source || 'crm';
    const statusStr = c.friendStatus === 'friend' ? 'Đã kết bạn' : c.friendStatus === 'pending' ? 'Chờ xác nhận' : 'Chưa kết bạn';
    const optStr = c.isOptOut ? 'Opt-out' : 'Bình thường';
    const lastContact = c.lastContactedAt || '-';
    const cleanNotes = (c.notes || '').replace(/[\r\n|]/g, ' ');

    return `${c.phone}|${c.name}|${accName}|${tagsStr}|${sourceStr}|${statusStr}|${optStr}|${lastContact}|${cleanNotes}`;
  });

  return header + lines.join('\n');
}

/**
 * Format Friend Request results into unified standard TXT
 */
export function formatFriendRequestReportToTxt(tasks: Array<{
  normalizedPhone: string;
  contactName?: string;
  accountId: string;
  status: string;
  processedAt?: string;
  error?: string;
}>, accountNamesMap?: Record<string, string>): string {
  const header = `# ========================================================
# BÁO CÁO KẾT QUẢ KẾT BẠN ZALO - MILKYWAY TOOL
# Xuất ngày: ${new Date().toLocaleString('vi-VN')}
# Định dạng chuẩn: Số_điện_thoại|Họ_và_tên|Tài_khoản_gửi|Trạng_thái|Thời_gian|Ghi_chú
# ========================================================\n`;

  const lines = tasks.map(t => {
    const accName = accountNamesMap?.[t.accountId] || t.accountId;
    const cleanError = (t.error || (t.status === 'success' ? 'Đã gửi lời mời hợp lệ' : '-')).replace(/[\r\n|]/g, ' ');
    return `${t.normalizedPhone}|${t.contactName || '-'}|${accName}|${t.status}|${t.processedAt || '-'}|${cleanError}`;
  });

  return header + lines.join('\n');
}

/**
 * Format Messaging Campaign results into unified standard TXT
 */
export function formatMessagingReportToTxt(tasks: Array<{
  normalizedPhone: string;
  contactName?: string;
  accountId: string;
  renderedMessage: string;
  status: string;
  processedAt?: string;
  error?: string;
}>, accountNamesMap?: Record<string, string>): string {
  const header = `# ========================================================
# BÁO CÁO CHIẾN DỊCH NHẮN TIN ZALO - MILKYWAY TOOL
# Xuất ngày: ${new Date().toLocaleString('vi-VN')}
# Định dạng chuẩn: Số_điện_thoại|Họ_và_tên|Tài_khoản_gửi|Trạng_thái|Thời_gian|Nội_dung_tin_nhắn|Ghi_chú_lỗi
# ========================================================\n`;

  const lines = tasks.map(t => {
    const accName = accountNamesMap?.[t.accountId] || t.accountId;
    const cleanMsg = t.renderedMessage.replace(/[\r\n|]/g, ' ');
    const cleanError = (t.error || (t.status === 'success' ? 'Đã gửi thành công' : '-')).replace(/[\r\n|]/g, ' ');
    return `${t.normalizedPhone}|${t.contactName || '-'}|${accName}|${t.status}|${t.processedAt || '-'}|${cleanMsg}|${cleanError}`;
  });

  return header + lines.join('\n');
}

/**
 * Format Scanned Group Members into unified standard TXT
 */
export function formatGroupMembersToTxt(
  groupName: string,
  members: Array<{
    name: string;
    phone?: string;
    phoneMasked?: string;
    zaloId: string;
    role: string;
    isFriend: boolean;
    isDiscoveredFromHidden?: boolean;
    discoveryMethod?: string;
  }>
): string {
  const header = `# ========================================================
# DANH SÁCH THÀNH VIÊN NHÓM ZALO: ${groupName.toUpperCase()}
# Xuất ngày: ${new Date().toLocaleString('vi-VN')}
# Định dạng chuẩn: Số_điện_thoại_hoặc_ID|Họ_và_tên|Vai_trò|Trạng_thái_bạn_bè|Nguồn_quét
# ========================================================\n`;

  const lines = members.map(m => {
    const phoneOrId = m.phone || m.phoneMasked || m.zaloId;
    const roleStr = m.role === 'admin' ? 'Trưởng nhóm' : m.role === 'deputy' ? 'Phó nhóm' : 'Thành viên';
    const friendStr = m.isFriend ? 'Đã kết bạn' : 'Chưa kết bạn';
    const sourceStr = m.isDiscoveredFromHidden 
      ? `Nhóm Ẩn Thành Viên (${m.discoveryMethod === 'reaction' ? 'Thả tim' : m.discoveryMethod === 'message_history' ? 'Lịch sử chat' : 'CDP'})`
      : 'Danh bạ nhóm công khai';

    return `${phoneOrId}|${m.name}|${roleStr}|${friendStr}|${sourceStr}`;
  });

  return header + lines.join('\n');
}
