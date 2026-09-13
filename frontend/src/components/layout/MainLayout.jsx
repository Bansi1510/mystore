import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BulkToolbar from '../common/BulkToolbar';
import FilePreviewModal from '../files/FilePreviewModal';
import FileDetailsDrawer from '../files/FileDetailsDrawer';
import FileUploadModal from '../files/FileUploadModal';
import FileVersionModal from '../files/FileVersionModal';
import FolderPickerModal from '../files/FolderPickerModal';
import ShareModal from '../files/ShareModal';
import NotificationCenter from '../common/NotificationCenter';
import Toast from '../common/Toast';
import { useDriveStore } from '../../store/driveStore';
import { useThemeStore } from '../../store/themeStore';
import api from '../../services/api';

export default function MainLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    // Fetch storage info on layout mount
    api.get('/storage').then((res) => {
      if (res.data.success) {
        useDriveStore.setState({ storageInfo: res.data.storage });
      }
    }).catch((e) => console.warn('Storage info fetch failed:', e));
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Body container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Drawer & Overlay */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div className="relative z-50 w-64 bg-white dark:bg-slate-900 h-full shadow-2xl">
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Floating Global Overlays & Modals */}
      <BulkToolbar />
      <FilePreviewModal />
      <FileDetailsDrawer />
      <FileUploadModal />
      <FileVersionModal />
      <FolderPickerModal />
      <ShareModal />
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <Toast />
    </div>
  );
}
