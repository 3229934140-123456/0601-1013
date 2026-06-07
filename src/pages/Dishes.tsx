import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ImageOff,
  AlertCircle,
  Package,
  Download,
  TrendingUp,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useDishStore } from '@/store/dishStore';
import { useUIStore } from '@/store/uiStore';
import { useStoreStore } from '@/store/storeStore';
import { useActivityStore } from '@/store/activityStore';
import { DishCard } from '@/components/business/DishCard';
import { DishFormModal } from '@/components/business/DishFormModal';
import { cn, formatPrice } from '@/utils/format';
import { exportDishDetails } from '@/utils/export';

export const Dishes = () => {
  const {
    getFilteredDishes,
    searchKeyword,
    setSearchKeyword,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
    selectedDishIds,
    toggleDishSelection,
    clearSelections,
    batchAdjustPrice,
    batchToggleOnSale,
    getMissingImageCount,
    getMissingPriceCount,
    getOnSaleCount,
    getDishStoreItem,
    dishes,
  } = useDishStore();
  const { openDishModal, currentStoreId } = useUIStore();
  const { stores } = useStoreStore();
  const { activities } = useActivityStore();

  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [batchPriceType, setBatchPriceType] = useState<'percentage' | 'fixed'>('percentage');
  const [batchPriceValue, setBatchPriceValue] = useState('10');

  const filteredDishes = getFilteredDishes(currentStoreId);
  const missingImageCount = getMissingImageCount();
  const missingPriceCount = getMissingPriceCount(currentStoreId);
  const onSaleCount = getOnSaleCount(currentStoreId);

  const allCategories = ['全部', ...categories];

  const isAllStores = currentStoreId === 'all';

  const lowStockDishes = filteredDishes.filter((dish) => {
    const storeItem = getDishStoreItem(dish, currentStoreId);
    if (!storeItem) return false;
    return storeItem.stock <= storeItem.stockWarning && storeItem.isOnSale;
  });

  const handleBatchAdjust = () => {
    if (isAllStores) return;
    const value = Number(batchPriceValue);
    if (isNaN(value)) return;
    batchAdjustPrice(batchPriceType === 'percentage' ? 'percent' : 'fixed', value, currentStoreId);
    setShowBatchPanel(false);
  };

  const handleSelectAll = () => {
    if (selectedDishIds.length === filteredDishes.length) {
      clearSelections();
    } else {
      useDishStore.setState({ selectedDishIds: filteredDishes.map((d) => d.id) });
    }
  };

  const handleBatchToggleOnSale = (isOnSale: boolean) => {
    if (isAllStores) return;
    batchToggleOnSale(isOnSale, currentStoreId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="stat-label">菜品总数</p>
            <p className="text-2xl font-bold text-earth-800">{dishes.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="stat-label">缺少图片</p>
            <p className="text-2xl font-bold text-red-600">{missingImageCount}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="stat-label">缺少价格</p>
            <p className="text-2xl font-bold text-amber-600">{missingPriceCount}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="stat-label">在售菜品</p>
            <p className="text-2xl font-bold text-green-600">{onSaleCount}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
              <input
                type="text"
                placeholder="搜索菜品名称..."
                className="input-field pl-10 py-2 w-64"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 bg-warm-50 rounded-xl p-1">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    selectedCategory === cat
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-earth-500 hover:text-earth-700'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowBatchPanel(!showBatchPanel)}
                className={cn(
                  'btn-secondary flex items-center gap-2',
                  selectedDishIds.length > 0 && 'border-primary-400 text-primary-600',
                  isAllStores && 'opacity-50 cursor-not-allowed'
                )}
                disabled={isAllStores}
              >
                <Filter className="w-4 h-4" />
                批量操作
                {selectedDishIds.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                    {selectedDishIds.length}
                  </span>
                )}
              </button>

              {showBatchPanel && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-earth-100 p-4 z-20 animate-slide-up">
                  <h4 className="font-semibold text-earth-800 mb-3">批量操作</h4>

                  {isAllStores && (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        请先选择具体门店后再进行批量操作
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-earth-600 mb-2">批量调价</p>
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setBatchPriceType('percentage')}
                          className={cn(
                            'flex-1 py-1.5 text-sm rounded-lg border-2 transition-colors',
                            batchPriceType === 'percentage'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-earth-200 text-earth-600'
                          )}
                        >
                          按百分比
                        </button>
                        <button
                          onClick={() => setBatchPriceType('fixed')}
                          className={cn(
                            'flex-1 py-1.5 text-sm rounded-lg border-2 transition-colors',
                            batchPriceType === 'fixed'
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-earth-200 text-earth-600'
                          )}
                        >
                          固定金额
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          className="input-field flex-1 py-2"
                          placeholder={batchPriceType === 'percentage' ? '如：10 表示涨价10%' : '如：5 表示涨价5元'}
                          value={batchPriceValue}
                          onChange={(e) => setBatchPriceValue(e.target.value)}
                          disabled={isAllStores}
                        />
                        <button
                          onClick={handleBatchAdjust}
                          className="btn-primary py-2 px-4"
                          disabled={selectedDishIds.length === 0 || isAllStores}
                        >
                          应用
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBatchToggleOnSale(true)}
                        className="flex-1 py-2 text-sm bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                        disabled={selectedDishIds.length === 0 || isAllStores}
                      >
                        批量上架
                      </button>
                      <button
                        onClick={() => handleBatchToggleOnSale(false)}
                        className="flex-1 py-2 text-sm bg-earth-50 text-earth-600 rounded-xl hover:bg-earth-100 transition-colors"
                        disabled={selectedDishIds.length === 0 || isAllStores}
                      >
                        批量下架
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-earth-100">
                    <button
                      onClick={clearSelections}
                      className="text-sm text-earth-500 hover:text-earth-700"
                      disabled={isAllStores}
                    >
                      清空选择
                    </button>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-primary-600 hover:text-primary-700"
                      disabled={isAllStores}
                    >
                      全选当前
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button className="btn-secondary flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                排序
              </button>
            </div>

            <select
              className="input-field py-2 w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">默认排序</option>
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
              <option value="views">浏览量最高</option>
              <option value="newest">最新创建</option>
            </select>

            <button
              onClick={() => exportDishDetails({
                storeId: currentStoreId,
                stores,
                dishes,
                activities,
              })}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出
            </button>

            <button onClick={() => openDishModal()} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新增菜品
            </button>
          </div>
        </div>
      </div>

      {lowStockDishes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
            <AlertCircle className="w-5 h-5" />
            库存预警（{lowStockDishes.length} 项）
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockDishes.map((dish) => {
              const storeItem = getDishStoreItem(dish, currentStoreId);
              return (
                <span
                  key={dish.id}
                  className="px-3 py-1 bg-white border border-red-200 rounded-full text-sm text-red-600"
                >
                  {dish.name} - 仅剩 {storeItem?.stock || 0} 份
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-earth-500">
          共 {filteredDishes.length} 道菜品
          {selectedDishIds.length > 0 && `，已选择 ${selectedDishIds.length} 道`}
        </p>
        {selectedDishIds.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            {selectedDishIds.length === filteredDishes.length ? (
              <>
                <CheckSquare className="w-4 h-4" />
                取消全选
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                全选当前
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredDishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            selected={selectedDishIds.includes(dish.id)}
            onSelect={() => !isAllStores && toggleDishSelection(dish.id)}
          />
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-earth-100 flex items-center justify-center">
            <Package className="w-10 h-10 text-earth-400" />
          </div>
          <p className="text-earth-500 mb-2">暂无符合条件的菜品</p>
          <button onClick={() => openDishModal()} className="btn-primary">
            新增菜品
          </button>
        </div>
      )}

      <DishFormModal />
    </div>
  );
};
