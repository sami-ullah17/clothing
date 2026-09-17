import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { AdminLogin } from './AdminLogin';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminProductForm } from './AdminProductForm';
import { AdminOrders } from './AdminOrders';
import { AdminSettings } from './AdminSettings';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'add-product' | 'orders' | 'settings';

export const AdminDashboard: React.FC = () => {
  const { adminUser, adminLogout, setCurrentView, settings } = useShop();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If not logged in as admin, show login view
  if (!adminUser) {
    return <AdminLogin onBackToStore={() => setCurrentView('home')} />;
  }

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setActiveTab('add-product');
  };

  const handleStartAddNewProduct = () => {
    setEditingProductId(null);
    setActiveTab('add-product');
  };

  const handleProductSaved = () => {
    setEditingProductId(null);
    setActiveTab('products');
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-neutral-950 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">{settings.storeName}</h1>
            <p className="text-[10px] text-neutral-400">Owner Portal</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-neutral-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-neutral-950 text-white flex flex-col justify-between p-5 transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="pb-6 mb-6 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">{settings.storeName}</h1>
                <span className="inline-block px-2 py-0.5 bg-amber-950/80 text-amber-400 rounded text-[9px] font-bold border border-amber-800/60 uppercase tracking-wider">
                  Sole Owner
                </span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 mt-2 truncate">
              {adminUser.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'add-product' && activeTab === 'add-product' && !editingProductId);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'add-product') {
                      handleStartAddNewProduct();
                    } else {
                      setActiveTab(item.id);
                    }
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-neutral-800/80 space-y-2">
          <button
            onClick={() => setCurrentView('home')}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <Store className="w-4 h-4 text-neutral-400" />
            <span>Customer Storefront</span>
            <ExternalLink className="w-3 h-3 ml-auto text-neutral-500" />
          </button>

          <button
            onClick={adminLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto min-h-screen">
        {activeTab === 'overview' && (
          <AdminOverview
            onNavigateTab={(tab) => {
              if (tab === 'add-product') handleStartAddNewProduct();
              else setActiveTab(tab);
            }}
            onEditProduct={handleEditProduct}
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts
            onAddNewProduct={handleStartAddNewProduct}
            onEditProduct={handleEditProduct}
          />
        )}

        {activeTab === 'add-product' && (
          <AdminProductForm
            productIdToEdit={editingProductId}
            onBack={() => {
              setEditingProductId(null);
              setActiveTab('products');
            }}
            onSaved={handleProductSaved}
          />
        )}

        {activeTab === 'orders' && <AdminOrders />}

        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};
