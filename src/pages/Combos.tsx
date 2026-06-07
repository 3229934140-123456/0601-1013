import { useState } from 'react';
import { Plus, Edit3, Trash2, Sandwich, Percent, DollarSign, X, Check } from 'lucide-react';
import { useComboStore } from '@/store/comboStore';
import { useDishStore } from '@/store/dishStore';
import { useUIStore } from '@/store/uiStore';
import { cn, formatPrice } from '@/utils/format';

export const Combos = () => {
  const { combos, addCombo, updateCombo, deleteCombo, toggleOnSale } = useComboStore();
  const { dishes } = useDishStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    dishIds: [] as string[],
    image: '',
    isOnSale: false,
  });
  const [batchMode, setBatchMode] = useState(false);
  const [batchType, setBatchType] = useState<'percentage' | 'fixed'>('percentage');
  const [batchValue, setBatchValue] = useState('10');

  const openEdit = (id?: string) => {
    if (id) {
      const combo = combos.find((c) => c.id === id);
      if (combo) {
        setFormData({
          name: combo.name,
          description: combo.description,
          price: combo.price,
          originalPrice: combo.originalPrice,
          dishIds: combo.dishIds,
          image: combo.image,
          isOnSale: combo.isOnSale,
        });
        setEditingId(id);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        dishIds: [],
        image: '',
        isOnSale: false,
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateCombo(editingId, formData);
    } else {
      addCombo(formData);
    }
    setShowForm(false);
  };

  const toggleDish = (dishId: string) => {
    const newDishIds = formData.dishIds.includes(dishId)
      ? formData.dishIds.filter((id) => id !== dishId)
      : [...formData.dishIds, dishId];
    setFormData({ ...formData, dishIds: newDishIds });
  };

  const comboDishesTotal = formData.dishIds.reduce((sum, id) => {
    const dish = dishes.find((d) => d.id === id);
    return sum + (dish?.price || 0);
  }, 0);

  const handleBatchAdjust = () => {
    const value = Number(batchValue);
    if (isNaN(value) || combos.length === 0) return;
    combos.forEach((combo) => {
      let newPrice = combo.price;
      if (batchType === 'percentage') {
        newPrice = Math.round(combo.price * (1 + value / 100));
      } else {
        newPrice = Math.max(0, combo.price + value);
      }
      updateCombo(combo.id, { price: newPrice });
    });
    setBatchMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title mb-1">套餐管理</h3>
            <p className="text-sm text-earth-500">共 {combos.length} 个套餐</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBatchMode(!batchMode)}
              className={cn('btn-secondary flex items-center gap-2', batchMode && 'border-primary-400 text-primary-600')}
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
          <div className="mt-4 p-4 bg-warm-50 rounded-xl flex items-center gap-4">
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
            />
            <button onClick={handleBatchAdjust} className="btn-primary py-2 px-4">
              应用
            </button>
            <button
              onClick={() => setBatchMode(false)}
              className="p-2 hover:bg-earth-100 rounded-lg"
            >
              <X className="w-4 h-4 text-earth-500" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {combos.map((combo) => {
          const comboDishes = combo.dishIds
            .map((id) => dishes.find((d) => d.id === id))
            .filter(Boolean);
          const originalTotal = comboDishes.reduce(
            (sum, d) => sum + (d?.price || 0),
            0
          );
          const savings = originalTotal - combo.price;

          return (
            <div
              key={combo.id}
              className={cn(
                'card overflow-hidden group',
                !combo.isOnSale && 'opacity-70'
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
                {!combo.isOnSale && (
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
                      {formatPrice(combo.price)}
                    </div>
                    <div className="text-xs text-earth-400 line-through">
                      {formatPrice(combo.originalPrice)}
                    </div>
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
                    onClick={() => toggleOnSale(combo.id)}
                    className={cn(
                      'text-sm font-medium',
                      combo.isOnSale ? 'text-green-600' : 'text-earth-500'
                    )}
                  >
                    {combo.isOnSale ? '● 在售' : '○ 下架'}
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    套餐价
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    原价
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="0.00"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalPrice: Number(e.target.value),
                      })
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
                    value={formData.description}
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
                    已选 {formData.dishIds.length} 道，原价合计{' '}
                    <span className="font-semibold text-primary-600">
                      {formatPrice(comboDishesTotal)}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {dishes.map((dish) => {
                    const isSelected = formData.dishIds.includes(dish.id);
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
                              {formatPrice(dish.price)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
                <div>
                  <p className="font-medium text-earth-800">立即上架</p>
                  <p className="text-xs text-earth-500">开启后套餐将在门店展示</p>
                </div>
                <button
                  onClick={() =>
                    setFormData({ ...formData, isOnSale: !formData.isOnSale })
                  }
                  className={cn(
                    'w-12 h-7 rounded-full transition-colors relative',
                    formData.isOnSale ? 'bg-green-500' : 'bg-earth-300'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      formData.isOnSale ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  ></div>
                </button>
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
