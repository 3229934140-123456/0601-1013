import {
  LayoutDashboard,
  UtensilsCrossed,
  Sandwich,
  Tags,
  Package,
  CalendarDays,
  MessageSquare,
  Smartphone,
  ChefHat,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import type { PageType } from '@/types';
import { cn } from '@/utils/format';

const navItems: { id: PageType; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: '数据概览', icon: LayoutDashboard },
  { id: 'dishes', label: '菜品库', icon: UtensilsCrossed, badge: '12' },
  { id: 'combos', label: '套餐编辑', icon: Sandwich },
  { id: 'tags', label: '口味标签', icon: Tags },
  { id: 'inventory', label: '库存展示', icon: Package },
  { id: 'activities', label: '活动排期', icon: CalendarDays },
  { id: 'reviews', label: '评价精选', icon: MessageSquare },
  { id: 'preview', label: '预览发布', icon: Smartphone },
];

export const Sidebar = () => {
  const { currentPage, setCurrentPage, sidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-earth-100 z-40 transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-60'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-earth-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-earth-800 text-lg leading-tight">美味后厨</h1>
              <p className="text-xs text-earth-500">餐厅管理平台</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={cn(
                  'sidebar-item w-full relative',
                  isActive && 'sidebar-item-active'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-primary-100 text-primary-600'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-earth-100">
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl bg-warm-50',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              张
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-earth-800 text-sm truncate">张经理</p>
                <p className="text-xs text-earth-500 truncate">运营主管</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
