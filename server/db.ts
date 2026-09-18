import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth.js';

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'men' | 'women' | 'kids';
  subcategory: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isSale?: boolean;
  salePercentage?: number;
  description: string;
  details: string[];
  composition: string;
  stock: number;
  status?: 'in_stock' | 'out_of_stock';
  reviews?: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    title: string;
    comment: string;
    verified: boolean;
  }>;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeDescription: string;
  storeLogo: string;
  whatsappNumber: string;
  whatsappNumbers?: string[];
  whatsappLabels?: Record<string, string>;
  instagramUrl: string;
  tiktokUrl: string;
  address: string;
  currency: string;
  currencySymbol: string;
}

export interface CustomerOrderItem {
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface CustomerOrder {
  id: string;
  customerName: string;
  phone: string;
  whatsappNumber: string;
  deliveryAddress: string;
  city: string;
  items: CustomerOrderItem[];
  totalAmount: number;
  date: string;
  status: OrderStatus;
  notes?: string;
}

interface DatabaseSchema {
  admin: {
    email: string;
    passwordHash: string;
    passwordSalt: string;
    role: 'owner';
  };
  settings: StoreSettings;
  products: Product[];
  orders: CustomerOrder[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Default initial settings
const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Pri-Boutique',
  storeTagline: 'Contemporary Haute Couture & Luxury Pret',
  storeDescription: 'Exclusive designer collection crafted with exceptional artisanal fabrics and timeless silhouettes.',
  storeLogo: '/pributeeq_logo.jpg',
  whatsappNumber: '923291171812',
  whatsappNumbers: ['923291171812'],
  whatsappLabels: {
    '923291171812': 'Pri-Boutique Official Line',
  },
  instagramUrl: 'https://instagram.com/pributeeq',
  tiktokUrl: 'https://tiktok.com/@pributeeq',
  address: 'Pakpattan, Punjab, Pakistan',
  currency: 'PKR',
  currencySymbol: 'Rs.',
};

// Initial demo products preserving existing high-quality images and clothing details
const INITIAL_DEMO_PRODUCTS: Product[] = [];

// Initial demo orders so owner can see immediate functioning Order Management
const INITIAL_DEMO_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-7291',
    customerName: 'Muhammad Rizwan',
    phone: '03017654321',
    whatsappNumber: '923017654321',
    deliveryAddress: 'House 14, Ward 5, Pakpattan Sharif',
    city: 'Pakpattan',
    items: [
      {
        productId: 'prod-4',
        productName: 'Crisp Cotton Oxford Shirt',
        color: 'Sky Blue',
        size: 'L',
        quantity: 2,
        price: 7800,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    totalAmount: 15600,
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: 'Pending',
    notes: 'Please confirm size measurements before dispatch.',
  },
  {
    id: 'ORD-7290',
    customerName: 'Fatima Zahra',
    phone: '03219876543',
    whatsappNumber: '923219876543',
    deliveryAddress: 'Canal Road, Near Model Town',
    city: 'Sahiwal',
    items: [
      {
        productId: 'prod-2',
        productName: 'Silk Slip Midi Dress',
        color: 'Emerald',
        size: 'M',
        quantity: 1,
        price: 14900,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
      },
    ],
    totalAmount: 14900,
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'Confirmed',
    notes: 'Order confirmed on WhatsApp.',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private initDefault(): DatabaseSchema {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pri-buteeq.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const { hash, salt } = hashPassword(adminPassword);

    return {
      admin: {
        email: adminEmail,
        passwordHash: hash,
        passwordSalt: salt,
        role: 'owner',
      },
      settings: DEFAULT_SETTINGS,
      products: INITIAL_DEMO_PRODUCTS,
      orders: INITIAL_DEMO_ORDERS,
    };
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Guarantee structure
        return {
          admin: parsed.admin || this.initDefault().admin,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          products: Array.isArray(parsed.products) ? parsed.products : [],
          orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_DEMO_ORDERS,
        };
      }
    } catch (err) {
      console.error('Error loading database, initializing fresh:', err);
    }
    const fresh = this.initDefault();
    this.saveData(fresh);
    return fresh;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database:', err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // Admin Auth
  getAdmin() {
    return this.data.admin;
  }

  setAdminPassword(newPassword: string) {
    const { hash, salt } = hashPassword(newPassword);
    this.data.admin.passwordHash = hash;
    this.data.admin.passwordSalt = salt;
    this.persist();
  }

  // Settings
  getSettings(): StoreSettings {
    return this.data.settings;
  }

  updateSettings(partial: Partial<StoreSettings>): StoreSettings {
    this.data.settings = {
      ...this.data.settings,
      ...partial,
    };
    this.persist();
    return this.data.settings;
  }

  // Products
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  addProduct(product: Omit<Product, 'id'> & { id?: string }): Product {
    const id = product.id || `prod-${Date.now()}`;
    const newProduct: Product = {
      ...product,
      id,
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      stock: typeof product.stock === 'number' ? product.stock : 10,
      status: product.status || (product.stock > 0 ? 'in_stock' : 'out_of_stock'),
      colors: product.colors || [{ name: 'Default', hex: '#000000' }],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      images: product.images && product.images.length > 0 ? product.images : [
        'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80'
      ],
      details: product.details || [],
      composition: product.composition || '100% Premium Material',
    };
    this.data.products.unshift(newProduct);
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.products[idx];
    const updated: Product = {
      ...existing,
      ...updates,
      id: existing.id, // cannot change id
    };

    // Auto-update status if stock was changed
    if (typeof updates.stock === 'number' && !updates.status) {
      updated.status = updates.stock > 0 ? 'in_stock' : 'out_of_stock';
    }

    this.data.products[idx] = updated;
    this.persist();
    return updated;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  clearDemoPhotos(): number {
    let count = 0;
    this.data.products = this.data.products.map((prod) => {
      // Remove Unsplash demo images
      const cleanedImages = (prod.images || []).filter(
        (img) => !img.includes('images.unsplash.com')
      );
      const cleanedColors = (prod.colors || []).map((col) => {
        if (col.image && col.image.includes('images.unsplash.com')) {
          return { ...col, image: undefined };
        }
        return col;
      });
      if (cleanedImages.length !== (prod.images || []).length) {
        count++;
      }
      return {
        ...prod,
        images: cleanedImages,
        colors: cleanedColors,
      };
    });
    this.persist();
    return count;
  }

  clearAllProducts(): void {
    this.data.products = [];
    this.persist();
  }

  // Orders
  getOrders(): CustomerOrder[] {
    return this.data.orders;
  }

  addOrder(order: Omit<CustomerOrder, 'id' | 'date'> & { id?: string; date?: string }): CustomerOrder {
    const id = order.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: CustomerOrder = {
      ...order,
      id,
      date: order.date || new Date().toISOString(),
      status: order.status || 'Pending',
    };
    this.data.orders.unshift(newOrder);
    this.persist();
    return newOrder;
  }

  updateOrderStatus(id: string, status: OrderStatus): CustomerOrder | null {
    const order = this.data.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    this.persist();
    return order;
  }
}

export const db = new Database();
