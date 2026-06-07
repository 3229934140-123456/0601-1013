import { useState } from 'react';
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
} from 'lucide-react';
import { useActivityStore } from '@/store/activityStore';
import { useDishStore } from '@/store/dishStore';
import { useStoreStore } from '@/store/storeStore';
import { cn, formatDate } from '@/utils/format';
import type { Activity } from '@/types';

const statusConfig = {
  active: { label: '进行中', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  scheduled: { label: '待开始', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  ended: { label: '已结束', color: 'text-earth-500', bg: 'bg-earth-100', dot: 'bg-earth-400' },
  draft: { label: '草稿', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
};

const typeConfig = {
  discount: { label: '折扣活动', icon: Percent, color: 'text-purple-600' },
  new: { label: '新品上市', icon: Sparkles, color: 'text-orange-600' },
  limited: { label: '限量特供', icon: Timer, color: 'text-red-600' },
};

export const Activities = () => {
  const { activities, addActivity, updateActivity, deleteActivity, updateStatus } = useActivityStore();
  const { dishes } = useDishStore();
  const { stores } = useStoreStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const filteredActivities =
    filterStatus === 'all'
      ? activities
      : activities.filter((a) => a.status === filterStatus);

  const openForm = (activity?: Activity) => {
    if (activity) {
      setFormData(activity);
      setEditingId(activity.id);
    } else {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFormData({
        name: '',
        type: 'discount',
        discount: 10,
        startTime: now.toISOString().slice(0, 16),
        endTime: nextWeek.toISOString().slice(0, 16),
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
    if (editingId) {
      updateActivity(editingId, formData);
    } else {
      addActivity(formData);
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

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title mb-1">活动排期</h3>
            <p className="text-sm text-earth-500">共 {activities.length} 个活动</p>
          </div>
          <div className="flex items-center gap-3">
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

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-earth-200"></div>
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const status = statusConfig[activity.status];
            const typeInfo = typeConfig[activity.type];
            const TypeIcon = typeInfo.icon;
            const activityDishes = activity.dishIds
              .map((id) => dishes.find((d) => d.id === id))
              .filter(Boolean);
            const activityStores = activity.storeIds
              .map((id) => stores.find((s) => s.id === id))
              .filter(Boolean);

            return (
              <div key={activity.id} className="relative pl-14">
                <div
                  className={cn(
                    'absolute left-4 w-5 h-5 rounded-full border-4 border-white z-10',
                    status.dot,
                    'shadow-md'
                  )}
                ></div>

                <div className="card p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          activity.status === 'active'
                            ? 'bg-green-100'
                            : activity.status === 'scheduled'
                            ? 'bg-blue-100'
                            : 'bg-earth-100'
                        )}
                      >
                        <TypeIcon
                          className={cn(
                            'w-6 h-6',
                            activity.status === 'active'
                              ? 'text-green-600'
                              : activity.status === 'scheduled'
                              ? 'text-blue-600'
                              : 'text-earth-500'
                          )}
                        />
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
                        </div>
                        <p className="text-sm text-earth-500 mb-2">
                          {activity.description || '暂无描述'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-earth-500">
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
                    value={formData.startTime}
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
                    value={formData.endTime}
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
                          <p className="text-xs text-primary-600">¥{dish.price}</p>
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
