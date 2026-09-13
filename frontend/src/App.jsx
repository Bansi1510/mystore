import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DrivePage from './pages/DrivePage';
import RecentPage from './pages/RecentPage';
import StarredPage from './pages/StarredPage';
import TrashPage from './pages/TrashPage';
import SearchPage from './pages/SearchPage';
import StoragePage from './pages/StoragePage';
import SettingsPage from './pages/SettingsPage';
import PublicSharePage from './pages/PublicSharePage';
import PublicRequestPage from './pages/PublicRequestPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminFilesPage from './pages/admin/AdminFilesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/drive" replace />;
  }
  return children;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/share/:token" element={<PublicSharePage />} />
        <Route path="/request/:token" element={<PublicRequestPage />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/drive" replace />} />
          <Route path="drive" element={<DrivePage />} />
          <Route path="drive/:folderId" element={<DrivePage />} />
          <Route path="recent" element={<RecentPage />} />
          <Route path="starred" element={<StarredPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/activity"
            element={
              <AdminRoute>
                <AdminActivityPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/files"
            element={
              <AdminRoute>
                <AdminFilesPage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/settings"
            element={
              <AdminRoute>
                <AdminSettingsPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/drive" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
