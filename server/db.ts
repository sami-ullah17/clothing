import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, StoreSettings, CustomerOrder, OrderStatus, ProductColor } from '../src/types.js';

const { Pool } = pg;

// ----------------------------------------------------
// Database Interfaces
// ----------------------------------------------------

export interface StoredProduct extends Product {
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSchema {
  admin: {
    email: string;
    passwordHash: string;
    passwordSalt: string;
    role: 'owner';
  };
  settings: StoreSettings;
  products: StoredProduct[];
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

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// ----------------------------------------------------
// Database Engine Implementation
// ----------------------------------------------------

export type DatabaseEngine = 'postgres' | 'supabase' | 'local_json';

class Database {
  private localData: DatabaseSchema;
  private engine: DatabaseEngine = 'local_json';
  private pgPool: pg.Pool | null = null;
  private supabase: SupabaseClient | null = null;
  private isInitialized = false;

  constructor() {
    this.localData = this.loadLocal();
    this.initExternalDatabase();
  }

  public async initExternalDatabase() {
    // 1. PostgreSQL (Neon, Railway, Supabase DB connection string, etc.)
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (dbUrl) {
      try {
        const isSslRequired = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');
        this.pgPool = new Pool({
          connectionString: dbUrl,
          ssl: isSslRequired ? { rejectUnauthorized: false } : false,
          max: 10,
          connectionTimeoutMillis: 5000,
        });

        // Test connection
        const client = await this.pgPool.connect();
        try {
          await this.createPostgresTables(client);
          this.engine = 'postgres';
          console.log('[Database] Connected to PostgreSQL permanent database');
          await this.seedPostgresIfEmpty(client);
        } finally {
          client.release();
        }
        this.isInitialized = true;
        return;
      } catch (err: any) {
        console.warn('[Database] PostgreSQL connection failed, falling back to local database:', err?.message || err);
        this.pgPool = null;
      }
    }

    // 2. Supabase REST API
    if (
      process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)
    ) {
      try {
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
        this.supabase = createClient(process.env.SUPABASE_URL, key);
        this.engine = 'supabase';
        console.log('[Database] Connected to Supabase REST database');
        this.isInitialized = true;
        return;
      } catch (err: any) {
        console.warn('[Database] Supabase client init warning:', err?.message || err);
        this.supabase = null;
      }
    }

    // 3. Local JSON fallback
    this.engine = 'local_json';
    this.isInitialized = true;
    console.log('[Database] Using local permanent JSON database (data/database.json)');
  }

  public getDatabaseConfigStatus() {
    const isPostgresConnected = this.engine === 'postgres';
    const isSupabaseConnected = this.engine === 'supabase';
    const hasPostgresConfig = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
    const hasSupabaseConfig = !!(
      process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY)
    );

    return {
      engine: this.engine,
      postgres: {
        status: isPostgresConnected ? 'Connected' : 'Not Configured',
        configured: hasPostgresConfig,
        connected: isPostgresConnected,
      },
      supabase: {
        status: isSupabaseConnected ? 'Connected' : 'Not Configured',
        configured: hasSupabaseConfig,
        connected: isSupabaseConnected,
      },
      localJson: {
        status: this.engine === 'local_json' ? 'Active' : 'Standby',
        active: this.engine === 'local_json',
        file: DB_FILE,
        productsCount: this.localData.products.length,
        ordersCount: this.localData.orders.length,
      },
    };
  }

