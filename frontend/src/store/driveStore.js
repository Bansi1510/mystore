import { create } from 'zustand';
import api from '../services/api';

export const useDriveStore = create((set, get) => ({
  currentFolder: null,
  breadcrumbs: [],
  folders: [],
  files: [],
  viewMode: localStorage.getItem('drive_view_mode') || 'grid',
  selectedFileIds: [],
  selectedFolderIds: [],
  selectedItemDetails: null,
  previewItem: null,
  
  // Modals state
  isUploadModalOpen: false,
  isCreateFolderOpen: false,
  isFolderPickerOpen: false,
  isShareModalOpen: false,
  isVersionModalOpen: false,
  isDuplicateModalOpen: false,
  shareTarget: null,
  versionTargetFile: null,
  pickerAction: null, // { type: 'move'|'copy', fileIds: [], folderIds: [] }

  searchQuery: '',
  filterCategory: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  isLoading: false,
  error: null,

  setViewMode: (mode) => {
    localStorage.setItem('drive_view_mode', mode);
    set({ viewMode: mode });
  },

  setFilterCategory: (category) => set({ filterCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSelectFile: (id) => {
    const { selectedFileIds } = get();
    if (selectedFileIds.includes(id)) {
      set({ selectedFileIds: selectedFileIds.filter((fId) => fId !== id) });
    } else {
      set({ selectedFileIds: [...selectedFileIds, id] });
    }
  },

  toggleSelectFolder: (id) => {
    const { selectedFolderIds } = get();
    if (selectedFolderIds.includes(id)) {
      set({ selectedFolderIds: selectedFolderIds.filter((fId) => fId !== id) });
    } else {
      set({ selectedFolderIds: [...selectedFolderIds, id] });
    }
  },

  selectAll: () => {
    const { files, folders } = get();
    set({
      selectedFileIds: files.map((f) => f._id),
      selectedFolderIds: folders.map((f) => f._id),
    });
  },

  clearSelection: () => {
    set({ selectedFileIds: [], selectedFolderIds: [] });
  },

  openPreview: (file) => set({ previewItem: file }),
  closePreview: () => set({ previewItem: null }),

  openDetails: (item) => set({ selectedItemDetails: item }),
  closeDetails: () => set({ selectedItemDetails: null }),

  // Modals control
  setUploadModalOpen: (isOpen) => set({ isUploadModalOpen: isOpen }),
  setCreateFolderOpen: (isOpen) => set({ isCreateFolderOpen: isOpen }),
  setFolderPickerOpen: (isOpen, pickerAction = null) => set({ isFolderPickerOpen: isOpen, pickerAction }),
  setShareModalOpen: (isOpen, target = null) => set({ isShareModalOpen: isOpen, shareTarget: target }),
  setVersionModalOpen: (isOpen, file = null) => set({ isVersionModalOpen: isOpen, versionTargetFile: file }),
  setDuplicateModalOpen: (isOpen) => set({ isDuplicateModalOpen: isOpen }),

  // Fetch Folder Contents
  fetchFolder: async (folderId = 'root') => {
    set({ isLoading: true, error: null, selectedFileIds: [], selectedFolderIds: [] });
    try {
      const url = folderId === 'root' ? '/folders' : `/folders/${folderId}`;
      const res = await api.get(url);
      set({
        currentFolder: res.data.currentFolder || null,
        breadcrumbs: res.data.breadcrumbs || [],
        folders: res.data.subfolders || [],
        files: res.data.files || [],
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Failed to fetch folder contents',
      });
    }
  },

  // Refresh current folder
  refreshFolder: async () => {
    const { currentFolder } = get();
    await get().fetchFolder(currentFolder ? currentFolder._id : 'root');
  },

  // Create folder
  createFolder: async (name, parentFolderId) => {
    const res = await api.post('/folders', { name, parentFolder: parentFolderId });
    await get().refreshFolder();
    return res.data;
  },

  // Star / Unstar
  toggleStarFile: async (fileId, isStarred) => {
    await api.patch(`/files/${fileId}/star`, { isStarred: !isStarred });
    await get().refreshFolder();
  },

  toggleStarFolder: async (folderId, isStarred) => {
    await api.patch(`/folders/${folderId}/star`, { isStarred: !isStarred });
    await get().refreshFolder();
  },

  // Soft Delete
  deleteFile: async (fileId) => {
    await api.delete(`/files/${fileId}`);
    await get().refreshFolder();
  },

  deleteFolder: async (folderId) => {
    await api.delete(`/folders/${folderId}`);
    await get().refreshFolder();
  },
}));
