import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductColor, Category } from '../../types';
import { getApiUrl, getAdminAuthToken } from '../../utils/api';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Link,
  Flame,
  Percent,
  Tag,
  CheckCircle2,
  X,
  Palette,
  Ruler,
  Camera,
  Eye,
  ExternalLink,
  Globe,
} from 'lucide-react';

interface AdminProductFormProps {
  productIdToEdit?: string | null;
  onBack: () => void;
  onSaved: () => void;
}

// Popular Pakistani & Boutique Garment Color Palette
const BOUTIQUE_COLOR_PRESETS: { name: string; hex: string; urdu: string }[] = [
  { name: 'Black', hex: '#111111', urdu: 'سیاہ' },
  { name: 'White', hex: '#FFFFFF', urdu: 'سفید' },
  { name: 'Off-White / Cream', hex: '#FAF7F2', urdu: 'کریم / آف وائٹ' },
  { name: 'Maroon', hex: '#800020', urdu: 'مہرون' },
  { name: 'Ruby Red', hex: '#DC2626', urdu: 'سرخ / لال' },
  { name: 'Emerald Green', hex: '#047857', urdu: 'زمردی سبز' },
  { name: 'Bottle Green', hex: '#14532D', urdu: 'بوٹل گرین' },
  { name: 'Olive / Mehndi', hex: '#65A30D', urdu: 'مہندی' },
  { name: 'Navy Blue', hex: '#1E3A8A', urdu: 'نیوی بلیو' },
  { name: 'Royal Blue', hex: '#2563EB', urdu: 'رائل بلیو' },
  { name: 'Mustard / Haldi', hex: '#EAB308', urdu: 'سرسوں / پیلا' },
  { name: 'Blush Pink', hex: '#F472B6', urdu: 'گلابی' },
  { name: 'Tea Pink', hex: '#D87D88', urdu: 'ٹی پنک' },
  { name: 'Fawn / Beige', hex: '#D4B996', urdu: 'بادامی / فاون' },
  { name: 'Charcoal Grey', hex: '#4B5563', urdu: 'سرمئی' },
  { name: 'Plum / Purple', hex: '#7E22CE', urdu: 'جامنی' },
  { name: 'Rust / Terracotta', hex: '#C2410C', urdu: 'تانبائی' },
  { name: 'Gold / Zari', hex: '#D4AF37', urdu: 'سنہری' },
  { name: 'Peach', hex: '#FDBA74', urdu: 'پیچ / آڑو' },
  { name: 'Sky Blue', hex: '#38BDF8', urdu: 'فیروزی' },
];

const STANDARD_SIZE_PRESETS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '3XL',
  'Free Size',
  'Unstitched (ان سلا)',
  'Semi-Stitched',
  'Custom Measurement (کسٹم ناپ)',
];

const SALE_PERCENTAGE_PRESETS = [10, 15, 20, 25, 30, 40, 50, 70];

