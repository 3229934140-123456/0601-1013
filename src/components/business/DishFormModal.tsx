import { useState, useEffect } from 'react';
import {
  X,
  Upload,
  X as XIcon,
  Plus,
  Minus,
  Flame,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import type { Dish } from '@/types';
import { useDishStore } from '@/store/dishStore';
import { useTagStore } from '@/store/tagStore';
import { useStoreStore } from '@/store/storeStore';
import { useUIStore } from '@/store/uiStore';
import { cn, getSpicinessText } from '@/utils/format';

const spicinessLevels = [0, 1, 2, 3, 4];
const spicinessColors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

export const DishFormModal = () => {
  const { dishModalOpen, editingDishId, closeDishModal } = useUIStore();
  const { dishes, addDish, updateDish, categories } = useDishStore();
  const { tags } = useTagStore();
  const { stores } = useStoreStore();

  const [formData, setFormData] = useState<Partial<Dish>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '招牌菜',
    images: [],
    portion: '',
    spicinessLevel: 0,
    tags: [],
    stock: 0,
    stockWarning: 10,
    isLimited: false,
    dailyLimit: 0,
    isSignature: false,
    isOnSale: false,
    storeIds: [],
  });

  useEffect(() => {
    if (editingDishId) {
      const dish = dishes.find((d) => d.id === editingDishId);
      if (dish) {
        setFormData(dish);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        category: '招牌菜',
        images: [],
        portion: '',
        spicinessLevel: 0,
        tags: [],
        stock: 0,
        stockWarning: 10,
        isLimited: false,
        dailyLimit: 0,
        isSignature: false,
        isOnSale: false,
        storeIds: [],
      });
    }
  }, [editingDishId, dishModalOpen, dishes]);

  const handleSubmit = () => {
    if (editingDishId) {
      updateDish(editingDishId, formData);
    } else {
      addDish(formData);
    }
    closeDishModal();
  };

  const handleImageUpload = () => {
    const newImages = [
      ...formData.images!,
      `https://picsum.photos/400/300?random=${Date.now()}`,
    ];
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images!.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const toggleTag = (tagId: string) => {
    const newTags = formData.tags!.includes(tagId)
      ? formData.tags!.filter((t) => t !== tagId)
      : [...formData.tags!, tagId];
    setFormData({ ...formData, tags: newTags });
  };

  const toggleStore = (storeId: string) => {
    const newStoreIds = formData.storeIds!.includes(storeId)
      ? formData.storeIds!.filter((s) => s !== storeId)
      : [...formData.storeIds!, storeId];
    setFormData({ ...formData, storeIds: newStoreIds });
  };

  const dietaryTags = tags.filter((t) => t.type === 'dietary');
  const ingredientTags = tags.filter((t) => t.type === 'ingredient');
  const otherTags = tags.filter((t) => t.type === 'other');

  if (!dishModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeDishModal}
      ></div>
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-earth-100">
          <h3 className="text-lg font-bold text-earth-800">
            {editingDishId ? '编辑菜品' : '新增菜品'}
          </h3>
          <button
            onClick={closeDishModal}
            className="p-2 rounded-xl hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5 text-earth-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <label className="block text-sm font-medium text-earth-700">
                菜品图片
              </label>
              <div className="flex flex-wrap gap-3">
                {formData.images?.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-xl overflow-hidden bg-earth-100 group"
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleImageUpload}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-earth-200 flex flex-col items-center justify-center gap-1 text-earth-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">添加图片</span>
                </button>
              </div>
              {formData.images!.length === 0 && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  建议至少上传一张菜品图片
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                菜品名称
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入菜品名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                菜品分类
              </label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                售价（元）
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
                原价（元）
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0.00"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                分量规格
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="如：约500g/份"
                value={formData.portion}
                onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                当前库存
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-earth-700 mb-1.5">
                菜品描述
              </label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="请输入菜品描述"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-earth-100">
            <h4 className="font-semibold text-earth-800 mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              辣度等级
            </h4>
            <div className="flex items-center gap-3">
              {spicinessLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, spicinessLevel: level })}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-xl border-2 transition-all text-center',
                    formData.spicinessLevel === level
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-earth-200 hover:border-earth-300'
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center"
                    style={{ backgroundColor: spicinessColors[level] }}
                  >
                    {formData.spicinessLevel === level && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-earth-700">
                    {getSpicinessText(level)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-earth-100">
            <h4 className="font-semibold text-earth-800 mb-4">口味标签</h4>
            <div className="space-y-4">
              {[
                { title: '忌口标签', tags: dietaryTags },
                { title: '食材标签', tags: ingredientTags },
                { title: '推荐标签', tags: otherTags },
              ].map((group) => (
                <div key={group.title}>
                  <p className="text-sm text-earth-500 mb-2">{group.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => {
                      const isSelected = formData.tags!.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                            isSelected
                              ? 'text-white shadow-md'
                              : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                          )}
                          style={{
                            backgroundColor: isSelected ? tag.color : undefined,
                          }}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-earth-100">
            <h4 className="font-semibold text-earth-800 mb-4">库存与限量</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-warm-50 rounded-xl">
                <span className="text-earth-700">每日限量</span>
                <button
                  onClick={() =>
                    setFormData({ ...formData, isLimited: !formData.isLimited })
                  }
                  className={cn(
                    'w-12 h-7 rounded-full transition-colors relative',
                    formData.isLimited ? 'bg-primary-500' : 'bg-earth-300'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      formData.isLimited ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  ></div>
                </button>
              </div>
              <div>
                <label className="block text-sm text-earth-600 mb-1.5">
                  库存预警阈值
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.stockWarning}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockWarning: Number(e.target.value),
                    })
                  }
                />
              </div>
              {formData.isLimited && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-earth-600 mb-1.5">
                    每日限量份数
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.dailyLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyLimit: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-earth-100">
            <h4 className="font-semibold text-earth-800 mb-4">适用门店</h4>
            <div className="flex flex-wrap gap-2">
              {stores.map((store) => {
                const isSelected = formData.storeIds!.includes(store.id);
                return (
                  <button
                    key={store.id}
                    onClick={() => toggleStore(store.id)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all border-2',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-earth-200 text-earth-600 hover:border-earth-300'
                    )}
                  >
                    {store.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-earth-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-between flex-1 p-4 bg-warm-50 rounded-xl">
                <div>
                  <p className="font-medium text-earth-800">立即上架</p>
                  <p className="text-xs text-earth-500">开启后菜品将在门店展示</p>
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
              <div className="flex items-center justify-between flex-1 p-4 bg-warm-50 rounded-xl">
                <div>
                  <p className="font-medium text-earth-800">招牌菜品</p>
                  <p className="text-xs text-earth-500">设为招牌将优先展示</p>
                </div>
                <button
                  onClick={() =>
                    setFormData({ ...formData, isSignature: !formData.isSignature })
                  }
                  className={cn(
                    'w-12 h-7 rounded-full transition-colors relative',
                    formData.isSignature ? 'bg-amber-500' : 'bg-earth-300'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                      formData.isSignature ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  ></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-earth-100">
          <button onClick={closeDishModal} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            {editingDishId ? '保存修改' : '创建菜品'}
          </button>
        </div>
      </div>
    </div>
  );
};
