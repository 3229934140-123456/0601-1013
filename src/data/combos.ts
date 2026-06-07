import type { Combo } from '@/types';

export const combos: Combo[] = [
  {
    id: 'combo-1',
    name: '招牌双人餐',
    description: '包含招牌香辣蟹 + 麻婆豆腐 + 米饭2碗，超值优惠',
    dishIds: ['dish-1', 'dish-6'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    storeItems: [
      { storeId: 'store-1', price: 198, originalPrice: 244, isOnSale: true, sortOrder: 1 },
      { storeId: 'store-2', price: 208, originalPrice: 254, isOnSale: true, sortOrder: 1 },
      { storeId: 'store-3', price: 218, originalPrice: 264, isOnSale: true, sortOrder: 2 },
      { storeId: 'store-5', price: 198, originalPrice: 244, isOnSale: false, sortOrder: 1 },
    ],
    createdAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'combo-2',
    name: '家庭欢聚四人餐',
    description: '适合家庭聚会，四菜一汤，荤素搭配营养均衡',
    dishIds: ['dish-2', 'dish-3', 'dish-8', 'dish-5'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    storeItems: [
      { storeId: 'store-1', price: 388, originalPrice: 492, isOnSale: true, sortOrder: 2 },
      { storeId: 'store-2', price: 398, originalPrice: 502, isOnSale: true, sortOrder: 2 },
      { storeId: 'store-5', price: 388, originalPrice: 492, isOnSale: true, sortOrder: 2 },
    ],
    createdAt: '2025-12-20T10:00:00Z',
  },
  {
    id: 'combo-3',
    name: '招牌烤鸭单人餐',
    description: '脆皮烤鸭半只 + 配菜 + 薄饼',
    dishIds: ['dish-5'],
    image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=300&fit=crop',
    storeItems: [
      { storeId: 'store-1', price: 98, originalPrice: 118, isOnSale: true, sortOrder: 3 },
      { storeId: 'store-2', price: 108, originalPrice: 128, isOnSale: true, sortOrder: 3 },
      { storeId: 'store-3', price: 118, originalPrice: 138, isOnSale: true, sortOrder: 1 },
      { storeId: 'store-5', price: 98, originalPrice: 118, isOnSale: false, sortOrder: 3 },
    ],
    createdAt: '2025-11-25T10:00:00Z',
  },
  {
    id: 'combo-4',
    name: '川湘风味双人餐',
    description: '水煮牛肉 + 宫保鸡丁 + 麻婆豆腐，川湘经典组合',
    dishIds: ['dish-4', 'dish-8', 'dish-6'],
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
    storeItems: [
      { storeId: 'store-1', price: 158, originalPrice: 194, isOnSale: true, sortOrder: 4 },
      { storeId: 'store-2', price: 158, originalPrice: 194, isOnSale: true, sortOrder: 4 },
      { storeId: 'store-3', price: 168, originalPrice: 204, isOnSale: true, sortOrder: 4 },
      { storeId: 'store-5', price: 158, originalPrice: 194, isOnSale: true, sortOrder: 4 },
    ],
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'combo-5',
    name: '甜蜜下午茶套餐',
    description: '桂花糖藕 + 杨枝甘露，甜蜜一夏',
    dishIds: ['dish-9', 'dish-10'],
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    storeItems: [
      { storeId: 'store-1', price: 52, originalPrice: 60, isOnSale: false, sortOrder: 5 },
      { storeId: 'store-2', price: 52, originalPrice: 60, isOnSale: false, sortOrder: 5 },
      { storeId: 'store-5', price: 52, originalPrice: 60, isOnSale: false, sortOrder: 5 },
    ],
    createdAt: '2026-01-10T10:00:00Z',
  },
];
