export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  images: string[];
  portion: string;
  spicinessLevel: number;
  tags: string[];
  stock: number;
  stockWarning: number;
  isLimited: boolean;
  dailyLimit: number;
  isSignature: boolean;
  isOnSale: boolean;
  storeIds: string[];
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  dishIds: string[];
  image: string;
  isOnSale: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  type: 'spiciness' | 'dietary' | 'ingredient' | 'other';
}

export interface Activity {
  id: string;
  name: string;
  type: 'discount' | 'new' | 'limited';
  discount: number;
  startTime: string;
  endTime: string;
  dishIds: string[];
  storeIds: string[];
  status: 'draft' | 'active' | 'ended' | 'scheduled';
  description: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  dishId: string;
  rating: number;
  content: string;
  images: string[];
  isFeatured: boolean;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface TrendData {
  date: string;
  views: number;
  favorites: number;
}

export type PageType =
  | 'dashboard'
  | 'dishes'
  | 'combos'
  | 'tags'
  | 'inventory'
  | 'activities'
  | 'reviews'
  | 'preview';
