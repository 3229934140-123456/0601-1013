import { useState, useMemo } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  CheckCircle,
  Clock,
  Eye,
  ChevronRight,
  Signal,
  Wifi,
  Battery,
  Crown,
  Flame,
  Heart,
  Star,
  Package,
  AlertTriangle,
  X,
  Store,
  ImageOff,
  Tag,
  Zap,
  FileText,
  Utensils,
  Building2,
} from 'lucide-react';
import { useDishStore } from '@/store/dishStore';
import { useComboStore } from '@/store/comboStore';
import { useUIStore } from '@/store/uiStore';
import { useStoreStore } from '@/store/storeStore';
import { useActivityStore } from '@/store/activityStore';
import { exportMenuToCSV, exportComboDetails, exportDishDetails } from '@/utils/export';
import { cn, formatPrice } from '@/utils/format';
import type { Dish } from '@/types';

export const Preview = () => {
  const { dishes, getMissingImageCount, getMissingPriceCount, getSoldOutOnSaleCount, getDishPrice, getDishOnSale, getDishStoreItem, getFilteredDishes } = useDishStore();
  const { combos, getOnSaleComboCount, getComboOnSale, getComboPrice, getFilteredCombos, getComboStoreItem } = useComboStore();
  const { currentStoreId } = useUIStore();
  const { stores, getStoreById } = useStoreStore();
  const { activities, getActiveActivities } = useActivityStore();

  const [activeTab, setActiveTab] = useState<'dishes' | 'combos'>('dishes');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('published');
  const [lastPublishTime, setLastPublishTime] = useState('2026-01-15 14:30');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeCheckItem, setActiveCheckItem] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'menu' | 'dish' | 'combo'>('menu');
  const [exportScope, setExportScope] = useState<'all' | 'current'>('current');

  const missingImageCount = getMissingImageCount();
  const missingPriceCount = getMissingPriceCount(currentStoreId);
  const soldOutCount = getSoldOutOnSaleCount(currentStoreId);
  const onSaleComboCount = getOnSaleComboCount(currentStoreId);
  const activeActivities = getActiveActivities();

  const filteredDishes = useMemo(() => {
    const filtered = getFilteredDishes(currentStoreId);
    if (activeCategory === '全部') {
      return filtered.filter((d) => getDishOnSale(d, currentStoreId));
    }
    return filtered.filter((d) => d.category === activeCategory && getDishOnSale(d, currentStoreId));
  }, [getFilteredDishes, getDishOnSale, activeCategory, currentStoreId]);

  const onSaleCombos = useMemo(() => {
    return getFilteredCombos(currentStoreId).filter((c) => getComboOnSale(c, currentStoreId));
  }, [getFilteredCombos, getComboOnSale, currentStoreId]);

  const categories = useMemo(() => {
    const storeDishes = getFilteredDishes(currentStoreId);
    const cats = [...new Set(storeDishes.map((d) => d.category))];
    return ['全部', ...cats];
  }, [getFilteredDishes, currentStoreId]);

  const signatureDishes = filteredDishes.filter((d) => d.isSignature);
  const regularDishes = filteredDishes.filter((d) => !d.isSignature);

  const missingImageDishes = useMemo(() => {
    return dishes.filter((d) => !d.coverImage || d.images.length === 0);
  }, [dishes]);

  const missingPriceDishes = useMemo(() => {
    const result: { dish: Dish; storeId: string; storeName: string }[] = [];
    for (const dish of dishes) {
      if (currentStoreId === 'all') {
        for (const item of dish.storeItems) {
          if (item.price <= 0) {
            const store = getStoreById(item.storeId);
            result.push({ dish, storeId: item.storeId, storeName: store?.name || item.storeId });
          }
        }
      } else {
        const item = dish.storeItems.find((i) => i.storeId === currentStoreId);
        if (item && item.price <= 0) {
          const store = getStoreById(currentStoreId);
          result.push({ dish, storeId: currentStoreId, storeName: store?.name || currentStoreId });
        }
      }
    }
    return result;
  }, [dishes, currentStoreId, getStoreById]);

  const soldOutDishes = useMemo(() => {
    const result: { dish: Dish; storeId: string; storeName: string }[] = [];
    for (const dish of dishes) {
      if (currentStoreId === 'all') {
        for (const item of dish.storeItems) {
          if (item.isOnSale && item.stock <= 0) {
            const store = getStoreById(item.storeId);
            result.push({ dish, storeId: item.storeId, storeName: store?.name || item.storeId });
          }
        }
      } else {
        const item = dish.storeItems.find((i) => i.storeId === currentStoreId);
        if (item && item.isOnSale && item.stock <= 0) {
          const store = getStoreById(currentStoreId);
          result.push({ dish, storeId: currentStoreId, storeName: store?.name || currentStoreId });
        }
      }
    }
    return result;
  }, [dishes, currentStoreId, getStoreById]);

  const totalIssues = missingImageCount + missingPriceCount + soldOutCount;

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleConfirmExport = () => {
    const storeId = exportScope === 'all' ? 'all' : currentStoreId;
    const activeActivities = getActiveActivities();

    switch (exportType) {
      case 'menu':
        exportMenuToCSV({
          storeId,
          stores,
          dishes,
          combos,
          activities: activeActivities,
          expandCombos: true,
        });
        break;
      case 'dish':
        exportDishDetails({
          storeId,
          stores,
          dishes,
          activities: activeActivities,
        });
        break;
      case 'combo':
        exportComboDetails({
          storeId,
          stores,
          dishes,
          combos,
        });
        break;
    }

    setShowExportModal(false);
  };

  const handleCancelExport = () => {
    setShowExportModal(false);
  };

  const handlePublishClick = () => {
    setShowConfirmModal(true);
  };

  const handleCancelPublish = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmPublish = () => {
    setShowConfirmModal(false);
    setPublishStatus('published');
    setLastPublishTime(
      new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const getDishCoverImage = (dish: Dish) => {
    return dish.coverImage || dish.images[0] || '';
  };

  const currentStoreName = currentStoreId === 'all' ? '全部门店' : getStoreById(currentStoreId)?.name || '未知门店';

  const checkItems = [
    { key: 'missingImages', label: '所有菜品都有图片', count: missingImageCount, icon: ImageOff, color: 'amber' },
    { key: 'missingPrices', label: '所有菜品都设置了价格', count: missingPriceCount, icon: Tag, color: 'amber' },
    { key: 'soldOut', label: '在售菜品无售罄', count: soldOutCount, icon: Package, color: 'amber' },
    { key: 'combos', label: '在售套餐数量正常', count: onSaleComboCount, icon: Crown, color: 'green', isPositive: true },
    { key: 'activities', label: '进行中活动', count: activeActivities.length, icon: Zap, color: 'green', isPositive: true },
  ];

  const handleCheckItemClick = (key: string) => {
    if (activeCheckItem === key) {
      setActiveCheckItem(null);
    } else {
      setActiveCheckItem(key);
    }
  };

  const renderCheckDetail = () => {
    if (!activeCheckItem) return null;

    switch (activeCheckItem) {
      case 'missingImages':
        if (missingImageDishes.length === 0) return <p className="text-sm text-earth-500 p-3">无缺图菜品</p>;
        return (
          <div className="border-t border-earth-100 p-3 space-y-2 max-h-48 overflow-y-auto">
            {missingImageDishes.map((dish) => (
              <div key={dish.id} className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-earth-400" />
                <span className="text-earth-700">{dish.name}</span>
              </div>
            ))}
          </div>
        );
      case 'missingPrices':
        if (missingPriceDishes.length === 0) return <p className="text-sm text-earth-500 p-3">无缺价菜品</p>;
        return (
          <div className="border-t border-earth-100 p-3 space-y-2 max-h-48 overflow-y-auto">
            {missingPriceDishes.map((item, idx) => (
              <div key={`${item.dish.id}-${item.storeId}-${idx}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-earth-400" />
                  <span className="text-earth-700">{item.dish.name}</span>
                </div>
                <span className="text-xs text-earth-500">{item.storeName}</span>
              </div>
            ))}
          </div>
        );
      case 'soldOut':
        if (soldOutDishes.length === 0) return <p className="text-sm text-earth-500 p-3">无在售售罄菜品</p>;
        return (
          <div className="border-t border-earth-100 p-3 space-y-2 max-h-48 overflow-y-auto">
            {soldOutDishes.map((item, idx) => (
              <div key={`${item.dish.id}-${item.storeId}-${idx}`} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-earth-700">{item.dish.name}</span>
                </div>
                <span className="text-xs text-earth-500">{item.storeName}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 relative">
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">发布成功！</span>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-5 border-b border-earth-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-earth-800">导出菜单</h3>
                <p className="text-sm text-earth-500 mt-0.5">选择导出类型和范围</p>
              </div>
              <button
                onClick={handleCancelExport}
                className="w-8 h-8 rounded-full bg-earth-100 hover:bg-earth-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-earth-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700">导出类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'menu', label: '菜单清单', icon: FileText },
                    { key: 'dish', label: '菜品详情', icon: Utensils },
                    { key: 'combo', label: '套餐明细', icon: Package },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setExportType(item.key as 'menu' | 'dish' | 'combo')}
                        className={cn(
                          'p-3 rounded-xl border-2 transition-all text-center',
                          exportType === item.key
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-earth-200 hover:border-earth-300 text-earth-600'
                        )}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-700">导出范围</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setExportScope('current')}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all text-left',
                      exportScope === 'current'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-earth-200 hover:border-earth-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Store className={cn(
                        'w-5 h-5',
                        exportScope === 'current' ? 'text-primary-600' : 'text-earth-400'
                      )} />
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          exportScope === 'current' ? 'text-primary-700' : 'text-earth-700'
                        )}>
                          当前门店
                        </p>
                        <p className="text-xs text-earth-500">{currentStoreName}</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setExportScope('all')}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all text-left',
                      exportScope === 'all'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-earth-200 hover:border-earth-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className={cn(
                        'w-5 h-5',
                        exportScope === 'all' ? 'text-primary-600' : 'text-earth-400'
                      )} />
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          exportScope === 'all' ? 'text-primary-700' : 'text-earth-700'
                        )}>
                          全部门店
                        </p>
                        <p className="text-xs text-earth-500">{stores.filter(s => s.isActive).length} 家门店</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-warm-50 rounded-xl p-3">
                <p className="text-xs text-earth-600">
                  <span className="font-medium">导出格式：</span>CSV (UTF-8 BOM)，可直接用 Excel 打开
                </p>
                <p className="text-xs text-earth-500 mt-1">
                  <span className="font-medium">文件名：</span>
                  {exportType === 'menu' && '菜单清单'}
                  {exportType === 'dish' && '菜品详情'}
                  {exportType === 'combo' && '套餐明细'}
                  _
                  {exportScope === 'all' ? '全部门店' : currentStoreName}
                  _
                  {new Date().toISOString().split('T')[0]}.csv
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-earth-100 flex gap-3">
              <button
                onClick={handleCancelExport}
                className="flex-1 py-2.5 px-4 rounded-xl border border-earth-200 text-earth-700 font-medium hover:bg-earth-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmExport}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                确认导出
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-5 border-b border-earth-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-earth-800">发布前确认</h3>
                <p className="text-sm text-earth-500 mt-0.5">请确认以下问题后再发布</p>
              </div>
              <button
                onClick={handleCancelPublish}
                className="w-8 h-8 rounded-full bg-earth-100 hover:bg-earth-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-earth-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
              {missingImageDishes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageOff className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-earth-800">缺图菜品 ({missingImageDishes.length})</h4>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 space-y-1.5">
                    {missingImageDishes.map((dish) => (
                      <div key={dish.id} className="text-sm text-earth-700">
                        • {dish.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {missingPriceDishes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-earth-800">缺价菜品 ({missingPriceDishes.length})</h4>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 space-y-1.5">
                    {missingPriceDishes.map((item, idx) => (
                      <div key={`${item.dish.id}-${item.storeId}-${idx}`} className="text-sm text-earth-700 flex justify-between">
                        <span>• {item.dish.name}</span>
                        <span className="text-earth-500 text-xs">{item.storeName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {soldOutDishes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-earth-800">在售售罄菜品 ({soldOutDishes.length})</h4>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 space-y-1.5">
                    {soldOutDishes.map((item, idx) => (
                      <div key={`${item.dish.id}-${item.storeId}-${idx}`} className="text-sm text-earth-700 flex justify-between">
                        <span>• {item.dish.name}</span>
                        <span className="text-earth-500 text-xs">{item.storeName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalIssues === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-earth-800 font-medium">所有检查项已通过</p>
                  <p className="text-sm text-earth-500 mt-1">可以放心发布</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-earth-100 flex gap-3">
              <button
                onClick={handleCancelPublish}
                className="flex-1 py-2.5 px-4 rounded-xl border border-earth-200 text-earth-700 font-medium hover:bg-earth-50 transition-colors"
              >
                返回处理
              </button>
              <button
                onClick={handleConfirmPublish}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                继续发布
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="section-title mb-1">发布管理</h3>
                <p className="text-sm text-earth-500">
                  最后发布时间：{lastPublishTime}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-50 rounded-xl">
                  <Store className="w-4 h-4 text-earth-500" />
                  <span className="text-sm text-earth-600">{currentStoreName}</span>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5',
                    publishStatus === 'published'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-amber-50 text-amber-600'
                  )}
                >
                  {publishStatus === 'published' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {publishStatus === 'published' ? '已发布' : '待发布'}
                </span>
                <button onClick={handlePublishClick} className="btn-primary flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  立即发布
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-warm-50 rounded-xl">
                <p className="text-sm text-earth-500 mb-1">在售菜品</p>
                <p className="text-2xl font-bold text-earth-800">
                  {filteredDishes.length} 道
                </p>
              </div>
              <div className="p-4 bg-warm-50 rounded-xl">
                <p className="text-sm text-earth-500 mb-1">在售套餐</p>
                <p className="text-2xl font-bold text-earth-800">
                  {onSaleCombos.length} 个
                </p>
              </div>
              <div className="p-4 bg-warm-50 rounded-xl">
                <p className="text-sm text-earth-500 mb-1">招牌菜品</p>
                <p className="text-2xl font-bold text-amber-600">
                  {signatureDishes.length} 道
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-earth-800">快捷操作</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleExport}
                className="p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5 text-primary-600" />
                </div>
                <p className="font-medium text-earth-800 text-sm">导出菜单清单</p>
                <p className="text-xs text-earth-500 mt-0.5">CSV 格式</p>
              </button>
              <button className="p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors text-left group">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-medium text-earth-800 text-sm">预览效果</p>
                <p className="text-xs text-earth-500 mt-0.5">手机端模拟</p>
              </button>
              <button className="p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors text-left group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium text-earth-800 text-sm">分享链接</p>
                <p className="text-xs text-earth-500 mt-0.5">生成二维码</p>
              </button>
              <button className="p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors text-left group">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="font-medium text-earth-800 text-sm">发布历史</p>
                <p className="text-xs text-earth-500 mt-0.5">版本记录</p>
              </button>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-earth-800">发布前检查清单</h3>
              <span className={cn(
                'text-sm font-medium px-2.5 py-1 rounded-full',
                totalIssues > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
              )}>
                {totalIssues > 0 ? `${totalIssues} 项待处理` : '全部通过'}
              </span>
            </div>
            <div className="space-y-2">
              {checkItems.map((item) => {
                const Icon = item.icon;
                const hasIssue = !item.isPositive && item.count > 0;
                const isExpanded = activeCheckItem === item.key;

                return (
                  <div
                    key={item.key}
                    className={cn(
                      'rounded-xl overflow-hidden transition-all',
                      isExpanded ? 'bg-warm-100' : 'bg-warm-50 hover:bg-warm-100'
                    )}
                  >
                    <button
                      onClick={() => handleCheckItemClick(item.key)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        {hasIssue ? (
                          <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
                            <span className="text-amber-500 text-xs font-bold">!</span>
                          </div>
                        ) : (
                          <CheckCircle className={cn(
                            'w-5 h-5',
                            item.isPositive ? 'text-green-500' : 'text-green-500'
                          )} />
                        )}
                        <Icon className={cn(
                          'w-4 h-4',
                          hasIssue ? 'text-amber-500' : 'text-earth-400'
                        )} />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            hasIssue ? 'text-amber-700' : 'text-earth-700'
                          )}
                        >
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-earth-500">
                          {item.isPositive ? `${item.count} 项` : hasIssue ? `${item.count} 项待处理` : '已完成'}
                        </span>
                        <ChevronRight className={cn(
                          'w-4 h-4 text-earth-400 transition-transform',
                          isExpanded && 'rotate-90'
                        )} />
                      </div>
                    </button>
                    {isExpanded && renderCheckDetail()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="w-72 h-[580px] bg-earth-900 rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-warm-50 rounded-[2.5rem] overflow-hidden relative flex flex-col">
                <div className="bg-white px-6 pt-3 pb-2 flex items-center justify-between text-xs text-earth-800 font-medium">
                  <span>9:41</span>
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-20 h-5 bg-earth-900 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>

                <div className="relative h-36 bg-earth-200 overflow-hidden">
                  {dishes.length > 0 && getDishCoverImage(dishes[0]) ? (
                    <img
                      src={getDishCoverImage(dishes[0])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-earth-400 bg-earth-100">
                      <ImageOff className="w-10 h-10 mb-2" />
                      <span className="text-xs">暂无封面图</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <h2 className="text-lg font-bold">{currentStoreName}</h2>
                    <p className="text-xs opacity-90">精选菜品 · 新鲜食材</p>
                  </div>
                </div>

                <div className="flex bg-white border-b border-earth-100 px-2">
                  {[
                    { key: 'dishes', label: '菜品' },
                    { key: 'combos', label: '套餐' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as 'dishes' | 'combos')}
                      className={cn(
                        'flex-1 py-2.5 text-sm font-medium relative',
                        activeTab === tab.key
                          ? 'text-primary-600'
                          : 'text-earth-500'
                      )}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'dishes' ? (
                    <>
                      <div className="sticky top-0 z-10 bg-warm-50 px-3 py-2 flex gap-1.5 overflow-x-auto">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
                              activeCategory === cat
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-earth-600'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {signatureDishes.length > 0 && (
                        <div className="px-3 py-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-semibold text-earth-800">
                              招牌推荐
                            </span>
                          </div>
                          <div className="space-y-2">
                            {signatureDishes.slice(0, 2).map((dish) => (
                              <div
                                key={dish.id}
                                className="flex gap-3 p-2.5 bg-white rounded-xl shadow-sm"
                              >
                                <div className="w-20 h-20 rounded-lg bg-earth-100 overflow-hidden flex-shrink-0 relative">
                                  {getDishCoverImage(dish) ? (
                                    <img
                                      src={getDishCoverImage(dish)}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-earth-400">
                                      <Package className="w-6 h-6" />
                                    </div>
                                  )}
                                  {dish.isSignature && (
                                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                      <Crown className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                  <div>
                                    <h4 className="text-sm font-semibold text-earth-800 truncate">
                                      {dish.name}
                                    </h4>
                                    <p className="text-xs text-earth-500 line-clamp-1 mt-0.5">
                                      {dish.description || '美味佳肴'}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-primary-600 font-bold text-sm">
                                      {formatPrice(getDishPrice(dish, currentStoreId))}
                                    </span>
                                    <button className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                                      <span className="text-white text-lg leading-none">+</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="px-3 pb-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-semibold text-earth-800">
                            全部菜品
                          </span>
                        </div>
                        <div className="space-y-2">
                          {regularDishes.slice(0, 4).map((dish) => (
                            <div
                              key={dish.id}
                              className="flex gap-3 p-2.5 bg-white rounded-xl shadow-sm"
                            >
                              <div className="w-16 h-16 rounded-lg bg-earth-100 overflow-hidden flex-shrink-0">
                                {getDishCoverImage(dish) ? (
                                  <img
                                    src={getDishCoverImage(dish)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-earth-400">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                  <h4 className="text-sm font-medium text-earth-800 truncate">
                                    {dish.name}
                                  </h4>
                                  <p className="text-xs text-earth-400 line-clamp-1 mt-0.5">
                                    {dish.portion || '标准份'}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-primary-600 font-bold text-sm">
                                    {formatPrice(getDishPrice(dish, currentStoreId))}
                                  </span>
                                  <button className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                    <span className="text-white text-base leading-none">
                                      +
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      {onSaleCombos.slice(0, 3).map((combo) => (
                        <div
                          key={combo.id}
                          className="bg-white rounded-xl shadow-sm overflow-hidden"
                        >
                          <div className="h-24 bg-earth-100 relative">
                            {combo.image ? (
                              <img
                                src={combo.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-earth-400">
                                <Package className="w-8 h-8" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                              套餐
                            </div>
                          </div>
                          <div className="p-2.5">
                            <h4 className="text-sm font-semibold text-earth-800 truncate">
                              {combo.name}
                            </h4>
                            <p className="text-xs text-earth-500 line-clamp-1 mt-0.5">
                              {combo.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-baseline gap-1">
                                <span className="text-primary-600 font-bold text-sm">
                                  {formatPrice(getComboPrice(combo, currentStoreId))}
                                </span>
                                <span className="text-xs text-earth-400 line-through">
                                  {formatPrice(getComboStoreItem(combo, currentStoreId)?.originalPrice || 0)}
                                </span>
                              </div>
                              <button className="px-3 py-1 bg-primary-500 text-white text-xs rounded-full">
                                选购
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white px-4 py-2 border-t border-earth-100 flex justify-around">
                  <button className="flex flex-col items-center gap-0.5 text-primary-600">
                    <Smartphone className="w-5 h-5" />
                    <span className="text-[10px]">菜单</span>
                  </button>
                  <button className="flex flex-col items-center gap-0.5 text-earth-400">
                    <Heart className="w-5 h-5" />
                    <span className="text-[10px]">收藏</span>
                  </button>
                  <button className="flex flex-col items-center gap-0.5 text-earth-400">
                    <Star className="w-5 h-5" />
                    <span className="text-[10px]">评价</span>
                  </button>
                  <button className="flex flex-col items-center gap-0.5 text-earth-400">
                    <ChevronRight className="w-5 h-5" />
                    <span className="text-[10px]">我的</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-earth-500">手机端预览效果</p>
              <p className="text-xs text-earth-400 mt-1">{currentStoreName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
