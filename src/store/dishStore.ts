import { create } from 'zustand';
import type { Dish, DishStoreItem } from '@/types';
import { dishes as initialDishes, dishCategories } from '@/data/dishes';

interface DishState {
  dishes: Dish[];
  categories: string[];
  searchKeyword: string;
  selectedCategory: string;
  sortBy: string;
  selectedDishIds: string[];

  setSearchKeyword: (keyword: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sort: string) => void;
  toggleDishSelection: (id: string) => void;
  clearSelections: () => void;
  selectAll: () => void;

  addDish: (dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  toggleSignature: (id: string) => void;

  getDishById: (id: string) => Dish | undefined;
  getFilteredDishes: (storeId?: string | 'all') => Dish[];
  getDishStoreItem: (dish: Dish, storeId: string | 'all') => DishStoreItem | null;
  getDishPrice: (dish: Dish, storeId: string | 'all') => number;
  getDishStock: (dish: Dish, storeId: string | 'all') => number;
  getDishOnSale: (dish: Dish, storeId: string | 'all') => boolean;

  getMissingImageCount: () => number;
  getMissingPriceCount: (storeId?: string | 'all') => number;
  getSoldOutOnSaleCount: (storeId?: string | 'all') => number;
  getOnSaleCount: (storeId?: string | 'all') => number;
  getSignatureCount: (storeId?: string | 'all') => number;

  batchAdjustPrice: (type: 'fixed' | 'percent', value: number, storeId: string, ids?: string[]) => void;
  batchToggleOnSale: (isOnSale: boolean, storeId: string, ids?: string[]) => void;
  batchUpdateStock: (stock: number, storeId: string, ids?: string[]) => void;

  updateDishStoreItem: (dishId: string, storeId: string, item: Partial<DishStoreItem>) => void;
  addDishToStore: (dishId: string, storeId: string, item: DishStoreItem) => void;
  removeDishFromStore: (dishId: string, storeId: string) => void;

  reorderImages: (dishId: string, fromIndex: number, toIndex: number) => void;
  setCoverImage: (dishId: string, imageUrl: string) => void;
  addImage: (dishId: string, imageUrl: string) => void;
  removeImage: (dishId: string, imageUrl: string) => void;
}

export const useDishStore = create<DishState>((set, get) => ({
  dishes: initialDishes,
  categories: dishCategories,
  searchKeyword: '',
  selectedCategory: '全部',
  sortBy: 'default',
  selectedDishIds: [],

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sort) => set({ sortBy: sort }),

  toggleDishSelection: (id) =>
    set((state) => ({
      selectedDishIds: state.selectedDishIds.includes(id)
        ? state.selectedDishIds.filter((i) => i !== id)
        : [...state.selectedDishIds, id],
    })),

  clearSelections: () => set({ selectedDishIds: [] }),

  selectAll: () => {
    const { getFilteredDishes } = get();
    const filtered = getFilteredDishes();
    set({ selectedDishIds: filtered.map((d) => d.id) });
  },

  addDish: (dish) => {
    const newDish: Dish = {
      ...dish,
      id: `dish-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ dishes: [...state.dishes, newDish] }));
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
      selectedDishIds: state.selectedDishIds.filter((i) => i !== id),
    })),

  toggleSignature: (id) =>
    set((state) => ({
      dishes: state.dishes.map((d) =>
        d.id === id ? { ...d, isSignature: !d.isSignature, updatedAt: new Date().toISOString() } : d
      ),
    })),

  getDishById: (id) => get().dishes.find((d) => d.id === id),

  getDishStoreItem: (dish, storeId) => {
    if (storeId === 'all') {
      return dish.storeItems[0] || null;
    }
    return dish.storeItems.find((item) => item.storeId === storeId) || null;
  },

  getDishPrice: (dish, storeId) => {
    const item = get().getDishStoreItem(dish, storeId);
    return item?.price || 0;
  },

  getDishStock: (dish, storeId) => {
    const item = get().getDishStoreItem(dish, storeId);
    return item?.stock || 0;
  },

  getDishOnSale: (dish, storeId) => {
    if (storeId === 'all') {
      return dish.storeItems.some((item) => item.isOnSale);
    }
    const item = dish.storeItems.find((i) => i.storeId === storeId);
    return item?.isOnSale || false;
  },

  getFilteredDishes: (storeId = 'all') => {
    const { dishes, searchKeyword, selectedCategory, sortBy } = get();
    let filtered = [...dishes];

    if (storeId !== 'all') {
      filtered = filtered.filter((d) => d.storeItems.some((item) => item.storeId === storeId));
    }

    if (searchKeyword) {
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (selectedCategory !== '全部') {
      filtered = filtered.filter((d) => d.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = get().getDishPrice(a, storeId);
          const priceB = get().getDishPrice(b, storeId);
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = get().getDishPrice(a, storeId);
          const priceB = get().getDishPrice(b, storeId);
          return priceB - priceA;
        });
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'favorites':
        filtered.sort((a, b) => b.favorites - a.favorites);
        break;
      default:
        filtered.sort((a, b) => {
          const sortA = get().getDishStoreItem(a, storeId)?.sortOrder || 999;
          const sortB = get().getDishStoreItem(b, storeId)?.sortOrder || 999;
          if (sortA !== sortB) return sortA - sortB;
          if (a.isSignature && !b.isSignature) return -1;
          if (!a.isSignature && b.isSignature) return 1;
          return 0;
        });
    }

    return filtered;
  },

  getMissingImageCount: () => {
    return get().dishes.filter((d) => !d.coverImage || d.images.length === 0).length;
  },

  getMissingPriceCount: (storeId = 'all') => {
    const { dishes } = get();
    let count = 0;
    for (const dish of dishes) {
      if (storeId === 'all') {
        if (dish.storeItems.some((item) => item.price <= 0)) {
          count++;
        }
      } else {
        const item = dish.storeItems.find((i) => i.storeId === storeId);
        if (item && item.price <= 0) {
          count++;
        }
      }
    }
    return count;
  },

  getSoldOutOnSaleCount: (storeId = 'all') => {
    const { dishes } = get();
    let count = 0;
    for (const dish of dishes) {
      if (storeId === 'all') {
        if (dish.storeItems.some((item) => item.isOnSale && item.stock <= 0)) {
          count++;
        }
      } else {
        const item = dish.storeItems.find((i) => i.storeId === storeId);
        if (item && item.isOnSale && item.stock <= 0) {
          count++;
        }
      }
    }
    return count;
  },

  getOnSaleCount: (storeId = 'all') => {
    const { dishes } = get();
    if (storeId === 'all') {
      return dishes.filter((d) => d.storeItems.some((item) => item.isOnSale)).length;
    }
    return dishes.filter((d) => {
      const item = d.storeItems.find((i) => i.storeId === storeId);
      return item?.isOnSale;
    }).length;
  },

  getSignatureCount: (storeId = 'all') => {
    const { dishes } = get();
    if (storeId === 'all') {
      return dishes.filter((d) => d.isSignature).length;
    }
    return dishes.filter((d) => {
      const item = d.storeItems.find((i) => i.storeId === storeId);
      return item && d.isSignature;
    }).length;
  },

  batchAdjustPrice: (type, value, storeId, ids) => {
    const { dishes, selectedDishIds } = get();
    const targetIds = ids || selectedDishIds;

    set({
      dishes: dishes.map((dish) => {
        if (!targetIds.includes(dish.id)) return dish;
        const newStoreItems = dish.storeItems.map((item) => {
          if (item.storeId !== storeId) return item;
          let newPrice = item.price;
          if (type === 'fixed') {
            newPrice = Math.max(0, item.price + value);
          } else {
            newPrice = Math.max(0, Math.round(item.price * (1 + value / 100)));
          }
          return { ...item, price: newPrice };
        });
        return { ...dish, storeItems: newStoreItems, updatedAt: new Date().toISOString() };
      }),
    });
  },

  batchToggleOnSale: (isOnSale, storeId, ids) => {
    const { dishes, selectedDishIds } = get();
    const targetIds = ids || selectedDishIds;

    set({
      dishes: dishes.map((dish) => {
        if (!targetIds.includes(dish.id)) return dish;
        const newStoreItems = dish.storeItems.map((item) => {
          if (item.storeId !== storeId) return item;
          return { ...item, isOnSale };
        });
        return { ...dish, storeItems: newStoreItems, updatedAt: new Date().toISOString() };
      }),
    });
  },

  batchUpdateStock: (stock, storeId, ids) => {
    const { dishes, selectedDishIds } = get();
    const targetIds = ids || selectedDishIds;

    set({
      dishes: dishes.map((dish) => {
        if (!targetIds.includes(dish.id)) return dish;
        const newStoreItems = dish.storeItems.map((item) => {
          if (item.storeId !== storeId) return item;
          return { ...item, stock: Math.max(0, stock) };
        });
        return { ...dish, storeItems: newStoreItems, updatedAt: new Date().toISOString() };
      }),
    });
  },

  updateDishStoreItem: (dishId, storeId, item) =>
    set((state) => ({
      dishes: state.dishes.map((dish) => {
        if (dish.id !== dishId) return dish;
        const newStoreItems = dish.storeItems.map((si) =>
          si.storeId === storeId ? { ...si, ...item } : si
        );
        return { ...dish, storeItems: newStoreItems, updatedAt: new Date().toISOString() };
      }),
    })),

  addDishToStore: (dishId, storeId, item) =>
    set((state) => ({
      dishes: state.dishes.map((dish) => {
        if (dish.id !== dishId) return dish;
        if (dish.storeItems.some((si) => si.storeId === storeId)) return dish;
        return {
          ...dish,
          storeItems: [...dish.storeItems, item],
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  removeDishFromStore: (dishId, storeId) =>
    set((state) => ({
      dishes: state.dishes.map((dish) => {
        if (dish.id !== dishId) return dish;
        return {
          ...dish,
          storeItems: dish.storeItems.filter((si) => si.storeId !== storeId),
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  reorderImages: (dishId, fromIndex, toIndex) =>
    set((state) => ({
      dishes: state.dishes.map((dish) => {
        if (dish.id !== dishId) return dish;
        const newImages = [...dish.images];
        const [removed] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, removed);
        const newCoverImage = dish.coverImage || newImages[0] || '';
        return { ...dish, images: newImages, coverImage: newCoverImage, updatedAt: new Date().toISOString() };
      }),
    })),

  setCoverImage: (dishId, imageUrl) =>
    set((state) => ({
      dishes: state.dishes.map((dish) => {
        if (dish.id !== dishId) return dish;
        return { ...dish, coverImage: imageUrl, updatedAt: new Date().toISOString() };
      }),
    })),

  addImage: (dishId, imageUrl) =>
    set((state) => ({
      dishes: state.dishes.map((dish) => {
        if (dish.id !== dishId) return dish;
        const newImages = [...dish.images, imageUrl];
        const newCoverImage = dish.coverImage || imageUrl;
        return { ...dish, images: newImages, coverImage: newCoverImage, updatedAt: new Date().toISOString() };
      }),
    })),

  removeImage: (dishId, imageUrl) =>
    set((state) => ({
      dishes: state.dishes.map((dish) => {
        if (dish.id !== dishId) return dish;
        const newImages = dish.images.filter((img) => img !== imageUrl);
        const newCoverImage = dish.coverImage === imageUrl ? (newImages[0] || '') : dish.coverImage;
        return { ...dish, images: newImages, coverImage: newCoverImage, updatedAt: new Date().toISOString() };
      }),
    })),
}));
