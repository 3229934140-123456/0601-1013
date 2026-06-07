import type { Dish, Combo } from '@/types';

export const exportMenuToCSV = (dishes: Dish[], combos: Combo[]): void => {
  let csvContent = 'data:text/csv;charset=utf-8,\ufeff';
  csvContent += '类型,名称,描述,价格,原价,分类,状态\n';

  dishes.forEach((dish) => {
    csvContent += [
      '菜品',
      dish.name,
      dish.description.replace(/,/g, '，'),
      dish.price,
      dish.originalPrice,
      dish.category,
      dish.isOnSale ? '在售' : '下架',
    ].join(',') + '\n';
  });

  combos.forEach((combo) => {
    csvContent += [
      '套餐',
      combo.name,
      combo.description.replace(/,/g, '，'),
      combo.price,
      combo.originalPrice,
      '套餐',
      combo.isOnSale ? '在售' : '下架',
    ].join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `菜单清单_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDishDetails = (dishes: Dish[]): void => {
  let csvContent = 'data:text/csv;charset=utf-8,\ufeff';
  csvContent += '菜品名称,描述,价格,原价,分类,分量,辣度,库存,日限量,浏览量,收藏量,状态\n';

  dishes.forEach((dish) => {
    csvContent += [
      dish.name,
      dish.description.replace(/,/g, '，').replace(/\n/g, ' '),
      dish.price,
      dish.originalPrice,
      dish.category,
      dish.portion,
      dish.spicinessLevel,
      dish.stock,
      dish.isLimited ? dish.dailyLimit : '不限量',
      dish.views,
      dish.favorites,
      dish.isOnSale ? '在售' : '下架',
    ].join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `菜品详情_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
