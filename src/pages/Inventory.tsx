import { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Clock, Edit3, Search } from 'lucide-react';
import { useDishStore } from '@/store/dishStore';
import { useStoreStore } from '@/store/storeStore';
import { cn, formatPrice } from '@/utils/format';

export const Inventory = () => {
  const { dishes, updateStock, updateDish } = useDishStore();
  const { stores, getStoreNames } = useStoreStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState('');
  const [editWarning, setEditWarning] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [editIsLimited, setEditIsLimited] = useState(false);

  const filteredDishes = dishes.filter((dish) => {
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    switch (filterStatus) {
      case 'low':
        return dish.stock > 0 && dish.stock <= dish.stockWarning;
      case 'out':
        return dish.stock === 0;
      case 'normal':
        return dish.stock > dish.stockWarning;
      default:
        return true;
    }
  });

  const openEdit = (dish: typeof dishes[0]) => {
    setEditingId(dish.id);
    setEditStock(String(dish.stock));
    setEditWarning(String(dish.stockWarning));
    setEditLimit(String(dish.dailyLimit));
    setEditIsLimited(dish.isLimited);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateStock(editingId, Number(editStock));
    updateDish(editingId, {
      stockWarning: Number(editWarning),
      isLimited: editIsLimited,
      dailyLimit: Number(editLimit),
    });
    setEditingId(null);
  };

  const getStockStatus = (dish: typeof dishes[0]) => {
    if (dish.stock === 0) return { text: '已售罄', color: 'text-red-600', bg: 'bg-red-50' };
    if (dish.stock <= dish.stockWarning)
      return { text: '库存预警', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: '库存充足', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const stockPercentage = (dish: typeof dishes[0]) => {
    const max = dish.isLimited ? dish.dailyLimit : Math.max(dish.stock * 2, 100);
    return Math.min(100, (dish.stock / max) * 100);
  };

  const stats = {
    total: dishes.reduce((sum, d) => sum + d.stock, 0),
    low: dishes.filter((d) => d.stock > 0 && d.stock <= d.stockWarning).length,
    out: dishes.filter((d) => d.stock === 0).length,
    limited: dishes.filter((d) => d.isLimited).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="stat-label">总库存量</p>
            <p className="text-2xl font-bold text-earth-800">{stats.total} 份</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="stat-label">库存预警</p>
            <p className="text-2xl font-bold text-amber-600">{stats.low} 项</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="stat-label">已售罄</p>
            <p className="text-2xl font-bold text-red-600">{stats.out} 项</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="stat-label">限量菜品</p>
            <p className="text-2xl font-bold text-green-600">{stats.limited} 项</p>
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
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
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
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {filteredDishes.map((dish) => {
                const status = getStockStatus(dish);
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
                          <p className="text-xs text-earth-500">{formatPrice(dish.price)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-earth-600">{dish.category}</td>
                    <td className="px-6 py-4">
                      {editingId === dish.id ? (
                        <input
                          type="number"
                          className="input-field w-24 py-1.5 text-sm"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span
                          className={cn(
                            'text-lg font-bold',
                            status.color
                          )}
                        >
                          {dish.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 h-2 bg-earth-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            dish.stock === 0
                              ? 'bg-red-400'
                              : dish.stock <= dish.stockWarning
                              ? 'bg-amber-400'
                              : 'bg-green-400'
                          )}
                          style={{ width: `${stockPercentage(dish)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-earth-600">
                      {editingId === dish.id ? (
                        <input
                          type="number"
                          className="input-field w-20 py-1.5 text-sm"
                          value={editWarning}
                          onChange={(e) => setEditWarning(e.target.value)}
                        />
                      ) : (
                        dish.stockWarning
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-earth-600">
                      {dish.isLimited ? (
                        editingId === dish.id ? (
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
                            {dish.dailyLimit} 份/天
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
                      {editingId === dish.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-sm bg-earth-100 text-earth-600 rounded-lg hover:bg-earth-200"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openEdit(dish)}
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
