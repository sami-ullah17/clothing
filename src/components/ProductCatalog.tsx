import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Size, SortOption, PageView } from '../types';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { SlidersHorizontal, Grid3X3, Grid2X2, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCatalogProps {
  initialCategory?: 'all' | 'men' | 'women' | 'kids';
  title?: string;
  subtitle?: string;
  forceOnlySale?: boolean;
  forceOnlyNew?: boolean;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  initialCategory = 'all',
  title,
  subtitle,
  forceOnlySale = false,
  forceOnlyNew = false,
}) => {
  const { products, currentView, setCurrentView, t, isRTL, getSubcategoryName } = useShop();

  // Filters
  const [category, setCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 60000]);
  const [onlySale, setOnlySale] = useState<boolean>(forceOnlySale);
  const [onlyNew, setOnlyNew] = useState<boolean>(forceOnlyNew);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [gridCols, setGridCols] = useState<3 | 4>(3);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category when view prop changes
  React.useEffect(() => {
    if (currentView === 'men' || currentView === 'women' || currentView === 'kids') {
      setCategory(currentView);
    } else if (currentView === 'sale') {
      setOnlySale(true);
      setCategory('all');
    } else if (currentView === 'new-arrivals') {
      setOnlyNew(true);
      setCategory('all');
    }
  }, [currentView]);

  const toggleSize = (size: Size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setCategory('all');
    setSelectedSubcategory('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 60000]);
    setOnlySale(false);
    setOnlyNew(false);
  };

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (priceRange[1] < 60000 ? 1 : 0) +
    (onlySale ? 1 : 0) +
    (onlyNew ? 1 : 0);

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (category !== 'all' && product.category !== category) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategory && product.subcategory !== selectedSubcategory) {
        return false;
      }

      // Sale filter
      if (onlySale && !product.discountPrice) {
        return false;
      }

      // New arrival filter
      if (onlyNew && !product.isNewArrival) {
        return false;
      }

      // Size filter
      if (
        selectedSizes.length > 0 &&
        !selectedSizes.some((s) => product.sizes.includes(s))
      ) {
        return false;
      }

      // Color filter
      if (
        selectedColors.length > 0 &&
        !selectedColors.some((c) =>
          product.colors.some((pc) => pc.name.toLowerCase() === c.toLowerCase())
        )
      ) {
        return false;
      }

      // Price filter
      const effectivePrice = product.discountPrice ?? product.price;
      if (effectivePrice > priceRange[1] || effectivePrice < priceRange[0]) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [
    category,
    selectedSubcategory,
    onlySale,
    onlyNew,
    selectedSizes,
    selectedColors,
    priceRange,
    sortBy,
  ]);

  // Page dynamic title
  const computedTitle =
    title ||
    (currentView === 'men'
      ? `${t('nav.men')} - StyleNest`
      : currentView === 'women'
      ? `${t('nav.women')} - StyleNest`
      : currentView === 'kids'
      ? `${t('nav.kids')} - StyleNest`
      : currentView === 'sale'
      ? `${t('nav.sale')} • Up to 40% Off`
      : currentView === 'new-arrivals'
      ? `${t('nav.newArrivals')}`
      : 'All Clothing Collections');

  const computedSubtitle =
    subtitle ||
    (currentView === 'sale'
      ? 'Exceptional garments from past and present capsules, priced for a limited time.'
      : 'Artisanal fabrication and contemporary aesthetics engineered to endure.');

  return (
    <div id="product-catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* Category Header */}
      <div className="pb-8 border-b border-neutral-200 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            StyleNest Wardrobe
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-950 mt-1">
            {computedTitle}
          </h1>
          <p className="text-neutral-500 text-sm mt-2 max-w-xl">
            {computedSubtitle}
          </p>
        </div>

        {/* Controls: Sorting & Grid toggles */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Mobile filter button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('catalog.filters')} {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-1.5 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs font-medium text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="featured">{t('catalog.featured')}</option>
              <option value="price-asc">{t('catalog.priceLowHigh')}</option>
              <option value="price-desc">{t('catalog.priceHighLow')}</option>
              <option value="newest">{t('catalog.newest')}</option>
              <option value="rating">{t('catalog.rating')}</option>
            </select>
          </div>

          {/* Desktop Grid Columns Toggle */}
          <div className="hidden sm:flex items-center border border-neutral-200 rounded-xl bg-neutral-100 p-0.5">
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 rounded-lg text-neutral-600 transition-colors ${
                gridCols === 3 ? 'bg-white text-neutral-950 shadow-sm' : 'hover:text-neutral-950'
              }`}
              title="3 Column Grid"
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 rounded-lg text-neutral-600 transition-colors ${
                gridCols === 4 ? 'bg-white text-neutral-950 shadow-sm' : 'hover:text-neutral-950'
              }`}
              title="4 Column Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-3 sticky top-28">
          <FilterSidebar
            category={category}
            setCategory={setCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
            selectedColors={selectedColors}
            toggleColor={toggleColor}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onlySale={onlySale}
            setOnlySale={setOnlySale}
            onlyNew={onlyNew}
            setOnlyNew={setOnlyNew}
            sortBy={sortBy}
            setSortBy={setSortBy}
            resetFilters={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden bg-neutral-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="w-full max-w-xs bg-white h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
                    <h3 className="font-bold text-base text-neutral-950 uppercase tracking-wider">
                      Filter Wardrobe
                    </h3>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-1 text-neutral-400 hover:text-neutral-950"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterSidebar
                    category={category}
                    setCategory={setCategory}
                    selectedSubcategory={selectedSubcategory}
                    setSelectedSubcategory={setSelectedSubcategory}
                    selectedSizes={selectedSizes}
                    toggleSize={toggleSize}
                    selectedColors={selectedColors}
                    toggleColor={toggleColor}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    onlySale={onlySale}
                    setOnlySale={setOnlySale}
                    onlyNew={onlyNew}
                    setOnlyNew={setOnlyNew}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    resetFilters={resetFilters}
                    activeFilterCount={activeFilterCount}
                  />
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="mt-6 w-full py-3 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md"
                >
                  View {filteredProducts.length} Results
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="lg:col-span-9">
          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-neutral-400 font-medium">{t('catalog.filters')}:</span>
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                  <span className="capitalize">{category}</span>
                  <button onClick={() => setCategory('all')}>×</button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                  <span>{getSubcategoryName(selectedSubcategory)}</span>
                  <button onClick={() => setSelectedSubcategory('')}>×</button>
                </span>
              )}
              {onlySale && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                  <span>{t('catalog.onlySale')}</span>
                  <button onClick={() => setOnlySale(false)}>×</button>
                </span>
              )}
              {onlyNew && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <span>{t('catalog.onlyNew')}</span>
                  <button onClick={() => setOnlyNew(false)}>×</button>
                </span>
              )}
              {selectedSizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"
                >
                  <span>{t('catalog.size')} {s}</span>
                  <button onClick={() => toggleSize(s)}>×</button>
                </span>
              ))}
              {selectedColors.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"
                >
                  <span>{c}</span>
                  <button onClick={() => toggleColor(c)}>×</button>
                </span>
              ))}
              <button
                onClick={resetFilters}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline ml-2 font-medium"
              >
                {t('catalog.clearAll')}
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 text-xs font-medium text-neutral-400">
            Displaying {filteredProducts.length} curated style{filteredProducts.length === 1 ? '' : 's'}
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-sm">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif-luxury text-2xl font-bold text-neutral-900 mb-2">
                Boutique Collection Updating
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6 leading-relaxed">
                Demo stock and placeholder items have been removed. Fresh Pakistani designer collections are being prepared. Store administrators can add new products directly from the Admin Panel.
              </p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors shadow"
              >
                Return to Store Home
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-neutral-200/80 p-8">
              <h3 className="font-serif-luxury text-xl font-bold text-neutral-900 mb-2">
                No Garments Match Your Filters
              </h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
                Try widening your price range or clearing color and size selections to see all pieces in this collection.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors shadow"
              >
                {t('catalog.resetFilters')}
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                gridCols === 4 ? 'xl:grid-cols-4 lg:grid-cols-3' : 'lg:grid-cols-3'
              } gap-6`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
