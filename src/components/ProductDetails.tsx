import React, { useState } from 'react';
import { Product, ProductColor, Size, Review } from '../types';
import { useShop } from '../context/ShopContext';
import { SAMPLE_PRODUCTS } from '../data/products';
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
  MessageSquarePlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentView,
    setIsCheckoutOpen,
    formatPrice,
    showToast,
    t,
    isRTL,
    getProductName,
    getSubcategoryName,
  } = useShop();

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

  const localizedName = getProductName(product.id, product.name);
  const localizedSubcategory = getSubcategoryName(product.subcategory, product.subcategory);

  // Related products from same category or same subcategory
  const relatedProducts = SAMPLE_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory)
  ).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsCheckoutOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `StyleNest — ${localizedName}`,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(t('product.share'), 'info');
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
        <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 ${isRTL ? 'rotate-180' : ''}`} />
        <button
          onClick={() => setCurrentView(product.category)}
          className="capitalize hover:text-neutral-900 transition-colors"
        >
          {t(`nav.${product.category}`)}
        </button>
        <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 ${isRTL ? 'rotate-180' : ''}`} />
        <span className="text-neutral-400">{localizedSubcategory}</span>
        <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 ${isRTL ? 'rotate-180' : ''}`} />
        <span className="text-neutral-900 font-medium truncate max-w-[200px]">
          {localizedName}
        </span>
      </nav>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] scrollbar-thin">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 sm:w-20 md:w-24 aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-neutral-950 shadow-md scale-102'
                    : 'border-neutral-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${localizedName} view ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>

          {/* Large Hero Main Image */}
          <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
                src={product.images[activeImageIndex] || product.images[0]}
                alt={localizedName}
                className="w-full h-full object-cover object-center"
              />
            </AnimatePresence>

            {/* Badges on main image */}
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex flex-col gap-2`}>
              {product.discountPrice && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded-lg shadow">
                  {t('product.save')} {discountPercent}%
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
        </div>

        {/* Right Column: Product Info & Purchase Form */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Subcategory & Rating */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              StyleNest Studio • {localizedSubcategory}
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
              {t('product.inclusiveGst')}
            </span>
          </div>

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
                  onClick={() => setSelectedColor(color)}
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

          {/* Quantity & Actions */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-neutral-300 rounded-xl bg-white shadow-sm p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add To Cart */}
              <button
                id="add-to-cart-page-btn"
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('product.addToBag')} • {formatPrice(currentPrice * quantity)}</span>
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

            {/* Buy Now Button */}
            <button
              id="buy-now-btn"
              onClick={handleBuyNow}
              className="w-full py-3 px-6 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99]"
            >
              {t('product.buyNow')}
            </button>
          </div>

          {/* Guarantees & Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 mb-8">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-neutral-700 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">{t('hero.freeDelivery')}</p>
                <p className="text-[11px] text-neutral-500">{t('hero.freeDeliverySub')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-neutral-700 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">{t('hero.easyExchange')}</p>
                <p className="text-[11px] text-neutral-500">{t('hero.easyExchangeSub')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-700 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">{t('hero.artisanalQuality')}</p>
                <p className="text-[11px] text-neutral-500">{t('hero.artisanalQualitySub')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="mt-14 border-t border-neutral-200 pt-10">
        <div className="flex items-center gap-8 border-b border-neutral-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 text-sm font-bold tracking-wide uppercase transition-all relative ${
              activeTab === 'details'
                ? 'text-neutral-950 border-b-2 border-neutral-950'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t('product.descTab')}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 text-sm font-bold tracking-wide uppercase transition-all relative ${
              activeTab === 'shipping'
                ? 'text-neutral-950 border-b-2 border-neutral-950'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t('product.fabricTab')}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold tracking-wide uppercase transition-all relative ${
              activeTab === 'reviews'
                ? 'text-neutral-950 border-b-2 border-neutral-950'
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t('product.reviewsTab')} ({localReviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl">
          {activeTab === 'details' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <p className="text-neutral-700 leading-relaxed text-base">
                {product.description}
              </p>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-3">
                  {t('product.highlights')}
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">
                  Fabric Composition & Care
                </h4>
                <p className="text-sm text-neutral-700 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  {product.composition}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2">
                  Delivery Estimates
                </h4>
                <div className="text-sm text-neutral-600 space-y-2">
                  <p>• <strong>Nationwide Express Courier (TCS / Leopards / Trax):</strong> 2-4 business days (Complimentary over Rs. 4,999)</p>
                  <p>• <strong>Same-Day / Next-Day Delivery:</strong> Available for Lahore, Karachi, and Islamabad / Rawalpindi.</p>
                  <p>• <strong>Payment on Delivery:</strong> Cash on Delivery (COD), JazzCash, and Easypaisa accepted at checkout.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Header with average and Write Review trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-neutral-950">{product.rating.toFixed(1)}</span>
                    <div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-neutral-500">Based on {localReviews.length} ratings</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{t('product.writeReview')}</span>
                </button>
              </div>

              {/* Review submission form */}
              {isReviewFormOpen && (
                <form
                  onSubmit={handleAddReview}
                  className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200"
                >
                  <h4 className="text-base font-bold text-neutral-900">Share Your Experience</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="e.g. Jordan K."
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5) Exceptional</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5) Great Quality</option>
                        <option value={3}>⭐⭐⭐ (3/5) Average</option>
                        <option value={2}>⭐⭐ (2/5) Disappointed</option>
                        <option value={1}>⭐ (1/5) Poor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Review Headline</label>
                    <input
                      type="text"
                      required
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Incredible fit and luxurious texture"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Comments</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe the fabric weight, sizing recommendation, and your honest impression..."
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReviewFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              {/* Review list */}
              <div className="space-y-4">
                {localReviews.length > 0 ? (
                  localReviews.map((rev) => (
                    <div key={rev.id} className="p-5 bg-white border border-neutral-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-neutral-900">{rev.author}</span>
                          {rev.verified && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <h5 className="text-sm font-bold text-neutral-900">{rev.title}</h5>
                      <p className="text-sm text-neutral-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-sm py-4">No reviews yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <h3 className="font-serif-luxury text-xl font-bold text-neutral-900">StyleNest Sizing Guide</h3>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="text-neutral-400 hover:text-neutral-900 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 overflow-x-auto">
                <p className="text-xs text-neutral-500 mb-3">Measurements are shown in inches. Fits true to size.</p>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-700">
                      <th className="p-2.5 font-bold">Size</th>
                      <th className="p-2.5 font-bold">Chest/Bust</th>
                      <th className="p-2.5 font-bold">Waist</th>
                      <th className="p-2.5 font-bold">Hips</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-600">
                    <tr><td className="p-2.5 font-bold text-neutral-900">XS</td><td className="p-2.5">32-34"</td><td className="p-2.5">25-27"</td><td className="p-2.5">35-37"</td></tr>
                    <tr><td className="p-2.5 font-bold text-neutral-900">S</td><td className="p-2.5">35-37"</td><td className="p-2.5">28-30"</td><td className="p-2.5">38-40"</td></tr>
                    <tr><td className="p-2.5 font-bold text-neutral-900">M</td><td className="p-2.5">38-40"</td><td className="p-2.5">31-33"</td><td className="p-2.5">41-43"</td></tr>
                    <tr><td className="p-2.5 font-bold text-neutral-900">L</td><td className="p-2.5">41-43"</td><td className="p-2.5">34-36"</td><td className="p-2.5">44-46"</td></tr>
                    <tr><td className="p-2.5 font-bold text-neutral-900">XL</td><td className="p-2.5">44-46"</td><td className="p-2.5">37-39"</td><td className="p-2.5">47-49"</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase rounded-lg"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Related Products Carousel/Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Complete the Look</span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-neutral-950">
                You May Also Like
              </h3>
            </div>
            <button
              onClick={() => setCurrentView(product.category)}
              className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-amber-800 transition-colors underline-offset-4 hover:underline"
            >
              View More in {product.category.toUpperCase()} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
