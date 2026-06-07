import { Bell, Search, Menu, HelpCircle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useDishStore } from '@/store/dishStore';
import { AlertTriangle, ImageOff } from 'lucide-react';

const pageTitles: Record<string, string> = {
  dashboard: '数据概览',
  dishes: '菜品库',
  combos: '套餐编辑',
  tags: '口味标签',
  inventory: '库存展示',
  activities: '活动排期',
  reviews: '评价精选',
  preview: '预览发布',
};

export const Header = () => {
  const { currentPage, toggleSidebar } = useUIStore();
  const { getMissingImages, getMissingPrices, getLowStockDishes } = useDishStore();

  const missingImages = getMissingImages();
  const missingPrices = getMissingPrices();
  const lowStock = getLowStockDishes();
  const totalIssues = missingImages.length + missingPrices.length + lowStock.length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-earth-100">
      <div className="flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-warm-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-earth-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-earth-800">{pageTitles[currentPage]}</h2>
            <p className="text-xs text-earth-500">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-400" />
            <input
              type="text"
              placeholder="搜索菜品、套餐..."
              className="input-field pl-10 py-2 w-64 text-sm"
            />
          </div>

          <button className="p-2.5 rounded-xl hover:bg-warm-100 transition-colors relative">
            <HelpCircle className="w-5 h-5 text-earth-500" />
          </button>

          <button className="p-2.5 rounded-xl hover:bg-warm-100 transition-colors relative">
            <Bell className="w-5 h-5 text-earth-500" />
            {totalIssues > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalIssues}
              </span>
            )}
          </button>

          {totalIssues > 0 && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-amber-700 font-medium">
                {totalIssues} 项待处理
              </span>
            </div>
          )}
        </div>
      </div>

      {totalIssues > 0 && (
        <div className="px-6 py-2 bg-amber-50/50 border-t border-amber-100 flex items-center gap-4 text-sm">
          {missingImages.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-700">
              <ImageOff className="w-4 h-4" />
              <span>缺图菜品: {missingImages.length}</span>
            </div>
          )}
          {missingPrices.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-700">
              <span className="font-semibold">¥</span>
              <span>缺价菜品: {missingPrices.length}</span>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-1.5 text-red-600">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>库存预警: {lowStock.length}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
