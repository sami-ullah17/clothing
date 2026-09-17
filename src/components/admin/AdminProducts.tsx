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
} from 'lucide-react';

interface AdminProductsProps {
  onAddNewProduct: () => void;
  onEditProduct: (productId: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  onAddNewProduct,
  onEditProduct,
}) => {
  const { products, deleteProduct, updateProduct, formatPrice, openProductDetails } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'men' | 'women' | 'kids'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Product Catalog</h2>
          <p className="text-xs text-neutral-500">
            Manage your store apparel, pricing, inventory stock, colors, and sizes
          </p>
        </div>

        <button
          onClick={onAddNewProduct}
          className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Add New Product</span>
        </button>
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
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Price</th>
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
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isInStock = product.stock > 0 && product.status !== 'out_of_stock';
                  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80';

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-neutral-50/60 transition-colors group"
                    >
                      {/* Product Image & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-12 h-14 object-cover rounded-xl border border-neutral-200/80 flex-shrink-0 bg-neutral-100"
                          />
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

                      {/* Price & Discount */}
                      <td className="py-3.5 px-4">
                        {product.discountPrice ? (
                          <div>
                            <div className="font-bold text-neutral-900">
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

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
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
                        </div>
                      </td>

                      {/* Colors */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-[120px]">
                          {product.colors.map((c) => (
                            <span
                              key={c.name}
                              className="w-3.5 h-3.5 rounded-full border border-neutral-300 inline-block"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                          <span className="text-[10px] text-neutral-400 ml-1">
                            ({product.colors.length})
                          </span>
                        </div>
                      </td>

                      {/* Sizes */}
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
                            title="Edit Product"
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
    </div>
  );
};
