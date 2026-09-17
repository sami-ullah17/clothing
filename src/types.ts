export type Category = 'men' | 'women' | 'kids';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductColor {
  name: string;
  hex: string;
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
  description: string;
  details: string[];
  composition: string;
  stock: number;
  reviews?: Review[];
}

export interface CartItem {
  id: string; // unique combo of product.id-size-color
  product: Product;
  selectedSize: Size;
  selectedColor: ProductColor;
  quantity: number;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
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
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingAddress: Address;
}

export interface User {
  name: string;
  email: string;
  orders: Order[];
}

export type PageView = 'home' | 'men' | 'women' | 'kids' | 'new-arrivals' | 'sale' | 'contact' | 'product-detail';

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
