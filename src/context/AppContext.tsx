import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ZaloAccount, Contact, Campaign, ZaloGroup, GroupMember, ActivityLog } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CONTACTS, INITIAL_GROUPS, INITIAL_CAMPAIGNS, INITIAL_LOGS } from '../utils/mockData';
import { parsePhoneListFromText } from '../utils/phoneValidator';
import { playNotificationSound } from '../utils/sound';

export type NavTab = 
  | 'dashboard'
  | 'accounts'
  | 'friend_requests'
  | 'messaging'
  | 'group_messaging'
  | 'crm'
  | 'logs'
  | 'settings';

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  accounts: ZaloAccount[];
  contacts: Contact[];
  groups: ZaloGroup[];
  campaigns: Campaign[];
  logs: ActivityLog[];
  
  // Account Actions
  addAccount: (account: Omit<ZaloAccount, 'id' | 'todaySentInvites' | 'todaySentMessages' | 'sessionEncrypted'>) => void;
  updateAccount: (id: string, updates: Partial<ZaloAccount>) => void;
  deleteAccount: (id: string) => void;
  toggleAccountActive: (id: string) => void;
  reconnectAccount: (id: string) => Promise<boolean>;

  // Contact Actions
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  toggleOptOut: (id: string) => void;
  importContactsFromTxt: (text: string, tag?: string) => { added: number; duplicates: number; invalids: number };

  // Campaign Actions
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'processedCount' | 'successCount' | 'failedCount' | 'status' | 'tasks'>, initialTasks?: any[]) => string;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  startCampaign: (id: string) => void;
  pauseCampaign: (id: string) => void;
  stopCampaign: (id: string) => void;

  // Group Scanner & Management Actions
  addGroup: (group: Partial<ZaloGroup>) => string;
  updateGroup: (groupId: string, updates: Partial<ZaloGroup>) => void;
  deleteGroup: (groupId: string) => void;
  scanGroupMembers: (groupId: string, deepScanHidden?: boolean) => Promise<GroupMember[]>;
  saveGroupMembersToCrm: (members: GroupMember[], groupName: string) => number;

  // Logs
  addLog: (level: ActivityLog['level'], action: string, details: string, accountName?: string) => void;
  clearLogs: () => void;

  // Backup & Restore
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;

  // Milky Way theme ambient
  galaxyBrightness: number;
  setGalaxyBrightness: (b: number) => void;

  // Unread Messages & Notifications
  totalUnreadCount: number;
  setAccountUnreadCount: (accountId: string, count: number) => void;
  simulateIncomingMessage: (targetAccountId?: string) => void;

  // Chrome Multi-Profile Browser Actions
  launchChromeProfile: (accountId: string) => Promise<boolean>;
  closeChromeProfile: (accountId: string) => void;
  launchAllChromeProfiles: () => Promise<void>;
  closeAllChromeProfiles: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_PREFIX = 'milkyway_zalo_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [galaxyBrightness, setGalaxyBrightness] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'galaxy_brightness');
      return saved ? parseFloat(saved) : 0.65;
    } catch {
      return 0.65;
    }
  });

  // Load state from localStorage with fallbacks to rich mockData
  const [accounts, setAccounts] = useState<ZaloAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a: ZaloAccount, idx: number) => {
            const init = INITIAL_ACCOUNTS.find(i => i.id === a.id);
            const unread = typeof a.unreadCount === 'number' ? a.unreadCount : (init?.unreadCount ?? 0);
            const chrome = a.chromeProfile || init?.chromeProfile || {
              profileId: `profile_${a.phone.replace(/\D/g, '')}`,
              profileDir: `C:\\MilkywayZalo\\Profiles\\profile_${a.phone.replace(/\D/g, '')}`,
              cdpPort: 9222 + idx,
              status: 'closed'
            };
            return { ...a, unreadCount: unread, chromeProfile: chrome };
          });
        }
      }
      return INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'contacts');
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch {
      return INITIAL_CONTACTS;
    }
  });

  const [groups, setGroups] = useState<ZaloGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'groups');
      if (saved) {
        const parsed: ZaloGroup[] = JSON.parse(saved);
        if (!parsed.some(g => g.id === 'grp-4')) {
          const hiddenGrp = INITIAL_GROUPS.find(g => g.id === 'grp-4');
          if (hiddenGrp) return [...parsed, hiddenGrp];
        }
        return parsed;
      }
      return INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'accounts', JSON.stringify(accounts));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'contacts', JSON.stringify(contacts));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'campaigns', JSON.stringify(campaigns));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'groups', JSON.stringify(groups));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [logs]);

  const addLog = (level: ActivityLog['level'], action: string, details: string, accountName?: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      level,
      accountName,
      action,
      details,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 199)]); // keep last 200 logs
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Xóa nhật ký', 'Người dùng đã làm sạch toàn bộ nhật ký hệ thống.');
  };

  // Account methods
  const addAccount = (accountData: Omit<ZaloAccount, 'id' | 'todaySentInvites' | 'todaySentMessages' | 'sessionEncrypted'>) => {
    const cleanPhone = accountData.phone.replace(/\D/g, '') || Math.floor(10000000 + Math.random() * 90000000).toString();
    const newAccount: ZaloAccount = {
      ...accountData,
      id: 'acc-' + Date.now(),
      todaySentInvites: 0,
      todaySentMessages: 0,
      sessionEncrypted: 'aes-gcm-256:' + Math.random().toString(36).substring(2, 18),
      chromeProfile: accountData.chromeProfile || {
        profileId: `profile_${cleanPhone}`,
        profileDir: `C:\\MilkywayZalo\\Profiles\\profile_${cleanPhone}`,
        cdpPort: 9222 + accounts.length,
        status: 'running',
        lastLaunchedAt: 'Vừa xong'
      }
    };
    setAccounts(prev => [newAccount, ...prev]);
    addLog('success', 'Thêm tài khoản', `Đã thêm tài khoản Zalo mới: ${newAccount.name} (${newAccount.phone}) kèm Chrome Profile riêng: ${newAccount.chromeProfile?.profileId}`, newAccount.name);
  };

  const updateAccount = (id: string, updates: Partial<ZaloAccount>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addLog('info', 'Cập nhật tài khoản', `Đã cập nhật thông tin cho tài khoản ID: ${id}`);
  };

  const deleteAccount = (id: string) => {
    const target = accounts.find(a => a.id === id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    addLog('warning', 'Xóa tài khoản', `Đã xóa tài khoản: ${target?.name || id}`);
  };

  const toggleAccountActive = (id: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.isActive;
        addLog('info', nextState ? 'Kích hoạt tài khoản' : 'Tạm dừng tài khoản', `${a.name} đã được ${nextState ? 'bật' : 'tắt'}.`, a.name);
        return { ...a, isActive: nextState };
      }
      return a;
    }));
  };

  const reconnectAccount = async (id: string): Promise<boolean> => {
    const target = accounts.find(a => a.id === id);
    if (!target) return false;

    // Simulate real handshake verification
    updateAccount(id, { status: 'connecting' });
    addLog('info', 'Xác thực phiên', `Đang kết nối lại máy chủ Zalo cho ${target.name}...`, target.name);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const newHash = 'aes-gcm-256:' + Math.random().toString(36).substring(2, 18);
    updateAccount(id, {
      status: 'online',
      isActive: true,
      lastActive: 'Vừa xong',
      sessionEncrypted: newHash
    });

    addLog('success', 'Kết nối thành công', `Tài khoản ${target.name} đã kết nối lại an toàn. Token mới được mã hóa.`, target.name);
    return true;
  };

  // Chrome Profile Methods
  const launchChromeProfile = async (accountId: string): Promise<boolean> => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return false;
    const cleanPhone = acc.phone.replace(/\D/g, '') || acc.id;
    const port = acc.chromeProfile?.cdpPort || (9222 + accounts.findIndex(a => a.id === accountId));
    const dir = acc.chromeProfile?.profileDir || `C:\\MilkywayZalo\\Profiles\\profile_${cleanPhone}`;

    addLog('info', 'Khởi chạy Chrome', `Đang mở trình duyệt Google Chrome độc lập cho ${acc.name} (Port: ${port}, UserDataDir: ${dir})...`, acc.name);

    // Simulate browser process spawn delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        return {
          ...a,
          chromeProfile: {
            profileId: a.chromeProfile?.profileId || `profile_${cleanPhone}`,
            profileDir: dir,
            cdpPort: port,
            status: 'running',
            lastLaunchedAt: 'Vừa xong'
          }
        };
      }
      return a;
    }));

    addLog('success', 'Chrome sẵn sàng', `Trình duyệt Chrome độc lập của ${acc.name} đã kết nối Zalo Web (https://chat.zalo.me).`, acc.name);
    return true;
  };

  const closeChromeProfile = (accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    setAccounts(prev => prev.map(a => {
      if (a.id === accountId && a.chromeProfile) {
        return {
          ...a,
          chromeProfile: {
            ...a.chromeProfile,
            status: 'closed'
          }
        };
      }
      return a;
    }));
    if (acc) {
      addLog('warning', 'Đóng Chrome', `Đã tắt tiến trình trình duyệt Chrome riêng của ${acc.name}.`, acc.name);
    }
  };

  const launchAllChromeProfiles = async () => {
    addLog('info', 'Mở hàng loạt Chrome', 'Bắt đầu khởi chạy các cửa sổ Google Chrome độc lập cho tất cả tài khoản hoạt động...');
    for (const acc of accounts.filter(a => a.isActive)) {
      await launchChromeProfile(acc.id);
    }
    addLog('success', 'Hoàn tất mở Chrome', 'Đã khởi chạy toàn bộ các trình duyệt Chrome độc lập tương ứng.');
  };

  const closeAllChromeProfiles = () => {
    setAccounts(prev => prev.map(a => ({
      ...a,
      chromeProfile: a.chromeProfile ? { ...a.chromeProfile, status: 'closed' } : undefined
    })));
    addLog('info', 'Đóng toàn bộ Chrome', 'Đã đóng tất cả các tiến trình Chrome của dàn tài khoản.');
  };

  // Contact methods
  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setContacts(prev => [newContact, ...prev]);
    addLog('info', 'Thêm khách hàng', `Đã lưu khách hàng mới: ${newContact.name} (${newContact.phone})`);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const toggleOptOut = (id: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const nextOpt = !c.isOptOut;
        addLog(nextOpt ? 'warning' : 'info', 'Cập nhật Opt-out', `Khách hàng ${c.name} (${c.phone}) ${nextOpt ? 'được đưa vào' : 'được xóa khỏi'} Blacklist.`);
        return { ...c, isOptOut: nextOpt };
      }
      return c;
    }));
  };

  const importContactsFromTxt = (text: string, tag: string = 'TXT Import') => {
    const report = parsePhoneListFromText(text);
    const existingPhones = new Set(contacts.map(c => c.normalizedPhone));
    let addedCount = 0;
    let duplicateWithExisting = 0;

    const newContactsList: Contact[] = [];
    const now = new Date().toISOString().split('T')[0];

    for (const item of report.validContacts) {
      if (existingPhones.has(item.normalized)) {
        duplicateWithExisting++;
        continue;
      }

      existingPhones.add(item.normalized);
      addedCount++;
      newContactsList.push({
        id: 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        phone: item.normalized,
        normalizedPhone: item.normalized,
        name: item.name || `Khách hàng ${item.normalized.slice(-4)}`,
        tags: [tag, item.carrier || 'Di động'].filter(Boolean),
        source: 'txt_import',
        friendStatus: 'not_friend',
        isOptOut: false,
        notes: `Nhập từ file TXT ngày ${now}`,
        createdAt: now,
      });
    }

    if (newContactsList.length > 0) {
      setContacts(prev => [...newContactsList, ...prev]);
    }

    addLog(
      'success',
      'Nhập liên hệ từ TXT',
      `Tổng dòng: ${report.totalLines} | Thêm mới: ${addedCount} | Trùng lặp: ${report.duplicateCount + duplicateWithExisting} | Không hợp lệ: ${report.invalidCount}`
    );

    return {
      added: addedCount,
      duplicates: report.duplicateCount + duplicateWithExisting,
      invalids: report.invalidCount,
    };
  };

  // Campaign methods
  const createCampaign = (
    data: Omit<Campaign, 'id' | 'createdAt' | 'processedCount' | 'successCount' | 'failedCount' | 'status' | 'tasks'>,
    initialTasks: any[] = []
  ): string => {
    const campId = 'camp-' + Date.now();
    const newCamp: Campaign = {
      ...data,
      id: campId,
      createdAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      status: 'draft',
      tasks: initialTasks,
    };
    setCampaigns(prev => [newCamp, ...prev]);
    addLog('info', 'Tạo chiến dịch', `Đã tạo chiến dịch [${newCamp.name}] với ${newCamp.totalCount} đối tượng.`);
    return campId;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const startCampaign = (id: string) => {
    const camp = campaigns.find(c => c.id === id);
    if (!camp) return;

    updateCampaign(id, {
      status: 'running',
      startedAt: camp.startedAt || new Date().toLocaleString('sv-SE').replace('T', ' ')
    });
    addLog('info', 'Bắt đầu chiến dịch', `Chiến dịch [${camp.name}] đang chạy.`);
  };

  const pauseCampaign = (id: string) => {
    const camp = campaigns.find(c => c.id === id);
    if (!camp) return;

    updateCampaign(id, { status: 'paused' });
    addLog('warning', 'Tạm dừng chiến dịch', `Chiến dịch [${camp.name}] đã được tạm dừng.`);
  };

  const stopCampaign = (id: string) => {
    const camp = campaigns.find(c => c.id === id);
    if (!camp) return;

    updateCampaign(id, {
      status: 'cancelled',
      completedAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    });
    addLog('warning', 'Hủy chiến dịch', `Chiến dịch [${camp.name}] đã kết thúc/hủy.`);
  };

  // Group Scanner & Management Actions
  const addGroup = (groupData: Partial<ZaloGroup>): string => {
    const newId = 'grp-' + Date.now();
    const newGrp: ZaloGroup = {
      id: newId,
      name: groupData.name || 'Nhóm Zalo Mới',
      avatar: groupData.avatar || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=200&h=200&q=80',
      memberCount: groupData.memberCount || 120,
      myRole: groupData.myRole || 'member',
      accountId: groupData.accountId || accounts[0]?.id || 'acc-1',
      isCommunityHidden: !!groupData.isCommunityHidden,
      communityLink: groupData.communityLink,
      scannedAt: undefined,
      lastScanCount: 0,
      members: groupData.members || []
    };
    setGroups(prev => [newGrp, ...prev]);
    addLog('info', 'Thêm nhóm mới', `Đã thêm nhóm [${newGrp.name}] (${newGrp.isCommunityHidden ? 'Nhóm Cộng Đồng Ẩn Thành Viên' : 'Nhóm Tiêu Chuẩn'}).`);
    return newId;
  };

  const updateGroup = (groupId: string, updates: Partial<ZaloGroup>) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const deleteGroup = (groupId: string) => {
    const grp = groups.find(g => g.id === groupId);
    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (grp) {
      addLog('warning', 'Xóa nhóm', `Đã xóa nhóm [${grp.name}] khỏi hệ thống.`);
    }
  };

  const scanGroupMembers = async (groupId: string, deepScanHidden: boolean = true): Promise<GroupMember[]> => {
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return [];

    addLog(
      'info', 
      'Bắt đầu Quét Nhóm', 
      `Đang khởi động bộ máy quét thành viên nhóm [${grp.name}] (${grp.isCommunityHidden ? 'Nhóm Cộng Đồng ẨN THÀNH VIÊN' : 'Nhóm tiêu chuẩn'})...`
    );

    // Simulate realistic scanning delay
    await new Promise(resolve => setTimeout(resolve, 1400));

    const existingMembers = grp.members || [];
    const existingZaloIds = new Set(existingMembers.map(m => m.zaloId));

    const samplePool = [
      { name: 'Nguyễn Văn Hùng (CEO VinaTech)', gender: 'male', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'message_history', snippet: 'Vừa nhắn: "Gửi tài liệu phân tích thị trường giúp mình"' },
      { name: 'Hoàng Minh Châu (Phó Giám Đốc)', gender: 'female', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80', role: 'deputy', method: 'admin_roster', snippet: 'Phó ban quản trị nhóm cộng đồng' },
      { name: 'Trần Đình Trọng (BĐS Thổ Cư)', gender: 'male', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'reaction', snippet: 'Thả tim bài ghim thông báo mới' },
      { name: 'Vũ Thị Thanh Thảo (Dược Phẩm)', gender: 'female', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'reaction', snippet: 'Thả like tin nhắn thị trường' },
      { name: 'Phạm Đức Anh (Nhà Đầu Tư VIP)', gender: 'male', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'cdp_dom_extract', snippet: 'Bóc tách từ luồng WebSocket Chrome CDP' },
      { name: 'Lê Thùy Dung (Mỹ Phẩm Xách Tay)', gender: 'female', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'message_history', snippet: 'Nhắn: "Bên bạn có tuyển đại lý phân phối không?"' },
      { name: 'Đặng Quốc Huy (Kinh Doanh Ô Tô)', gender: 'male', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'reaction', snippet: 'Thả tim tin nhắn trao đổi' },
      { name: 'Bùi Ngọc Lan (Tài Chính F88)', gender: 'female', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'cdp_dom_extract', snippet: 'Trích xuất ID gói tin tương tác' },
      { name: 'Dương Thành Long (Xây Dựng HN)', gender: 'male', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'message_history', snippet: 'Nhắn: "Cho mình xin báo giá thi công trọn gói"' },
      { name: 'Đỗ Hải Yến (Marketing Agency)', gender: 'female', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80', role: 'member', method: 'reaction', snippet: 'Thả cảm xúc trên khảo sát nhóm' },
    ];

    const newlyDiscovered: GroupMember[] = [];
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    samplePool.forEach((sample, idx) => {
      const zaloId = `scan_${sample.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${idx}`;
      if (!existingZaloIds.has(zaloId)) {
        const randomPhoneEnd = Math.floor(100 + Math.random() * 899);
        const phone = `09${Math.floor(10 + Math.random() * 89)}888${randomPhoneEnd}`;

        newlyDiscovered.push({
          id: `m-scan-${Date.now()}-${idx}`,
          name: sample.name,
          zaloId,
          avatar: sample.avatar,
          phoneMasked: `09${Math.floor(10 + Math.random() * 89)}***${randomPhoneEnd}`,
          phone,
          isFriend: Math.random() < 0.2,
          isOptOut: false,
          role: sample.role as 'admin' | 'deputy' | 'member',
          joinedAt: `Hôm nay ${nowStr}`,
          isDiscoveredFromHidden: grp.isCommunityHidden || deepScanHidden,
          discoveryMethod: sample.method as any,
          lastActiveSnippet: sample.snippet,
          gender: sample.gender as any
        });
      }
    });

    const merged = [...existingMembers, ...newlyDiscovered];
    const scannedAt = new Date().toLocaleString('sv-SE').replace('T', ' ');

    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          scannedAt,
          lastScanCount: merged.length,
          members: merged
        };
      }
      return g;
    }));

    addLog(
      'success',
      'Quét nhóm hoàn tất',
      `Đã quét thành công ${merged.length} thành viên từ nhóm [${grp.name}]. ${newlyDiscovered.length} thành viên mới được giải mã & trích xuất.`
    );

    return merged;
  };

  const saveGroupMembersToCrm = (membersToSave: GroupMember[], groupName: string): number => {
    const existingPhones = new Set(contacts.map(c => c.normalizedPhone));
    let addedCount = 0;
    const now = new Date().toISOString().split('T')[0];
    const newContacts: Contact[] = [];

    for (const m of membersToSave) {
      const phoneToUse = m.phone || (m.phoneMasked ? m.phoneMasked.replace(/\*/g, '8') : `098${Math.floor(1000000 + Math.random() * 8999999)}`);
      const normalized = phoneToUse.replace(/\D/g, '');

      if (!existingPhones.has(normalized)) {
        existingPhones.add(normalized);
        addedCount++;
        newContacts.push({
          id: 'c-grp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          phone: normalized,
          normalizedPhone: normalized,
          name: m.name,
          tags: ['Quét Nhóm Zalo', groupName],
          source: 'group',
          friendStatus: m.isFriend ? 'friend' : 'not_friend',
          isOptOut: m.isOptOut,
          notes: `Quét từ nhóm "${groupName}". Phương thức phát hiện: ${m.discoveryMethod || 'Quét nhóm'}`,
          createdAt: now
        });
      }
    }

    if (newContacts.length > 0) {
      setContacts(prev => [...newContacts, ...prev]);
    }

    addLog('success', 'Lưu vào CRM', `Đã thêm ${addedCount} thành viên từ nhóm [${groupName}] vào danh sách Khách Hàng CRM.`);
    return addedCount;
  };

  // Backup & Restore
  const exportDatabaseJson = (): string => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      accounts,
      contacts,
      groups,
      campaigns,
      logs,
    };
    return JSON.stringify(dump, null, 2);
  };

  const importDatabaseJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.accounts && Array.isArray(data.accounts)) setAccounts(data.accounts);
      if (data.contacts && Array.isArray(data.contacts)) setContacts(data.contacts);
      if (data.groups && Array.isArray(data.groups)) setGroups(data.groups);
      if (data.campaigns && Array.isArray(data.campaigns)) setCampaigns(data.campaigns);
      if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
      addLog('success', 'Khôi phục CSDL', 'Đã khôi phục dữ liệu từ bản sao lưu thành công.');
      return true;
    } catch (e) {
      addLog('error', 'Lỗi khôi phục CSDL', 'Tệp sao lưu không đúng định dạng JSON hợp lệ.');
      return false;
    }
  };

  // Unread Messages Management
  const totalUnreadCount = accounts.reduce((sum, a) => sum + (a.unreadCount || 0), 0);

  const setAccountUnreadCount = useCallback((accountId: string, count: number) => {
    const safeCount = Math.max(0, count);
    setAccounts(prev => {
      const current = prev.find(a => a.id === accountId);
      if (current && (current.unreadCount ?? 0) === safeCount) {
        return prev;
      }
      return prev.map(a => (a.id === accountId ? { ...a, unreadCount: safeCount } : a));
    });
  }, []);

  const simulateIncomingMessage = (targetAccountId?: string) => {
    const target = targetAccountId
      ? accounts.find(a => a.id === targetAccountId)
      : accounts.find(a => a.isActive && a.status === 'online') || accounts[0];

    if (!target) return;

    const sampleTexts = [
      'Chào bạn! Cho mình hỏi bảng giá gói dịch vụ CSKH tự động bên bạn với ạ.',
      'Dạ alo, mình vừa nhận được lời mời kết bạn, cho mình hỏi về dự án nha.',
      'Sản phẩm này có hỗ trợ cài đặt trên máy tính Windows 11 không bạn?',
      'Bên bạn có xuất hóa đơn VAT điện tử cho doanh nghiệp không ạ?',
      'Mình đã xem qua tài liệu rồi, cho mình xin hẹn tư vấn trực tiếp vào chiều nay nhé!'
    ];
    const incomingText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Update target account unread count
    const nextUnread = (target.unreadCount || 0) + 1;
    setAccounts(prev =>
      prev.map(a => (a.id === target.id ? { ...a, unreadCount: nextUnread, lastActive: 'Vừa xong' } : a))
    );

    // Try updating localStorage chat conversation if present
    try {
      const storageKey = `milkyway_chat_${target.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const chats = JSON.parse(saved);
        if (Array.isArray(chats) && chats.length > 0) {
          // Add to first or random conversation
          const targetConv = chats[Math.floor(Math.random() * chats.length)];
          targetConv.unreadCount = (targetConv.unreadCount || 0) + 1;
          targetConv.lastMessage = incomingText;
          targetConv.lastMessageTime = timeNow;
          targetConv.messages = targetConv.messages || [];
          targetConv.messages.push({
            id: 'sim-' + Date.now(),
            sender: 'contact',
            text: incomingText,
            time: timeNow,
            status: 'delivered'
          });
          localStorage.setItem(storageKey, JSON.stringify(chats));
        }
      }
    } catch {
      // ignore storage errors
    }

    // Play notification sound
    playNotificationSound();

    addLog(
      'info',
      'Tin nhắn mới đến',
      `Tài khoản [${target.name}] vừa nhận 1 tin nhắn mới: "${incomingText.substring(0, 45)}..."`,
      target.name
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        accounts,
        contacts,
        groups,
        campaigns,
        logs,
        addAccount,
        updateAccount,
        deleteAccount,
        toggleAccountActive,
        reconnectAccount,
        addContact,
        updateContact,
        deleteContact,
        toggleOptOut,
        importContactsFromTxt,
        createCampaign,
        updateCampaign,
        startCampaign,
        pauseCampaign,
        stopCampaign,
        addGroup,
        updateGroup,
        deleteGroup,
        scanGroupMembers,
        saveGroupMembersToCrm,
        addLog,
        clearLogs,
        exportDatabaseJson,
        importDatabaseJson,
        galaxyBrightness,
        setGalaxyBrightness,
        totalUnreadCount,
        setAccountUnreadCount,
        simulateIncomingMessage,
        launchChromeProfile,
        closeChromeProfile,
        launchAllChromeProfiles,
        closeAllChromeProfiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
