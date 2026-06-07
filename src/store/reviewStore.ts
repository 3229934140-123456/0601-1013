import { create } from 'zustand';
import type { Review } from '@/types';
import { reviews as initialReviews } from '@/data/reviews';

interface ReviewState {
  reviews: Review[];
  filterRating: number;
  sortBy: 'newest' | 'rating';
  onlyFeatured: boolean;
  setFilterRating: (rating: number) => void;
  setSortBy: (sort: 'newest' | 'rating') => void;
  setOnlyFeatured: (only: boolean) => void;
  toggleFeatured: (id: string) => void;
  getFilteredReviews: () => Review[];
  getHighRatingReviews: () => Review[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: initialReviews,
  filterRating: 0,
  sortBy: 'newest',
  onlyFeatured: false,

  setFilterRating: (rating) => set({ filterRating: rating }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setOnlyFeatured: (only) => set({ onlyFeatured: only }),

  toggleFeatured: (id) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, isFeatured: !r.isFeatured } : r
      ),
    })),

  getFilteredReviews: () => {
    const { reviews, filterRating, sortBy, onlyFeatured } = get();
    let filtered = [...reviews];

    if (filterRating > 0) {
      filtered = filtered.filter((r) => r.rating >= filterRating);
    }

    if (onlyFeatured) {
      filtered = filtered.filter((r) => r.isFeatured);
    }

    if (sortBy === 'newest') {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  },

  getHighRatingReviews: () => get().reviews.filter((r) => r.rating >= 4),
}));
