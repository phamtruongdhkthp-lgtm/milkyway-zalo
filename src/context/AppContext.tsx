import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ZaloAccount, Contact, Campaign, ZaloGroup, ActivityLog } from '../types';
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
          return parsed.map((a: ZaloAccount) => {
            if (typeof a.unreadCount === 'number') return a;
            const init = INITIAL_ACCOUNTS.find(i => i.id === a.id);
            return { ...a, unreadCount: init?.unreadCount ?? 0 };
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
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
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
    const newAccount: ZaloAccount = {
      ...accountData,
      id: 'acc-' + Date.now(),
      todaySentInvites: 0,
      todaySentMessages: 0,
      sessionEncrypted: 'aes-gcm-256:' + Math.random().toString(36).substring(2, 18),
    };
    setAccounts(prev => [newAccount, ...prev]);
    addLog('success', 'Thêm tài khoản', `Đã thêm tài khoản Zalo mới: ${newAccount.name} (${newAccount.phone})`, newAccount.name);
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
        addLog,
        clearLogs,
        exportDatabaseJson,
        importDatabaseJson,
        galaxyBrightness,
        setGalaxyBrightness,
        totalUnreadCount,
        setAccountUnreadCount,
        simulateIncomingMessage,
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
