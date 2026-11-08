/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CosmicBackground } from './components/layout/CosmicBackground';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/modules/DashboardView';
import { AccountManagerView } from './components/modules/AccountManagerView';
import { FriendRequestView } from './components/modules/FriendRequestView';
import { MessagingCampaignView } from './components/modules/MessagingCampaignView';
import { GroupMessagingView } from './components/modules/GroupMessagingView';
import { CustomerCrmView } from './components/modules/CustomerCrmView';
import { AuditLogView } from './components/modules/AuditLogView';
import { SettingsAndPackagingView } from './components/modules/SettingsAndPackagingView';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060814] text-slate-100 overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-amber-200">
      {/* Animated Milkyway stars background */}
      <CosmicBackground />

      {/* Top Navigation */}
      <Navbar />

      {/* Body Area */}
      <div className="relative z-10 flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Nav Menu */}
        <Sidebar />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'accounts' && <AccountManagerView />}
            {activeTab === 'friend_requests' && <FriendRequestView />}
            {activeTab === 'messaging' && <MessagingCampaignView />}
            {activeTab === 'group_messaging' && <GroupMessagingView />}
            {activeTab === 'crm' && <CustomerCrmView />}
            {activeTab === 'logs' && <AuditLogView />}
            {activeTab === 'settings' && <SettingsAndPackagingView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
