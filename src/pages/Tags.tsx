import { useState } from 'react';
import { Plus, Edit3, Trash2, Tag, X, Flame, Leaf } from 'lucide-react';
import { useTagStore } from '@/store/tagStore';
import { cn } from '@/utils/format';
import type { Tag as TagType } from '@/types';

const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
];

export const Tags = () => {
  const { tags, addTag, updateTag, deleteTag, getCategories, activeCategory, setActiveCategory } =
    useTagStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TagType>>({
    name: '',
    category: '',
    color: '#f97316',
    icon: 'Tag',
    type: 'other',
  });

  const categories = getCategories();

  const openForm = (tag?: TagType) => {
    if (tag) {
      setFormData(tag);
      setEditingId(tag.id);
    } else {
      setFormData({
        name: '',
        category: activeCategory === '全部' ? '' : activeCategory,
        color: '#f97316',
        icon: 'Tag',
        type: 'other',
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    if (editingId) {
      updateTag(editingId, formData);
    } else {
      addTag(formData);
    }
    setShowForm(false);
  };

  const filteredTags =
    activeCategory === '全部'
      ? tags
      : tags.filter((t) => t.category === activeCategory);

  const typeLabels: Record<string, string> = {
    spiciness: '辣度',
    dietary: '忌口',
    ingredient: '食材',
    other: '其他',
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title mb-1">口味标签管理</h3>
            <p className="text-sm text-earth-500">共 {tags.length} 个标签</p>
          </div>
          <button
            onClick={() => openForm()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增标签
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                activeCategory === cat
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-warm-50 text-earth-600 hover:bg-warm-100'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {(['spiciness', 'dietary', 'ingredient', 'other'] as const).map((type) => {
        const typeTags = filteredTags.filter((t) => t.type === type);
        if (typeTags.length === 0) return null;

        return (
          <div key={type} className="card p-5">
            <h4 className="font-semibold text-earth-800 mb-4 flex items-center gap-2">
              {type === 'spiciness' && <Flame className="w-5 h-5 text-orange-500" />}
              {type === 'dietary' && <Leaf className="w-5 h-5 text-green-500" />}
              {type === 'ingredient' && <Tag className="w-5 h-5 text-purple-500" />}
              {type === 'other' && <Tag className="w-5 h-5 text-blue-500" />}
              {typeLabels[type]}标签
              <span className="text-sm font-normal text-earth-400 ml-1">
                ({typeTags.length})
              </span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {typeTags.map((tag) => (
                <div
                  key={tag.id}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-full cursor-default"
                  style={{ backgroundColor: `${tag.color}15` }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></span>
                  <span className="font-medium" style={{ color: tag.color }}>
                    {tag.name}
                  </span>
                  <span className="text-xs text-earth-400 ml-1">· {tag.category}</span>
                  <div className="absolute -right-1 -top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openForm(tag)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-earth-50"
                    >
                      <Edit3 className="w-3 h-3 text-earth-600" />
                    </button>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="p-1 bg-white rounded-full shadow-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-earth-100">
              <h3 className="text-lg font-bold text-earth-800">
                {editingId ? '编辑标签' : '新增标签'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl hover:bg-warm-100"
              >
                <X className="w-5 h-5 text-earth-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">
                  标签名称
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="请输入标签名称"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">
                  标签分类
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="如：辣度、忌口、推荐"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">
                  标签类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['spiciness', 'dietary', 'ingredient', 'other'] as const).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, type })}
                        className={cn(
                          'py-2 px-3 rounded-xl text-sm font-medium transition-all border-2',
                          formData.type === type
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-earth-200 text-earth-600 hover:border-earth-300'
                        )}
                      >
                        {typeLabels[type]}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-2">
                  标签颜色
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-earth-400 scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-warm-50 rounded-xl flex items-center justify-center">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${formData.color}20`,
                    color: formData.color,
                  }}
                >
                  {formData.name || '标签预览'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-earth-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                {editingId ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
