import type { Dish, Combo, Activity, Store, DishStoreItem, ComboStoreItem } from '@/types';

const escapeCSV = (value: string | number | boolean | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getSpicinessText = (level: number): string => {
  const map: Record<number, string> = {
    0: '不辣',
    1: '微辣',
    2: '中辣',
    3: '特辣',
    4: '变态辣',
  };
  return map[level] || `辣度${level}`;
};

const calculateDiscountRate = (price: number, originalPrice: number): string => {
  if (!originalPrice || originalPrice <= 0 || price <= 0) return '';
  const rate = (price / originalPrice) * 10;
  return rate.toFixed(1) + '折';
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const getActivityForDish = (dishId: string, storeId: string, activities: Activity[]): Activity | null => {
  const now = new Date();
  for (const activity of activities) {
    if (activity.status !== 'active') continue;
    if (!activity.dishIds.includes(dishId)) continue;
    if (activity.storeIds.length > 0 && !activity.storeIds.includes(storeId)) continue;
    try {
      const startTime = new Date(activity.startTime);
      const endTime = new Date(activity.endTime);
      if (now >= startTime && now <= endTime) {
        return activity;
      }
    } catch {
      continue;
    }
  }
  return null;
};

const downloadCSV = (content: string, filename: string): void => {
  const bom = '\ufeff';
  const csvContent = bom + content;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

interface ExportMenuOptions {
  storeId: string | 'all';
  stores: Store[];
  dishes: Dish[];
  combos: Combo[];
  activities: Activity[];
  expandCombos?: boolean;
  includeDetails?: boolean;
}

const getDishStoreItems = (dish: Dish, storeId: string | 'all'): { storeId: string; item: DishStoreItem }[] => {
  if (storeId === 'all') {
    return dish.storeItems.map((item) => ({ storeId: item.storeId, item }));
  }
  const item = dish.storeItems.find((i) => i.storeId === storeId);
  return item ? [{ storeId, item }] : [];
};

const getComboStoreItems = (combo: Combo, storeId: string | 'all'): { storeId: string; item: ComboStoreItem }[] => {
  if (storeId === 'all') {
    return combo.storeItems.map((item) => ({ storeId: item.storeId, item }));
  }
  const item = combo.storeItems.find((i) => i.storeId === storeId);
  return item ? [{ storeId, item }] : [];
};

export const exportMenuToCSV = (options: ExportMenuOptions): void => {
  const { storeId, stores, dishes, combos, activities, expandCombos = true } = options;

  const getStoreName = (sid: string): string => {
    return stores.find((s) => s.id === sid)?.name || sid;
  };

  const headers = [
    '类型',
    '门店名称',
    '分类',
    '名称',
    '描述',
    '售价',
    '原价',
    '折扣率',
    '分量规格',
    '辣度',
    '标签',
    '库存数量',
    '库存预警值',
    '是否限量',
    '每日限量',
    '上下架状态',
    '是否招牌菜',
    '活动折扣',
    '生效时间',
    '备注',
  ];

  let csvContent = headers.join(',') + '\n';

  dishes.forEach((dish) => {
    const storeItems = getDishStoreItems(dish, storeId);
    storeItems.forEach(({ storeId: sid, item }) => {
      const activity = getActivityForDish(dish.id, sid, activities);
      const discountRate = calculateDiscountRate(item.price, item.originalPrice);

      const row = [
        '菜品',
        getStoreName(sid),
        dish.category,
        dish.name,
        dish.description,
        item.price,
        item.originalPrice,
        discountRate,
        dish.portion || '',
        getSpicinessText(dish.spicinessLevel),
        dish.tags.join('、'),
        item.stock,
        item.stockWarning,
        item.isLimited ? '是' : '否',
        item.isLimited ? item.dailyLimit : '不限量',
        item.isOnSale ? '在售' : '下架',
        dish.isSignature ? '是' : '否',
        activity ? `${activity.discount}折 (${activity.name})` : '',
        activity ? `${formatDate(activity.startTime)} - ${formatDate(activity.endTime)}` : '',
        '',
      ];

      csvContent += row.map(escapeCSV).join(',') + '\n';
    });
  });

  combos.forEach((combo) => {
    const storeItems = getComboStoreItems(combo, storeId);
    storeItems.forEach(({ storeId: sid, item }) => {
      const discountRate = calculateDiscountRate(item.price, item.originalPrice);

      const row = [
        '套餐',
        getStoreName(sid),
        '套餐',
        combo.name,
        combo.description,
        item.price,
        item.originalPrice,
        discountRate,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        item.isOnSale ? '在售' : '下架',
        '',
        '',
        '',
        '',
      ];

      csvContent += row.map(escapeCSV).join(',') + '\n';

      if (expandCombos) {
        combo.dishIds.forEach((dishId, index) => {
          const dish = dishes.find((d) => d.id === dishId);
          if (dish) {
            const dishItem = dish.storeItems.find((i) => i.storeId === sid);
            const detailRow = [
              '  └ 菜品明细',
              getStoreName(sid),
              dish.category,
              `  ${index + 1}. ${dish.name}`,
              dish.description,
              dishItem?.price || '',
              dishItem?.originalPrice || '',
              '',
              dish.portion || '',
              getSpicinessText(dish.spicinessLevel),
              dish.tags.join('、'),
              dishItem?.stock || '',
              dishItem?.stockWarning || '',
              '',
              '',
              '',
              '',
              '',
              '',
              '',
            ];
            csvContent += detailRow.map(escapeCSV).join(',') + '\n';
          }
        });
      }
    });
  });

  const storeName = storeId === 'all' ? '全部门店' : getStoreName(storeId);
  const filename = `菜单清单_${storeName}_${getDateString()}.csv`;
  downloadCSV(csvContent, filename);
};

interface ExportComboDetailsOptions {
  storeId: string | 'all';
  stores: Store[];
  dishes: Dish[];
  combos: Combo[];
}

export const exportComboDetails = (options: ExportComboDetailsOptions): void => {
  const { storeId, stores, dishes, combos } = options;

  const getStoreName = (sid: string): string => {
    return stores.find((s) => s.id === sid)?.name || sid;
  };

  const headers = [
    '套餐名称',
    '门店名称',
    '套餐描述',
    '套餐售价',
    '套餐原价',
    '折扣率',
    '包含菜品数量',
    '菜品序号',
    '菜品名称',
    '菜品分类',
    '菜品描述',
    '菜品售价',
    '菜品原价',
    '分量规格',
    '辣度',
    '标签',
    '上下架状态',
  ];

  let csvContent = headers.join(',') + '\n';

  combos.forEach((combo) => {
    const storeItems = storeId === 'all'
      ? combo.storeItems.map((item) => ({ storeId: item.storeId, item }))
      : combo.storeItems.filter((i) => i.storeId === storeId).map((item) => ({ storeId, item }));

    storeItems.forEach(({ storeId: sid, item }) => {
      const discountRate = calculateDiscountRate(item.price, item.originalPrice);

      combo.dishIds.forEach((dishId, index) => {
        const dish = dishes.find((d) => d.id === dishId);
        if (dish) {
          const dishItem = dish.storeItems.find((i) => i.storeId === sid);
          const row = [
            index === 0 ? combo.name : '',
            index === 0 ? getStoreName(sid) : '',
            index === 0 ? combo.description : '',
            index === 0 ? item.price : '',
            index === 0 ? item.originalPrice : '',
            index === 0 ? discountRate : '',
            index === 0 ? combo.dishIds.length : '',
            index + 1,
            dish.name,
            dish.category,
            dish.description,
            dishItem?.price || '',
            dishItem?.originalPrice || '',
            dish.portion || '',
            getSpicinessText(dish.spicinessLevel),
            dish.tags.join('、'),
            dishItem?.isOnSale ? '在售' : '下架',
          ];
          csvContent += row.map(escapeCSV).join(',') + '\n';
        }
      });
    });
  });

  const storeName = storeId === 'all' ? '全部门店' : getStoreName(storeId);
  const filename = `套餐明细_${storeName}_${getDateString()}.csv`;
  downloadCSV(csvContent, filename);
};

interface ExportDishDetailsOptions {
  storeId: string | 'all';
  stores: Store[];
  dishes: Dish[];
  activities: Activity[];
}

export const exportDishDetails = (options: ExportDishDetailsOptions): void => {
  const { storeId, stores, dishes, activities } = options;

  const getStoreName = (sid: string): string => {
    return stores.find((s) => s.id === sid)?.name || sid;
  };

  const headers = [
    '门店名称',
    '分类',
    '菜品名称',
    '描述',
    '售价',
    '原价',
    '折扣率',
    '分量规格',
    '辣度',
    '标签',
    '库存数量',
    '库存预警值',
    '是否限量',
    '每日限量',
    '上下架状态',
    '是否招牌菜',
    '活动折扣',
    '生效时间',
    '浏览量',
    '收藏量',
    '备注',
  ];

  let csvContent = headers.join(',') + '\n';

  dishes.forEach((dish) => {
    const storeItems = getDishStoreItems(dish, storeId);
    storeItems.forEach(({ storeId: sid, item }) => {
      const activity = getActivityForDish(dish.id, sid, activities);
      const discountRate = calculateDiscountRate(item.price, item.originalPrice);

      const row = [
        getStoreName(sid),
        dish.category,
        dish.name,
        dish.description,
        item.price,
        item.originalPrice,
        discountRate,
        dish.portion || '',
        getSpicinessText(dish.spicinessLevel),
        dish.tags.join('、'),
        item.stock,
        item.stockWarning,
        item.isLimited ? '是' : '否',
        item.isLimited ? item.dailyLimit : '不限量',
        item.isOnSale ? '在售' : '下架',
        dish.isSignature ? '是' : '否',
        activity ? `${activity.discount}折 (${activity.name})` : '',
        activity ? `${formatDate(activity.startTime)} - ${formatDate(activity.endTime)}` : '',
        dish.views,
        dish.favorites,
        '',
      ];

      csvContent += row.map(escapeCSV).join(',') + '\n';
    });
  });

  const storeName = storeId === 'all' ? '全部门店' : getStoreName(storeId);
  const filename = `菜品详情_${storeName}_${getDateString()}.csv`;
  downloadCSV(csvContent, filename);
};
