import React from 'react';
import { useShop } from '../../context/ShopContext';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  TrendingUp,
  PlusCircle,
  ShoppingBag,
  Settings,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: 'products' | 'add-product' | 'orders' | 'settings') => void;
  onEditProduct: (productId: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab, onEditProduct }) => {
  const { products, orders, settings, formatPrice } = useShop();

  // Metrics
  const totalProducts = products.length;
  const inStockProducts = products.filter(
    (p) => (p.stock > 0 && p.status !== 'out_of_stock')
  ).length;
  const outOfStockProducts = totalProducts - inStockProducts;

  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(
    (o) => o.status === 'Confirmed' || o.status === 'Processing'
  ).length;

  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status !== 'Cancelled') {
      return sum + (o.totalAmount || 0);
    }
    return sum;
  }, 0);

  const outOfStockList = products.filter(
    (p) => p.stock <= 0 || p.status === 'out_of_stock'
  );

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 rounded-3xl p-6 sm:p-8 text-white border border-neutral-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Store Live & Operational</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {settings.storeName} Management Console
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Orders route to WhatsApp ({settings.whatsappNumber}) • Customer sees brand: <strong className="text-amber-300">Pri-Buteeq</strong> • Location: {settings.address}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigateTab('add-product')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-all border border-neutral-700 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Total Products</span>
            <Package className="w-4 h-4 text-neutral-700" />
          </div>
          <div className="text-2xl font-extrabold text-neutral-900">{totalProducts}</div>
          <p className="text-[11px] text-neutral-400 mt-1">Active in catalog</p>
        </div>

        {/* In Stock */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium">In Stock</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{inStockProducts}</div>
          <p className="text-[11px] text-emerald-600/80 mt-1">Ready for order</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-medium">Out of Stock</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{outOfStockProducts}</div>
          <p className="text-[11px] text-rose-600/80 mt-1">Requires restock</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-medium">Pending Orders</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{pendingOrders}</div>
          <p className="text-[11px] text-amber-600/80 mt-1">Awaiting confirmation</p>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-medium">Confirmed</span>
            <Check className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{confirmedOrders}</div>
          <p className="text-[11px] text-blue-600/80 mt-1">Ready for packing</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Recorded Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-neutral-900 truncate">
            {formatPrice(totalRevenue)}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Across all orders</p>
        </div>
      </div>

      {/* Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Recent Customer Orders</h3>
              <p className="text-xs text-neutral-500">Live feed of orders received from customers</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-neutral-900 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-neutral-400 text-sm">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p>No customer orders recorded yet.</p>
              <p className="text-xs text-neutral-400 mt-1">Orders placed on WhatsApp will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.slice(0, 5).map((order) => {
                    const statusColor =
                      order.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : order.status === 'Confirmed' || order.status === 'Processing'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : order.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200';

                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 font-mono font-bold text-neutral-900">{order.id}</td>
                        <td className="py-3">
                          <div className="font-semibold text-neutral-900">{order.customerName}</div>
                          <div className="text-[11px] text-neutral-500">{order.city || 'Pakpattan'}</div>
                        </td>
                        <td className="py-3 text-neutral-600">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </td>
                        <td className="py-3 font-bold text-neutral-900">{formatPrice(order.totalAmount)}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <a
                            href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Out of Stock & Store Quick Check (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Out of stock alert */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Inventory Alerts</span>
              </h3>
              <span className="text-xs font-bold text-neutral-500">
                {outOfStockList.length} out of stock
              </span>
            </div>

            {outOfStockList.length === 0 ? (
              <div className="text-center py-6 text-neutral-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <p className="font-semibold text-neutral-700">All products in stock!</p>
                <p className="text-[11px] text-neutral-400">Inventory levels are healthy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outOfStockList.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-xl border border-rose-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-xs text-neutral-900 line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-rose-700 font-bold">0 units available</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onEditProduct(prod.id)}
                      className="text-[11px] font-bold text-amber-700 hover:underline px-2"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Store Config Quick Tile */}
          <div className="bg-neutral-900 rounded-3xl p-6 text-white border border-neutral-800 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400 mb-3">
              <Settings className="w-4 h-4" />
              <span>Owner Quick Links</span>
            </h3>
            <div className="text-xs space-y-2 text-neutral-300">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">WhatsApp Route:</span>
                <span className="font-mono text-white">+{settings.whatsappNumber} (Masked as Pri-Buteeq)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Location:</span>
                <span className="text-white">{settings.address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">Currency:</span>
                <span className="text-white">{settings.currency} ({settings.currencySymbol})</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('settings')}
              className="w-full mt-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white rounded-xl transition-colors text-center block"
            >
              Edit Store Settings →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
