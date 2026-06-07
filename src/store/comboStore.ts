import { create } from 'zustand';
import type { Combo } from '@/types';
import { combos as initialCombos } from '@/data/combos';
import { generateId } from '@/utils/format';

interface ComboState {
  combos: Combo[];
  selectedIds: string[];
  addCombo: (combo: Partial<Combo>) => void;
  updateCombo: (id: string, combo: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;
  toggleOnSale: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  batchAdjustPrice: (type: 'percentage' | 'fixed', value: number) => void;
}

export const useComboStore = create<ComboState>((set, get) => ({
  combos: initialCombos,
  selectedIds: [],

  addCombo: (combo) => {
    const newCombo: Combo = {
      id: generateId('combo'),
      name: combo.name || '新套餐',
      description: combo.description || '',
      price: combo.price || 0,
      originalPrice: combo.originalPrice || combo.price || 0,
      dishIds: combo.dishIds || [],
      image: combo.image || '',
      isOnSale: combo.isOnSale || false,
      sortOrder: get().combos.length + 1,
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
      selectedIds: state.selectedIds.filter((i) => i !== id),
    })),

  toggleOnSale: (id) =>
    set((state) => ({
      combos: state.combos.map((c) =>
        c.id === id ? { ...c, isOnSale: !c.isOnSale } : c
      ),
    })),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),

  selectAll: () =>
    set((state) => ({
      selectedIds: state.combos.map((c) => c.id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  batchAdjustPrice: (type, value) => {
    const { selectedIds } = get();
    if (selectedIds.length === 0) return;

    set((state) => ({
      combos: state.combos.map((c) => {
        if (!selectedIds.includes(c.id)) return c;
        let newPrice = c.price;
        if (type === 'percentage') {
          newPrice = Math.round(c.price * (1 + value / 100));
        } else {
          newPrice = Math.max(0, c.price + value);
        }
        return { ...c, price: newPrice };
      }),
    }));
  },
}));
