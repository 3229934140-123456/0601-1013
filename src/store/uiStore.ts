import { create } from 'zustand';
import type { PageType } from '@/types';

interface UIState {
  currentPage: PageType;
  sidebarCollapsed: boolean;
  currentStoreId: string | 'all';
  dishModalOpen: boolean;
  editingDishId: string | null;
  comboModalOpen: boolean;
  editingComboId: string | null;
  activityModalOpen: boolean;
  editingActivityId: string | null;
  publishConfirmOpen: boolean;
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setCurrentStoreId: (storeId: string | 'all') => void;
  openDishModal: (id?: string) => void;
  closeDishModal: () => void;
  openComboModal: (id?: string) => void;
  closeComboModal: () => void;
  openActivityModal: (id?: string) => void;
  closeActivityModal: () => void;
  openPublishConfirm: () => void;
  closePublishConfirm: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  currentStoreId: 'all',
  dishModalOpen: false,
  editingDishId: null,
  comboModalOpen: false,
  editingComboId: null,
  activityModalOpen: false,
  editingActivityId: null,
  publishConfirmOpen: false,

  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCurrentStoreId: (storeId) => set({ currentStoreId: storeId }),

  openDishModal: (id) => set({ dishModalOpen: true, editingDishId: id || null }),
  closeDishModal: () => set({ dishModalOpen: false, editingDishId: null }),

  openComboModal: (id) => set({ comboModalOpen: true, editingComboId: id || null }),
  closeComboModal: () => set({ comboModalOpen: false, editingComboId: null }),

  openActivityModal: (id) => set({ activityModalOpen: true, editingActivityId: id || null }),
  closeActivityModal: () => set({ activityModalOpen: false, editingActivityId: null }),

  openPublishConfirm: () => set({ publishConfirmOpen: true }),
  closePublishConfirm: () => set({ publishConfirmOpen: false }),
}));
