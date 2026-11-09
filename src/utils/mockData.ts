import { ZaloAccount, Contact, Campaign, ZaloGroup, ActivityLog } from '../types';

export const INITIAL_ACCOUNTS: ZaloAccount[] = [
  {
    id: 'acc-1',
    name: 'Zalo Sales Master (Hà Nội)',
    phone: '0982112334',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'online',
    isActive: true,
    lastActive: '2 phút trước',
    todaySentInvites: 18,
    todaySentMessages: 42,
    maxDailyInvites: 40,
    maxDailyMessages: 150,
    proxy: '103.142.12.88:8080 (VN Viettel Clean)',
    sessionEncrypted: 'aes-gcm-256:8f4c21a97d3b0e12',
    note: 'Tài khoản chính tiếp cận khách hàng VIP miền Bắc',
    zaloId: 'zalo_sales_hn_01',
    unreadCount: 3
  },
  {
    id: 'acc-2',
    name: 'CSKH Miền Bắc - Hoàng Vy',
    phone: '0915667889',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'online',
    isActive: true,
    lastActive: '5 phút trước',
    todaySentInvites: 12,
    todaySentMessages: 65,
    maxDailyInvites: 35,
    maxDailyMessages: 200,
    proxy: '118.69.182.10:3128 (VN FPT Telecom)',
    sessionEncrypted: 'aes-gcm-256:7b1e42a89c2d1f43',
    note: 'Tài khoản trực hỗ trợ ticket và tư vấn đơn hàng',
    zaloId: 'zalo_cskh_hn_vy',
    unreadCount: 1
  },
  {
    id: 'acc-3',
    name: 'Tư Vấn Doanh Nghiệp (HCM)',
    phone: '0903221445',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'online',
    isActive: true,
    lastActive: 'Vừa xong',
    todaySentInvites: 25,
    todaySentMessages: 38,
    maxDailyInvites: 45,
    maxDailyMessages: 120,
    proxy: '14.225.244.15:8080 (VN VNPT Datacenter)',
    sessionEncrypted: 'aes-gcm-256:3d9c12e84a7f0b91',
    note: 'Chuyên kết nối nhóm BĐS và Chủ doanh nghiệp',
    zaloId: 'zalo_corp_hcm_03',
    unreadCount: 0
  },
  {
    id: 'acc-4',
    name: 'Chi Nhánh Miền Trung - Minh Tuấn',
    phone: '0868990112',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'online',
    isActive: true,
    lastActive: '12 phút trước',
    todaySentInvites: 8,
    todaySentMessages: 22,
    maxDailyInvites: 30,
    maxDailyMessages: 100,
    proxy: 'Direct (IP Dân Cư Đà Nẵng)',
    sessionEncrypted: 'aes-gcm-256:6e2d91a78c4f1a23',
    note: 'Tài khoản hoạt động thị trường Đà Nẵng, Quảng Nam',
    zaloId: 'zalo_dn_tuan',
    unreadCount: 2
  },
  {
    id: 'acc-5',
    name: 'Marketing Sự Kiện & Hội Thảo',
    phone: '0794556778',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'qr_required',
    isActive: false,
    lastActive: '3 giờ trước',
    todaySentInvites: 0,
    todaySentMessages: 0,
    maxDailyInvites: 25,
    maxDailyMessages: 80,
    proxy: '103.74.120.44:3128',
    sessionEncrypted: 'aes-gcm-256:expired_token_need_reauth',
    note: 'Phiên đăng nhập hết hạn sau 30 ngày, cần quét mã QR',
    zaloId: 'zalo_mkt_event'
  },
  {
    id: 'acc-6',
    name: 'Tài Khoản Dự Phòng VIP 06',
    phone: '0888334556',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&h=200&q=80',
    status: 'offline',
    isActive: false,
    lastActive: 'Hôm qua',
    todaySentInvites: 0,
    todaySentMessages: 0,
    maxDailyInvites: 20,
    maxDailyMessages: 50,
    proxy: 'Direct',
    sessionEncrypted: 'aes-gcm-256:4a8b12c93d5e7f01',
    note: 'Tài khoản nuôi dự phòng, hạn chế gửi để tăng trust',
    zaloId: 'zalo_backup_06'
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c-1',
    phone: '0988776655',
    normalizedPhone: '0988776655',
    name: 'Nguyễn Thành Nam',
    zaloAccountRelated: 'acc-1',
    tags: ['Khách VIP', 'Bất động sản', 'Đã mua hàng'],
    source: 'txt_import',
    friendStatus: 'friend',
    isOptOut: false,
    lastContactedAt: '2026-11-06 14:30',
    notes: 'Quan tâm dự án biệt thự biển Nha Trang, ngân sách 15 tỷ',
    createdAt: '2026-10-15'
  },
  {
    id: 'c-2',
    phone: '0912345678',
    normalizedPhone: '0912345678',
    name: 'Trần Thị Thu Hương',
    zaloAccountRelated: 'acc-2',
    tags: ['Khách VIP', 'Thẩm mỹ - Spa'],
    source: 'group',
    friendStatus: 'friend',
    isOptOut: false,
    lastContactedAt: '2026-11-07 10:15',
    notes: 'Chủ chuỗi spa 5 chi nhánh tại Hà Nội, dùng gói phần mềm CRM',
    createdAt: '2026-10-18'
  },
  {
    id: 'c-3',
    phone: '0908123456',
    normalizedPhone: '0908123456',
    name: 'Lê Hoàng Long',
    zaloAccountRelated: 'acc-3',
    tags: ['Tiềm năng', 'Chủ Doanh Nghiệp'],
    source: 'txt_import',
    friendStatus: 'pending',
    isOptOut: false,
    lastContactedAt: '2026-11-08 09:00',
    notes: 'Đã gửi lời mời kết bạn từ chiến dịch Hội Thảo Doanh Nhân',
    createdAt: '2026-11-01'
  },
  {
    id: 'c-4',
    phone: '0933998877',
    normalizedPhone: '0933998877',
    name: 'Phạm Minh Đức',
    zaloAccountRelated: 'acc-1',
    tags: ['TMĐT', 'Shopee Seller'],
    source: 'website',
    friendStatus: 'friend',
    isOptOut: false,
    lastContactedAt: '2026-11-05 16:40',
    notes: 'Cần giải pháp tự động gửi tin nhắn chăm sóc sau bán trên Zalo',
    createdAt: '2026-10-22'
  },
  {
    id: 'c-5',
    phone: '0977665544',
    normalizedPhone: '0977665544',
    name: 'Đặng Mai Phương',
    zaloAccountRelated: 'acc-2',
    tags: ['Chờ phản hồi', 'Mỹ phẩm'],
    source: 'txt_import',
    friendStatus: 'not_friend',
    isOptOut: false,
    notes: 'Data thu thập từ hội chợ triển lãm Vietbeauty',
    createdAt: '2026-11-03'
  },
  {
    id: 'c-6',
    phone: '0966554433',
    normalizedPhone: '0966554433',
    name: 'Vũ Quốc Khánh',
    zaloAccountRelated: 'acc-3',
    tags: ['Từ chối nhận tin'],
    source: 'txt_import',
    friendStatus: 'not_friend',
    isOptOut: true,
    lastContactedAt: '2026-10-28 11:20',
    notes: 'Yêu cầu không gửi tin nhắn quảng cáo (Đã đưa vào Blacklist Opt-out)',
    createdAt: '2026-10-28'
  },
  {
    id: 'c-7',
    phone: '0944112233',
    normalizedPhone: '0944112233',
    name: 'Hoàng Thị Bích Ngọc',
    zaloAccountRelated: 'acc-4',
    tags: ['Khách VIP', 'Đà Nẵng'],
    source: 'group',
    friendStatus: 'friend',
    isOptOut: false,
    lastContactedAt: '2026-11-07 15:20',
    notes: 'Quan tâm dịch vụ marketing tự động đa kênh',
    createdAt: '2026-10-29'
  },
  {
    id: 'c-8',
    phone: '0868112244',
    normalizedPhone: '0868112244',
    name: 'Bùi Anh Tuấn',
    tags: ['Tiềm năng', 'F&B'],
    source: 'txt_import',
    friendStatus: 'not_friend',
    isOptOut: false,
    notes: 'Chủ chuỗi trà sữa TocoToco nhượng quyền',
    createdAt: '2026-11-04'
  }
];

