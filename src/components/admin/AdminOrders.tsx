import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { CustomerOrder, OrderStatus } from '../../types';
import {
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  Filter,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, formatPrice, settings } = useShop();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const allStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search) ||
      order.whatsappNumber.includes(search) ||
      (order.city && order.city.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const openCustomerWhatsApp = (order: CustomerOrder) => {
    let clean = order.whatsappNumber.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '92' + clean.slice(1);
    if (clean.length === 10) clean = '92' + clean;

    const message = `Hello ${order.customerName},\nThis is ${settings.storeName} regarding your Order ${order.id}. Current status: ${order.status}. Thank you!`;
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Customer Orders</h2>
          <p className="text-xs text-neutral-500">
            View orders placed by customers, contact them on WhatsApp, and update fulfillment stages
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 bg-white px-3.5 py-2 rounded-xl border border-neutral-200">
          <span>Total Orders:</span>
          <span className="font-bold text-neutral-900">{orders.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, phone, or order ID..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-neutral-950 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            All ({orders.length})
          </button>
          {allStatuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-neutral-950 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-12 text-center text-neutral-400">
          <Package className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
          <p className="text-sm font-semibold text-neutral-700">No customer orders found</p>
          <p className="text-xs text-neutral-400 mt-1">
            Orders created via the WhatsApp checkout flow will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-PK', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm hover:border-neutral-300 transition-all space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-base font-bold text-neutral-900">
                      {order.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateFormatted}</span>
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-neutral-500">Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    >
                      {allStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50/70 p-4 rounded-2xl text-xs">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                      Customer
                    </span>
                    <p className="font-bold text-neutral-900 text-sm">{order.customerName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-neutral-600 font-mono">{order.phone}</span>
                      <button
                        onClick={() => openCustomerWhatsApp(order)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition-colors"
                        title="Chat with customer on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                      Delivery Address
                    </span>
                    <div className="flex items-start gap-1.5 text-neutral-700">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress}, <span className="font-semibold text-neutral-900">{order.city || 'Pakistan'}</span>
                      </span>
                    </div>
                    {order.notes && (
                      <p className="mt-1.5 text-neutral-500 italic">
                        Notes: "{order.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Ordered Items Breakdown */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block mb-2">
                    Ordered Apparel ({order.items.length} item{order.items.length > 1 ? 's' : ''})
                  </span>
                  <div className="divide-y divide-neutral-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-10 h-12 object-cover rounded-lg border border-neutral-200"
                            />
                          ) : (
                            <div className="w-10 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-neutral-900">{item.productName}</p>
                            <div className="flex items-center gap-2 text-neutral-500 text-[11px] mt-0.5">
                              <span>Color: <strong className="text-neutral-700">{item.color}</strong></span>
                              <span>•</span>
                              <span>Size: <strong className="text-neutral-700">{item.size}</strong></span>
                              <span>•</span>
                              <span>Qty: <strong className="text-neutral-700">{item.quantity}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-neutral-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer / Grand Total */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Total Order Value
                  </span>
                  <span className="text-lg font-extrabold text-neutral-950">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
