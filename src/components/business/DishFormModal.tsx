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
  ChevronUp,
  ChevronDown,
  Star,
  Store,
  ArrowUpDown,
} from 'lucide-react';
import type { Dish, DishStoreItem } from '@/types';
import { useDishStore } from '@/store/dishStore';
import { useTagStore } from '@/store/tagStore';
import { useStoreStore } from '@/store/storeStore';
import { useUIStore } from '@/store/uiStore';
import { cn, getSpicinessText } from '@/utils/format';

const spicinessLevels = [0, 1, 2, 3, 4];
const spicinessColors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

const defaultStoreItem = (storeId: string): DishStoreItem => ({
  storeId,
  price: 0,
  originalPrice: 0,
  stock: 0,
  stockWarning: 10,
  isLimited: false,
  dailyLimit: 0,
  isOnSale: false,
  sortOrder: 999,
});

export const DishFormModal = () => {
  const { dishModalOpen, editingDishId, closeDishModal } = useUIStore();
  const { dishes, addDish, updateDish, categories } = useDishStore();
  const { tags } = useTagStore();
  const { stores } = useStoreStore();

  const [activeStoreTab, setActiveStoreTab] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Dish>>({
    name: '',
    description: '',
    category: '招牌菜',
    images: [],
    coverImage: '',
    portion: '',
    spicinessLevel: 0,
    tags: [],
    isSignature: false,
    storeItems: [],
  });

  const activeStores = stores.filter((s) => s.isActive);

  useEffect(() => {
    if (editingDishId) {
      const dish = dishes.find((d) => d.id === editingDishId);
      if (dish) {
        setFormData({
          name: dish.name,
          description: dish.description,
          category: dish.category,
          images: [...dish.images],
          coverImage: dish.coverImage,
          portion: dish.portion,
          spicinessLevel: dish.spicinessLevel,
          tags: [...dish.tags],
          isSignature: dish.isSignature,
          storeItems: dish.storeItems.map((item) => ({ ...item })),
        });
        if (dish.storeItems.length > 0) {
          setActiveStoreTab(dish.storeItems[0].storeId);
        } else if (activeStores.length > 0) {
          setActiveStoreTab(activeStores[0].id);
        }
      }
    } else {
      setFormData({
        name: '',
        description: '',
        category: '招牌菜',
        images: [],
        coverImage: '',
        portion: '',
        spicinessLevel: 0,
        tags: [],
        isSignature: false,
        storeItems: [],
      });
      if (activeStores.length > 0) {
        setActiveStoreTab(activeStores[0].id);
      }
    }
  }, [editingDishId, dishModalOpen, dishes, activeStores]);

  const getStoreItem = (storeId: string): DishStoreItem | undefined => {
    return formData.storeItems?.find((item) => item.storeId === storeId);
  };

  const updateStoreItem = (storeId: string, updates: Partial<DishStoreItem>) => {
    const currentItems = formData.storeItems || [];
    const existingItem = currentItems.find((item) => item.storeId === storeId);
    
    let newStoreItems: DishStoreItem[];
    if (existingItem) {
      newStoreItems = currentItems.map((item) =>
        item.storeId === storeId ? { ...item, ...updates } : item
      );
    } else {
      newStoreItems = [...currentItems, { ...defaultStoreItem(storeId), ...updates }];
    }
    
    setFormData({ ...formData, storeItems: newStoreItems });
  };

  const removeStoreItem = (storeId: string) => {
    const newStoreItems = (formData.storeItems || []).filter(
      (item) => item.storeId !== storeId
    );
    setFormData({ ...formData, storeItems: newStoreItems });
    
    if (activeStoreTab === storeId) {
      const remaining = newStoreItems.length > 0 
        ? newStoreItems[0].storeId 
        : activeStores.find((s) => s.id !== storeId)?.id || '';
      setActiveStoreTab(remaining);
    }
  };

  const handleSubmit = () => {
    if (editingDishId) {
      updateDish(editingDishId, formData);
    } else {
      addDish(formData as Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>);
    }
    closeDishModal();
  };

  const handleImageUpload = () => {
    const newImage = `https://picsum.photos/400/300?random=${Date.now()}`;
    const newImages = [...(formData.images || []), newImage];
    const newCoverImage = formData.coverImage || newImage;
    setFormData({ ...formData, images: newImages, coverImage: newCoverImage });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images!.filter((_, i) => i !== index);
    const removedImage = formData.images![index];
    let newCoverImage = formData.coverImage;
    if (formData.coverImage === removedImage) {
      newCoverImage = newImages[0] || '';
    }
    setFormData({ ...formData, images: newImages, coverImage: newCoverImage });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formData.images!];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newImages.length) return;
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    const currentCover = formData.coverImage;
    const coverIndex = newImages.findIndex((img) => img === currentCover);
    let newCoverImage = currentCover;
    if (coverIndex === -1 && newImages.length > 0) {
      newCoverImage = newImages[0];
    }
    
    setFormData({ ...formData, images: newImages, coverImage: newCoverImage });
  };

  const setAsCover = (imageUrl: string) => {
    setFormData({ ...formData, coverImage: imageUrl });
  };

  const toggleTag = (tagId: string) => {
    const newTags = formData.tags!.includes(tagId)
      ? formData.tags!.filter((t) => t !== tagId)
      : [...formData.tags!, tagId];
    setFormData({ ...formData, tags: newTags });
  };

  const dietaryTags = tags.filter((t) => t.type === 'dietary');
  const ingredientTags = tags.filter((t) => t.type === 'ingredient');
  const otherTags = tags.filter((t) => t.type === 'other');

  const currentStoreItem = activeStoreTab ? getStoreItem(activeStoreTab) : undefined;
  const selectedStoreCount = formData.storeItems?.length || 0;

  if (!dishModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeDishModal}
      ></div>
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
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
          <div className="space-y-4">
            <label className="block text-sm font-medium text-earth-700">
              菜品图片
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {formData.images?.map((img, index) => {
                const isCover = img === formData.coverImage;
                return (
                  <div
                    key={index}
                    className={cn(
                      'relative aspect-square rounded-xl overflow-hidden bg-earth-100 group',
                      isCover && 'ring-2 ring-primary-500 ring-offset-2'
                    )}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {isCover && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        封面
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                        className={cn(
                          'p-1.5 rounded-lg bg-white/90 text-earth-700 hover:bg-white transition-colors',
                          index === 0 && 'opacity-50 cursor-not-allowed'
                        )}
                        title="上移"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === (formData.images?.length || 0) - 1}
                        className={cn(
                          'p-1.5 rounded-lg bg-white/90 text-earth-700 hover:bg-white transition-colors',
                          index === (formData.images?.length || 0) - 1 && 'opacity-50 cursor-not-allowed'
                        )}
                        title="下移"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="删除图片"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                    {!isCover && (
                      <button
                        onClick={() => setAsCover(img)}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/90 hover:bg-white text-earth-700 text-xs font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md whitespace-nowrap"
                      >
                        设为封面
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={handleImageUpload}
                className="aspect-square rounded-xl border-2 border-dashed border-earth-200 flex flex-col items-center justify-center gap-1 text-earth-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50/50 transition-all"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs">添加图片</span>
              </button>
            </div>
            {(!formData.coverImage || formData.images!.length === 0) && (
              <p className="text-xs text-orange-500 flex items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg">
                <ImageIcon className="w-4 h-4" />
                {formData.images!.length === 0 
                  ? '请上传至少一张菜品图片，并设置封面图'
                  : '请设置一张封面图'
                }
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="flex items-end">
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
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-earth-800 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary-500" />
                门店配置
                <span className="text-xs font-normal text-earth-500 bg-earth-100 px-2 py-0.5 rounded-full">
                  已选 {selectedStoreCount} 个门店
                </span>
              </h4>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {activeStores.map((store) => {
                const isSelected = formData.storeItems?.some(
                  (item) => item.storeId === store.id
                );
                const isActive = activeStoreTab === store.id;
                return (
                  <button
                    key={store.id}
                    onClick={() => setActiveStoreTab(store.id)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 relative',
                      isActive
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : isSelected
                        ? 'border-earth-200 bg-white text-earth-600 hover:border-primary-300'
                        : 'border-earth-200 bg-earth-50 text-earth-400 hover:border-earth-300'
                    )}
                  >
                    {store.name}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeStoreTab && currentStoreItem && (
              <div className="bg-warm-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {activeStores.find((s) => s.id === activeStoreTab)?.name?.charAt(0) || '门'}
                    </div>
                    <div>
                      <p className="font-semibold text-earth-800">
                        {activeStores.find((s) => s.id === activeStoreTab)?.name}
                      </p>
                      <p className="text-xs text-earth-500">门店独立配置</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStoreItem(activeStoreTab)}
                    className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    移除门店
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-earth-600 mb-1.5">
                      售价（元）
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0.00"
                      value={currentStoreItem.price}
                      onChange={(e) =>
                        updateStoreItem(activeStoreTab, {
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-earth-600 mb-1.5">
                      原价（元）
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0.00"
                      value={currentStoreItem.originalPrice}
                      onChange={(e) =>
                        updateStoreItem(activeStoreTab, {
                          originalPrice: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-earth-600 mb-1.5">
                      当前库存
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      value={currentStoreItem.stock}
                      onChange={(e) =>
                        updateStoreItem(activeStoreTab, {
                          stock: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-earth-600 mb-1.5">
                      库存预警阈值
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={currentStoreItem.stockWarning}
                      onChange={(e) =>
                        updateStoreItem(activeStoreTab, {
                          stockWarning: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-earth-600 mb-1.5 flex items-center gap-1">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      排序权重
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={currentStoreItem.sortOrder}
                      onChange={(e) =>
                        updateStoreItem(activeStoreTab, {
                          sortOrder: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                  <div>
                    <p className="font-medium text-earth-800">每日限量</p>
                    <p className="text-xs text-earth-500">开启后设置每日可售份数</p>
                  </div>
                  <button
                    onClick={() =>
                      updateStoreItem(activeStoreTab, {
                        isLimited: !currentStoreItem.isLimited,
                      })
                    }
                    className={cn(
                      'w-12 h-7 rounded-full transition-colors relative',
                      currentStoreItem.isLimited ? 'bg-primary-500' : 'bg-earth-300'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                        currentStoreItem.isLimited
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      )}
                    ></div>
                  </button>
                </div>

                {currentStoreItem.isLimited && (
                  <div>
                    <label className="block text-sm text-earth-600 mb-1.5">
                      每日限量份数
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={currentStoreItem.dailyLimit}
                      onChange={(e) =>
                        updateStoreItem(activeStoreTab, {
                          dailyLimit: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                  <div>
                    <p className="font-medium text-earth-800">立即上架</p>
                    <p className="text-xs text-earth-500">开启后菜品将在该门店展示</p>
                  </div>
                  <button
                    onClick={() =>
                      updateStoreItem(activeStoreTab, {
                        isOnSale: !currentStoreItem.isOnSale,
                      })
                    }
                    className={cn(
                      'w-12 h-7 rounded-full transition-colors relative',
                      currentStoreItem.isOnSale ? 'bg-green-500' : 'bg-earth-300'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                        currentStoreItem.isOnSale
                          ? 'translate-x-5'
                          : 'translate-x-0.5'
                      )}
                    ></div>
                  </button>
                </div>
              </div>
            )}

            {activeStoreTab && !currentStoreItem && (
              <div className="bg-earth-50 rounded-2xl p-8 text-center">
                <Store className="w-12 h-12 text-earth-300 mx-auto mb-3" />
                <p className="text-earth-500 mb-4">
                  {activeStores.find((s) => s.id === activeStoreTab)?.name} 暂未配置
                </p>
                <button
                  onClick={() => {
                    updateStoreItem(activeStoreTab, defaultStoreItem(activeStoreTab));
                  }}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  添加该门店
                </button>
              </div>
            )}
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
