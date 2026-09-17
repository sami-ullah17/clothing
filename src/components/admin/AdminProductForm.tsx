import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product, ProductColor, Category } from '../../types';
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
} from 'lucide-react';

interface AdminProductFormProps {
  productIdToEdit?: string | null;
  onBack: () => void;
  onSaved: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  productIdToEdit,
  onBack,
  onSaved,
}) => {
  const { products, addProduct, updateProduct, adminUser, showToast } = useShop();

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
      'Handcrafted using premium sustainable fabric, designed with precision tailoring for modern elegance.'
  );
  const [composition, setComposition] = useState(
    existingProduct?.composition || '100% Premium Cotton. Gentle wash.'
  );

  // Pricing & Stock
  const [price, setPrice] = useState<number>(existingProduct?.price || 4500);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(
    existingProduct?.discountPrice
  );
  const [stock, setStock] = useState<number>(
    existingProduct?.stock !== undefined ? existingProduct.stock : 15
  );
  const [status, setStatus] = useState<'in_stock' | 'out_of_stock'>(
    existingProduct?.status || 'in_stock'
  );

  // Badges
  const [isNewArrival, setIsNewArrival] = useState<boolean>(
    existingProduct?.isNewArrival || false
  );
  const [isBestSeller, setIsBestSeller] = useState<boolean>(
    existingProduct?.isBestSeller || false
  );

  // Images
  const [images, setImages] = useState<string[]>(
    existingProduct?.images || [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80',
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Colors
  const [colors, setColors] = useState<ProductColor[]>(
    existingProduct?.colors || [
      { name: 'Black', hex: '#111111' },
      { name: 'Ivory Cream', hex: '#FFFFF0' },
    ]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorImage, setNewColorImage] = useState('');

  // Sizes
  const [sizes, setSizes] = useState<string[]>(
    existingProduct?.sizes || ['S', 'M', 'L', 'XL']
  );
  const [newSize, setNewSize] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync if existing product loads
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setCategory(existingProduct.category);
      setSubcategory(existingProduct.subcategory);
      setDescription(existingProduct.description);
      setComposition(existingProduct.composition);
      setPrice(existingProduct.price);
      setDiscountPrice(existingProduct.discountPrice);
      setStock(existingProduct.stock);
      setStatus(existingProduct.status || (existingProduct.stock > 0 ? 'in_stock' : 'out_of_stock'));
      setIsNewArrival(!!existingProduct.isNewArrival);
      setIsBestSeller(!!existingProduct.isBestSeller);
      setImages(existingProduct.images || []);
      setColors(existingProduct.colors || []);
      setSizes(existingProduct.sizes || []);
    }
  }, [existingProduct]);

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size exceeds 10MB limit.', 'error');
      return;
    }

    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const token = adminUser?.token || localStorage.getItem('pributeeq_admin_token');
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            image: base64Data,
            filename: file.name,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setImages((prev) => [...prev, data.url]);
          showToast('Image uploaded and saved successfully!', 'success');
        } else {
          // If server upload fails, fallback to direct data URL
          setImages((prev) => [...prev, base64Data]);
          showToast('Saved image as local preview.', 'info');
        }
      } catch (err) {
        setImages((prev) => [...prev, base64Data]);
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) {
      showToast('Please enter a color name', 'error');
      return;
    }
    const colorObj: ProductColor = {
      name: newColorName.trim(),
      hex: newColorHex,
      image: newColorImage.trim() || undefined,
    };
    setColors((prev) => [...prev, colorObj]);
    setNewColorName('');
    setNewColorImage('');
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length <= 1) {
      showToast('At least one color is required', 'error');
      return;
    }
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSize = () => {
    const trimmed = newSize.trim().toUpperCase();
    if (!trimmed) return;
    if (sizes.includes(trimmed)) {
      showToast('Size already added', 'info');
      return;
    }
    setSizes((prev) => [...prev, trimmed]);
    setNewSize('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (sizes.length <= 1) {
      showToast('At least one size is required', 'error');
      return;
    }
    setSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    if (price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (images.length === 0) {
      setError('Please add or upload at least one product image');
      return;
    }

    if (colors.length === 0) {
      setError('Please add at least one color');
      return;
    }

    if (sizes.length === 0) {
      setError('Please add at least one size');
      return;
    }

    setIsSubmitting(true);

    const productPayload: Omit<Product, 'id'> = {
      name: name.trim(),
      category,
      subcategory: subcategory.trim(),
      price: Number(price),
      discountPrice: discountPrice && Number(discountPrice) > 0 ? Number(discountPrice) : undefined,
      stock: Number(stock),
      status: status,
      rating: existingProduct?.rating || 5.0,
      reviewCount: existingProduct?.reviewCount || 0,
      images,
      colors,
      sizes,
      description: description.trim(),
      details: existingProduct?.details || [
        'Artisanal tailoring with precision stitched seams',
        'Breathable, premium high-grade fabric construction',
        'Comfortable tailored silhouette with natural drape',
      ],
      composition: composition.trim(),
      isNewArrival,
      isBestSeller,
      isSale: !!discountPrice && Number(discountPrice) < Number(price),
    };

    if (isEditMode && productIdToEdit) {
      const updated = await updateProduct(productIdToEdit, productPayload);
      setIsSubmitting(false);
      if (updated) {
        onSaved();
      }
    } else {
      const created = await addProduct(productPayload);
      setIsSubmitting(false);
      if (created) {
        onSaved();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product List</span>
        </button>

        <h2 className="text-xl font-bold text-neutral-900">
          {isEditMode ? 'Edit Existing Product' : 'Add New Apparel Product'}
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
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100">
            1. Basic Product Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Product Title / Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Silk Slip Midi Dress or Premium Cotton Shirt"
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
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Subcategory / Type *
              </label>
              <input
                type="text"
                required
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Dresses, Jackets & Coats, Shirts, Knitwear"
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
                placeholder="Detailed garment cut, drape, styling notes..."
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
                placeholder="e.g. 100% Egyptian Cotton, Dry clean only"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing, Stock & Badges */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100">
            2. Pricing, Inventory & Availability
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Regular Price (Rs.) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="3500"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Sale / Discount Price (Rs.)
              </label>
              <input
                type="number"
                min={0}
                value={discountPrice ?? ''}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Leave blank if not on sale"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Stock Quantity *
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

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Availability Status *
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="in_stock">In Stock (Ordering Active)</option>
                <option value="out_of_stock">Out of Stock (Ordering Disabled)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-950 focus:ring-0"
              />
              <span>Mark as New Arrival Badge</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-800">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-950 focus:ring-0"
              />
              <span>Mark as Best Seller Badge</span>
            </label>
          </div>
        </div>

        {/* Section 3: Product Images */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                3. Product Images ({images.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Upload image files or enter image URLs. First image is used as primary thumbnail.
              </p>
            </div>
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
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-neutral-950 text-white rounded text-[9px] font-bold">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Upload Box */}
            <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50 hover:bg-neutral-100 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-neutral-500 mb-1" />
              <span className="text-[11px] font-bold text-neutral-800">
                {isUploadingImage ? 'Uploading...' : 'Upload Image'}
              </span>
              <span className="text-[9px] text-neutral-400">JPG, PNG, WebP</span>
            </label>
          </div>

          {/* Or Enter Web Image URL */}
          <div className="pt-3 border-t border-neutral-100 flex gap-2">
            <div className="relative flex-1">
              <Link className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste direct image URL (Unsplash, CDN, etc.)..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Section 4: Colors */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100">
            4. Available Garment Colors ({colors.length})
          </h3>
          <p className="text-xs text-neutral-500">
            Customers can choose from these colors. You can optionally attach an image URL to switch images when clicked.
          </p>

          {/* Color Chips */}
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c, index) => (
              <div
                key={index}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl"
              >
                <span
                  className="w-4 h-4 rounded-full border border-neutral-300 shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-xs font-semibold text-neutral-800">{c.name}</span>
                <span className="text-[10px] font-mono text-neutral-400">{c.hex}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(index)}
                  className="text-neutral-400 hover:text-rose-600 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Color Form */}
          <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Color Name
              </label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="e.g. Royal Blue, Emerald, Sand"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Hex Code & Picker
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg border border-neutral-300 cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Associated Image URL (Optional)
              </label>
              <input
                type="url"
                value={newColorImage}
                onChange={(e) => setNewColorImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleAddColor}
              className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Color</span>
            </button>
          </div>
        </div>

        {/* Section 5: Sizes */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider pb-2 border-b border-neutral-100">
            5. Available Sizes ({sizes.length})
          </h3>
          <p className="text-xs text-neutral-500">
            Manage standard sizes (XS, S, M, L, XL, XXL) or waist/age sizes (30, 32, 2-3Y).
          </p>

          {/* Size Chips */}
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
                  className="text-neutral-400 hover:text-rose-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Quick presets & custom size add */}
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (!sizes.includes(preset)) setSizes([...sizes, preset]);
                }}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                  sizes.includes(preset)
                    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'
                }`}
              >
                +{preset}
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-auto">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Custom size..."
                className="w-28 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>
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
              <span>Saving Product...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
