import React from 'react';
import { useShop } from '../context/ShopContext';
import { SAMPLE_PRODUCTS } from '../data/products';
import { Heart, X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    openProductDetails,
    setCurrentView,
    formatPrice,
    t,
    isRTL,
    getProductName,
    getSubcategoryName,
  } = useShop();

  if (!isWishlistOpen) return null;

  const wishlistProducts = SAMPLE_PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className={`fixed inset-0 z-50 flex ${isRTL ? 'justify-start' : 'justify-end'} bg-neutral-950/60 backdrop-blur-sm transition-opacity`}>
      <motion.div
        initial={{ x: isRTL ? '-100%' : '100%' }}
        animate={{ x: 0 }}
        exit={{ x: isRTL ? '-100%' : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-neutral-200"
      >
        {/* Wishlist Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-serif-luxury text-xl font-bold text-neutral-950">
              {t('wishlist.title')}
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold bg-neutral-100 text-neutral-800 rounded-full">
              {wishlist.length}
            </span>
          </div>

          <button
            id="close-wishlist-drawer-btn"
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-serif-luxury text-lg font-bold text-neutral-900 mb-1">
                {t('wishlist.empty')}
              </h4>
              <p className="text-neutral-500 text-xs max-w-xs mb-6">
                {t('wishlist.emptyDesc')}
              </p>
              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  setCurrentView('new-arrivals');
                }}
                className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-colors"
              >
                {t('wishlist.browse')}
              </button>
            </div>
          ) : (
            wishlistProducts.map((product) => {
              const localizedName = getProductName(product.id, product.name);
              const localizedSubcategory = getSubcategoryName(product.subcategory, product.subcategory);
              return (
                <div
                  key={product.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition-colors shadow-sm"
                >
                  <img
                    src={product.images[0]}
                    alt={localizedName}
                    onClick={() => {
                      openProductDetails(product);
                      setIsWishlistOpen(false);
                    }}
                    className="w-20 h-24 object-cover rounded-xl bg-neutral-100 cursor-pointer flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            openProductDetails(product);
                            setIsWishlistOpen(false);
                          }}
                          className="text-sm font-semibold text-neutral-900 truncate hover:text-amber-800 cursor-pointer"
                        >
                          {localizedName}
                        </h4>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-0.5"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-neutral-500 mt-0.5 capitalize">
                        {t(`nav.${product.category}`)} • {localizedSubcategory}
                      </p>

                      <p className="text-sm font-bold text-neutral-950 mt-1">
                        {formatPrice(product.discountPrice ?? product.price)}
                        {product.discountPrice && (
                          <span className="text-neutral-400 text-xs line-through ml-1.5 font-normal">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => {
                          addToCart(product, product.sizes[0], product.colors[0], 1);
                          toggleWishlist(product.id);
                        }}
                        className="flex-1 py-1.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t('wishlist.moveToBag')}</span>
                      </button>
                      <button
                        onClick={() => {
                          openProductDetails(product);
                          setIsWishlistOpen(false);
                        }}
                        className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg text-xs"
                        title="View Details"
                      >
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
