import { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Check, Building2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useStoreStore } from '@/store/storeStore';

export const StoreSelector = () => {
  const { currentStoreId, setCurrentStoreId } = useUIStore();
  const { stores } = useStoreStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentStoreName =
    currentStoreId === 'all'
      ? '全部门店'
      : stores.find((s) => s.id === currentStoreId)?.name || '全部门店';

  const activeStores = stores.filter((s) => s.isActive);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-warm-50 hover:bg-warm-100 border border-warm-200 rounded-xl transition-colors"
      >
        <Store className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-medium text-earth-700">{currentStoreName}</span>
        <ChevronDown className={`w-4 h-4 text-earth-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-earth-100 py-1.5 z-50 animate-fade-in">
          <button
            onClick={() => {
              setCurrentStoreId('all');
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-warm-50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-earth-800">全部门店</p>
              <p className="text-xs text-earth-500">查看所有门店数据</p>
            </div>
            {currentStoreId === 'all' && <Check className="w-4 h-4 text-primary-500" />}
          </button>

          <div className="border-t border-earth-100 my-1"></div>

          {activeStores.map((store) => (
            <button
              key={store.id}
              onClick={() => {
                setCurrentStoreId(store.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-warm-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center">
                <Store className="w-4 h-4 text-earth-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-earth-800 truncate">{store.name}</p>
                <p className="text-xs text-earth-500 truncate">{store.address}</p>
              </div>
              {currentStoreId === store.id && <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
