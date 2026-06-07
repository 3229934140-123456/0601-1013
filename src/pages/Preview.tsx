import { useState } from 'react';
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
} from 'lucide-react';
import { useDishStore } from '@/store/dishStore';
import { useComboStore } from '@/store/comboStore';
import { exportMenuToCSV } from '@/utils/export';
import { cn, formatPrice } from '@/utils/format';

export const Preview = () => {
  const { dishes, categories } = useDishStore();
  const { combos } = useComboStore();
  const [activeTab, setActiveTab] = useState<'dishes' | 'combos'>('dishes');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('published');
  const [lastPublishTime, setLastPublishTime] = useState('2026-01-15 14:30');

  const allCategories = ['全部', ...categories];
  const filteredDishes =
    activeCategory === '全部'
      ? dishes.filter((d) => d.isOnSale)
      : dishes.filter((d) => d.category === activeCategory && d.isOnSale);

  const onSaleCombos = combos.filter((c) => c.isOnSale);

  const signatureDishes = filteredDishes.filter((d) => d.isSignature);
  const regularDishes = filteredDishes.filter((d) => !d.isSignature);

  const handleExport = () => {
    exportMenuToCSV(dishes, combos);
  };

  const handlePublish = () => {
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
  };

  return (
    <div className="space-y-6">
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
                <button onClick={handlePublish} className="btn-primary flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  立即发布
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-warm-50 rounded-xl">
                <p className="text-sm text-earth-500 mb-1">在售菜品</p>
                <p className="text-2xl font-bold text-earth-800">
                  {dishes.filter((d) => d.isOnSale).length} 道
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
                  {dishes.filter((d) => d.isSignature && d.isOnSale).length} 道
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
            <h3 className="font-semibold text-earth-800 mb-4">发布前检查清单</h3>
            <div className="space-y-3">
              {[
                { label: '所有菜品都有图片', status: false, count: 3 },
                { label: '所有菜品都设置了价格', status: false, count: 2 },
                { label: '招牌菜品已设置', status: true, count: 3 },
                { label: '库存预警已处理', status: false, count: 2 },
                { label: '活动排期已确认', status: true, count: 2 },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-warm-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {item.status ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center">
                        <span className="text-amber-500 text-xs font-bold">!</span>
                      </div>
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        item.status ? 'text-earth-700' : 'text-amber-700'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs text-earth-500">
                    {item.status ? '已完成' : `${item.count} 项待处理`}
                  </span>
                </div>
              ))}
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

                <div className="px-4 py-3 bg-white border-b border-earth-100">
                  <h2 className="text-lg font-bold text-earth-800">美味餐厅</h2>
                  <p className="text-xs text-earth-500">精选菜品 · 新鲜食材</p>
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
                        {allCategories.map((cat) => (
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
                                  {dish.images[0] ? (
                                    <img
                                      src={dish.images[0]}
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
                                      {formatPrice(dish.price)}
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
                                    {formatPrice(dish.price)}
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
                                  {formatPrice(combo.price)}
                                </span>
                                <span className="text-xs text-earth-400 line-through">
                                  {formatPrice(combo.originalPrice)}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
