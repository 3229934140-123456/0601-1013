import { create } from 'zustand';
import type { Store } from '@/types';
import { stores as initialStores } from '@/data/stores';

interface StoreState {
  stores: Store[];
  getActiveStores: () => Store[];
  getStoreById: (id: string) => Store | undefined;
  getStoreNames: (ids: string[]) => string[];
}

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: initialStores,

  getActiveStores: () => get().stores.filter((s) => s.isActive),

  getStoreById: (id) => get().stores.find((s) => s.id === id),

  getStoreNames: (ids) => {
    const { stores } = get();
    return ids.map((id) => stores.find((s) => s.id === id)?.name || '').filter(Boolean);
  },
}));
