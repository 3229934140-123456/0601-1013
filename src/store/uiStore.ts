import { create } from 'zustand';
import type { PageType } from '@/types';

interface UIState {
  currentPage: PageType;
  sidebarCollapsed: boolean;
  dishModalOpen: boolean;
  editingDishId: string | null;
  comboModalOpen: boolean;
  editingComboId: string | null;
  activityModalOpen: boolean;
  editingActivityId: string | null;
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  openDishModal: (id?: string) => void;
  closeDishModal: () => void;
  openComboModal: (id?: string) => void;
  closeComboModal: () => void;
  openActivityModal: (id?: string) => void;
  closeActivityModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  dishModalOpen: false,
  editingDishId: null,
  comboModalOpen: false,
  editingComboId: null,
  activityModalOpen: false,
  editingActivityId: null,

  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  openDishModal: (id) => set({ dishModalOpen: true, editingDishId: id || null }),
  closeDishModal: () => set({ dishModalOpen: false, editingDishId: null }),

  openComboModal: (id) => set({ comboModalOpen: true, editingComboId: id || null }),
  closeComboModal: () => set({ comboModalOpen: false, editingComboId: null }),

  openActivityModal: (id) => set({ activityModalOpen: true, editingActivityId: id || null }),
  closeActivityModal: () => set({ activityModalOpen: false, editingActivityId: null }),
}));
