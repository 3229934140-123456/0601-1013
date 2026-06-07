import { useState } from 'react';
import { Plus, Edit3, Trash2, Sandwich, Percent, X, Check, AlertCircle, Store } from 'lucide-react';
import { useComboStore } from '@/store/comboStore';
import { useDishStore } from '@/store/dishStore';
import { useStoreStore } from '@/store/storeStore';
import { useUIStore } from '@/store/uiStore';
import { cn, formatPrice } from '@/utils/format';
import type { Combo, ComboStoreItem } from '@/types';

export const Combos = () => {
  const {
    getFilteredCombos,
    getComboPrice,
    getComboOnSale,
    getOnSaleComboCount,
    getComboStoreItem,
    batchAdjustPrice,
    updateComboStoreItem,
    addCombo,
    updateCombo,
    deleteCombo,
    combos,
  } = useComboStore();
  const { dishes, getDishPrice } = useDishStore();
  const { stores } = useStoreStore();
  const { currentStoreId } = useUIStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Combo>>({
    name: '',
    description: '',
    dishIds: [],
    image: '',
    storeItems: [],
  });
  const [batchMode, setBatchMode] = useState(false);
  const [batchType, setBatchType] = useState<'percentage' | 'fixed'>('percentage');
  const [batchValue, setBatchValue] = useState('10');

  const isAllStores = currentStoreId === 'all';
  const filteredCombos = getFilteredCombos(currentStoreId);
  const onSaleCount = getOnSaleComboCount(currentStoreId);

  const openEdit = (id?: string) => {
    if (id) {
      const combo = combos.find((c) => c.id === id);
      if (combo) {
        setFormData({
          name: combo.name,
          description: combo.description,
          dishIds: combo.dishIds,
          image: combo.image,
          storeItems: [...combo.storeItems],
        });
        setEditingId(id);
      }
    } else {
      const defaultStoreItems: ComboStoreItem[] = stores.map((store) => ({
        storeId: store.id,
        price: 0,
        originalPrice: 0,
        isOnSale: false,
        sortOrder: 999,
      }));
      setFormData({
        name: '',
        description: '',
        dishIds: [],
        image: '',
        storeItems: defaultStoreItems,
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateCombo(editingId, formData);
    } else {
      addCombo(formData as Omit<Combo, 'id' | 'createdAt'>);
    }
    setShowForm(false);
  };

  const toggleDish = (dishId: string) => {
    const newDishIds = formData.dishIds!.includes(dishId)
      ? formData.dishIds!.filter((id) => id !== dishId)
      : [...formData.dishIds!, dishId];
    setFormData({ ...formData, dishIds: newDishIds });
  };

  const comboDishesTotal = formData.dishIds!.reduce((sum, id) => {
    const dish = dishes.find((d) => d.id === id);
    return sum + (dish ? getDishPrice(dish, currentStoreId) : 0);
  }, 0);

  const handleBatchAdjust = () => {
    if (isAllStores) return;
    const value = Number(batchValue);
    if (isNaN(value) || filteredCombos.length === 0) return;
    const ids = filteredCombos.map((c) => c.id);
    batchAdjustPrice(batchType === 'percentage' ? 'percent' : 'fixed', value, currentStoreId, ids);
    setBatchMode(false);
  };

  const handleToggleOnSale = (comboId: string) => {
    if (isAllStores) return;
    const combo = combos.find((c) => c.id === comboId);
    if (!combo) return;
    const currentOnSale = getComboOnSale(combo, currentStoreId);
    updateComboStoreItem(comboId, currentStoreId, { isOnSale: !currentOnSale });
  };

  const updateStoreItem = (storeId: string, updates: Partial<ComboStoreItem>) => {
    const newStoreItems = formData.storeItems!.map((item) =>
      item.storeId === storeId ? { ...item, ...updates } : item
    );
    setFormData({ ...formData, storeItems: newStoreItems });
  };

  const getStoreItem = (storeId: string) => {
    return formData.storeItems!.find((item) => item.storeId === storeId);
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title mb-1">套餐管理</h3>
            <p className="text-sm text-earth-500">
              共 {filteredCombos.length} 个套餐，在售 {onSaleCount} 个
              {isAllStores && <span className="ml-2 text-amber-600">（全部门店视图）</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBatchMode(!batchMode)}
              className={cn(
                'btn-secondary flex items-center gap-2',
                batchMode && 'border-primary-400 text-primary-600',
                isAllStores && 'opacity-50 cursor-not-allowed'
              )}
              disabled={isAllStores}
            >
              <Percent className="w-4 h-4" />
              批量调价
            </button>
            <button
              onClick={() => openEdit()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建套餐
            </button>
          </div>
        </div>

        {batchMode && (
          <div className="mt-4 p-4 bg-warm-50 rounded-xl">
            {isAllStores && (
              <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">
                  请先选择具体门店后再进行批量调价
                </p>
              </div>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-earth-700">批量调整所有套餐价格</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBatchType('percentage')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border-2 transition-colors',
                    batchType === 'percentage'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-earth-200 text-earth-600'
                  )}
                >
                  百分比
                </button>
                <button
                  onClick={() => setBatchType('fixed')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border-2 transition-colors',
                    batchType === 'fixed'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-earth-200 text-earth-600'
                  )}
                >
                  固定金额
                </button>
              </div>
              <input
                type="number"
                className="input-field w-32 py-2"
                placeholder={batchType === 'percentage' ? '如：10 表示涨10%' : '如：5 表示涨5元'}
                value={batchValue}
                onChange={(e) => setBatchValue(e.target.value)}
                disabled={isAllStores}
              />
              <button
                onClick={handleBatchAdjust}
                className="btn-primary py-2 px-4"
                disabled={isAllStores}
              >
                应用
              </button>
              <button
                onClick={() => setBatchMode(false)}
                className="p-2 hover:bg-earth-100 rounded-lg"
              >
                <X className="w-4 h-4 text-earth-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCombos.map((combo) => {
          const comboDishes = combo.dishIds
            .map((id) => dishes.find((d) => d.id === id))
            .filter(Boolean);
          const price = getComboPrice(combo, currentStoreId);
          const storeItem = getComboStoreItem(combo, currentStoreId);
          const originalPrice = storeItem?.originalPrice || 0;
          const isOnSale = getComboOnSale(combo, currentStoreId);
          const originalTotal = comboDishes.reduce(
            (sum, d) => sum + (d ? getDishPrice(d, currentStoreId) : 0),
            0
          );
          const savings = originalTotal - price;

          return (
            <div
              key={combo.id}
              className={cn(
                'card overflow-hidden group',
                !isOnSale && 'opacity-70'
              )}
            >
              <div className="aspect-[16/9] bg-earth-100 relative overflow-hidden">
                {combo.image ? (
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-earth-400 gap-2">
                    <Sandwich className="w-12 h-12" />
                    <span className="text-sm">套餐图片</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded-lg">
                  省 ¥{savings}
                </div>
                {!isOnSale && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-earth-700 text-white text-sm font-medium rounded-full">
                      已下架
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-earth-800 text-lg">{combo.name}</h3>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary-600">
                      {formatPrice(price)}
                    </div>
                    {originalPrice > 0 && (
                      <div className="text-xs text-earth-400 line-through">
                        {formatPrice(originalPrice)}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-earth-500 mb-4 line-clamp-2">
                  {combo.description}
                </p>

                <div className="mb-4">
                  <p className="text-xs text-earth-500 mb-2">包含菜品：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comboDishes.slice(0, 4).map((dish) =>
                      dish ? (
                        <span
                          key={dish.id}
                          className="px-2 py-0.5 bg-warm-100 text-earth-600 text-xs rounded-full"
                        >
                          {dish.name}
                        </span>
                      ) : null
                    )}
                    {comboDishes.length > 4 && (
                      <span className="px-2 py-0.5 bg-earth-100 text-earth-500 text-xs rounded-full">
                        +{comboDishes.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-earth-100">
                  <button
                    onClick={() => handleToggleOnSale(combo.id)}
                    className={cn(
                      'text-sm font-medium',
                      isOnSale ? 'text-green-600' : 'text-earth-500',
                      isAllStores && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={isAllStores}
                  >
                    {isOnSale ? '● 在售' : '○ 下架'}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(combo.id)}
                      className="p-1.5 rounded-lg hover:bg-warm-100 text-earth-500 hover:text-primary-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCombo(combo.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-earth-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          ></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-earth-100">
              <h3 className="text-lg font-bold text-earth-800">
                {editingId ? '编辑套餐' : '新建套餐'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl hover:bg-warm-100"
              >
                <X className="w-5 h-5 text-earth-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    套餐名称
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="请输入套餐名称"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    套餐描述
                  </label>
                  <textarea
                    className="input-field min-h-[80px] resize-none"
                    placeholder="请输入套餐描述"
                    value={formData.description || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-earth-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-earth-800">选择菜品</h4>
                  <span className="text-sm text-earth-500">
                    已选 {formData.dishIds!.length} 道，原价合计{' '}
                    <span className="font-semibold text-primary-600">
                      {formatPrice(comboDishesTotal)}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {dishes.map((dish) => {
                    const isSelected = formData.dishIds!.includes(dish.id);
                    const dishPrice = getDishPrice(dish, currentStoreId);
                    return (
                      <button
                        key={dish.id}
                        onClick={() => toggleDish(dish.id)}
                        className={cn(
                          'p-3 rounded-xl border-2 text-left transition-all',
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-earth-200 hover:border-earth-300'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                              isSelected
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-earth-300'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-earth-800 truncate">
                              {dish.name}
                            </p>
                            <p className="text-xs text-primary-600">
                              {formatPrice(dishPrice)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-earth-100">
                <h4 className="font-semibold text-earth-800 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary-500" />
                  门店价格与上架设置
                </h4>
                <div className="space-y-3">
                  {stores.map((store) => {
                    const storeItem = getStoreItem(store.id);
                    if (!storeItem) return null;
                    return (
                      <div
                        key={store.id}
                        className="p-4 bg-warm-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-earth-800">{store.name}</span>
                          <button
                            onClick={() =>
                              updateStoreItem(store.id, { isOnSale: !storeItem.isOnSale })
                            }
                            className={cn(
                              'w-12 h-7 rounded-full transition-colors relative',
                              storeItem.isOnSale ? 'bg-green-500' : 'bg-earth-300'
                            )}
                          >
                            <div
                              className={cn(
                                'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                                storeItem.isOnSale ? 'translate-x-5' : 'translate-x-0.5'
                              )}
                            ></div>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-earth-500 mb-1">
                              套餐价（元）
                            </label>
                            <input
                              type="number"
                              className="input-field py-2 text-sm"
                              placeholder="0.00"
                              value={storeItem.price}
                              onChange={(e) =>
                                updateStoreItem(store.id, { price: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-earth-500 mb-1">
                              原价（元）
                            </label>
                            <input
                              type="number"
                              className="input-field py-2 text-sm"
                              placeholder="0.00"
                              value={storeItem.originalPrice}
                              onChange={(e) =>
                                updateStoreItem(store.id, { originalPrice: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-earth-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                {editingId ? '保存修改' : '创建套餐'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
