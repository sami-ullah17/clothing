import React, { useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { SAMPLE_PRODUCTS } from '../data/products';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SearchBar: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    openProductDetails,
  } = useShop();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Global '/' keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = cleanQuery
    ? SAMPLE_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.subcategory.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          p.description.toLowerCase().includes(cleanQuery) ||
          p.colors.some((c) => c.name.toLowerCase().includes(cleanQuery))
      )
    : [];

  const popularSearches = ['Overcoat', 'Silk Dress', 'Cashmere', 'Hoodie', 'Denim', 'Puffer'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center p-4 sm:p-6 md:p-12 bg-neutral-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-neutral-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-6 py-4 border-b border-neutral-100 gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clothing styles, colors, materials..."
            className="flex-1 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Popular Tags */}
        <div className="px-6 py-3 bg-neutral-50/80 border-b border-neutral-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-neutral-400 font-medium flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Popular:
          </span>
          {popularSearches.map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-2.5 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-900 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[420px] overflow-y-auto p-4">
          {cleanQuery ? (
            filteredProducts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 px-2 uppercase tracking-wider mb-2">
                  Found {filteredProducts.length} matching pieces
                </p>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      openProductDetails(p);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-neutral-50 cursor-pointer transition-colors group"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-14 h-16 object-cover rounded-xl bg-neutral-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="uppercase font-medium">{p.category}</span>
                        <span>•</span>
                        <span>{p.subcategory}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-neutral-900 group-hover:text-amber-800 transition-colors truncate">
                        {p.name}
                      </h4>
                      <p className="text-xs font-bold text-neutral-950 mt-0.5">
                        ${p.discountPrice ?? p.price}
                        {p.discountPrice && (
                          <span className="text-neutral-400 line-through font-normal ml-1.5">
                            ${p.price}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-neutral-400">
                <p className="text-sm font-medium text-neutral-700">No matching garments found for "{searchQuery}"</p>
                <p className="text-xs mt-1 text-neutral-400">Try searching for generic terms like "wool", "jacket", or "silk".</p>
              </div>
            )
          ) : (
            <div className="py-8 text-center text-neutral-400 text-xs">
              Type keywords above to discover seasonal apparel.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
