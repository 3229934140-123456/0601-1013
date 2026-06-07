import { create } from 'zustand';
import type { Tag } from '@/types';
import { tags as initialTags } from '@/data/tags';
import { generateId } from '@/utils/format';

interface TagState {
  tags: Tag[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  addTag: (tag: Partial<Tag>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  getTagsByType: (type: Tag['type']) => Tag[];
  getCategories: () => string[];
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: initialTags,
  activeCategory: '全部',

  setActiveCategory: (category) => set({ activeCategory: category }),

  addTag: (tag) => {
    const newTag: Tag = {
      id: generateId('tag'),
      name: tag.name || '新标签',
      category: tag.category || '其他',
      color: tag.color || '#888888',
      icon: tag.icon || 'Tag',
      type: tag.type || 'other',
    };
    set((state) => ({ tags: [...state.tags, newTag] }));
  },

  updateTag: (id, tag) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...tag } : t)),
    })),

  deleteTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    })),

  getTagsByType: (type) => get().tags.filter((t) => t.type === type),

  getCategories: () => {
    const categories = new Set(get().tags.map((t) => t.category));
    return ['全部', ...Array.from(categories)];
  },
}));
