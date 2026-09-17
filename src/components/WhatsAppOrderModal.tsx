import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PriButeeqLogo } from './PriButeeqLogo';
import { MessageCircle, X, MapPin, User, Phone, CheckCircle2, ShoppingBag, ArrowRight, Shirt, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WhatsAppOrderModal: React.FC = () => {
  const {
    isWhatsAppModalOpen,
    setIsWhatsAppModalOpen,
    whatsAppPayload,
    cart,
    cartSubtotal,
    discountAmount,
    clearCart,
    createCustomerOrder,
    settings,
    formatPrice,
    getCleanWhatsAppNumber,
    getActiveWhatsAppLines,
    showToast,
    user,
  } = useShop();

  const activeLines = getActiveWhatsAppLines();
  const primaryLine = activeLines.find(l => l.isPrimary)?.cleanNumber || activeLines[0]?.cleanNumber || '923291171812';
  const [selectedLineClean, setSelectedLineClean] = useState<string>(primaryLine);

  // Customer form inputs
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('Pakpattan, Punjab');
  const [city, setCity] = useState(user?.city || 'Pakpattan');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  if (!isWhatsAppModalOpen) return null;

  const isFromCart = whatsAppPayload?.fromCart || (!whatsAppPayload?.product && cart.length > 0);

  // Calculate order items & totals
  let orderItems: Array<{
    productId: string;
    productName: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    image?: string;
  }> = [];

  let grandTotal = 0;

  if (isFromCart) {
    orderItems = cart.map((item) => {
      const unitPrice = item.product.discountPrice ?? item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.name,
        color: item.selectedColor.name,
        size: item.selectedSize,
        quantity: item.quantity,
        price: unitPrice,
        image: item.product.images[0],
      };
    });
    grandTotal = Math.max(0, cartSubtotal - discountAmount);
  } else if (whatsAppPayload?.product) {
    const prod = whatsAppPayload.product;
    const unitPrice = prod.discountPrice ?? prod.price;
    const qty = whatsAppPayload.quantity || 1;
    const colorName = whatsAppPayload.color?.name || prod.colors[0]?.name || 'Standard';
    const sizeName = whatsAppPayload.size || prod.sizes[0] || 'M';

    orderItems = [
      {
        productId: prod.id,
        productName: prod.name,
        color: colorName,
        size: sizeName,
        quantity: qty,
        price: unitPrice,
        image: prod.images[0],
      },
    ];
    grandTotal = unitPrice * qty;
  }

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !deliveryAddress.trim()) {
      showToast('Please provide your name, phone number, and delivery address.', 'error');
      return;
    }

    setIsSubmitting(true);

    // 1. Create order record in backend database
    const savedOrder = await createCustomerOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      whatsappNumber: phone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      city: city.trim(),
      items: orderItems,
      totalAmount: grandTotal,
      notes: notes.trim() || undefined,
    });

    const generatedOrderId = savedOrder?.id || `ORD-${Date.now().toString().slice(-6)}`;

    // 2. Build formatted WhatsApp message
    let message = '';
    if (isFromCart) {
      message = `Hello, I want to place this order:\n\n`;
      message += `Order ID: ${generatedOrderId}\n`;
      message += `Customer: ${customerName.trim()}\n`;
      message += `Phone: ${phone.trim()}\n`;
      message += `Address: ${deliveryAddress.trim()}, ${city.trim()}\n\n`;

      orderItems.forEach((item, index) => {
        message += `${index + 1}. Product: ${item.productName}\n`;
        message += `Color: ${item.color}\n`;
        message += `Size: ${item.size}\n`;
        message += `Quantity: ${item.quantity}\n`;
        message += `Price: ${formatPrice(item.price * item.quantity)}\n\n`;
      });

      message += `Total: ${formatPrice(grandTotal)}\n`;
      if (notes.trim()) {
        message += `Notes: ${notes.trim()}\n`;
      }
      message += `\nPlease confirm my order.`;
    } else {
      const item = orderItems[0];
      message = `Hello, I want to place an order.\n\n`;
      message += `Order ID: ${generatedOrderId}\n`;
      message += `Product: ${item.productName}\n`;
      message += `Color: ${item.color}\n`;
      message += `Size: ${item.size}\n`;
      message += `Quantity: ${item.quantity}\n`;
      message += `Price: ${formatPrice(item.price)}\n`;
      message += `Total: ${formatPrice(grandTotal)}\n\n`;
      message += `Customer: ${customerName.trim()}\n`;
      message += `Phone: ${phone.trim()}\n`;
      message += `Address: ${deliveryAddress.trim()}, ${city.trim()}\n`;
      if (notes.trim()) {
        message += `Notes: ${notes.trim()}\n`;
      }
      message += `\nPlease confirm my order.`;
    }

    // 3. Launch WhatsApp link using selected Pri-Buteeq line (masked from customer)
    const cleanNumber = getCleanWhatsAppNumber(selectedLineClean);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // 4. Clear cart if ordered from cart
    if (isFromCart) {
      clearCart();
    }

    setCompletedOrderId(generatedOrderId);
    setIsSubmitting(false);
    showToast('Order successfully prepared for Pri-Buteeq WhatsApp!', 'success');
  };

  const handleClose = () => {
    setIsWhatsAppModalOpen(false);
    setCompletedOrderId(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 px-6 py-5 text-white flex items-center justify-between border-b border-emerald-800">
            <PriButeeqLogo variant="modal" />
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {completedOrderId ? (
            /* Order Sent Confirmation Screen */
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-900">Order Placed on WhatsApp!</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Your order reference has been logged. Our boutique team will confirm your order details and delivery window shortly.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 font-mono text-xs text-neutral-700">
                <span className="text-neutral-400 block text-[10px] uppercase font-sans font-bold">
                  Order Reference
                </span>
                <span className="text-base font-bold text-neutral-900">{completedOrderId}</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Continue Browsing Collection
                </button>
              </div>
            </div>
          ) : (
            /* Order Form & Items Summary */
            <form onSubmit={handleSendOrder} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Order Items Preview */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>Order Items ({orderItems.length})</span>
                  <span>Total: {formatPrice(grandTotal)}</span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto divide-y divide-neutral-200/60">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-8 h-10 object-cover rounded-lg border border-neutral-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 flex-shrink-0">
                            <Shirt className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-neutral-900 line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            {item.color} • {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-neutral-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Customer & Delivery Details
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Fatima Zahra"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      WhatsApp / Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pakpattan, Lahore, etc."
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Street Address / Delivery Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Plot number, Street, Area name..."
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Special Instructions / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Please send size chart verification or gift wrap"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-desk routing if owner configured multiple lines (numbers masked from customer) */}
              {activeLines.length > 1 && (
                <div className="space-y-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                  <label className="block text-[11px] font-semibold text-neutral-700">
                    Route Order to Pri-Buteeq Desk:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeLines.map((line) => {
                      const isSelected = selectedLineClean === line.cleanNumber;
                      return (
                        <button
                          key={line.cleanNumber}
                          type="button"
                          onClick={() => setSelectedLineClean(line.cleanNumber)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-neutral-300'}`} />
                            <span className="truncate">{line.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || orderItems.length === 0}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Send Order to Pri-Buteeq on WhatsApp • {formatPrice(grandTotal)}</span>
                </button>
                <p className="text-[10px] text-center text-neutral-400 mt-2">
                  Opens WhatsApp with pre-filled specifications for instant boutique confirmation.
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
