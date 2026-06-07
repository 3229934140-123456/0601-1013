import { useState } from 'react';
import {
  Star,
  MessageSquare,
  Crown,
  Filter,
  ThumbsUp,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { useReviewStore } from '@/store/reviewStore';
import { useDishStore } from '@/store/dishStore';
import { cn, formatDate } from '@/utils/format';

export const Reviews = () => {
  const {
    reviews,
    filterRating,
    setFilterRating,
    sortBy,
    setSortBy,
    onlyFeatured,
    setOnlyFeatured,
    toggleFeatured,
    getFilteredReviews,
  } = useReviewStore();
  const { dishes, toggleSignature, getLowStockDishes } = useDishStore();

  const [showFilter, setShowFilter] = useState(false);

  const filteredReviews = getFilteredReviews();

  const getDishById = (id: string) => dishes.find((d) => d.id === id);

  const signatureDishes = dishes.filter((d) => d.isSignature);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-earth-200'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="stat-label">总评价数</p>
            <p className="text-2xl font-bold text-earth-800">{reviews.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <ThumbsUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="stat-label">好评（4-5星）</p>
            <p className="text-2xl font-bold text-green-600">
              {reviews.filter((r) => r.rating >= 4).length}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <Star className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="stat-label">精选评价</p>
            <p className="text-2xl font-bold text-primary-600">
              {reviews.filter((r) => r.isFeatured).length}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="stat-label">招牌菜品</p>
            <p className="text-2xl font-bold text-purple-600">
              {signatureDishes.length}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-earth-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            招牌菜品（置顶展示）
          </h3>
          <span className="text-sm text-earth-500">
            共 {signatureDishes.length} 道招牌菜
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {dishes.slice(0, 8).map((dish) => (
            <button
              key={dish.id}
              onClick={() => toggleSignature(dish.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all',
                dish.isSignature
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-earth-200 hover:border-earth-300'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-earth-100 overflow-hidden flex-shrink-0">
                {dish.images[0] ? (
                  <img src={dish.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-earth-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-earth-800">{dish.name}</p>
                <p className="text-xs text-earth-500">¥{dish.price}</p>
              </div>
              {dish.isSignature && (
                <Crown className="w-4 h-4 text-amber-500 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-earth-800">用户评价</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                筛选
                <ChevronDown className="w-4 h-4" />
              </button>

              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-earth-100 p-4 z-10 animate-slide-up">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-earth-700 mb-2">
                        评分筛选
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[0, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setFilterRating(rating)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                              filterRating === rating
                                ? 'bg-primary-500 text-white'
                                : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                            )}
                          >
                            {rating === 0 ? '全部' : `${rating}星+`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-earth-700 mb-2">
                        排序方式
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSortBy('newest')}
                          className={cn(
                            'flex-1 py-1.5 rounded-lg text-sm font-medium transition-all',
                            sortBy === 'newest'
                              ? 'bg-primary-500 text-white'
                              : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                          )}
                        >
                          最新
                        </button>
                        <button
                          onClick={() => setSortBy('rating')}
                          className={cn(
                            'flex-1 py-1.5 rounded-lg text-sm font-medium transition-all',
                            sortBy === 'rating'
                              ? 'bg-primary-500 text-white'
                              : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                          )}
                        >
                          评分最高
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-earth-700">只看精选</span>
                      <button
                        onClick={() => setOnlyFeatured(!onlyFeatured)}
                        className={cn(
                          'w-11 h-6 rounded-full transition-colors relative',
                          onlyFeatured ? 'bg-primary-500' : 'bg-earth-300'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                            onlyFeatured ? 'translate-x-5' : 'translate-x-0.5'
                          )}
                        ></div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const dish = getDishById(review.dishId);
          return (
            <div key={review.id} className="card p-5 group">
              <div className="flex items-start gap-4">
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-earth-800">
                          {review.userName}
                        </h4>
                        {review.isFeatured && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-medium rounded-full">
                            精选
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-earth-500">
                          {formatDate(review.createdAt)}
                        </span>
                        {dish && (
                          <span className="text-xs px-2 py-0.5 bg-warm-100 text-earth-600 rounded-full">
                            {dish.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatured(review.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100',
                        review.isFeatured
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                      )}
                    >
                      {review.isFeatured ? '取消精选' : '设为精选'}
                    </button>
                  </div>

                  <p className="text-earth-600 mb-3 leading-relaxed">
                    {review.content}
                  </p>

                  {review.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.images.map((img, index) => (
                        <div
                          key={index}
                          className="w-20 h-20 rounded-xl overflow-hidden bg-earth-100"
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-earth-300" />
          <p className="text-earth-500">没有找到符合条件的评价</p>
        </div>
      )}
    </div>
  );
};
