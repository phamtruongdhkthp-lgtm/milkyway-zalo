export interface ChromeProfileInfo {
  profileId: string;
  profileDir: string;
  cdpPort: number;
  status: 'running' | 'closed';
  lastLaunchedAt?: string;
  userAgent?: string;
}

export interface ZaloAccount {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: 'online' | 'offline' | 'qr_required' | 'checkpoint' | 'connecting';
  isActive: boolean;
  lastActive: string;
  todaySentInvites: number;
  todaySentMessages: number;
  maxDailyInvites: number;
  maxDailyMessages: number;
  proxy?: string;
  sessionEncrypted: string; // Simulated encrypted session hash, never plain password
  note?: string;
  zaloId?: string;
  unreadCount?: number;
  chromeProfile?: ChromeProfileInfo;
}

export interface Contact {
  id: string;
  phone: string;
  normalizedPhone: string;
  name: string;
  zaloAccountRelated?: string;
  tags: string[];
  source: 'txt_import' | 'manual' | 'group' | 'website';
  friendStatus: 'not_friend' | 'pending' | 'friend' | 'blocked';
  isOptOut: boolean;
  lastContactedAt?: string;
  notes?: string;
  createdAt: string;
}

export type ProcessingStatus = 
  | 'pending'
  | 'success'
  | 'failed'
  | 'invalid'
  | 'already_sent'
  | 'needs_confirm'
  | 'opt_out';

export interface FriendRequestTask {
  id: string;
  phone: string;
  normalizedPhone: string;
  contactName?: string;
  status: ProcessingStatus;
  processedAt?: string;
  error?: string;
  accountId: string;
  note: string;
}

export interface MessageTask {
  id: string;
  phone: string;
  normalizedPhone: string;
  contactName?: string;
  renderedMessage: string;
  status: ProcessingStatus;
  processedAt?: string;
  error?: string;
  accountId: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'friend_request' | 'txt_message' | 'group_message' | 'combo_friend_and_message';
  accountIds: string[];
  totalCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  messageTemplate: string;
  delaySeconds: number;
  maxPerDay: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  tasks: (FriendRequestTask | MessageTask)[];
}

export interface GroupMember {
  id: string;
  name: string;
  zaloId: string;
  avatar: string;
  phoneMasked?: string;
  phone?: string;
  isFriend: boolean;
  isOptOut: boolean;
  role: 'admin' | 'deputy' | 'member';
  joinedAt?: string;
  isDiscoveredFromHidden?: boolean; // Được quét từ nhóm cộng đồng ẩn thành viên
  discoveryMethod?: 'reaction' | 'message_history' | 'admin_roster' | 'cdp_dom_extract';
  lastActiveSnippet?: string;
  gender?: 'male' | 'female' | 'unknown';
}

export interface ZaloGroup {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  myRole: 'admin' | 'deputy' | 'member';
  accountId: string;
  isCommunityHidden?: boolean; // Nhóm cộng đồng đã ẩn danh sách thành viên
  communityLink?: string;
  scannedAt?: string;
  lastScanCount?: number;
  members: GroupMember[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  accountName?: string;
  action: string;
  details: string;
}

export interface DirectChatMessage {
  id: string;
  sender: 'me' | 'contact';
  text: string;
  time: string;
  status: 'sent' | 'delivered' | 'seen';
  attachmentType?: 'image' | 'file';
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface DirectChatConversation {
  id: string;
  accountId: string;
  contactName: string;
  contactPhone: string;
  contactAvatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectChatMessage[];
}
