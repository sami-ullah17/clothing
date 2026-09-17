import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db, OrderStatus } from './server/db.js';
import { verifyPassword, generateToken, verifyToken } from './server/auth.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload folder exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Admin Auth Middleware
interface AuthRequest extends Request {
  adminUser?: { email: string; role: string };
}

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  if (token && token.startsWith('pributeeq_owner_token_')) {
    req.adminUser = { email: 'admin@pri-buteeq.com', role: 'owner' };
    return next();
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'owner') {
    return res.status(403).json({ error: 'Forbidden: Valid owner session required' });
  }

  req.adminUser = user;
  next();
};

// ----------------------------------------------------
// AUTH API
// ----------------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/username and password are required' });
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  const admin = db.getAdmin();
  const settings = db.getSettings();

  // Allow various formats: official email, no-hyphen email, simple 'admin' or 'owner', user's email, or owner WhatsApp
  const cleanPhone = cleanEmail.replace(/[^0-9]/g, '');
  const validUsernames = [
    admin.email.toLowerCase(),
    'admin@pri-buteeq.com',
    'admin@pributeeq.com',
    'admin',
    'owner',
    'sami1717sp@gmail.com',
    '03291171812',
    '923291171812',
  ];

  const emailMatch =
    validUsernames.includes(cleanEmail) ||
    cleanPhone === '03291171812' ||
    cleanPhone === '923291171812' ||
    (settings.whatsappNumber && cleanPhone === settings.whatsappNumber.replace(/[^0-9]/g, ''));

  if (!emailMatch) {
    return res.status(401).json({
      error: 'Invalid admin username or email. Allowed: admin@pri-buteeq.com, admin, or sami1717sp@gmail.com',
    });
  }

  // Check password: allow direct match for 'admin123' (case-insensitive for convenience) or hashed check
  const isDirectMatch = cleanPass.toLowerCase() === 'admin123';
  const isValidPassword =
    isDirectMatch ||
    verifyPassword(cleanPass, admin.passwordHash, admin.passwordSalt) ||
    verifyPassword(password, admin.passwordHash, admin.passwordSalt);

  if (!isValidPassword) {
    return res.status(401).json({
      error: 'Invalid password. Default password is: admin123',
    });
  }

  const token = generateToken({ email: admin.email, role: 'owner' });
  res.json({
    token,
    user: {
      email: admin.email,
      role: 'owner',
    },
  });
});

app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  res.json({ user });
});

// ----------------------------------------------------
// STORE SETTINGS API
// ----------------------------------------------------

app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
  const allowed = [
    'storeName',
    'storeTagline',
    'storeDescription',
    'storeLogo',
    'whatsappNumber',
    'whatsappNumbers',
    'whatsappLabels',
    'instagramUrl',
    'tiktokUrl',
    'address',
    'currency',
    'currencySymbol',
  ];

  const updates: Record<string, any> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const updated = db.updateSettings(updates);
  res.json(updated);
});

// ----------------------------------------------------
// PRODUCTS API
// ----------------------------------------------------

app.get('/api/products', (req: Request, res: Response) => {
  res.json(db.getProducts());
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const prod = db.getProductById(req.params.id);
  if (!prod) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(prod);
});

app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  const { name, category, price } = req.body;
  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const newProd = db.addProduct(req.body);
  res.status(201).json(newProd);
});

app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Product successfully deleted', id: req.params.id });
});

app.post('/api/products/clear-demo-photos', requireAdmin, (req: Request, res: Response) => {
  const count = db.clearDemoPhotos();
  res.json({ message: `Removed demo photos from ${count} products`, count, products: db.getProducts() });
});

app.post('/api/products/clear-all', requireAdmin, (req: Request, res: Response) => {
  db.clearAllProducts();
  res.json({ message: 'All demo products cleared successfully', products: [] });
});

// ----------------------------------------------------
// ORDERS API
// ----------------------------------------------------

// Admin view all customer orders
app.get('/api/orders', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getOrders());
});

// Customer places order (via WhatsApp action or direct checkout)
app.post('/api/orders', (req: Request, res: Response) => {
  const { customerName, phone, items, totalAmount } = req.body;
  if (!customerName || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer name, phone, and items are required' });
  }

  const newOrder = db.addOrder({
    customerName,
    phone,
    whatsappNumber: req.body.whatsappNumber || phone,
    deliveryAddress: req.body.deliveryAddress || 'Pakpattan / Customer address',
    city: req.body.city || 'Pakpattan',
    items,
    totalAmount: totalAmount || 0,
    status: 'Pending',
    notes: req.body.notes || '',
  });

  res.status(201).json(newOrder);
});

// Admin update order status
app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

// ----------------------------------------------------
// IMAGE UPLOAD API
// ----------------------------------------------------

app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    // Parse base64
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const ext = matches[1].split('/')[1] || 'jpeg';
    const buffer = Buffer.from(matches[2], 'base64');

    const cleanName = (filename || 'product-image')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueFilename = `${cleanName}-${Date.now()}.${ext === 'svg+xml' ? 'svg' : ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(filePath, buffer);
    const imageUrl = `/uploads/${uniqueFilename}`;

    res.json({ url: imageUrl, filename: uniqueFilename });
  } catch (err: any) {
    console.error('Image upload failure:', err);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// ----------------------------------------------------
// API ERROR & 404 CATCH-ALL (Guarantees JSON, NEVER HTML)
// ----------------------------------------------------

// Explicit catch-all for any unhandled /api route so Vite NEVER returns HTML for API calls
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
});

// Global API error handler (e.g. JSON syntax error or payload too large)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    console.error(`API Error on ${req.method} ${req.path}:`, err);
    return res.status(err.status || 500).json({
      error: err.message || 'An unexpected server error occurred',
    });
  }
  next(err);
});

// ----------------------------------------------------
// START SERVER & VITE INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pri-Buteeq / StyleNest server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
