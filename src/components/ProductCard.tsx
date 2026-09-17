import React, { useState } from 'react';
import { Product, ProductColor, Size } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, Star, ShoppingBag, Eye, Check, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    openProductDetails,
    formatPrice,
    t,
    getProductName,
    getSubcategoryName,
    showToast,
  } = useShop();

  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0] || 'M');
  const [isSizeSelectorOpen, setIsSizeSelectorOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      showToast('Product is currently out of stock', 'error');
      return;
    }
    addToCart(product, selectedSize, selectedColor, 1);
    setIsSizeSelectorOpen(false);
  };

  const localizedName = getProductName(product);
  const localizedSubcategory = getSubcategoryName(product.subcategory);

  return (
    <motion.div
      id={`product-card-${product.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        isOutOfStock
          ? 'border-neutral-200/50 opacity-90'
          : 'border-neutral-200/70 hover:shadow-xl hover:border-neutral-300'
      }`}
    >
      {/* Product Image Area */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 cursor-pointer"
        onClick={() => openProductDetails(product)}
      >
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={localizedName}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider bg-rose-600 text-white rounded-md shadow-sm">
              Out of Stock
            </span>
          ) : (
            <>
              {product.discountPrice && (
                <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider bg-rose-600 text-white rounded-md shadow-sm">
                  -{discountPercent}% {t('card.sale')}
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider bg-neutral-900 text-white rounded-md shadow-sm">
                  {t('card.new')}
                </span>
              )}
              {product.isBestSeller && !product.discountPrice && (
                <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider bg-amber-700 text-white rounded-md shadow-sm">
                  {t('card.bestseller')}
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Icon Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-white text-rose-600 shadow-md scale-110'
              : 'bg-white/80 text-neutral-600 hover:text-neutral-950 hover:bg-white hover:scale-110'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Quick Action Overlay (Desktop) */}
        <div className="absolute inset-x-3 bottom-3 hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              openProductDetails(product);
            }}
            className="flex-1 py-2.5 px-3 bg-white/95 hover:bg-white text-neutral-900 text-xs font-semibold rounded-xl shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors border border-neutral-200/50"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('card.viewDetails')}</span>
          </button>

          {!isOutOfStock && (
            <button
              id={`quick-cart-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsSizeSelectorOpen(!isSizeSelectorOpen);
              }}
              className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-lg flex items-center justify-center transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Size Picker popover */}
        {isSizeSelectorOpen && !isOutOfStock && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-neutral-200 z-30 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
                {t('card.selectSize')}:
              </span>
              <button
                onClick={() => setIsSizeSelectorOpen(false)}
                className="text-[11px] text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-2.5">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                    selectedSize === sz
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
            <button
              onClick={handleQuickAdd}
              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('card.confirmAdd')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Subcategory & Rating */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-neutral-400 tracking-wide uppercase">
              {localizedSubcategory}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-neutral-800">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-neutral-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => openProductDetails(product)}
            className="text-sm sm:text-base font-medium text-neutral-900 hover:text-neutral-600 cursor-pointer transition-colors line-clamp-1 mb-2"
          >
            {localizedName}
          </h3>

          {/* Color Swatches */}
          <div className="flex items-center gap-1.5 mb-3">
            {product.colors.map((c, idx) => (
              <button
                key={c.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(c);
                  if (product.images[idx]) {
                    setCurrentImageIndex(idx);
                  }
                }}
                className={`relative w-4 h-4 rounded-full border transition-all ${
                  selectedColor.name === c.name
                    ? 'ring-2 ring-neutral-900 ring-offset-1 scale-110 border-transparent'
                    : 'border-neutral-300 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={`Color ${c.name}`}
              />
            ))}
            <span className="text-[11px] text-neutral-400 ml-1">
              {product.colors.length} {t('card.colors')}
            </span>
          </div>
        </div>

        {/* Pricing & Mobile Action Buttons */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-base sm:text-lg font-bold text-neutral-950">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-xs sm:text-sm text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg font-bold text-neutral-950">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => openProductDetails(product)}
              className="p-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
              aria-label="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!isOutOfStock ? (
              <button
                onClick={() => addToCart(product, selectedSize, selectedColor, 1)}
                className="px-3 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg flex items-center gap-1 shadow-sm"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('card.add')}</span>
              </button>
            ) : (
              <span className="px-2 py-1 text-[10px] font-bold bg-neutral-100 text-neutral-500 rounded">
                Out
              </span>
            )}
          </div>

          {/* Desktop Direct "View Details" text link */}
          <button
            onClick={() => openProductDetails(product)}
            className="hidden md:inline-flex text-xs font-medium text-neutral-500 hover:text-neutral-950 transition-colors underline-offset-4 hover:underline"
          >
            {t('card.viewDetails')} →
          </button>
        </div>
      </div>
    </motion.div>
  );
};
