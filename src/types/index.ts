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
  type: 'friend_request' | 'txt_message' | 'group_message';
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
  isFriend: boolean;
  isOptOut: boolean;
  role: 'admin' | 'deputy' | 'member';
  joinedAt?: string;
}

export interface ZaloGroup {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  myRole: 'admin' | 'deputy' | 'member';
  accountId: string;
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