  private async createPostgresTables(client: pg.PoolClient) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS boutique_products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100) DEFAULT 'Dresses',
        price NUMERIC NOT NULL,
        discount_price NUMERIC,
        sale_percentage INTEGER,
        is_sale BOOLEAN DEFAULT FALSE,
        stock INTEGER DEFAULT 10,
        status VARCHAR(50) DEFAULT 'in_stock',
        rating NUMERIC DEFAULT 5.0,
        review_count INTEGER DEFAULT 0,
        images JSONB DEFAULT '[]'::jsonb,
        colors JSONB DEFAULT '[]'::jsonb,
        sizes JSONB DEFAULT '[]'::jsonb,
        details JSONB DEFAULT '[]'::jsonb,
        composition TEXT,
        description TEXT,
        is_new_arrival BOOLEAN DEFAULT TRUE,
        is_best_seller BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS boutique_orders (
        id VARCHAR(255) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        whatsapp_number VARCHAR(100),
        delivery_address TEXT,
        city VARCHAR(100),
        items JSONB NOT NULL,
        total_amount NUMERIC NOT NULL,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Pending',
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS boutique_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async seedPostgresIfEmpty(client: pg.PoolClient) {
    const res = await client.query('SELECT COUNT(*) FROM boutique_products');
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0 && this.localData.products.length > 0) {
      console.log(`[Database] Migrating ${this.localData.products.length} existing products into PostgreSQL...`);
      for (const prod of this.localData.products) {
        await client.query(
          `INSERT INTO boutique_products (
            id, name, category, subcategory, price, discount_price, sale_percentage, is_sale,
            stock, status, rating, review_count, images, colors, sizes, details, composition,
            description, is_new_arrival, is_best_seller, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO NOTHING`,
          [
            prod.id,
            prod.name,
            prod.category,
            prod.subcategory || 'Dresses',
            prod.price,
            prod.discountPrice || null,
            prod.salePercentage || null,
            Boolean(prod.isSale),
            prod.stock !== undefined ? prod.stock : 10,
            prod.status || 'in_stock',
            prod.rating || 5.0,
            prod.reviewCount || 0,
            JSON.stringify(prod.images || []),
            JSON.stringify(prod.colors || []),
            JSON.stringify(prod.sizes || []),
            JSON.stringify(prod.details || []),
            prod.composition || '',
            prod.description || '',
            prod.isNewArrival !== false,
            Boolean(prod.isBestSeller),
            prod.created_at || new Date().toISOString(),
            prod.updated_at || new Date().toISOString(),
          ]
        );
      }
      console.log('[Database] Migration to PostgreSQL complete!');
    }
  }

  // ----------------------------------------------------
  // Local JSON Helpers
  // ----------------------------------------------------

  private initDefault(): DatabaseSchema {
    const { hash, salt } = hashPassword('admin123');
    return {
      admin: {
        email: 'admin@pri-buteeq.com',
        passwordHash: hash,
        passwordSalt: salt,
        role: 'owner',
      },
      settings: DEFAULT_SETTINGS,
      products: [],
      orders: [],
    };
  }

  private loadLocal(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        const fresh = this.initDefault();
        this.saveLocal(fresh);
        return fresh;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.admin || !parsed.settings || !Array.isArray(parsed.products)) {
        const fresh = this.initDefault();
        this.saveLocal(fresh);
        return fresh;
      }
      return parsed;
    } catch (err) {
      console.error('[Database] Error loading database.json, initializing fresh:', err);
      const fresh = this.initDefault();
      this.saveLocal(fresh);
      return fresh;
    }
  }

  private saveLocal(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      // Safe atomic write using temp file
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[Database] Failed to write database.json:', err);
    }
  }

  private persistLocal() {
    this.saveLocal(this.localData);
  }

  public getEngine(): DatabaseEngine {
    return this.engine;
  }

  // ----------------------------------------------------
  // Admin & Settings Operations
  // ----------------------------------------------------

  getAdmin() {
    return this.localData.admin;
  }

  setAdminPassword(newPassword: string) {
    const { hash, salt } = hashPassword(newPassword);
    this.localData.admin.passwordHash = hash;
    this.localData.admin.passwordSalt = salt;
    this.persistLocal();
  }

  async getSettings(): Promise<StoreSettings> {
    if (this.engine === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          "SELECT value FROM boutique_settings WHERE key = 'store_settings'"
        );
        if (res.rows.length > 0 && res.rows[0].value) {
          return { ...DEFAULT_SETTINGS, ...res.rows[0].value };
        }
      } catch (err) {
        console.warn('[Database] Postgres getSettings error:', err);
      }
    }
    return this.localData.settings;
  }

  async updateSettings(partial: Partial<StoreSettings>): Promise<StoreSettings> {
    this.localData.settings = {
      ...this.localData.settings,
      ...partial,
    };
    this.persistLocal();

    if (this.engine === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO boutique_settings (key, value, updated_at)
           VALUES ('store_settings', $1, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP`,
          [JSON.stringify(this.localData.settings)]
        );
      } catch (err) {
        console.warn('[Database] Postgres updateSettings error:', err);
      }
    }
    return this.localData.settings;
  }

  // ----------------------------------------------------
  // Products Operations (Source of Truth)
  // ----------------------------------------------------

  async getProducts(): Promise<StoredProduct[]> {
    if (this.engine === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT * FROM boutique_products ORDER BY created_at DESC'
        );
        return res.rows.map(this.mapPgRowToProduct);
      } catch (err) {
        console.error('[Database] Postgres getProducts failed, using local cache:', err);
      }
    }

    if (this.engine === 'supabase' && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('boutique_products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(this.mapPgRowToProduct);
        }
      } catch (err) {
        console.error('[Database] Supabase getProducts failed, using local cache:', err);
      }
    }

    return this.localData.products;
  }

  async getProductById(id: string): Promise<StoredProduct | undefined> {
    if (this.engine === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT * FROM boutique_products WHERE id = $1 LIMIT 1',
          [id]
        );
        if (res.rows.length > 0) {
          return this.mapPgRowToProduct(res.rows[0]);
        }
        return undefined;
      } catch (err) {
        console.error('[Database] Postgres getProductById failed:', err);
      }
    }

    return this.localData.products.find((p) => p.id === id);
  }

  async addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<StoredProduct> {
    const id = product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const stock = typeof product.stock === 'number' && !isNaN(product.stock) ? product.stock : 10;
    const now = new Date().toISOString();

    const newProduct: StoredProduct = {
      ...product,
      id,
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      stock,
      status: product.status || (stock > 0 ? 'in_stock' : 'out_of_stock'),
      isNewArrival: product.isNewArrival !== undefined ? Boolean(product.isNewArrival) : true,
      isBestSeller: Boolean(product.isBestSeller),
      colors: product.colors && product.colors.length > 0 ? product.colors : [{ name: 'Standard', hex: '#111111' }],
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'],
      images: Array.isArray(product.images) ? product.images : [],
      details: product.details && product.details.length > 0 ? product.details : [
        'Pure artisanal Pakistani boutique craftsmanship',
        'Fine threadwork and precision tailored seams',
        'Durable, comfortable high-grade drape fabric',
      ],
      composition: product.composition || '100% Premium Lawn / Cotton',
      created_at: now,
      updated_at: now,
    };

    // Always update local memory & file
    this.localData.products = [newProduct, ...this.localData.products.filter((p) => p.id !== id)];
    this.persistLocal();

    // Persist to Postgres if active
    if (this.engine === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO boutique_products (
            id, name, category, subcategory, price, discount_price, sale_percentage, is_sale,
            stock, status, rating, review_count, images, colors, sizes, details, composition,
            description, is_new_arrival, is_best_seller, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, category = EXCLUDED.category, subcategory = EXCLUDED.subcategory,
            price = EXCLUDED.price, discount_price = EXCLUDED.discount_price,
            sale_percentage = EXCLUDED.sale_percentage, is_sale = EXCLUDED.is_sale,
            stock = EXCLUDED.stock, status = EXCLUDED.status, images = EXCLUDED.images,
            colors = EXCLUDED.colors, sizes = EXCLUDED.sizes, details = EXCLUDED.details,
            composition = EXCLUDED.composition, description = EXCLUDED.description,
            is_new_arrival = EXCLUDED.is_new_arrival, is_best_seller = EXCLUDED.is_best_seller,
            updated_at = EXCLUDED.updated_at`,
          [
            newProduct.id,
            newProduct.name,
            newProduct.category,
            newProduct.subcategory || 'Dresses',
            newProduct.price,
            newProduct.discountPrice || null,
            newProduct.salePercentage || null,
            Boolean(newProduct.isSale),
            newProduct.stock,
            newProduct.status,
            newProduct.rating,
            newProduct.reviewCount,
            JSON.stringify(newProduct.images),
            JSON.stringify(newProduct.colors),
            JSON.stringify(newProduct.sizes),
            JSON.stringify(newProduct.details),
            newProduct.composition || '',
            newProduct.description || '',
            newProduct.isNewArrival,
            newProduct.isBestSeller,
            newProduct.created_at,
            newProduct.updated_at,
          ]
        );
      } catch (err) {
        console.error('[Database] Postgres addProduct error:', err);
      }
    }

    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<StoredProduct | null> {
    const idx = this.localData.products.findIndex((p) => p.id === id);
    const existing = idx !== -1 ? this.localData.products[idx] : await this.getProductById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: StoredProduct = {
      ...existing,
      ...updates,
      id: existing.id,
      updated_at: now,
    };

    if (typeof updates.stock === 'number' && !updates.status) {
      updated.status = updates.stock > 0 ? 'in_stock' : 'out_of_stock';
    }

    if (idx !== -1) {
      this.localData.products[idx] = updated;
    } else {
      this.localData.products.unshift(updated);
    }
    this.persistLocal();

    if (this.engine === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `UPDATE boutique_products SET
            name = COALESCE($1, name),
            category = COALESCE($2, category),
            subcategory = COALESCE($3, subcategory),
            price = COALESCE($4, price),
            discount_price = $5,
            sale_percentage = $6,
            is_sale = COALESCE($7, is_sale),
            stock = COALESCE($8, stock),
            status = COALESCE($9, status),
            images = COALESCE($10, images),
            colors = COALESCE($11, colors),
            sizes = COALESCE($12, sizes),
            details = COALESCE($13, details),
            composition = COALESCE($14, composition),
            description = COALESCE($15, description),
            is_new_arrival = COALESCE($16, is_new_arrival),
            is_best_seller = COALESCE($17, is_best_seller),
            updated_at = $18
          WHERE id = $19`,
          [
            updates.name,
            updates.category,
            updates.subcategory,
            updates.price,
            updates.discountPrice || null,
            updates.salePercentage || null,
            updates.isSale !== undefined ? Boolean(updates.isSale) : null,
            updates.stock,
            updates.status,
            updates.images ? JSON.stringify(updates.images) : null,
            updates.colors ? JSON.stringify(updates.colors) : null,
            updates.sizes ? JSON.stringify(updates.sizes) : null,
            updates.details ? JSON.stringify(updates.details) : null,
            updates.composition,
            updates.description,
            updates.isNewArrival !== undefined ? Boolean(updates.isNewArrival) : null,
            updates.isBestSeller !== undefined ? Boolean(updates.isBestSeller) : null,
            now,
            id,
          ]
        );
      } catch (err) {
        console.error('[Database] Postgres updateProduct error:', err);
      }
    }

    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const initialLen = this.localData.products.length;
    this.localData.products = this.localData.products.filter((p) => p.id !== id);
    const deletedLocally = this.localData.products.length !== initialLen;
    if (deletedLocally) {
      this.persistLocal();
    }

    if (this.engine === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'DELETE FROM boutique_products WHERE id = $1',
          [id]
        );
        return (res.rowCount ?? 0) > 0 || deletedLocally;
      } catch (err) {
        console.error('[Database] Postgres deleteProduct error:', err);
      }
    }

    return deletedLocally;
  }

  async clearDemoPhotos(): Promise<number> {
    let count = 0;
    this.localData.products = this.localData.products.map((prod) => {
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
    this.persistLocal();
    return count;
  }

  async clearAllProducts(): Promise<void> {
    this.localData.products = [];
    this.persistLocal();

    if (this.engine === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query('TRUNCATE TABLE boutique_products');
      } catch (err) {
        console.error('[Database] Postgres clearAll error:', err);
      }
    }
  }

  // ----------------------------------------------------
  // Orders Operations
  // ----------------------------------------------------

  async getOrders(): Promise<CustomerOrder[]> {
    if (this.engine === 'postgres' && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          'SELECT * FROM boutique_orders ORDER BY date DESC'
        );
        return res.rows.map((r) => ({
          id: r.id,
          customerName: r.customer_name,
          phone: r.phone,
          whatsappNumber: r.whatsapp_number,
          deliveryAddress: r.delivery_address,
          city: r.city,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
          totalAmount: Number(r.total_amount),
          date: r.date,
          status: r.status as OrderStatus,
          notes: r.notes,
        }));
      } catch (err) {
        console.warn('[Database] Postgres getOrders error:', err);
      }
    }
    return this.localData.orders;
  }

  async addOrder(order: Omit<CustomerOrder, 'id' | 'date'> & { id?: string; date?: string }): Promise<CustomerOrder> {
    const id = order.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: CustomerOrder = {
      ...order,
      id,
      date: order.date || new Date().toISOString(),
      status: order.status || 'Pending',
    };
    this.localData.orders.unshift(newOrder);
    this.persistLocal();

    if (this.engine === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO boutique_orders (
            id, customer_name, phone, whatsapp_number, delivery_address, city, items, total_amount, date, status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            newOrder.id,
            newOrder.customerName,
            newOrder.phone,
            newOrder.whatsappNumber || '',
            newOrder.deliveryAddress || '',
            newOrder.city || '',
            JSON.stringify(newOrder.items),
            newOrder.totalAmount,
            newOrder.date,
            newOrder.status,
            newOrder.notes || '',
          ]
        );
      } catch (err) {
        console.warn('[Database] Postgres addOrder error:', err);
      }
    }
    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<CustomerOrder | null> {
    const order = this.localData.orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      this.persistLocal();
    }

    if (this.engine === 'postgres' && this.pgPool) {
      try {
        await this.pgPool.query(
          'UPDATE boutique_orders SET status = $1 WHERE id = $2',
          [status, id]
        );
      } catch (err) {
        console.warn('[Database] Postgres updateOrderStatus error:', err);
      }
    }
    return order || null;
  }

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------

  private mapPgRowToProduct(r: any): StoredProduct {
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      subcategory: r.subcategory || 'Dresses',
      price: Number(r.price),
      discountPrice: r.discount_price ? Number(r.discount_price) : undefined,
      salePercentage: r.sale_percentage ? Number(r.sale_percentage) : undefined,
      isSale: Boolean(r.is_sale),
      stock: r.stock !== undefined ? Number(r.stock) : 10,
      status: r.status || 'in_stock',
      rating: r.rating ? Number(r.rating) : 5.0,
      reviewCount: r.review_count ? Number(r.review_count) : 0,
      images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images || [],
      colors: typeof r.colors === 'string' ? JSON.parse(r.colors) : r.colors || [],
      sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes) : r.sizes || [],
      details: typeof r.details === 'string' ? JSON.parse(r.details) : r.details || [],
      composition: r.composition || '',
      description: r.description || '',
      isNewArrival: r.is_new_arrival !== false,
      isBestSeller: Boolean(r.is_best_seller),
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  }
}

export const db = new Database();
export type { OrderStatus };
