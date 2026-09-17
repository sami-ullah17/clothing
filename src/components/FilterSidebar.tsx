import React from 'react';
import { Size, SortOption } from '../types';
import { useShop } from '../context/ShopContext';
import { SlidersHorizontal, RotateCcw, Check, Sparkles } from 'lucide-react';

interface FilterSidebarProps {
  category: string;
  setCategory: (cat: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  selectedSizes: Size[];
  toggleSize: (size: Size) => void;
  selectedColors: string[];
  toggleColor: (color: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  onlySale: boolean;
  setOnlySale: (val: boolean) => void;
  onlyNew: boolean;
  setOnlyNew: (val: boolean) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

const AVAILABLE_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const AVAILABLE_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Navy', hex: '#1B263B' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Emerald', hex: '#046307' },
  { name: 'Champagne', hex: '#F7E7CE' },
];

const SUBCATEGORIES = [
  'All Styles',
  'Jackets & Coats',
  'Dresses',
  'Knitwear',
  'Shirts',
  'Pants',
  'Hoodies & Sweats',
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  category,
  setCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedSizes,
  toggleSize,
  selectedColors,
  toggleColor,
  priceRange,
  setPriceRange,
  onlySale,
  setOnlySale,
  onlyNew,
  setOnlyNew,
  resetFilters,
  activeFilterCount,
}) => {
  const { formatPrice, t, getSubcategoryName } = useShop();

  return (
    <aside className="w-full space-y-7 p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-900" />
          <h3 className="font-bold text-sm tracking-wider uppercase text-neutral-900">
            {t('catalog.filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}
          </h3>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-950 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('catalog.clearAll')}</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
          {t('catalog.category')}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: t('nav.home') === 'Home' ? 'All' : 'All' },
            { id: 'women', label: t('nav.women') },
            { id: 'men', label: t('nav.men') },
            { id: 'kids', label: t('nav.kids') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === item.id
                  ? 'bg-neutral-950 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2.5">
          {t('catalog.category')}
        </h4>
        <div className="space-y-1">
          {SUBCATEGORIES.map((sub) => {
            const isSelected =
              (sub === 'All Styles' && !selectedSubcategory) ||
              selectedSubcategory === sub;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub === 'All Styles' ? '' : sub)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'font-bold text-neutral-950 bg-neutral-100'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                <span>{sub === 'All Styles' ? sub : getSubcategoryName(sub)}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Highlights: Sale & New */}
      <div className="pt-4 border-t border-neutral-100 space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlySale}
            onChange={(e) => setOnlySale(e.target.checked)}
            className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-950 border-neutral-300"
          />
          <span className="text-xs font-semibold text-neutral-800">
            {t('catalog.onlySale')}
          </span>
          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded">
            PROMO
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={(e) => setOnlyNew(e.target.checked)}
            className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-950 border-neutral-300"
          />
          <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
            <span>{t('catalog.onlyNew')}</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </span>
        </label>
      </div>

      {/* Size Filter */}
      <div className="pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            {t('catalog.size')}
          </h4>
          {selectedSizes.length > 0 && (
            <span className="text-[11px] text-neutral-400">
              {selectedSizes.join(', ')}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {AVAILABLE_SIZES.map((sz) => {
            const active = selectedSizes.includes(sz);
            return (
              <button
                key={sz}
                onClick={() => toggleSize(sz)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  active
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div className="pt-4 border-t border-neutral-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
          {t('catalog.color')}
        </h4>
        <div className="grid grid-cols-4 gap-2.5">
          {AVAILABLE_COLORS.map((col) => {
            const active = selectedColors.includes(col.name);
            return (
              <button
                key={col.name}
                onClick={() => toggleColor(col.name)}
                className={`group flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                  active
                    ? 'border-neutral-950 bg-neutral-50 shadow-sm'
                    : 'border-transparent hover:bg-neutral-50'
                }`}
                title={col.name}
              >
                <div
                  className={`w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center ${
                    active ? 'ring-2 ring-neutral-950 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: col.hex }}
                >
                  {active && (
                    <Check
                      className={`w-3 h-3 ${
                        col.hex === '#FFFFFF' || col.hex === '#F7E7CE'
                          ? 'text-black'
                          : 'text-white'
                      }`}
                    />
                  )}
                </div>
                <span className="text-[10px] text-neutral-600 truncate max-w-[48px]">
                  {col.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            {t('catalog.maxPrice')}: <span className="font-extrabold text-neutral-950">{formatPrice(priceRange[1])}</span>
          </h4>
          <span className="text-[11px] text-neutral-400">Up to {formatPrice(60000)}</span>
        </div>
        <input
          type="range"
          min={3000}
          max={60000}
          step={1000}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-neutral-950 cursor-pointer"
        />
      </div>
    </aside>
  );
};