export const INITIAL_GROUPS: ZaloGroup[] = [
  {
    id: 'grp-1',
    name: 'Cộng Đồng Khách Hàng VIP 2026 - Master Class',
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=200&h=200&q=80',
    memberCount: 142,
    myRole: 'admin',
    accountId: 'acc-1',
    members: [
      { id: 'm-1', name: 'Nguyễn Thành Nam', zaloId: 'nam_bds_88', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0988***655', isFriend: true, isOptOut: false, role: 'deputy' },
      { id: 'm-2', name: 'Trần Thị Thu Hương', zaloId: 'huong_spa', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0912***678', isFriend: true, isOptOut: false, role: 'member' },
      { id: 'm-3', name: 'Lê Hoàng Long', zaloId: 'long_investor', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0908***456', isFriend: false, isOptOut: false, role: 'member' },
      { id: 'm-4', name: 'Chu Đình Trọng', zaloId: 'trong_media', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0973***889', isFriend: false, isOptOut: false, role: 'member' },
      { id: 'm-5', name: 'Đỗ Thùy Trang', zaloId: 'trang_ecom', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0962***331', isFriend: false, isOptOut: false, role: 'member' },
      { id: 'm-6', name: 'Vũ Quốc Khánh', zaloId: 'khanh_banned', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0966***433', isFriend: false, isOptOut: true, role: 'member' }
    ]
  },
  {
    id: 'grp-2',
    name: 'Bất Động Sản Nghỉ Dưỡng & Đầu Tư Cao Cấp',
    avatar: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&h=200&q=80',
    memberCount: 238,
    myRole: 'deputy',
    accountId: 'acc-3',
    members: [
      { id: 'm-7', name: 'Phạm Nhật Minh', zaloId: 'minh_resort', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0903***778', isFriend: true, isOptOut: false, role: 'admin' },
      { id: 'm-8', name: 'Mai Thu Hà', zaloId: 'ha_property', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0918***992', isFriend: false, isOptOut: false, role: 'member' },
      { id: 'm-9', name: 'Trần Đức Bình', zaloId: 'binh_finance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0989***221', isFriend: false, isOptOut: false, role: 'member' }
    ]
  },
  {
    id: 'grp-3',
    name: 'Hội Chủ Doanh Nghiệp F&B & Bán Lẻ Toàn Quốc',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&h=200&q=80',
    memberCount: 95,
    myRole: 'member',
    accountId: 'acc-2',
    members: [
      { id: 'm-10', name: 'Lâm Văn Hải', zaloId: 'hai_fb_coffee', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80', phoneMasked: '0932***556', isFriend: false, isOptOut: false, role: 'member' }
    ]
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Tri Ân Khách Hàng VIP - Tặng Voucher Tháng 11',
    type: 'txt_message',
    accountIds: ['acc-1', 'acc-2'],
    totalCount: 150,
    processedCount: 150,
    successCount: 146,
    failedCount: 4,
    status: 'completed',
    messageTemplate: '{Xin chào|Kính chào} {danh_xung} {ten_khach_hang}! Milkyway xin gửi tặng bạn voucher {ma_voucher} ưu đãi 20% dịch vụ trong tuần này. Chúc bạn một {thoi_gian} vui vẻ!',
    delaySeconds: 25,
    maxPerDay: 80,
    createdAt: '2026-11-05 09:00',
    startedAt: '2026-11-05 09:15',
    completedAt: '2026-11-05 15:40',
    tasks: []
  },
  {
    id: 'camp-2',
    name: 'Kết bạn Danh sách Data Hội thảo Doanh Nhân',
    type: 'friend_request',
    accountIds: ['acc-1', 'acc-3'],
    totalCount: 45,
    processedCount: 28,
    successCount: 26,
    failedCount: 2,
    status: 'running',
    messageTemplate: '{Chào|Xin chào} {danh_xung} {ten_khach_hang}, mình là quản lý kết nối tại Hội thảo Doanh nhân vừa qua. Rất mong được kết nối cùng bạn trên Zalo để trao đổi hợp tác ạ!',
    delaySeconds: 30,
    maxPerDay: 35,
    createdAt: '2026-11-08 08:30',
    startedAt: '2026-11-08 08:45',
    tasks: []
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-08 14:55:12',
    level: 'info',
    accountName: 'Zalo Sales Master (Hà Nội)',
    action: 'Kiểm tra phiên kết nối',
    details: 'Token phiên AES-256 hợp lệ. Ping máy chủ Zalo 42ms. Tài khoản hoạt động ổn định.'
  },
  {
    id: 'log-2',
    timestamp: '2026-11-08 14:40:05',
    level: 'success',
    accountName: 'Zalo Sales Master (Hà Nội)',
    action: 'Gửi lời mời kết bạn',
    details: 'Đã gửi lời mời thành công tới SĐT 0988***655 (Nguyễn Thành Nam). Thời gian giãn cách 32s.'
  },
  {
    id: 'log-3',
    timestamp: '2026-11-08 13:12:44',
    level: 'warning',
    accountName: 'Marketing Sự Kiện & Hội Thảo',
    action: 'Cảnh báo hết hạn phiên',
    details: 'Phiên đăng nhập Web Zalo cần xác thực lại bằng mã QR để tiếp tục.'
  },
  {
    id: 'log-4',
    timestamp: '2026-11-08 11:20:18',
    level: 'info',
    accountName: 'Hệ thống CRM',
    action: 'Đồng bộ danh sách khách hàng',
    details: 'Phát hiện 1 số điện thoại thuộc danh sách Opt-out (0966554433). Tự động loại khỏi mọi chiến dịch.'
  }
];
