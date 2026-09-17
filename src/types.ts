export type Category = 'men' | 'women' | 'kids';

export type Size = string;

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: ProductColor[];
  sizes: Size[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isSale?: boolean;
  salePercentage?: number;
  description: string;
  details: string[];
  composition: string;
  stock: number;
  status?: 'in_stock' | 'out_of_stock';
  reviews?: Review[];
}

export interface CartItem {
  id: string; // unique combo of product.id-size-color
  product: Product;
  selectedSize: Size;
  selectedColor: ProductColor;
  quantity: number;
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

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface CustomerOrderItem {
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

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
  createdAt?: string;
  status: OrderStatus;
  notes?: string;
}

export interface AdminUser {
  email: string;
  role: 'owner';
  token: string;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string; // Province / Region
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  orders: Order[];
}

export type PageView = 'home' | 'men' | 'women' | 'kids' | 'new-arrivals' | 'sale' | 'contact' | 'product-detail' | 'admin';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

export interface FilterState {
  category: string; // 'all' | 'men' | 'women' | 'kids'
  subcategories: string[];
  sizes: Size[];
  colors: string[];
  priceRange: [number, number];
  onlySale: boolean;
  onlyNew: boolean;
}

