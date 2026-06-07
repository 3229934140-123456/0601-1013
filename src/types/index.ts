export interface DishStoreItem {
  storeId: string;
  price: number;
  originalPrice: number;
  stock: number;
  stockWarning: number;
  isLimited: boolean;
  dailyLimit: number;
  isOnSale: boolean;
  sortOrder: number;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  coverImage: string;
  portion: string;
  spicinessLevel: number;
  tags: string[];
  isSignature: boolean;
  storeItems: DishStoreItem[];
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComboStoreItem {
  storeId: string;
  price: number;
  originalPrice: number;
  isOnSale: boolean;
  sortOrder: number;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  dishIds: string[];
  image: string;
  storeItems: ComboStoreItem[];
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

export interface PublishCheckResult {
  missingImages: Dish[];
  missingPrices: { dish: Dish; storeId: string }[];
  soldOutOnSale: { dish: Dish; storeId: string }[];
  totalIssues: number;
}
