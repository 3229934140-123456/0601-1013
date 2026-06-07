import { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Edit3, Search, Store } from 'lucide-react';
import { useDishStore } from '@/store/dishStore';
import { useStoreStore } from '@/store/storeStore';
import { useUIStore } from '@/store/uiStore';
import { cn, formatPrice } from '@/utils/format';
import type { Dish, DishStoreItem } from '@/types';

export const Inventory = () => {
  const { dishes, updateDishStoreItem, getDishStoreItem } = useDishStore();
  const { stores, getStoreById } = useStoreStore();
  const { currentStoreId } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');
  const [editWarning, setEditWarning] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [editIsLimited, setEditIsLimited] = useState(false);

  const activeStores = stores.filter((s) => s.isActive);

  const getStockStatus = (stock: number, warning: number) => {
    if (stock === 0) return { text: '已售罄', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' };
    if (stock <= warning) return { text: '库存预警', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' };
    return { text: '库存充足', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' };
  };

  const stockPercentage = (stock: number, isLimited: boolean, dailyLimit: number) => {
    const max = isLimited ? dailyLimit : Math.max(stock * 2, 100);
    return Math.min(100, (stock / max) * 100);
  };

  const stats = (() => {
    if (currentStoreId === 'all') {
      let totalSku = 0;
      let sufficient = 0;
      let warning = 0;
      let soldOut = 0;

      dishes.forEach((dish) => {
        dish.storeItems.forEach((item) => {
          if (!activeStores.some((s) => s.id === item.storeId)) return;
          totalSku++;
          if (item.stock === 0) {
            soldOut++;
          } else if (item.stock <= item.stockWarning) {
            warning++;
          } else {
            sufficient++;
          }
        });
      });

      return { totalSku, sufficient, warning, soldOut };
    } else {
      const storeDishes = dishes.filter((d) =>
        d.storeItems.some((item) => item.storeId === currentStoreId)
      );
      const totalSku = storeDishes.length;
      let sufficient = 0;
      let warning = 0;
      let soldOut = 0;

      storeDishes.forEach((dish) => {
        const item = dish.storeItems.find((i) => i.storeId === currentStoreId);
        if (item) {
          if (item.stock === 0) {
            soldOut++;
          } else if (item.stock <= item.stockWarning) {
            warning++;
          } else {
            sufficient++;
          }
        }
      });

      return { totalSku, sufficient, warning, soldOut };
    }
  })();

  const filteredDishes = dishes.filter((dish) => {
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (currentStoreId !== 'all') {
      const hasStore = dish.storeItems.some((item) => item.storeId === currentStoreId);
      if (!hasStore) return false;
    }

    if (filterStatus !== 'all') {
      if (currentStoreId === 'all') {
        const hasMatch = dish.storeItems.some((item) => {
          if (!activeStores.some((s) => s.id === item.storeId)) return false;
          switch (filterStatus) {
            case 'low':
              return item.stock > 0 && item.stock <= item.stockWarning;
            case 'out':
              return item.stock === 0;
            case 'normal':
              return item.stock > item.stockWarning;
            default:
              return true;
          }
        });
        if (!hasMatch) return false;
      } else {
        const item = dish.storeItems.find((i) => i.storeId === currentStoreId);
        if (!item) return false;
        switch (filterStatus) {
          case 'low':
            return item.stock > 0 && item.stock <= item.stockWarning;
          case 'out':
            return item.stock === 0;
          case 'normal':
            return item.stock > item.stockWarning;
          default:
            return true;
        }
      }
    }

    return true;
  });

  const openEdit = (dish: Dish, storeId: string) => {
    const item = getDishStoreItem(dish, storeId);
    if (!item) return;
    setEditingKey(`${dish.id}-${storeId}`);
    setEditStock(String(item.stock));
    setEditWarning(String(item.stockWarning));
    setEditLimit(String(item.dailyLimit));
    setEditIsLimited(item.isLimited);
  };

  const saveEdit = (dishId: string, storeId: string) => {
    updateDishStoreItem(dishId, storeId, {
      stock: Number(editStock),
      stockWarning: Number(editWarning),
      isLimited: editIsLimited,
      dailyLimit: Number(editLimit),
    });
    setEditingKey(null);
  };

  const renderStoreInventoryCell = (dish: Dish, storeId: string) => {
    const item = dish.storeItems.find((i) => i.storeId === storeId);
    const key = `${dish.id}-${storeId}`;
    const isEditing = editingKey === key;

    if (!item) {
      return (
        <td key={storeId} className="px-4 py-4 text-center">
          <span className="text-earth-300 text-sm">未上架</span>
        </td>
      );
    }

    const status = getStockStatus(item.stock, item.stockWarning);

    return (
      <td key={storeId} className="px-4 py-4">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-500 w-14">库存:</span>
              <input
                type="number"
                className="input-field w-20 py-1 text-sm"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-500 w-14">预警:</span>
              <input
                type="number"
                className="input-field w-20 py-1 text-sm"
                value={editWarning}
                onChange={(e) => setEditWarning(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-500 w-14">限量:</span>
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={editIsLimited}
                onChange={(e) => setEditIsLimited(e.target.checked)}
              />
              {editIsLimited && (
                <input
                  type="number"
                  className="input-field w-16 py-1 text-sm"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                />
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => saveEdit(dish.id, storeId)}
                className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                保存
              </button>
              <button
                onClick={() => setEditingKey(null)}
                className="px-2 py-1 text-xs bg-earth-100 text-earth-600 rounded hover:bg-earth-200"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className={cn('text-lg font-bold', status.color)}>{item.stock}</span>
              <button
                onClick={() => openEdit(dish, storeId)}
                className="p-1 rounded hover:bg-warm-100 text-earth-400 hover:text-primary-600 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-full h-1.5 bg-earth-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  item.stock === 0
                    ? 'bg-red-400'
                    : item.stock <= item.stockWarning
                    ? 'bg-amber-400'
                    : 'bg-green-400'
                )}
                style={{ width: `${stockPercentage(item.stock, item.isLimited, item.dailyLimit)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-earth-400">预警: {item.stockWarning}</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-medium',
                  status.bg,
                  status.color
                )}
              >
                {status.text}
              </span>
            </div>
            {item.isLimited && (
              <div className="text-xs text-primary-600">限量: {item.dailyLimit}份/天</div>
            )}
            <div className="flex items-center gap-1 text-xs">
              <span className={cn('w-1.5 h-1.5 rounded-full', item.isOnSale ? 'bg-green-500' : 'bg-earth-300')}></span>
              <span className={item.isOnSale ? 'text-green-600' : 'text-earth-400'}>
                {item.isOnSale ? '在售' : '下架'}
              </span>
            </div>
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="stat-label">总SKU数</p>
            <p className="text-2xl font-bold text-earth-800">{stats.totalSku} 个</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="stat-label">库存充足</p>
            <p className="text-2xl font-bold text-green-600">{stats.sufficient} 项</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="stat-label">库存预警</p>
            <p className="text-2xl font-bold text-amber-600">{stats.warning} 项</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="stat-label">已售罄</p>
            <p className="text-2xl font-bold text-red-600">{stats.soldOut} 项</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
            <input
              type="text"
              placeholder="搜索菜品..."
              className="input-field pl-10 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 bg-warm-50 rounded-xl p-1">
            {[
              { key: 'all', label: '全部' },
              { key: 'normal', label: '充足' },
              { key: 'low', label: '预警' },
              { key: 'out', label: '售罄' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key as typeof filterStatus)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filterStatus === item.key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-earth-500 hover:text-earth-700'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {currentStoreId !== 'all' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-earth-500">
            <Store className="w-4 h-4" />
            <span>当前门店：{getStoreById(currentStoreId)?.name || '未知门店'}</span>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {currentStoreId === 'all' ? (
            <table className="w-full min-w-max">
              <thead className="bg-warm-50">
                <tr>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700 sticky left-0 bg-warm-50 z-10">
                    菜品
                  </th>
                  <th className="text-left px-4 py-3.5 text-sm font-semibold text-earth-700 sticky left-48 bg-warm-50 z-10">
                    分类
                  </th>
                  {activeStores.map((store) => (
                    <th
                      key={store.id}
                      className="text-left px-4 py-3.5 text-sm font-semibold text-earth-700 min-w-48"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary-500" />
                        {store.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100">
                {filteredDishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-warm-50/50 transition-colors">
                    <td className="px-6 py-4 sticky left-0 bg-white z-10 group-hover:bg-warm-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-earth-100 overflow-hidden flex-shrink-0">
                          {dish.images[0] ? (
                            <img
                              src={dish.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-earth-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-earth-800">{dish.name}</p>
                          <p className="text-xs text-earth-500">{formatPrice(dish.storeItems[0]?.price || 0)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-earth-600 sticky left-48 bg-white z-10 group-hover:bg-warm-50/50">
                      {dish.category}
                    </td>
                    {activeStores.map((store) => renderStoreInventoryCell(dish, store.id))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    菜品
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    分类
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    当前库存
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    库存进度
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    预警阈值
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    每日限量
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    状态
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    上下架
                  </th>
                  <th className="text-left px-6 py-3.5 text-sm font-semibold text-earth-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100">
                {filteredDishes.map((dish) => {
                  const item = dish.storeItems.find((i) => i.storeId === currentStoreId);
                  if (!item) return null;
                  const status = getStockStatus(item.stock, item.stockWarning);
                  const isEditing = editingKey === `${dish.id}-${currentStoreId}`;

                  return (
                    <tr key={dish.id} className="hover:bg-warm-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-earth-100 overflow-hidden flex-shrink-0">
                            {dish.images[0] ? (
                              <img
                                src={dish.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-earth-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-earth-800">{dish.name}</p>
                            <p className="text-xs text-earth-500">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-earth-600">{dish.category}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="input-field w-24 py-1.5 text-sm"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span className={cn('text-lg font-bold', status.color)}>
                            {item.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 h-2 bg-earth-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              item.stock === 0
                                ? 'bg-red-400'
                                : item.stock <= item.stockWarning
                                ? 'bg-amber-400'
                                : 'bg-green-400'
                            )}
                            style={{ width: `${stockPercentage(item.stock, item.isLimited, item.dailyLimit)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-earth-600">
                        {isEditing ? (
                          <input
                            type="number"
                            className="input-field w-20 py-1.5 text-sm"
                            value={editWarning}
                            onChange={(e) => setEditWarning(e.target.value)}
                          />
                        ) : (
                          item.stockWarning
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-earth-600">
                        {item.isLimited ? (
                          isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="input-field w-20 py-1.5 text-sm"
                                value={editLimit}
                                onChange={(e) => setEditLimit(e.target.value)}
                              />
                            </div>
                          ) : (
                            <span className="text-primary-600 font-medium">
                              {item.dailyLimit} 份/天
                            </span>
                          )
                        ) : (
                          <span className="text-earth-400">不限量</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium',
                            status.bg,
                            status.color
                          )}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium',
                            item.isOnSale ? 'bg-green-50 text-green-600' : 'bg-earth-100 text-earth-500'
                          )}
                        >
                          {item.isOnSale ? '在售' : '下架'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveEdit(dish.id, currentStoreId)}
                              className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="px-3 py-1.5 text-sm bg-earth-100 text-earth-600 rounded-lg hover:bg-earth-200"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openEdit(dish, currentStoreId)}
                            className="p-1.5 rounded-lg hover:bg-warm-100 text-earth-500 hover:text-primary-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filteredDishes.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-earth-300" />
            <p className="text-earth-500">没有找到符合条件的菜品</p>
          </div>
        )}
      </div>
    </div>
  );
};
