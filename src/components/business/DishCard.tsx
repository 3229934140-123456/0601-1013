import {
  Edit3,
  Trash2,
  Eye,
  Heart,
  Star,
  ImageOff,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Crown,
  Package,
} from 'lucide-react';
import type { Dish } from '@/types';
import { useDishStore } from '@/store/dishStore';
import { useTagStore } from '@/store/tagStore';
import { useUIStore } from '@/store/uiStore';
import { cn, formatPrice, getSpicinessText } from '@/utils/format';

interface DishCardProps {
  dish: Dish;
  selected?: boolean;
  onSelect?: () => void;
}

export const DishCard = ({ dish, selected, onSelect }: DishCardProps) => {
  const { toggleOnSale, toggleSignature, deleteDish } = useDishStore();
  const { openDishModal } = useUIStore();
  const { tags } = useTagStore();

  const dishTags = dish.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean)
    .slice(0, 3);

  const hasMissingImage = dish.images.length === 0;
  const hasMissingPrice = dish.price <= 0;
  const hasIssue = hasMissingImage || hasMissingPrice;

  const isLowStock = dish.stock <= dish.stockWarning && dish.isOnSale;

  return (
    <div
      className={cn(
        'card card-hover overflow-hidden relative group',
        selected && 'ring-2 ring-primary-500 ring-offset-2',
        !dish.isOnSale && 'opacity-70'
      )}
    >
      {onSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="absolute top-3 left-3 z-10 w-5 h-5 rounded border-2 bg-white flex items-center justify-center transition-colors"
          style={{ borderColor: selected ? '#f97316' : '#d2bab0' }}
        >
          {selected && (
            <div className="w-3 h-3 rounded-full bg-primary-500"></div>
          )}
        </button>
      )}

      {dish.isSignature && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {hasIssue && (
        <div className="absolute bottom-3 right-3 z-10">
          <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            信息不全
          </div>
        </div>
      )}

      {!dish.isOnSale && (
        <div className="absolute inset-0 z-5 bg-black/10 flex items-center justify-center">
          <span className="px-3 py-1.5 bg-earth-700 text-white text-sm font-medium rounded-full">
            已下架
          </span>
        </div>
      )}

      <div
        className="aspect-[4/3] bg-earth-100 relative overflow-hidden cursor-pointer"
        onClick={() => openDishModal(dish.id)}
      >
        {dish.images[0] ? (
          <img
            src={dish.images[0]}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-earth-400 gap-2">
            <ImageOff className="w-10 h-10" />
            <span className="text-sm">暂无图片</span>
          </div>
        )}

        {dish.isLimited && dish.isOnSale && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Package className="w-4 h-4" />
              <span>
                限量 {dish.dailyLimit} 份 / 剩余 {dish.stock} 份
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-earth-800 text-base mb-0.5 line-clamp-1">
              {dish.name}
            </h3>
            <span className="text-xs text-earth-500">{dish.category}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary-600">
              {formatPrice(dish.price)}
            </div>
            {dish.originalPrice > dish.price && dish.price > 0 && (
              <div className="text-xs text-earth-400 line-through">
                {formatPrice(dish.originalPrice)}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-earth-500 line-clamp-2 mb-3 h-10">
          {dish.description || '暂无描述'}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {dish.spicinessLevel > 0 && (
            <span className="tag-chip bg-red-50 text-red-600">
              {getSpicinessText(dish.spicinessLevel)}
            </span>
          )}
          {dishTags.map((tag) =>
            tag ? (
              <span
                key={tag.id}
                className="tag-chip"
                style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
              >
                {tag.name}
              </span>
            ) : null
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-earth-500 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {dish.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {dish.favorites}
            </span>
          </div>
          <span>{dish.portion || '未设置分量'}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-earth-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleOnSale(dish.id)}
              className="p-1.5 rounded-lg hover:bg-warm-100 transition-colors"
              title={dish.isOnSale ? '点击下架' : '点击上架'}
            >
              {dish.isOnSale ? (
                <ToggleRight className="w-5 h-5 text-primary-500" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-earth-400" />
              )}
            </button>
            <button
              onClick={() => toggleSignature(dish.id)}
              className="p-1.5 rounded-lg hover:bg-warm-100 transition-colors"
              title={dish.isSignature ? '取消招牌' : '设为招牌'}
            >
              <Star
                className={cn(
                  'w-5 h-5',
                  dish.isSignature
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-earth-400'
                )}
              />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => openDishModal(dish.id)}
              className="p-1.5 rounded-lg hover:bg-warm-100 transition-colors text-earth-500 hover:text-primary-600"
              title="编辑"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteDish(dish.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-earth-500 hover:text-red-500"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
