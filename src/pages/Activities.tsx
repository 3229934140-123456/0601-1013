import { useState, useMemo } from 'react';
import {
  Plus,
  CalendarDays,
  Clock,
  Store,
  Tag as TagIcon,
  Edit3,
  Trash2,
  X,
  Check,
  Sparkles,
  Percent,
  Timer,
  List,
  Calendar,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { useActivityStore } from '@/store/activityStore';
import { useDishStore } from '@/store/dishStore';
import { useStoreStore } from '@/store/storeStore';
import { useUIStore } from '@/store/uiStore';
import { cn, formatDate, formatDateTime, formatPrice } from '@/utils/format';
import type { Activity } from '@/types';

type ViewType = 'list' | 'month' | 'week';

const statusConfig = {
  active: { label: '进行中', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500', border: 'border-green-200' },
  scheduled: { label: '待开始', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500', border: 'border-blue-200' },
  ended: { label: '已结束', color: 'text-earth-500', bg: 'bg-earth-100', dot: 'bg-earth-400', border: 'border-earth-200' },
  draft: { label: '草稿', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-200' },
};

const typeConfig = {
  discount: { label: '折扣活动', icon: Percent, color: 'text-purple-600', bg: 'bg-purple-100' },
  new: { label: '新品上市', icon: Sparkles, color: 'text-orange-600', bg: 'bg-orange-100' },
  limited: { label: '限量特供', icon: Timer, color: 'text-red-600', bg: 'bg-red-100' },
};

const isoToDatetimeLocal = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return d >= s && d <= e;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

const getWeekDates = (date: Date): Date[] => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(monday));
    monday.setDate(monday.getDate() + 1);
  }
  return dates;
};

const checkTimeOverlap = (a1: Activity, a2: Activity): boolean => {
  const start1 = new Date(a1.startTime).getTime();
  const end1 = new Date(a1.endTime).getTime();
  const start2 = new Date(a2.startTime).getTime();
  const end2 = new Date(a2.endTime).getTime();
  return start1 < end2 && start2 < end1;
};

interface ConflictInfo {
  activityId: string;
  conflicts: {
    conflictActivityId: string;
    conflictActivityName: string;
    dishIds: string[];
    storeIds: string[];
    timeOverlap: boolean;
  }[];
}

export const Activities = () => {
  const { activities, addActivity, updateActivity, deleteActivity, updateStatus } = useActivityStore();
  const { dishes } = useDishStore();
  const { stores } = useStoreStore();
  const { currentStoreId } = useUIStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Activity>>({
    name: '',
    type: 'discount',
    discount: 10,
    startTime: '',
    endTime: '',
    dishIds: [],
    storeIds: [],
    status: 'draft',
    description: '',
  });

  const filteredActivities = useMemo(() => {
    let result = activities;
    if (filterStatus !== 'all') {
      result = result.filter((a) => a.status === filterStatus);
    }
    if (currentStoreId !== 'all') {
      result = result.filter((a) => a.storeIds.includes(currentStoreId));
    }
    return result;
  }, [activities, filterStatus, currentStoreId]);

  const conflictsMap = useMemo(() => {
    const map: Record<string, ConflictInfo> = {};
    const discountActivities = activities.filter((a) => a.type === 'discount' && a.status !== 'ended' && a.status !== 'draft');
    
    for (let i = 0; i < discountActivities.length; i++) {
      for (let j = i + 1; j < discountActivities.length; j++) {
        const a1 = discountActivities[i];
        const a2 = discountActivities[j];
        
        const overlappingDishes = a1.dishIds.filter((id) => a2.dishIds.includes(id));
        const overlappingStores = a1.storeIds.filter((id) => a2.storeIds.includes(id));
        const timeOverlap = checkTimeOverlap(a1, a2);
        
        if (overlappingDishes.length > 0 && overlappingStores.length > 0) {
          if (!map[a1.id]) {
            map[a1.id] = { activityId: a1.id, conflicts: [] };
          }
          if (!map[a2.id]) {
            map[a2.id] = { activityId: a2.id, conflicts: [] };
          }
          map[a1.id].conflicts.push({
            conflictActivityId: a2.id,
            conflictActivityName: a2.name,
            dishIds: overlappingDishes,
            storeIds: overlappingStores,
            timeOverlap,
          });
          map[a2.id].conflicts.push({
            conflictActivityId: a1.id,
            conflictActivityName: a1.name,
            dishIds: overlappingDishes,
            storeIds: overlappingStores,
            timeOverlap,
          });
        }
      }
    }
    return map;
  }, [activities]);

  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const dates: { date: Date; isCurrentMonth: boolean }[] = [];
    
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      dates.push({
        date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    const remaining = 42 - dates.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= remaining; i++) {
      dates.push({
        date: new Date(nextYear, nextMonth, i),
        isCurrentMonth: false,
      });
    }
    
    return dates;
  }, [currentDate]);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const getActivitiesForDate = (date: Date): Activity[] => {
    return filteredActivities.filter((activity) => {
      const start = new Date(activity.startTime);
      const end = new Date(activity.endTime);
      return isDateInRange(date, start, end);
    });
  };

  const openForm = (activity?: Activity) => {
    if (activity) {
      setFormData({
        ...activity,
        startTime: isoToDatetimeLocal(activity.startTime),
        endTime: isoToDatetimeLocal(activity.endTime),
      });
      setEditingId(activity.id);
    } else {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFormData({
        name: '',
        type: 'discount',
        discount: 10,
        startTime: isoToDatetimeLocal(now.toISOString()),
        endTime: isoToDatetimeLocal(nextWeek.toISOString()),
        dishIds: [],
        storeIds: [],
        status: 'draft',
        description: '',
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    const data = {
      ...formData,
      startTime: formData.startTime ? new Date(formData.startTime).toISOString() : '',
      endTime: formData.endTime ? new Date(formData.endTime).toISOString() : '',
    };
    if (editingId) {
      updateActivity(editingId, data);
    } else {
      addActivity(data);
    }
    setShowForm(false);
  };

  const toggleDish = (dishId: string) => {
    const newIds = formData.dishIds!.includes(dishId)
      ? formData.dishIds!.filter((id) => id !== dishId)
      : [...formData.dishIds!, dishId];
    setFormData({ ...formData, dishIds: newIds });
  };

  const toggleStore = (storeId: string) => {
    const newIds = formData.storeIds!.includes(storeId)
      ? formData.storeIds!.filter((id) => id !== storeId)
      : [...formData.storeIds!, storeId];
    setFormData({ ...formData, storeIds: newIds });
  };

  const prevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const prevWeek = () => {
    setCurrentDate((d) => {
      const newDate = new Date(d);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const nextWeek = () => {
    setCurrentDate((d) => {
      const newDate = new Date(d);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getActivityDishes = (activity: Activity) =>
    activity.dishIds.map((id) => dishes.find((d) => d.id === id)).filter(Boolean);

  const getActivityStores = (activity: Activity) =>
    activity.storeIds.map((id) => stores.find((s) => s.id === id)).filter(Boolean);

  const renderListView = () => (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-earth-200"></div>
      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const status = statusConfig[activity.status];
          const typeInfo = typeConfig[activity.type];
          const TypeIcon = typeInfo.icon;
          const activityDishes = getActivityDishes(activity);
          const activityStores = getActivityStores(activity);
          const hasConflict = !!conflictsMap[activity.id];
          const hasTimeOverlap = conflictsMap[activity.id]?.conflicts.some((c) => c.timeOverlap);

          return (
            <div key={activity.id} className="relative pl-14">
              <div
                className={cn(
                  'absolute left-4 w-5 h-5 rounded-full border-4 border-white z-10',
                  status.dot,
                  'shadow-md'
                )}
              ></div>

              <div className={cn(
                'card p-5 group relative',
                hasTimeOverlap && 'ring-2 ring-red-300 ring-offset-2'
              )}>
                {hasConflict && (
                  <div
                    className="absolute top-3 right-3 z-20"
                    onMouseEnter={() => setHoveredActivity(activity.id)}
                    onMouseLeave={() => setHoveredActivity(null)}
                  >
                    <div className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium cursor-help',
                      hasTimeOverlap
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-600'
                    )}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{hasTimeOverlap ? '时间冲突' : '菜品重叠'}</span>
                    </div>
                    {hoveredActivity === activity.id && (
                      <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-earth-200 z-30">
                        <p className="text-sm font-medium text-earth-800 mb-2">冲突详情</p>
                        {conflictsMap[activity.id]?.conflicts.map((conflict, idx) => (
                          <div key={idx} className="text-xs text-earth-600 mb-2 last:mb-0">
                            <p className="font-medium text-earth-700">与「{conflict.conflictActivityName}」冲突</p>
                            <p className="mt-1">
                              重叠菜品：{conflict.dishIds.length} 道
                              {conflict.timeOverlap && (
                                <span className="text-red-500 ml-2">· 时间重叠</span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between mb-4 pr-20">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        typeInfo.bg
                      )}
                    >
                      <TypeIcon className={cn('w-6 h-6', typeInfo.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-earth-800 text-lg">
                          {activity.name}
                        </h4>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            status.bg,
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            typeInfo.bg,
                            typeInfo.color
                          )}
                        >
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-earth-500 mb-2">
                        {activity.description || '暂无描述'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-earth-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4" />
                          {formatDate(activity.startTime)} - {formatDate(activity.endTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Percent className="w-4 h-4" />
                          {activity.discount}% 折扣
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Store className="w-4 h-4" />
                          {activityStores.length} 家门店
                        </span>
                        <span className="flex items-center gap-1.5">
                          <UtensilsCrossed className="w-4 h-4" />
                          {activityDishes.length} 道菜品
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {activity.status === 'draft' && (
                      <button
                        onClick={() => updateStatus(activity.id, 'scheduled')}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        发布
                      </button>
                    )}
                    {activity.status === 'scheduled' && (
                      <button
                        onClick={() => updateStatus(activity.id, 'active')}
                        className="px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                      >
                        立即开始
                      </button>
                    )}
                    {activity.status === 'active' && (
                      <button
                        onClick={() => updateStatus(activity.id, 'ended')}
                        className="px-3 py-1.5 text-sm bg-earth-100 text-earth-600 rounded-lg hover:bg-earth-200"
                      >
                        结束
                      </button>
                    )}
                    <button
                      onClick={() => openForm(activity)}
                      className="p-2 rounded-lg hover:bg-warm-100 text-earth-500 hover:text-primary-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteActivity(activity.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-earth-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {activityStores.map((store) =>
                    store ? (
                      <span
                        key={store.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-600 text-xs rounded-full"
                      >
                        <MapPin className="w-3 h-3" />
                        {store.name}
                      </span>
                    ) : null
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activityDishes.slice(0, 6).map((dish) =>
                    dish ? (
                      <span
                        key={dish.id}
                        className="px-2.5 py-1 bg-warm-100 text-earth-600 text-xs rounded-full"
                      >
                        {dish.name}
                      </span>
                    ) : null
                  )}
                  {activityDishes.length > 6 && (
                    <span className="px-2.5 py-1 bg-earth-100 text-earth-500 text-xs rounded-full">
                      +{activityDishes.length - 6} 道菜品
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-20">
          <CalendarDays className="w-16 h-16 mx-auto mb-4 text-earth-300" />
          <p className="text-earth-500 mb-2">暂无活动</p>
          <button onClick={() => openForm()} className="btn-primary">
            创建第一个活动
          </button>
        </div>
      )}
    </div>
  );

  const renderMonthView = () => {
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
    const today = new Date();

    return (
      <div className="card p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-earth-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthDates.map(({ date, isCurrentMonth }, index) => {
            const dayActivities = getActivitiesForDate(date);
            const isToday = isSameDay(date, today);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={index}
                className={cn(
                  'min-h-28 p-2 rounded-xl border transition-colors',
                  isCurrentMonth
                    ? 'bg-white border-earth-200'
                    : 'bg-earth-50 border-earth-100',
                  isToday && 'ring-2 ring-primary-400 ring-offset-1'
                )}
              >
                <div
                  className={cn(
                    'text-sm font-medium mb-1.5',
                    !isCurrentMonth && 'text-earth-400',
                    isToday && 'text-primary-600',
                    isWeekend && isCurrentMonth && !isToday && 'text-orange-500'
                  )}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayActivities.slice(0, 3).map((activity) => {
                    const typeInfo = typeConfig[activity.type];
                    const hasTimeOverlap = conflictsMap[activity.id]?.conflicts.some((c) => c.timeOverlap);
                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          'group relative text-xs px-1.5 py-1 rounded-md truncate cursor-pointer',
                          hasTimeOverlap
                            ? 'bg-red-100 text-red-700'
                            : activity.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : activity.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : activity.status === 'draft'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-earth-100 text-earth-600'
                        )}
                        onMouseEnter={() => setHoveredActivity(activity.id)}
                        onMouseLeave={() => setHoveredActivity(null)}
                      >
                        <span className="truncate block">{activity.name}</span>
                        {hoveredActivity === activity.id && (
                          <div className="absolute left-full top-0 ml-2 w-56 p-3 bg-white rounded-xl shadow-xl border border-earth-200 z-30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeInfo.bg)}>
                                <typeInfo.icon className={cn('w-4 h-4', typeInfo.color)} />
                              </div>
                              <div>
                                <p className="font-medium text-earth-800 text-sm">{activity.name}</p>
                                <span className={cn('text-xs', typeInfo.color)}>{typeInfo.label}</span>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs text-earth-500">
                              <p className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(activity.startTime)}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Percent className="w-3 h-3" />
                                {activity.discount}% 折扣
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Store className="w-3 h-3" />
                                {getActivityStores(activity).length} 家门店
                              </p>
                              <p className="flex items-center gap-1.5">
                                <UtensilsCrossed className="w-3 h-3" />
                                {getActivityDishes(activity).length} 道菜品
                              </p>
                            </div>
                            {conflictsMap[activity.id] && (
                              <div className="mt-2 pt-2 border-t border-earth-100">
                                <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  存在冲突
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {dayActivities.length > 3 && (
                    <div className="text-xs text-earth-500 pl-1.5">
                      +{dayActivities.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const today = new Date();

    return (
      <div className="card p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, idx) => {
            const dayActivities = getActivitiesForDate(date);
            const isToday = isSameDay(date, today);

            return (
              <div key={idx} className="flex flex-col">
                <div
                  className={cn(
                    'text-center py-3 rounded-t-xl border-b-2',
                    isToday
                      ? 'bg-primary-50 border-primary-400'
                      : 'bg-earth-50 border-earth-200'
                  )}
                >
                  <p className="text-sm text-earth-500">{weekDayNames[idx]}</p>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      isToday ? 'text-primary-600' : 'text-earth-800'
                    )}
                  >
                    {date.getDate()}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex-1 min-h-96 p-2 space-y-2 border border-t-0 rounded-b-xl',
                    isToday ? 'border-primary-200 bg-primary-50/30' : 'border-earth-200 bg-white'
                  )}
                >
                  {dayActivities.map((activity) => {
                    const typeInfo = typeConfig[activity.type];
                    const status = statusConfig[activity.status];
                    const hasTimeOverlap = conflictsMap[activity.id]?.conflicts.some((c) => c.timeOverlap);
                    const startTime = new Date(activity.startTime);
                    const endTime = new Date(activity.endTime);

                    const isStartDay = isSameDay(startTime, date);
                    const isEndDay = isSameDay(endTime, date);
                    const isSingleDay = isStartDay && isEndDay;

                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          'group relative p-2 rounded-lg cursor-pointer transition-all hover:shadow-md',
                          hasTimeOverlap
                            ? 'bg-red-100 border border-red-300'
                            : activity.status === 'active'
                            ? 'bg-green-100 border border-green-300'
                            : activity.status === 'scheduled'
                            ? 'bg-blue-100 border border-blue-300'
                            : activity.status === 'draft'
                            ? 'bg-amber-100 border border-amber-300'
                            : 'bg-earth-100 border border-earth-300',
                          isStartDay && 'rounded-l-lg',
                          isEndDay && 'rounded-r-lg',
                          !isStartDay && !isEndDay && 'rounded-none'
                        )}
                        onMouseEnter={() => setHoveredActivity(activity.id)}
                        onMouseLeave={() => setHoveredActivity(null)}
                      >
                        <p className={cn(
                          'text-sm font-medium truncate',
                          hasTimeOverlap ? 'text-red-800' : 'text-earth-800'
                        )}>
                          {activity.name}
                        </p>
                        <p className="text-xs text-earth-500 mt-1">
                          {isSingleDay
                            ? `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
                            : isStartDay
                            ? `开始 ${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`
                            : isEndDay
                            ? `结束 ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
                            : '全天'}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <span
                            className={cn(
                              'px-1.5 py-0.5 text-xs rounded-full',
                              status.bg,
                              status.color
                            )}
                          >
                            {status.label}
                          </span>
                          <span className="text-xs text-earth-500">
                            {activity.discount}%
                          </span>
                        </div>
                        {hoveredActivity === activity.id && (
                          <div className="absolute left-full top-0 ml-2 w-56 p-3 bg-white rounded-xl shadow-xl border border-earth-200 z-30">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeInfo.bg)}>
                                <typeInfo.icon className={cn('w-4 h-4', typeInfo.color)} />
                              </div>
                              <div>
                                <p className="font-medium text-earth-800 text-sm">{activity.name}</p>
                                <span className={cn('text-xs', typeInfo.color)}>{typeInfo.label}</span>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs text-earth-500">
                              <p className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {formatDateTime(activity.startTime)} - {formatDateTime(activity.endTime)}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Percent className="w-3 h-3" />
                                {activity.discount}% 折扣
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Store className="w-3 h-3" />
                                {getActivityStores(activity).length} 家门店
                              </p>
                              <p className="flex items-center gap-1.5">
                                <UtensilsCrossed className="w-3 h-3" />
                                {getActivityDishes(activity).length} 道菜品
                              </p>
                            </div>
                            {conflictsMap[activity.id] && (
                              <div className="mt-2 pt-2 border-t border-earth-100">
                                <p className="text-xs font-medium text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  存在冲突
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const viewConfig = [
    { key: 'list' as ViewType, label: '列表', icon: List },
    { key: 'month' as ViewType, label: '月视图', icon: Calendar },
    { key: 'week' as ViewType, label: '周视图', icon: CalendarRange },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="section-title mb-1">活动排期</h3>
            <p className="text-sm text-earth-500">
              共 {activities.length} 个活动
              {currentStoreId !== 'all' && (
                <span className="ml-2 text-primary-600">
                  · 当前门店筛选中
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-warm-50 rounded-xl p-1">
              {[
                { key: 'all', label: '全部' },
                { key: 'active', label: '进行中' },
                { key: 'scheduled', label: '待开始' },
                { key: 'ended', label: '已结束' },
                { key: 'draft', label: '草稿' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilterStatus(item.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    filterStatus === item.key
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-earth-500 hover:text-earth-700'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-warm-50 rounded-xl p-1">
              {viewConfig.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setViewType(item.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                      viewType === item.key
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-earth-500 hover:text-earth-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {(viewType === 'month' || viewType === 'week') && (
              <div className="flex items-center gap-1">
                <button
                  onClick={viewType === 'month' ? prevMonth : prevWeek}
                  className="p-2 rounded-lg hover:bg-warm-100 text-earth-500"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  今天
                </button>
                <button
                  onClick={viewType === 'month' ? nextMonth : nextWeek}
                  className="p-2 rounded-lg hover:bg-warm-100 text-earth-500"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="ml-2 text-sm font-medium text-earth-700 min-w-32 text-center">
                  {viewType === 'month'
                    ? `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
                    : `${weekDates[0].getMonth() + 1}月${weekDates[0].getDate()}日 - ${weekDates[6].getMonth() + 1}月${weekDates[6].getDate()}日`}
                </span>
              </div>
            )}

            <button
              onClick={() => openForm()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建活动
            </button>
          </div>
        </div>
      </div>

      {viewType === 'list' && renderListView()}
      {viewType === 'month' && renderMonthView()}
      {viewType === 'week' && renderWeekView()}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          ></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-earth-100">
              <h3 className="text-lg font-bold text-earth-800">
                {editingId ? '编辑活动' : '新建活动'}
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
                    活动名称
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="请输入活动名称"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    活动类型
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['discount', 'new', 'limited'] as const).map((type) => {
                      const info = typeConfig[type];
                      const Icon = info.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, type })}
                          className={cn(
                            'p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all',
                            formData.type === type
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-earth-200 hover:border-earth-300'
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5',
                              formData.type === type ? info.color : 'text-earth-400'
                            )}
                          />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              formData.type === type ? info.color : 'text-earth-600'
                            )}
                          >
                            {info.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    折扣力度（%）
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="10"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    开始时间
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={formData.startTime || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    结束时间
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={formData.endTime || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-earth-700 mb-1.5">
                    活动描述
                  </label>
                  <textarea
                    className="input-field min-h-[60px] resize-none"
                    placeholder="请输入活动描述"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-earth-100">
                <h4 className="font-semibold text-earth-800 mb-3">选择门店</h4>
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-earth-800">参与活动菜品</h4>
                  <span className="text-sm text-earth-500">
                    已选 {formData.dishIds!.length} 道
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {dishes.map((dish) => {
                    const isSelected = formData.dishIds!.includes(dish.id);
                    return (
                      <button
                        key={dish.id}
                        onClick={() => toggleDish(dish.id)}
                        className={cn(
                          'p-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2',
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-earth-200 hover:border-earth-300'
                        )}
                      >
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
                          <p className="text-xs text-primary-600">{formatPrice(dish.storeItems[0]?.price || 0)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-earth-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                {editingId ? '保存修改' : '创建活动'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
