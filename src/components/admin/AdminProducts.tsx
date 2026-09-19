import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Product } from '../../types';
import {
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Eye,
  SlidersHorizontal,
  Camera,
  Flame,
  Tag,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface AdminProductsProps {
  onAddNewProduct: () => void;
  onEditProduct: (productId: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  onAddNewProduct,
  onEditProduct,
}) => {
  const {
    products,
    deleteProduct,
    updateProduct,
    clearDemoPhotos,
    clearAllProducts,
    formatPrice,
    openProductDetails,
  } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'men' | 'women' | 'kids'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk Clean modals
  const [showClearPhotosModal, setShowClearPhotosModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Quick Sale popover
  const [quickSaleProductId, setQuickSaleProductId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    const isActuallyInStock = product.stock > 0 && product.status !== 'out_of_stock';
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && isActuallyInStock) ||
      (stockFilter === 'out_of_stock' && !isActuallyInStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleToggleStockStatus = async (product: Product) => {
    const isCurrentlyInStock = product.stock > 0 && product.status !== 'out_of_stock';
    const newStatus = isCurrentlyInStock ? 'out_of_stock' : 'in_stock';
    const newStock = isCurrentlyInStock ? 0 : Math.max(10, product.stock);

    await updateProduct(product.id, {
      status: newStatus,
      stock: newStock,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirmId(null);
  };

  const handleQuickSaleChange = async (product: Product, percentage: number | null) => {
    if (percentage === null || percentage <= 0) {
      // Turn sale OFF
      await updateProduct(product.id, {
        isSale: false,
        salePercentage: undefined,
        discountPrice: undefined,
      });
    } else {
      // Turn sale ON with percentage
      const newDiscountPrice = Math.max(1, Math.round(product.price * (1 - percentage / 100)));
      await updateProduct(product.id, {
        isSale: true,
        salePercentage: percentage,
        discountPrice: newDiscountPrice,
      });
    }
    setQuickSaleProductId(null);
  };

  const handleConfirmClearPhotos = async () => {
    setIsCleaning(true);
    await clearDemoPhotos();
    setIsCleaning(false);
    setShowClearPhotosModal(false);
  };

  const handleConfirmClearAll = async () => {
    setIsCleaning(true);
    await clearAllProducts();
    setIsCleaning(false);
    setShowClearAllModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Product Catalog</h2>
          <p className="text-xs text-neutral-500">
            Manage boutique apparel, photos, sales & discount percentages, colors, and sizes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Clear Demo Photos */}
          <button
            type="button"
            onClick={() => setShowClearPhotosModal(true)}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            title="Delete demo placeholder photos from products"
          >
            <Camera className="w-3.5 h-3.5 text-neutral-500" />
            <span>Remove Demo Photos</span>
          </button>

          {/* Clear All Products */}
          <button
            type="button"
            onClick={() => setShowClearAllModal(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            title="Clear all demo products to start fresh"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear Demo Items</span>
          </button>

          {/* Add Product */}
          <button
            onClick={onAddNewProduct}
            className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 justify-center"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subcategory..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Category tabs */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold text-neutral-600">
            {(['all', 'men', 'women', 'kids'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e: any) => setStockFilter(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 focus:outline-none"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Product & Photo</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Sale Option (%)</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Colors</th>
                <th className="py-3.5 px-4">Sizes</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Camera className="w-8 h-8 text-neutral-300 mx-auto" />
                      <div className="font-semibold text-neutral-700">No products found</div>
                      <div className="text-[11px] text-neutral-400">
                        Click "Add New Product" above to upload boutique photos, set colors, sizes, and sale percentage.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isInStock = product.stock > 0 && product.status !== 'out_of_stock';
                  const hasPhoto = product.images && product.images.length > 0;
                  const primaryImage = hasPhoto ? product.images[0] : null;

                  // Sale calculations
                  const isOnSale = product.isSale || (!!product.discountPrice && product.discountPrice < product.price);
                  const discountPercent = product.salePercentage || (
                    product.discountPrice
                      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                      : 0
                  );

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50/60 transition-colors group"
                    >
                      {/* Product Image & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="w-12 h-14 object-cover rounded-xl border border-neutral-200/80 flex-shrink-0 bg-neutral-100 shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => onEditProduct(product.id)}
                              className="w-12 h-14 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100 flex flex-col items-center justify-center text-amber-700 flex-shrink-0 cursor-pointer transition-colors"
                              title="Click to add photo"
                            >
                              <Camera className="w-4 h-4 text-amber-700" />
                              <span className="text-[8px] font-bold mt-0.5">+ Photo</span>
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-neutral-900 group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                              <span>{product.name}</span>
                              {product.isNewArrival && (
                                <span className="px-1.5 py-0.2 bg-neutral-900 text-white rounded text-[9px] font-bold">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 capitalize">
                              {product.category} • {product.subcategory}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        {isOnSale && product.discountPrice ? (
                          <div>
                            <div className="font-bold text-rose-700">
                              {formatPrice(product.discountPrice)}
                            </div>
                            <div className="text-[11px] text-neutral-400 line-through">
                              {formatPrice(product.price)}
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-neutral-900">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </td>

                      {/* Sale Option & Percentage */}
                      <td className="py-3.5 px-4 relative">
                        <div className="flex items-center gap-1.5">
                          {isOnSale ? (
                            <button
                              type="button"
                              onClick={() =>
                                setQuickSaleProductId(
                                  quickSaleProductId === product.id ? null : product.id
                                )
                              }
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all"
                              title="Click to change sale percentage"
                            >
                              <Flame className="w-3 h-3 text-rose-600" />
                              <span>{discountPercent}% OFF</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setQuickSaleProductId(
                                  quickSaleProductId === product.id ? null : product.id
                                )
                              }
                              className="px-2.5 py-1 bg-neutral-100 hover:bg-rose-50 border border-neutral-200 hover:border-rose-200 text-neutral-500 hover:text-rose-600 rounded-full text-[11px] font-medium transition-all"
                              title="Click to enable sale"
                            >
                              + Put on Sale
                            </button>
                          )}
                        </div>

                        {/* Quick Sale Dropdown */}
                        {quickSaleProductId === product.id && (
                          <div className="absolute top-12 left-2 z-30 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-800 pb-1 border-b border-neutral-100">
                              <span>Select Sale %</span>
                              <button
                                onClick={() => setQuickSaleProductId(null)}
                                className="text-neutral-400 hover:text-neutral-700"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[10, 15, 20, 25, 30, 50].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => handleQuickSaleChange(product, pct)}
                                  className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                                    isOnSale && discountPercent === pct
                                      ? 'bg-rose-600 text-white border-rose-600'
                                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-rose-400'
                                  }`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                            {isOnSale && (
                              <button
                                type="button"
                                onClick={() => handleQuickSaleChange(product, null)}
                                className="w-full mt-1 py-1 text-[10px] font-semibold text-neutral-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-center"
                              >
                                Turn Sale OFF
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            product.stock <= 0
                              ? 'text-rose-600'
                              : product.stock < 5
                              ? 'text-amber-600'
                              : 'text-neutral-800'
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>

                      {/* Confirmed Colors */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-[120px]">
                          {product.colors.map((c) => (
                            <span
                              key={c.name}
                              className="w-3.5 h-3.5 rounded-full border border-neutral-300 inline-block shadow-inner"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                          <span className="text-[10px] text-neutral-400 ml-1">
                            ({product.colors.length})
                          </span>
                        </div>
                      </td>

                      {/* Confirmed Sizes */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                          {product.sizes.map((sz) => (
                            <span
                              key={sz}
                              className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-semibold"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStockStatus(product)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                            isInStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle status"
                        >
                          {isInStock ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Out of Stock</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openProductDetails(product)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Preview on Store"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditProduct(product.id)}
                            className="p-1.5 text-amber-700 hover:text-amber-800 rounded-lg hover:bg-amber-50 transition-colors"
                            title="Edit Product, Photos & Sale"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === product.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                              <span className="text-[10px] text-rose-700 font-bold px-1">
                                Confirm?
                              </span>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-neutral-500 text-[10px] hover:text-neutral-800"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(product.id)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal: Remove Demo Photos */}
      {showClearPhotosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-neutral-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Remove All Demo Photos?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This will strip all Unsplash placeholder/demo images from existing products in your database, leaving clean boutique items ready for your genuine photos.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearPhotosModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCleaning}
                onClick={handleConfirmClearPhotos}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                {isCleaning ? 'Cleaning...' : 'Remove Demo Photos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Products */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Clear All Demo Products?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              This will delete all demo/sample products from the catalog so you can start with a 100% fresh, clean boutique catalog. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isCleaning}
                onClick={handleConfirmClearAll}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                {isCleaning ? 'Deleting...' : 'Yes, Clear All Demo Products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