// Browser-side canvas image compression to ensure camera uploads upload instantly
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const PAKISTANI_BOUTIQUE_SAMPLE_PHOTOS = [
  {
    title: 'Embroidered Lawn Suit (Ruby Maroon)',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Pure Chiffon Festive Kurti (Emerald Green)',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Organza Dupatta Formal Ensemble (Blush Pink)',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Mens Festive Embroidered Kurta',
    url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
  },
];

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  productIdToEdit,
  onBack,
  onSaved,
}) => {
  const { products, addProduct, updateProduct, adminUser, showToast, formatPrice, openProductDetails, setCurrentView } = useShop();

  const isEditMode = !!productIdToEdit;
  const existingProduct = isEditMode
    ? products.find((p) => p.id === productIdToEdit)
    : null;

  // Basic Information
  const [name, setName] = useState(existingProduct?.name || '');
  const [category, setCategory] = useState<Category>(existingProduct?.category || 'women');
  const [subcategory, setSubcategory] = useState(existingProduct?.subcategory || 'Dresses');
  const [description, setDescription] = useState(
    existingProduct?.description ||
      'Handcrafted premium boutique fabric, detailed with fine stitching and comfortable silhouette for elegant wear.'
  );
  const [composition, setComposition] = useState(
    existingProduct?.composition || '100% Premium Lawn / Cotton. Gentle wash.'
  );

  // Pricing & Stock
  const [price, setPrice] = useState<number>(existingProduct?.price || 4500);

  // Sale Settings (Requirement: Toggle + Percentage)
  const [isOnSale, setIsOnSale] = useState<boolean>(() => {
    if (existingProduct?.isSale !== undefined) return existingProduct.isSale;
    if (existingProduct?.discountPrice && existingProduct.discountPrice < existingProduct.price) {
      return true;
    }
    return false;
  });

  const [salePercentage, setSalePercentage] = useState<number>(() => {
    if (existingProduct?.salePercentage) return existingProduct.salePercentage;
    if (
      existingProduct?.price &&
      existingProduct.discountPrice &&
      existingProduct.discountPrice < existingProduct.price
    ) {
      return Math.round(
        ((existingProduct.price - existingProduct.discountPrice) / existingProduct.price) * 100
      );
    }
    return 20; // Default 20%
  });

  const [discountPrice, setDiscountPrice] = useState<number | undefined>(() => {
    if (existingProduct?.discountPrice) return existingProduct.discountPrice;
    if (existingProduct?.isSale && existingProduct?.price) {
      return Math.round(existingProduct.price * 0.8);
    }
    return undefined;
  });

  const [stock, setStock] = useState<number>(
    existingProduct?.stock !== undefined ? existingProduct.stock : 15
  );
  const [status, setStatus] = useState<'in_stock' | 'out_of_stock'>(
    existingProduct?.status || 'in_stock'
  );

  // Badges (Default to true for new products so they immediately show under New Arrivals & Homepage)
  const [isNewArrival, setIsNewArrival] = useState<boolean>(
    existingProduct ? Boolean(existingProduct.isNewArrival) : true
  );
  const [isBestSeller, setIsBestSeller] = useState<boolean>(
    existingProduct?.isBestSeller || false
  );

  // Just published online confirmation state
  const [justPublishedProduct, setJustPublishedProduct] = useState<Product | null>(null);

  // Images (Preserve all boutique photos uploaded or selected)
  const [images, setImages] = useState<string[]>(() => {
    return existingProduct?.images || [];
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Colors
  const [colors, setColors] = useState<ProductColor[]>(
    existingProduct?.colors || [
      { name: 'Black', hex: '#111111' },
      { name: 'Off-White / Cream', hex: '#FAF7F2' },
    ]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#800020');

  // Sizes
  const [sizes, setSizes] = useState<string[]>(
    existingProduct?.sizes || ['S', 'M', 'L', 'XL']
  );
  const [newSize, setNewSize] = useState('');

  // Product Details & Specifications
  const [details, setDetails] = useState<string[]>(() => {
    if (existingProduct?.details && existingProduct.details.length > 0) {
      return existingProduct.details;
    }
    return [
      '3-Piece Stitched Luxury Ensemble (Shirt, Trouser & Dupatta)',
      'Pure artisanal Pakistani boutique craftsmanship',
      'Fine threadwork and precision tailored seams',
      'Breathable, comfortable high-grade drape fabric',
    ];
  });
  const [newDetailText, setNewDetailText] = useState('');

  // Interactive Photo Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [photoForConfirmation, setPhotoForConfirmation] = useState<string | null>(null);
  const [hasConfirmedForPhoto, setHasConfirmedForPhoto] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle price or percentage change to recalculate discountPrice
  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
    if (isOnSale) {
      const calculated = Math.max(1, Math.round(newPrice * (1 - salePercentage / 100)));
      setDiscountPrice(calculated);
    }
  };

  const handleSaleToggle = (active: boolean) => {
    setIsOnSale(active);
    if (active) {
      const calculated = Math.max(1, Math.round(price * (1 - salePercentage / 100)));
      setDiscountPrice(calculated);
    } else {
      setDiscountPrice(undefined);
    }
  };

  const handlePercentageSelect = (pct: number) => {
    setSalePercentage(pct);
    if (isOnSale) {
      const calculated = Math.max(1, Math.round(price * (1 - pct / 100)));
      setDiscountPrice(calculated);
    }
  };

  // Sync if existing product changes
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setCategory(existingProduct.category);
      setSubcategory(existingProduct.subcategory);
      setDescription(existingProduct.description);
      setComposition(existingProduct.composition);
      setPrice(existingProduct.price);
      setDiscountPrice(existingProduct.discountPrice);
      setIsOnSale(existingProduct.isSale || !!existingProduct.discountPrice);
      if (existingProduct.salePercentage) {
        setSalePercentage(existingProduct.salePercentage);
      } else if (existingProduct.discountPrice && existingProduct.price) {
        setSalePercentage(
          Math.round(((existingProduct.price - existingProduct.discountPrice) / existingProduct.price) * 100)
        );
      }
      setStock(existingProduct.stock);
      setStatus(existingProduct.status || (existingProduct.stock > 0 ? 'in_stock' : 'out_of_stock'));
      setIsNewArrival(!!existingProduct.isNewArrival);
      setIsBestSeller(!!existingProduct.isBestSeller);
      setImages(existingProduct.images || []);
      setColors(existingProduct.colors && existingProduct.colors.length > 0 ? existingProduct.colors : [
        { name: 'Black', hex: '#111111' },
        { name: 'Off-White / Cream', hex: '#FAF7F2' },
      ]);
      setSizes(existingProduct.sizes && existingProduct.sizes.length > 0 ? existingProduct.sizes : ['S', 'M', 'L', 'XL']);
      if (existingProduct.details && Array.isArray(existingProduct.details) && existingProduct.details.length > 0) {
        setDetails(existingProduct.details);
      }
    }
  }, [existingProduct]);

  // Image Upload handler with client compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }

    setIsUploadingImage(true);

    try {
      // Compress in browser so it uploads instantly and doesn't hit size limits
      const compressedData = await compressImageFile(file);
      if (!compressedData) {
        showToast('Could not process image file.', 'error');
        setIsUploadingImage(false);
        return;
      }

      let finalUrl = compressedData;
      const token = adminUser?.token || getAdminAuthToken();

      try {
        const res = await fetch(getApiUrl('/api/upload'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            image: compressedData,
            filename: file.name,
          }),
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data?.url) {
              finalUrl = data.url;
            }
          }
        }
      } catch (uploadErr) {
        console.warn('Using client data URL fallback:', uploadErr);
      }

      setImages((prev) => [...prev, finalUrl]);
      setPhotoForConfirmation(finalUrl);
      showToast('Photo added successfully! (تصویر شامل ہو گئی)', 'success');
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('Failed to upload image.', 'error');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Add Image via Direct URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setImages((prev) => [...prev, url]);
    setNewImageUrl('');
    showToast('Photo URL added successfully! (تصویر شامل ہو گئی)', 'success');
  };

  const handleAddSamplePhoto = (sampleUrl: string) => {
    if (images.includes(sampleUrl)) {
      showToast('This sample photo is already in the gallery', 'info');
      return;
    }
    setImages((prev) => [...prev, sampleUrl]);
    showToast('Sample boutique photo added to gallery!', 'success');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Color Toggle & Add
  const togglePresetColor = (preset: { name: string; hex: string }) => {
    const exists = colors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      setColors((prev) => prev.filter((c) => c.name.toLowerCase() !== preset.name.toLowerCase()));
    } else {
      setColors((prev) => [...prev, { name: preset.name, hex: preset.hex }]);
    }
  };

  const handleAddCustomColor = () => {
    if (!newColorName.trim()) return;
    const trimmed = newColorName.trim();
    if (colors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Color name already exists', 'error');
      return;
    }
    setColors((prev) => [...prev, { name: trimmed, hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Size Toggle & Add
  const toggleSize = (sz: string) => {
    if (sizes.includes(sz)) {
      setSizes((prev) => prev.filter((s) => s !== sz));
    } else {
      setSizes((prev) => [...prev, sz]);
    }
  };

  const handleAddCustomSize = () => {
    if (!newSize.trim()) return;
    const trimmed = newSize.trim();
    if (sizes.includes(trimmed)) {
      showToast('Size already added', 'error');
      return;
    }
    setSizes((prev) => [...prev, trimmed]);
    setNewSize('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  // Details Handlers
  const handleAddDetail = (textToAdd?: string) => {
    const val = (textToAdd !== undefined ? textToAdd : newDetailText).trim();
    if (!val) return;
    if (details.includes(val)) {
      showToast('This specification point is already in the list', 'info');
      return;
    }
    setDetails((prev) => [...prev, val]);
    if (textToAdd === undefined) setNewDetailText('');
  };

  const handleRemoveDetail = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // Save / Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      const msg = 'Product title / dress name is required (پروڈکٹ کا نام لازمی ہے)';
      setError(msg);
      showToast(msg, 'error');
      const el = document.getElementById('product-title-input');
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      const msg = 'Please enter a valid product price (درست قیمت درج کریں)';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setIsSubmitting(true);

    const calculatedDiscountPrice =
      isOnSale && discountPrice && discountPrice > 0 ? Number(discountPrice) : undefined;

    const finalColors: ProductColor[] =
      colors.length > 0
        ? colors
        : [
            { name: 'Standard / As Shown', hex: '#111111' },
            { name: 'Off-White / Cream', hex: '#FAF7F2' },
          ];

    const finalSizes: string[] =
      sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'];

    const finalDetails = details.length > 0 ? details : [
      '3-Piece Stitched Luxury Ensemble (Shirt, Trouser & Dupatta)',
      'Pure artisanal Pakistani boutique craftsmanship',
      'Fine threadwork and precision tailored seams',
      'Breathable, comfortable high-grade drape fabric',
    ];

    const productPayload: Omit<Product, 'id'> = {
      name: name.trim(),
      category,
      subcategory: subcategory.trim() || 'Dresses',
      price: Number(price),
      discountPrice: calculatedDiscountPrice,
      salePercentage: isOnSale ? salePercentage : undefined,
      isSale: isOnSale,
      stock: Number(stock),
      status: status,
      rating: existingProduct?.rating || 5.0,
      reviewCount: existingProduct?.reviewCount || 0,
      images,
      colors: finalColors,
      sizes: finalSizes,
      description: description.trim(),
      details: finalDetails,
      composition: composition.trim(),
      isNewArrival: isNewArrival !== false,
      isBestSeller: Boolean(isBestSeller),
    };

    try {
      if (isEditMode && productIdToEdit) {
        const updated = await updateProduct(productIdToEdit, productPayload);
        setIsSubmitting(false);
        if (updated) {
          setJustPublishedProduct(updated);
          showToast(`"${productPayload.name}" updated successfully!`, 'success');
        } else {
          setError('Failed to update product. Please check your network and inputs.');
          showToast('Failed to update product', 'error');
        }
      } else {
        const created = await addProduct(productPayload);
        setIsSubmitting(false);
        if (created) {
          setJustPublishedProduct(created);
          showToast(`"${productPayload.name}" published to store!`, 'success');
        } else {
          setError('Failed to publish product. Please try again.');
          showToast('Failed to save product', 'error');
        }
      }
    } catch (submitErr: any) {
      setIsSubmitting(false);
      const errMsg = submitErr?.message || 'Error occurred while saving product';
      setError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  const handleResetForNew = () => {
    setJustPublishedProduct(null);
    setName('');
    setDescription('Handcrafted premium boutique fabric, detailed with fine stitching and comfortable silhouette for elegant wear.');
    setComposition('100% Premium Lawn / Cotton. Gentle wash.');
    setPrice(4500);
    setIsOnSale(false);
    setImages([]);
    setIsNewArrival(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Live Online Success Announcement */}
      {justPublishedProduct && (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-300 space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Now Live Online (اب آن لائن لائیو ہے)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 font-serif-luxury">
                "{justPublishedProduct.name}" آن لائن ہو گئی ہے!
              </h3>
              <p className="text-neutral-600 text-sm mt-1.5 leading-relaxed">
                یہ پروڈکٹ فوری طور پر محفوظ ہو کر ویب سائٹ کے <strong>ہوم پیج</strong> اور <strong>نئی ورائٹی (New Arrivals)</strong> پر تمام صارفین اور وزٹرز کے لیے لائیو دستیاب ہے۔
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 border-t border-emerald-100">
            <button
              onClick={() => openProductDetails(justPublishedProduct)}
              className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>ویب سائٹ پر لائیو دیکھیں (View Live on Website)</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={handleResetForNew}
              className="px-5 py-3 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-amber-700" />
              <span>مزید پروڈکٹ شامل کریں (Add Another Product)</span>
            </button>

            <button
              onClick={onSaved}
              className="px-5 py-3 bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-900 text-xs font-bold rounded-xl transition-all"
            >
              <span>پروڈکٹس لسٹ (Go to Products List)</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <h2 className="text-xl font-bold text-neutral-900">
          {isEditMode ? 'Edit Boutique Product' : 'Add New Boutique Apparel'}
        </h2>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
            <span>1. Basic Product Information</span>
            <span className="text-[11px] font-normal text-neutral-400 font-urdu">(بنیادی معلومات)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Product Title / Dress Name *
              </label>
              <input
                id="product-title-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pure Silk Embroidered Kurti, 3-Piece Stitched Lawn Suit"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Target Category *
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 capitalize"
              >
                <option value="women">Women (خواتین)</option>
                <option value="men">Men (مردانہ)</option>
                <option value="kids">Kids (بچے)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Subcategory / Apparel Type *
              </label>
              <input
                type="text"
                required
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Formal, Casual, Kurtis, 3-Piece, Shawls"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Product Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the fabric cut, embroidery details, styling, embellishments..."
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Fabric & Care Composition
              </label>
              <input
                type="text"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="e.g. 100% Chiffon Dupatta with Pure Lawn Shirt, Dry clean or Hand wash"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Owner Photo Upload & Confirmation */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-700" />
                <span>2. Boutique Photos ({images.length})</span>
                <span className="text-[11px] font-normal text-neutral-400 font-urdu">(تصاویر کا انتخاب)</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Upload genuine boutique photos. When you add a photo, confirm its available colors and sizes.
              </p>
            </div>

            {images.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPhotoForConfirmation(images[0]);
                  setIsConfirmModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold transition-colors self-start"
              >
                <Palette className="w-3.5 h-3.5 text-amber-700" />
                <span>Confirm Colours & Sizes for Photo</span>
              </button>
            )}
          </div>

          {/* Current Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-sm"
              >
                <img
                  src={imgUrl}
                  alt={`Boutique Item ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-neutral-950 text-white rounded text-[9px] font-bold">
                    Primary
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoForConfirmation(imgUrl);
                      setIsConfirmModalOpen(true);
                    }}
                    className="p-1.5 bg-white text-neutral-900 rounded-full hover:bg-amber-400 transition-colors"
                    title="Confirm colors & sizes"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload Box */}
            <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-600 bg-amber-50/40 hover:bg-amber-50 flex flex-col items-center justify-center cursor-pointer transition-colors p-3 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center mb-1.5 text-amber-800">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-900">
                {isUploadingImage ? 'Uploading...' : 'Upload Photo'}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5">Camera or File</span>
            </label>
          </div>

          {/* Web URL input */}
          <div className="pt-2 flex gap-2">
            <div className="relative flex-1">
              <Link className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste direct image URL link..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            >
              Add Photo URL
            </button>
          </div>

          {/* Quick Preset Boutique Photos */}
          <div className="pt-2 border-t border-neutral-100">
            <p className="text-[11px] font-semibold text-neutral-600 mb-2">
              Or pick high-definition Pakistani Boutique sample photos:
            </p>
            <div className="flex flex-wrap gap-2">
              {PAKISTANI_BOUTIQUE_SAMPLE_PHOTOS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddSamplePhoto(sample.url)}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-neutral-50 hover:bg-amber-50 border border-neutral-200 hover:border-amber-300 rounded-xl text-[11px] text-neutral-700 transition-colors"
                >
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="w-5 h-5 rounded-md object-cover"
                  />
                  <span>+ {sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          {images.length === 0 && (
            <div className="p-3 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-xs text-neutral-500 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                No demo photos exist. You can upload photos now or publish and add them anytime.
              </span>
            </div>
          )}
        </div>

        {/* Section 3: Sale Option & Pricing (Owner toggle + percentage) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-5">
          <div className="pb-3 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-600" />
                <span>3. Pricing & Sale Discount Option</span>
                <span className="text-[11px] font-normal text-neutral-400 font-urdu">(قیمت اور سیل کا آپشن)</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Set normal price and toggle Sale ON/OFF with discount percentage calculation.
              </p>
            </div>

            {/* Sale Toggle Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-600">Sale Status:</span>
              <div className="inline-flex rounded-xl bg-neutral-100 p-1 border border-neutral-200">
                <button
                  type="button"
                  onClick={() => handleSaleToggle(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    !isOnSale
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Regular Price
                </button>
                <button
                  type="button"
                  onClick={() => handleSaleToggle(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    isOnSale
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>ON SALE</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Regular Price */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Regular Price (Rs.) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">
                  Rs.
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  placeholder="4500"
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Stock Inventory Quantity *
              </label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStock(val);
                  if (val <= 0) setStatus('out_of_stock');
                  else if (status === 'out_of_stock' && val > 0) setStatus('in_stock');
                }}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Availability Status *
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="in_stock">In Stock (Available to Order)</option>
                <option value="out_of_stock">Out of Stock (Disabled)</option>
              </select>
            </div>
          </div>

          {/* Expanded Sale Controls (When ON SALE is true) */}
          {isOnSale ? (
            <div className="p-4 bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-orange-50/60 rounded-2xl border border-rose-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Choose Sale Discount Percentage (%)</span>
                  <span className="font-urdu font-normal text-rose-700">(ڈسکاؤنٹ فیصد)</span>
                </span>
                <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-xs font-bold shadow-sm">
                  {salePercentage}% OFF
                </span>
              </div>

              {/* Quick Percentage Presets */}
              <div className="flex flex-wrap items-center gap-2">
                {SALE_PERCENTAGE_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageSelect(pct)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      salePercentage === pct
                        ? 'bg-rose-600 text-white shadow-md scale-105'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-rose-300'
                    }`}
                  >
                    {pct}% OFF
                  </button>
                ))}
              </div>

              {/* Range Slider and Direct Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Fine-tune Percentage ({salePercentage}%)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={90}
                    value={salePercentage}
                    onChange={(e) => handlePercentageSelect(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Calculated Sale Price (Rs.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-600">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={discountPrice ?? ''}
                      onChange={(e) => {
                        const customVal = Number(e.target.value);
                        setDiscountPrice(customVal);
                        if (price > 0 && customVal < price) {
                          setSalePercentage(Math.round(((price - customVal) / price) * 100));
                        }
                      }}
                      className="w-full pl-10 pr-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Banner */}
              <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-rose-200/60 text-neutral-700">
                <div>
                  Regular: <span className="line-through text-neutral-400">{formatPrice(price)}</span>{' '}
                  → <span className="font-bold text-rose-700">Sale Price: {formatPrice(discountPrice || 0)}</span>
                </div>
                <div className="font-semibold text-emerald-700">
                  Customer Saves: {formatPrice(price - (discountPrice || 0))} ({salePercentage}% OFF)
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
              <span>This product is currently selling at regular price without any discount.</span>
              <button
                type="button"
                onClick={() => handleSaleToggle(true)}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                + Turn Sale ON
              </button>
            </div>
          )}

          {/* Badges Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-950 focus:ring-0"
              />
              <span>Mark as "New Arrival" Badge</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-950 focus:ring-0"
              />
              <span>Mark as "Best Seller" Badge</span>
            </label>
          </div>
        </div>

        {/* Section 4: Colors (Pakistani Boutique Shades & Confirm) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-700" />
                <span>4. Garment Colours ({colors.length} Selected)</span>
                <span className="text-[11px] font-normal text-neutral-400 font-urdu">(رنگ کی تصدیق)</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Click any shade to toggle ON/OFF or add custom color.
              </p>
            </div>
          </div>

          {/* Current Selected Colors */}
          <div className="flex flex-wrap gap-2">
            {colors.map((c, index) => (
              <div
                key={index}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/40 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="text-neutral-400 hover:text-rose-400 p-0.5 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Pakistani & Boutique Palette Quick Toggle */}
          <div className="pt-3 border-t border-neutral-100">
            <span className="block text-xs font-bold text-neutral-700 mb-2">
              Popular Boutique Colors (کلک کر کے منتخب کریں):
            </span>
            <div className="flex flex-wrap gap-2">
              {BOUTIQUE_COLOR_PRESETS.map((preset) => {
                const isSelected = colors.some(
                  (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                );
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => togglePresetColor(preset)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="font-semibold">{preset.name}</span>
                    <span className="text-[10px] font-urdu opacity-75">{preset.urdu}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Color */}
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Custom color name (e.g. Teal, Mint)..."
                className="w-56 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomColor}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold"
            >
              + Add Color
            </button>
          </div>
        </div>

        {/* Section 5: Sizes (Standard & Boutique Options) */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-700" />
                <span>5. Available Sizes ({sizes.length} Selected)</span>
                <span className="text-[11px] font-normal text-neutral-400 font-urdu">(سائز کی تصدیق)</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Confirm available sizes for this garment (Ready-to-wear or Unstitched/Free Size).
              </p>
            </div>
          </div>

          {/* Current Selected Sizes */}
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => (
              <div
                key={sz}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                <span>{sz}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(sz)}
                  className="text-neutral-400 hover:text-rose-400 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Preset Sizes Grid */}
          <div className="pt-3 border-t border-neutral-100">
            <span className="block text-xs font-bold text-neutral-700 mb-2">
              Boutique Size Options (کلک کر کے شامل یا خارج کریں):
            </span>
            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZE_PRESETS.map((sz) => {
                const isSelected = sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {sz} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Size */}
          <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Custom size (e.g. Chest 21 / Length 38)..."
              className="w-64 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold"
            >
              + Add Size
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>محفوظ ہو رہا ہے... (Saving Product...)</span>
              </span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {isEditMode
                    ? 'Update Product (محفوظ کریں)'
                    : 'Publish Boutique Product (پروڈکٹ شائع کریں)'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ========================================================== */}
      {/* INTERACTIVE PHOTO CONFIRMATION MODAL (Colors & Sizes) */}
      {/* ========================================================== */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-neutral-900 via-neutral-950 to-amber-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Confirm Colours & Sizes for Photo
                  </h3>
                  <p className="text-xs text-amber-200 font-urdu">
                    تصدیق کریں: اس تصویر / سوٹ کے پاس کون سے رنگ اور سائز ہیں؟
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Photo Preview & Notice */}
              <div className="flex items-center gap-4 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                {photoForConfirmation ? (
                  <img
                    src={photoForConfirmation}
                    alt="Current uploaded item"
                    className="w-16 h-20 object-cover rounded-xl border border-amber-300 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-20 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    Boutique Item Photo Added
                  </div>
                  <div className="text-[11px] text-neutral-600 mt-0.5">
                    Please select the colours you have in stock for this photo, and choose the available sizes below.
                  </div>
                </div>
              </div>

              {/* Step 1: Colors Confirmation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-700" />
                    <span>Which COLOURS do you have? (رنگ منتخب کریں)</span>
                  </span>
                  <span className="text-xs text-neutral-500 font-semibold">
                    {colors.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {BOUTIQUE_COLOR_PRESETS.map((preset) => {
                    const isSelected = colors.some(
                      (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => togglePresetColor(preset)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all border ${
                          isSelected
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="font-semibold">{preset.name}</span>
                        <span className="text-[10px] font-urdu opacity-75">{preset.urdu}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Sizes Confirmation */}
              <div className="space-y-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-amber-700" />
                    <span>Which SIZES are available? (سائز منتخب کریں)</span>
                  </span>
                  <span className="text-xs text-neutral-500 font-semibold">
                    {sizes.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZE_PRESETS.map((sz) => {
                    const isSelected = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {sz} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                Ready to save with <strong className="text-neutral-900">{colors.length} colors</strong> and{' '}
                <strong className="text-neutral-900">{sizes.length} sizes</strong>.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setHasConfirmedForPhoto(true);
                    showToast('✓ Colors & sizes successfully confirmed for photo!', 'success');
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Colours & Sizes (تصدیق ہوگئی)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
