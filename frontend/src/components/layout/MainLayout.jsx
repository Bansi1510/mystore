import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import MobileFab from './MobileFab';
import BulkToolbar from '../common/BulkToolbar';
import FilePreviewModal from '../files/FilePreviewModal';
import FileDetailsDrawer from '../files/FileDetailsDrawer';
import FileUploadModal from '../files/FileUploadModal';
import CreateFolderModal from '../files/CreateFolderModal';
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
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
            />
            <div className="relative z-50 w-72 bg-white dark:bg-slate-900 h-full shadow-2xl animate-in slide-in-from-left">
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area (extra bottom padding on mobile for MobileBottomNav) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-20 md:pb-6 relative">
          <Outlet />
        </main>
      </div>

      {/* Mobile Experience Overlays */}
      <MobileBottomNav />
      <MobileFab />

      {/* Floating Global Overlays & Modals */}
      <BulkToolbar />
      <FilePreviewModal />
      <FileDetailsDrawer />
      <FileUploadModal />
      <CreateFolderModal />
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
