import { create } from 'zustand';
import type { Dish } from '@/types';
import { dishes as initialDishes, dishCategories } from '@/data/dishes';
import { generateId } from '@/utils/format';

interface DishState {
  dishes: Dish[];
  categories: string[];
  selectedIds: string[];
  searchQuery: string;
  activeCategory: string;
  sortBy: string;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
  setSortBy: (sort: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  addDish: (dish: Partial<Dish>) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  toggleOnSale: (id: string) => void;
  toggleSignature: (id: string) => void;
  batchAdjustPrice: (type: 'percentage' | 'fixed', value: number, ids?: string[]) => void;
  batchToggleOnSale: (isOnSale: boolean, ids?: string[]) => void;
  updateStock: (id: string, stock: number) => void;
  getFilteredDishes: () => Dish[];
  getMissingImages: () => Dish[];
  getMissingPrices: () => Dish[];
  getLowStockDishes: () => Dish[];
}

export const useDishStore = create<DishState>((set, get) => ({
  dishes: initialDishes,
  categories: dishCategories,
  selectedIds: [],
  searchQuery: '',
  activeCategory: '全部',
  sortBy: 'default',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSortBy: (sort) => set({ sortBy: sort }),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),

  selectAll: () =>
    set((state) => ({
      selectedIds: get().getFilteredDishes().map((d) => d.id),
    })),

  clearSelection: () => set({ selectedIds: [] }),

  addDish: (dish) => {
    const newDish: Dish = {
      id: generateId('dish'),
      name: dish.name || '新菜品',
      description: dish.description || '',
      price: dish.price || 0,
      originalPrice: dish.originalPrice || dish.price || 0,
      category: dish.category || '招牌菜',
      images: dish.images || [],
      portion: dish.portion || '',
      spicinessLevel: dish.spicinessLevel || 0,
      tags: dish.tags || [],
      stock: dish.stock ?? 0,
      stockWarning: dish.stockWarning ?? 10,
      isLimited: dish.isLimited || false,
      dailyLimit: dish.dailyLimit || 0,
      isSignature: dish.isSignature || false,
      isOnSale: dish.isOnSale || false,
      storeIds: dish.storeIds || [],
      views: 0,
      favorites: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ dishes: [newDish, ...state.dishes] }));
  },

  updateDish: (id, dish) =>
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === id ? { ...d, ...dish, updatedAt: new Date().toISOString() } : d
      ),
    })),

  deleteDish: (id) =>
    set((state) => ({
      dishes: state.dishes.filter((d) => d.id !== id),
      selectedIds: state.selectedIds.filter((i) => i !== id),
    })),

  toggleOnSale: (id) =>
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === id
          ? { ...d, isOnSale: !d.isOnSale, updatedAt: new Date().toISOString() }
          : d
      ),
    })),

  toggleSignature: (id) =>
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === id
          ? { ...d, isSignature: !d.isSignature, updatedAt: new Date().toISOString() }
          : d
      ),
    })),

  batchAdjustPrice: (type, value, ids) => {
    const targetIds = ids || get().selectedIds;
    if (targetIds.length === 0) return;

    set((state) => ({
      dishes: state.dishes.map((d) => {
        if (!targetIds.includes(d.id)) return d;
        let newPrice = d.price;
        if (type === 'percentage') {
          newPrice = Math.round(d.price * (1 + value / 100));
        } else {
          newPrice = Math.max(0, d.price + value);
        }
        return { ...d, price: newPrice, updatedAt: new Date().toISOString() };
      }),
    }));
  },

  batchToggleOnSale: (isOnSale, ids) => {
    const targetIds = ids || get().selectedIds;
    if (targetIds.length === 0) return;

    set((state) => ({
      dishes: state.dishes.map((d) =>
        targetIds.includes(d.id)
          ? { ...d, isOnSale, updatedAt: new Date().toISOString() }
          : d
      ),
    }));
  },

  updateStock: (id, stock) =>
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === id ? { ...d, stock, updatedAt: new Date().toISOString() } : d
      ),
    })),

  getFilteredDishes: () => {
    const { dishes, searchQuery, activeCategory, sortBy } = get();
    let filtered = [...dishes];

    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeCategory && activeCategory !== '全部') {
      filtered = filtered.filter((d) => d.category === activeCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        break;
    }

    return filtered;
  },

  getMissingImages: () => get().dishes.filter((d) => d.images.length === 0),
  getMissingPrices: () => get().dishes.filter((d) => d.price <= 0),
  getLowStockDishes: () =>
    get().dishes.filter((d) => d.stock <= d.stockWarning && d.isOnSale),
}));
