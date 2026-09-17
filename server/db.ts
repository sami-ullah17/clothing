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
  storeName: 'Pri-Buteeq',
  storeTagline: 'Contemporary Haute Couture & Luxury Pret',
  storeDescription: 'Exclusive designer collection crafted with exceptional artisanal fabrics and timeless silhouettes.',
  storeLogo: '',
  whatsappNumber: '923001234567',
  instagramUrl: 'https://instagram.com/pributeeq',
  tiktokUrl: 'https://tiktok.com/@pributeeq',
  address: 'Pakpattan, Punjab, Pakistan',
  currency: 'PKR',
  currencySymbol: 'Rs.',
};

// Initial demo products preserving existing high-quality images and clothing details
const INITIAL_DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Tailored Wool-Blend Overcoat',
    category: 'men',
    subcategory: 'Jackets & Coats',
    price: 28500,
    discountPrice: 22900,
    rating: 4.9,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Camel', hex: '#C19A6B', image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Charcoal', hex: '#36454F', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Midnight Navy', hex: '#1B263B', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNewArrival: true,
    isBestSeller: true,
    isSale: true,
    description: 'A refined single-breasted overcoat tailored in an Italian wool-cashmere blend. Features notched lapels, horn-effect buttons, and a smooth satin lining for comfortable layering.',
    details: [
      'Notched lapels with subtle pick-stitching',
      'Two exterior welt pockets, interior ticket pocket',
      'Back single vent for ease of motion',
      'Fully lined with premium Bemberg cupro',
    ],
    composition: '75% Virgin Wool, 20% Polyamide, 5% Cashmere. Dry clean only.',
    stock: 14,
    status: 'in_stock',
  },
  {
    id: 'prod-2',
    name: 'Silk Slip Midi Dress',
    category: 'women',
    subcategory: 'Dresses',
    price: 18900,
    discountPrice: 14900,
    rating: 4.8,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Champagne', hex: '#F7E7CE', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Emerald', hex: '#046307', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Noir Black', hex: '#111111', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isNewArrival: false,
    isBestSeller: true,
    isSale: true,
    description: 'Cut on the bias from 100% pure Mulberry silk for an effortlessly fluid drape. Features delicate adjustable straps, a soft cowl neckline, and French-seam interior construction.',
    details: [
      '100% 19mm grade 6A Mulberry silk',
      'Adjustable spaghetti straps with subtle gold sliders',
      'Bias cut contours gently to natural curves',
      'Subtle side slit for fluid movement',
    ],
    composition: '100% Mulberry Silk. Hand wash cold or dry clean.',
    stock: 9,
    status: 'in_stock',
  },
  {
    id: 'prod-3',
    name: 'Cashmere Ribbed Turtleneck',
    category: 'women',
    subcategory: 'Knitwear',
    price: 15500,
    rating: 4.9,
    reviewCount: 38,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Oatmeal', hex: '#E3DAC9', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Black', hex: '#1C1C1C', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Mocha', hex: '#826644' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    isNewArrival: true,
    isBestSeller: false,
    description: 'Spun from grade-A Mongolian cashmere with dense 12-gauge knit structure. Provides sumptuous warmth with an ultra-soft handle that will not pill with proper care.',
    details: [
      'Fold-over ribbed turtleneck collar',
      'Tubular knit hem and cuffs for lasting shape retention',
      'Slightly relaxed silhouette for easy layering',
    ],
    composition: '100% Mongolian Cashmere. Hand wash lukewarm.',
    stock: 12,
    status: 'in_stock',
  },
  {
    id: 'prod-4',
    name: 'Crisp Cotton Oxford Shirt',
    category: 'men',
    subcategory: 'Shirts',
    price: 7800,
    rating: 4.7,
    reviewCount: 89,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Optic White', hex: '#FFFFFF', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Sky Blue', hex: '#87CEEB', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Pink Tint', hex: '#FADADD' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNewArrival: false,
    isBestSeller: true,
    description: 'A benchmark men wardrobe essential crafted from 100% long-staple Egyptian cotton basketweave. Designed with a timeless button-down collar and mother-of-pearl buttons.',
    details: [
      'Button-down collar with gentle roll',
      'Box pleat and locker loop at back yoke',
      'Curved hem designed to stay neatly tucked or worn casually untucked',
    ],
    composition: '100% Long-Staple Egyptian Cotton. Machine wash 30°C.',
    stock: 25,
    status: 'in_stock',
  },
  {
    id: 'prod-5',
    name: 'Pleated High-Waist Wide-Leg Trousers',
    category: 'women',
    subcategory: 'Pants',
    price: 13500,
    discountPrice: 10800,
    rating: 4.9,
    reviewCount: 54,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Sand Taupe', hex: '#B38B6D', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Black', hex: '#111111', image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Olive Drab', hex: '#556B2F' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    isNewArrival: false,
    isBestSeller: true,
    isSale: true,
    description: 'Dramatic double-pleated front with a fluid wide leg that pools slightly over footwear. Woven from breathable stretch gabardine that resists creasing throughout the day.',
    details: [
      'Extended waistband with concealed hook-and-bar closure',
      'Dual deep front pleats with sharp pressed creases',
      'Discreet side slant pockets and rear jetted pockets',
    ],
    composition: '68% Polyester, 28% Viscose, 4% Elastane. Machine wash gentle.',
    stock: 18,
    status: 'in_stock',
  },
  {
    id: 'prod-6',
    name: 'Organic Cotton Breton Stripe Tee',
    category: 'kids',
    subcategory: 'Tops & Tees',
    price: 3800,
    rating: 4.8,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Navy & White', hex: '#1E2A38', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Red & Cream', hex: '#A82828', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=1000&q=80' },
    ],
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y'],
    isNewArrival: true,
    isBestSeller: false,
    description: 'Super-soft combed organic cotton jersey gentle on sensitive young skin. Features classic maritime horizontal stripes and reinforced shoulder seams to withstand active play.',
    details: [
      '100% GOTS-certified organic cotton',
      'Ribbed bound crew neck with back neck tape',
      'Hypoallergenic tagless collar printing',
    ],
    composition: '100% Organic Cotton. Machine wash 40°C.',
    stock: 30,
    status: 'in_stock',
  },
  {
    id: 'prod-7',
    name: 'Japanese Selvedge Denim Jacket',
    category: 'men',
    subcategory: 'Jackets & Coats',
    price: 19500,
    rating: 4.9,
    reviewCount: 46,
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Raw Indigo', hex: '#1A2A44', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80' },
      { name: 'Washed Black', hex: '#2B2B2B', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=80' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    isNewArrival: false,
    isBestSeller: true,
    description: 'Constructed from 13.5oz vintage shuttle-loomed Japanese selvedge denim. Unwashed raw finish will mold uniquely to the wearers body with distinctive fading over years.',
    details: [
      'Red-line selvedge visible along interior placket',
      'Custom copper donut buttons and donut rivet reinforcement',
      'Pleated front with iconic box-stitch details',
    ],
    composition: '100% Kuroki Mills Cotton Denim. Dry clean or cold soak only.',
    stock: 8,
    status: 'in_stock',
  },
  {
    id: 'prod-8',
    name: 'Kids Quilted Puffer Jacket',
    category: 'kids',
    subcategory: 'Outerwear',
    price: 8900,
    discountPrice: 6900,
    rating: 4.8,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=1000&q=80',
    ],
    colors: [
      { name: 'Forest Green', hex: '#228B22' },
      { name: 'Mustard Yellow', hex: '#E1AD01' },
      { name: 'Navy', hex: '#000080' },
    ],
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y'],
    isNewArrival: true,
    isBestSeller: false,
    isSale: true,
    description: 'Featherlight recycled down-alternative insulation encased in water-resistant micro-ripstop shell. Keeps little ones cozy and dry during chilly school days and outdoor weekend explorations.',
    details: [
      'Fleece-lined storm hood and cozy chin guard',
      'Heavy-duty YKK zipper with easy-pull cord for small fingers',
      'Reflective safety piping along back hem',
    ],
    composition: '100% Recycled Polyester shell and thermal padding. Machine washable.',
    stock: 0,
    status: 'out_of_stock',
  },
];

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
          products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_DEMO_PRODUCTS,
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
