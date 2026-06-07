import { create } from 'zustand';
import type { Combo, ComboStoreItem } from '@/types';
import { combos as initialCombos } from '@/data/combos';

interface ComboState {
  combos: Combo[];
  selectedComboIds: string[];

  addCombo: (combo: Omit<Combo, 'id' | 'createdAt'>) => void;
  updateCombo: (id: string, combo: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;
  toggleComboSelection: (id: string) => void;
  clearSelections: () => void;

  getComboById: (id: string) => Combo | undefined;
  getFilteredCombos: (storeId?: string | 'all') => Combo[];
  getComboStoreItem: (combo: Combo, storeId: string | 'all') => ComboStoreItem | null;
  getComboPrice: (combo: Combo, storeId: string | 'all') => number;
  getComboOnSale: (combo: Combo, storeId: string | 'all') => boolean;
  getOnSaleComboCount: (storeId?: string | 'all') => number;

  batchAdjustPrice: (type: 'fixed' | 'percent', value: number, storeId: string, ids?: string[]) => void;

  updateComboStoreItem: (comboId: string, storeId: string, item: Partial<ComboStoreItem>) => void;
  addComboToStore: (comboId: string, storeId: string, item: ComboStoreItem) => void;
  removeComboFromStore: (comboId: string, storeId: string) => void;
}

export const useComboStore = create<ComboState>((set, get) => ({
  combos: initialCombos,
  selectedComboIds: [],

  addCombo: (combo) => {
    const newCombo: Combo = {
      ...combo,
      id: `combo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ combos: [...state.combos, newCombo] }));
  },

  updateCombo: (id, combo) =>
    set((state) => ({
      combos: state.combos.map((c) => (c.id === id ? { ...c, ...combo } : c)),
    })),

  deleteCombo: (id) =>
    set((state) => ({
      combos: state.combos.filter((c) => c.id !== id),
      selectedComboIds: state.selectedComboIds.filter((i) => i !== id),
    })),

  toggleComboSelection: (id) =>
    set((state) => ({
      selectedComboIds: state.selectedComboIds.includes(id)
        ? state.selectedComboIds.filter((i) => i !== id)
        : [...state.selectedComboIds, id],
    })),

  clearSelections: () => set({ selectedComboIds: [] }),

  getComboById: (id) => get().combos.find((c) => c.id === id),

  getComboStoreItem: (combo, storeId) => {
    if (storeId === 'all') {
      return combo.storeItems[0] || null;
    }
    return combo.storeItems.find((item) => item.storeId === storeId) || null;
  },

  getComboPrice: (combo, storeId) => {
    const item = get().getComboStoreItem(combo, storeId);
    return item?.price || 0;
  },

  getComboOnSale: (combo, storeId) => {
    if (storeId === 'all') {
      return combo.storeItems.some((item) => item.isOnSale);
    }
    const item = combo.storeItems.find((i) => i.storeId === storeId);
    return item?.isOnSale || false;
  },

  getFilteredCombos: (storeId = 'all') => {
    let combos = [...get().combos];
    if (storeId !== 'all') {
      combos = combos.filter((c) => c.storeItems.some((item) => item.storeId === storeId));
    }
    combos.sort((a, b) => {
      const sortA = get().getComboStoreItem(a, storeId)?.sortOrder || 999;
      const sortB = get().getComboStoreItem(b, storeId)?.sortOrder || 999;
      return sortA - sortB;
    });
    return combos;
  },

  getOnSaleComboCount: (storeId = 'all') => {
    const { combos } = get();
    if (storeId === 'all') {
      return combos.filter((c) => c.storeItems.some((item) => item.isOnSale)).length;
    }
    return combos.filter((c) => {
      const item = c.storeItems.find((i) => i.storeId === storeId);
      return item?.isOnSale;
    }).length;
  },

  batchAdjustPrice: (type, value, storeId, ids) => {
    const { combos, selectedComboIds } = get();
    const targetIds = ids || selectedComboIds;

    set({
      combos: combos.map((combo) => {
        if (!targetIds.includes(combo.id)) return combo;
        const newStoreItems = combo.storeItems.map((item) => {
          if (item.storeId !== storeId) return item;
          let newPrice = item.price;
          if (type === 'fixed') {
            newPrice = Math.max(0, item.price + value);
          } else {
            newPrice = Math.max(0, Math.round(item.price * (1 + value / 100)));
          }
          return { ...item, price: newPrice };
        });
        return { ...combo, storeItems: newStoreItems };
      }),
    });
  },

  updateComboStoreItem: (comboId, storeId, item) =>
    set((state) => ({
      combos: state.combos.map((combo) => {
        if (combo.id !== comboId) return combo;
        const newStoreItems = combo.storeItems.map((si) =>
          si.storeId === storeId ? { ...si, ...item } : si
        );
        return { ...combo, storeItems: newStoreItems };
      }),
    })),

  addComboToStore: (comboId, storeId, item) =>
    set((state) => ({
      combos: state.combos.map((combo) => {
        if (combo.id !== comboId) return combo;
        if (combo.storeItems.some((si) => si.storeId === storeId)) return combo;
        return { ...combo, storeItems: [...combo.storeItems, item] };
      }),
    })),

  removeComboFromStore: (comboId, storeId) =>
    set((state) => ({
      combos: state.combos.map((combo) => {
        if (combo.id !== comboId) return combo;
        return { ...combo, storeItems: combo.storeItems.filter((si) => si.storeId !== storeId) };
      }),
    })),
}));
