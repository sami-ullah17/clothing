import React, { useState } from 'react';
import { Product, ProductColor, Size, Review } from '../types';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  ChevronRight,
  Share2,
  Check,
  Sparkles,
  MessageCircle,
  AlertTriangle,
  MapPin,
  Shirt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product: initialProduct }) => {
  const {
    products,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentView,
    openWhatsAppOrder,
    formatPrice,
    settings,
    showToast,
    t,
    isRTL,
    getProductName,
    getSubcategoryName,
  } = useShop();

  // Find freshest version of product from context in case admin updated price/stock
  const product = products.find((p) => p.id === initialProduct.id) || initialProduct;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'reviews'>('details');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [localReviews, setLocalReviews] = useState<Review[]>(product.reviews || []);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.discountPrice ?? product.price;

  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';

  const localizedName = getProductName(product.id, product.name);
  const localizedSubcategory = getSubcategoryName(product.subcategory, product.subcategory);

  // Related products from same category or same subcategory
  const relatedProducts = products
    .filter(
      (p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory)
    )
    .slice(0, 4);

  const handleSelectColor = (color: ProductColor) => {
    setSelectedColor(color);
    if (color.image) {
      const foundIdx = product.images.findIndex((img) => img === color.image);
      if (foundIdx >= 0) {
        setActiveImageIndex(foundIdx);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock.', 'error');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleOrderOnWhatsApp = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock.', 'error');
      return;
    }
    openWhatsAppOrder({
      product,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings.storeName} — ${localizedName}`,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please fill out all review fields.', 'error');
      return;
    }

    const newRev: Review = {
      id: 'rev-' + Date.now(),
      author: reviewAuthor.trim(),
      rating: reviewRating,
      date: 'Just now',
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
      verified: true,
    };

    setLocalReviews([newRev, ...localReviews]);
    setReviewAuthor('');
    setReviewTitle('');
    setReviewComment('');
    setIsReviewFormOpen(false);
    showToast('Thank you! Your verified review was published.', 'success');
  };

  return (
    <div id="product-details-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 mb-8 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setCurrentView('home')}
          className="hover:text-neutral-900 transition-colors"
        >
          {t('nav.home')}
        </button>
        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
        <button
          onClick={() => setCurrentView(product.category as any)}
          className="hover:text-neutral-900 transition-colors capitalize"
        >
          {product.category}
        </button>
        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
        <span className="text-neutral-900 font-medium truncate max-w-[200px]">
          {localizedName}
        </span>
      </nav>

      {/* Product Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {product.images && product.images.length > 0 ? (
            <>
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] pb-2 sm:pb-0 scrollbar-none">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === index
                          ? 'border-neutral-950 ring-2 ring-neutral-950/20 shadow-sm'
                          : 'border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${localizedName} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Primary View */}
              <div className="flex-1 relative aspect-[3/4] sm:aspect-auto sm:h-[580px] rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={localizedName}
                  className="w-full h-full object-cover"
                />

                {/* Badges */}
                <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex flex-col gap-2`}>
                  {isOutOfStock ? (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-lg shadow">
                      Out of Stock
                    </span>
                  ) : (product.isSale || product.discountPrice) ? (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-lg shadow flex items-center gap-1">
                      <span>🔥 {t('product.save')} {product.salePercentage || discountPercent}%</span>
                    </span>
                  ) : null}

                  {product.isNewArrival && (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white rounded-lg shadow">
                      {t('product.newSeason')}
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-3 rounded-full backdrop-blur-md shadow-md transition-all ${
                    inWishlist
                      ? 'bg-white text-rose-600'
                      : 'bg-white/80 text-neutral-700 hover:bg-white hover:text-neutral-950'
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 relative aspect-[3/4] sm:aspect-auto sm:h-[580px] rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-100 via-stone-50 to-amber-50/50 border border-neutral-200 shadow-sm flex flex-col items-center justify-center p-8 text-center select-none">
              <div className="w-24 h-24 rounded-3xl bg-white shadow-md border border-neutral-200 flex items-center justify-center text-amber-800 mb-6">
                <Shirt className="w-12 h-12 text-neutral-800" />
              </div>
              <h3 className="font-serif-luxury text-2xl font-bold text-neutral-900 mb-2">
                {localizedName}
              </h3>
              <p className="text-xs text-amber-900 font-semibold tracking-widest uppercase mb-1">
                {settings.storeName || 'Pri-Buteeq'} • Pakpattan
              </p>
              <p className="text-xs text-neutral-500 max-w-sm">
                Authentic Pakistani Boutique Apparel. Original piece available at our boutique shop.
              </p>

              {/* Badges */}
              <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex flex-col gap-2`}>
                {(product.isSale || product.discountPrice) && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-lg shadow">
                    🔥 -{product.salePercentage || discountPercent}% SALE
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white rounded-lg shadow">
                    {t('product.newSeason')}
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-3 rounded-full bg-white/90 shadow-md text-neutral-700 hover:text-neutral-950`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Subcategory & Rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              {settings.storeName} • {localizedSubcategory}
            </span>
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-amber-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-800">
                {product.rating.toFixed(1)}
              </span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-neutral-500 hover:underline"
              >
                ({localReviews.length} {t('product.reviewsTab')})
              </button>
            </div>
          </div>

          {/* Product Name */}
          <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight mb-4">
            {localizedName}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-neutral-200">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold text-rose-700 bg-rose-100 rounded-md">
                  {t('product.save')} {formatPrice(product.price - product.discountPrice)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                {formatPrice(product.price)}
              </span>
            )}
            <span className={`text-xs text-neutral-500 ${isRTL ? 'mr-auto' : 'ml-auto'} flex items-center gap-1`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Inclusive of all taxes</span>
            </span>
          </div>

          {/* Stock Alert */}
          {isOutOfStock ? (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Currently Out of Stock. You can contact us on WhatsApp for backorder.</span>
            </div>
          ) : product.stock < 5 ? (
            <div className="mb-4 text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Only {product.stock} pieces left in stock — order soon!</span>
            </div>
          ) : null}

          {/* Description summary */}
          <p className="text-neutral-600 text-sm leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Color Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                {t('product.color')}: <span className="font-normal text-neutral-600">{selectedColor.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleSelectColor(color)}
                  className={`group relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor.name === color.name
                      ? 'ring-2 ring-neutral-950 ring-offset-2 border-transparent scale-110'
                      : 'border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name}`}
                >
                  {selectedColor.name === color.name && (
                    <Check className={`w-3.5 h-3.5 ${color.hex === '#FFFFFF' || color.hex === '#FFFDD0' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                {t('product.size')}: <span className="font-normal text-neutral-600">{selectedSize}</span>
              </span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 underline transition-colors"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{t('product.sizeGuide')}</span>
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                    selectedSize === size
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                      : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & WhatsApp Action Buttons */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-neutral-300 rounded-xl bg-white shadow-sm p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add To Bag */}
              <button
                id="add-to-cart-page-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-6 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : t('product.addToBag')}</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-3 border border-neutral-200 hover:border-neutral-400 rounded-xl text-neutral-600 hover:text-neutral-950 transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* ORDER ON WHATSAPP CTA */}
            <button
              id="order-on-whatsapp-btn"
              onClick={handleOrderOnWhatsApp}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all hover:shadow-xl active:scale-[0.99]"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : `Order on WhatsApp • ${formatPrice(currentPrice * quantity)}`}
              </span>
            </button>
          </div>

          {/* Guarantees & Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 mb-8">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-neutral-700 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Doorstep Delivery</p>
                <p className="text-[11px] text-neutral-500">Across Pakistan</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-neutral-700 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Easy Exchange</p>
                <p className="text-[11px] text-neutral-500">7-day hassle-free</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-neutral-700 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Studio Location</p>
                <p className="text-[11px] text-neutral-500">{settings.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Details, Shipping, Reviews */}
      <div className="border-t border-neutral-200 pt-10 mb-16">
        <div className="flex items-center justify-center gap-8 border-b border-neutral-200 pb-4 mb-8">
          {(['details', 'shipping', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-semibold text-sm pb-2 border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {tab === 'details' && t('product.detailsTab')}
              {tab === 'shipping' && t('product.shippingTab')}
              {tab === 'reviews' && `${t('product.reviewsTab')} (${localReviews.length})`}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          {activeTab === 'details' && (
            <div className="space-y-4 text-sm text-neutral-600">
              <p className="leading-relaxed">{product.description}</p>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                {product.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
              {product.composition && (
                <div className="pt-2 border-t border-neutral-100">
                  <span className="font-semibold text-neutral-900">{t('product.composition')}:</span>{' '}
                  {product.composition}
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3 text-sm text-neutral-600">
              <p>
                All orders are dispatched directly from our boutique studio in <strong>{settings.address}</strong> via trusted courier partners across Pakistan.
              </p>
              <p>
                Standard delivery time is 2-4 business days. You will receive WhatsApp tracking details as soon as your order is confirmed and dispatched.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-neutral-900">Verified Customer Reviews</h4>
                  <p className="text-xs text-neutral-500">Authentic feedback from our boutique patrons</p>
                </div>
                <button
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Form */}
              {isReviewFormOpen && (
                <form onSubmit={handleAddReview} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Review Title"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Your review comment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(false)}
                      className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {localReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-neutral-50/60 rounded-2xl border border-neutral-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-neutral-900">{rev.author}</span>
                      <span className="text-[11px] text-neutral-400">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400 mb-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-neutral-800 mb-1">{rev.title}</p>
                    <p className="text-xs text-neutral-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-neutral-200 pt-12">
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-neutral-950 mb-6">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
