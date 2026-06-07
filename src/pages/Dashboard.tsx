import { TrendingUp, TrendingDown, Utensils, Eye, Heart, Store, AlertTriangle, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDishStore } from '@/store/dishStore';
import { useComboStore } from '@/store/comboStore';
import { useStoreStore } from '@/store/storeStore';
import { useUIStore } from '@/store/uiStore';
import { trendData7Days, trendData30Days } from '@/data/trends';
import { useState } from 'react';
import { cn } from '@/utils/format';

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  gradient: string;
}) => (
  <div className="card p-5 relative overflow-hidden group">
    <div className={cn('absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20', gradient)}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">{title}</span>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="stat-number mb-2">{value}</div>
      <div className={cn('flex items-center gap-1 text-sm font-medium', change >= 0 ? 'text-green-600' : 'text-red-500')}>
        {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span>{Math.abs(change)}%</span>
        <span className="text-earth-400 font-normal">较上周</span>
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const { currentStoreId } = useUIStore();
  const { getOnSaleCount, getSignatureCount, getSoldOutOnSaleCount, getFilteredDishes, getDishPrice } = useDishStore();
  const { getOnSaleComboCount } = useComboStore();
  const { stores, getActiveStores, getStoreById } = useStoreStore();
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  const trendData = timeRange === '7days' ? trendData7Days : trendData30Days;

  const onSaleDishes = getOnSaleCount(currentStoreId);
  const signatureDishes = getSignatureCount(currentStoreId);
  const lowStockCount = getSoldOutOnSaleCount(currentStoreId);
  const onSaleCombos = getOnSaleComboCount(currentStoreId);
  
  const filteredDishes = getFilteredDishes(currentStoreId);
  const totalViews = filteredDishes.reduce((sum, d) => sum + d.views, 0);
  const totalFavorites = filteredDishes.reduce((sum, d) => sum + d.favorites, 0);
  const activeStores = getActiveStores().length;
  
  const currentStore = currentStoreId === 'all' ? null : getStoreById(currentStoreId);
  const storeLabel = currentStoreId === 'all' ? '全部门店' : currentStore?.name || '未知门店';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="在售菜品"
          value={onSaleDishes}
          change={12}
          icon={Utensils}
          gradient="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <StatCard
          title="招牌菜品"
          value={signatureDishes}
          change={8.5}
          icon={Star}
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
        />
        <StatCard
          title="库存预警"
          value={lowStockCount}
          change={-5}
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-red-400 to-red-600"
        />
        <StatCard
          title="在售套餐"
          value={onSaleCombos}
          change={15.2}
          icon={Store}
          gradient="bg-gradient-to-br from-green-400 to-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="section-title mb-1">浏览与收藏趋势</h3>
              <p className="text-sm text-earth-500">展示近{timeRange === '7days' ? '7' : '30'}天的数据变化 · 当前门店：{storeLabel}</p>
            </div>
            <div className="flex bg-warm-50 rounded-xl p-1">
              {[
                { key: '7days', label: '近7天' },
                { key: '30days', label: '近30天' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTimeRange(item.key as '7days' | '30days')}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                    timeRange === item.key
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-earth-500 hover:text-earth-700'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFavorites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                <XAxis dataKey="date" stroke="#a18072" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a18072" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #eaddd7',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: '#5c4038', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#colorViews)"
                  name="浏览量"
                />
                <Area
                  type="monotone"
                  dataKey="favorites"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="url(#colorFavorites)"
                  name="收藏量"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm text-earth-600">浏览量</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span className="text-sm text-earth-600">收藏量</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="section-title text-base mb-4">快速统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-warm-50 rounded-xl">
                <span className="text-earth-600 text-sm">在售菜品</span>
                <span className="font-bold text-earth-800">{onSaleDishes} 道</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warm-50 rounded-xl">
                <span className="text-earth-600 text-sm">招牌菜品</span>
                <span className="font-bold text-earth-800">{signatureDishes} 道</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warm-50 rounded-xl">
                <span className="text-earth-600 text-sm">在售套餐</span>
                <span className="font-bold text-earth-800">{onSaleCombos} 个</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <span className="text-red-600 text-sm">库存预警</span>
                <span className="font-bold text-red-600">{lowStockCount} 项</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title text-base mb-4">门店概览</h3>
            <div className="space-y-4">
              {stores.slice(0, 4).map((store) => {
                const storeOnSaleDishes = getOnSaleCount(store.id);
                const storeOnSaleCombos = getOnSaleComboCount(store.id);
                const storeLowStock = getSoldOutOnSaleCount(store.id);
                return (
                  <div key={store.id} className="p-3 bg-warm-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            store.isActive ? 'bg-green-500' : 'bg-gray-300'
                          )}
                        ></div>
                        <span className="text-sm font-medium text-earth-700">{store.name}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary-600">{storeOnSaleDishes}</div>
                        <div className="text-xs text-earth-500">在售菜品</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">{storeOnSaleCombos}</div>
                        <div className="text-xs text-earth-500">在售套餐</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-500">{storeLowStock}</div>
                        <div className="text-xs text-earth-500">库存预警</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title mb-4">热门菜品 TOP 5 <span className="text-sm font-normal text-earth-500 ml-2">· {storeLabel}</span></h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...filteredDishes]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map((dish, index) => {
              const price = getDishPrice(dish, currentStoreId);
              return (
                <div key={dish.id} className="relative group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-earth-100 mb-2">
                    {dish.images[0] ? (
                      <img
                        src={dish.images[0]}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-earth-400">
                        <Utensils className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-earth-800 text-sm truncate">{dish.name}</h4>
                  <div className="flex items-center justify-between text-xs text-earth-500 mt-1">
                    <span>¥{price}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {dish.views}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
