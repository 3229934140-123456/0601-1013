import { TrendingUp, TrendingDown, Utensils, Eye, Heart, Store } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDishStore } from '@/store/dishStore';
import { useComboStore } from '@/store/comboStore';
import { useStoreStore } from '@/store/storeStore';
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
  const { dishes, getLowStockDishes } = useDishStore();
  const { combos } = useComboStore();
  const { stores, getActiveStores } = useStoreStore();
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  const trendData = timeRange === '7days' ? trendData7Days : trendData30Days;

  const totalDishes = dishes.length;
  const onSaleDishes = dishes.filter((d) => d.isOnSale).length;
  const totalViews = dishes.reduce((sum, d) => sum + d.views, 0);
  const totalFavorites = dishes.reduce((sum, d) => sum + d.favorites, 0);
  const activeStores = getActiveStores().length;
  const lowStockCount = getLowStockDishes().length;
  const signatureDishes = dishes.filter((d) => d.isSignature).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="菜品总数"
          value={totalDishes}
          change={12}
          icon={Utensils}
          gradient="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <StatCard
          title="今日浏览量"
          value={totalViews.toLocaleString()}
          change={8.5}
          icon={Eye}
          gradient="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          title="收藏总数"
          value={totalFavorites.toLocaleString()}
          change={15.2}
          icon={Heart}
          gradient="bg-gradient-to-br from-pink-400 to-pink-600"
        />
        <StatCard
          title="在售门店"
          value={`${activeStores}/${stores.length}`}
          change={0}
          icon={Store}
          gradient="bg-gradient-to-br from-green-400 to-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="section-title mb-1">浏览与收藏趋势</h3>
              <p className="text-sm text-earth-500">展示近{timeRange === '7days' ? '7' : '30'}天的数据变化</p>
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
                <span className="text-earth-600 text-sm">套餐数量</span>
                <span className="font-bold text-earth-800">{combos.length} 个</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <span className="text-red-600 text-sm">库存预警</span>
                <span className="font-bold text-red-600">{lowStockCount} 项</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title text-base mb-4">门店概览</h3>
            <div className="space-y-3">
              {stores.slice(0, 4).map((store) => (
                <div key={store.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        store.isActive ? 'bg-green-500' : 'bg-gray-300'
                      )}
                    ></div>
                    <span className="text-sm text-earth-700">{store.name}</span>
                  </div>
                  <span className="text-xs text-earth-500">
                    {dishes.filter((d) => d.storeIds.includes(store.id) && d.isOnSale).length} 道菜
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title mb-4">热门菜品 TOP 5</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...dishes]
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map((dish, index) => (
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
                  <span>¥{dish.price}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {dish.views}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
