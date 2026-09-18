import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [];

export const CATEGORIES_DATA = [
  {
    id: 'women',
    name: 'Women’s Collection',
    tagline: 'Luxury Pret, Chiffon & Embroidered Couture',
    image: '/images/pakistani_women.jpg',
    count: 'Pakistani Haute Couture',
  },
  {
    id: 'men',
    name: 'Men’s Tailoring & Eastern Wear',
    tagline: 'Bespoke Kurtas, Waistcoats & Prince Coats',
    image: '/images/pakistani_men.jpg',
    count: 'Pakistani Designer Wear',
  },
  {
    id: 'kids',
    name: 'Kids & Teens Eastern',
    tagline: 'Festive Shalwar Kameez & Cute Kurtas',
    image: '/images/pakistani_kids.jpg',
    count: 'Festive Eid Collection',
  },
];

export const TESTIMONIALS_DATA = [
  {
    id: 't-1',
    name: 'Zainab Qureshi',
    role: 'Fashion Stylist, Lahore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    quote: 'StyleNest provides international luxury tailoring right here in Pakistan. Paid via Easypaisa and delivery to Gulberg Lahore arrived within 48 hours!',
    rating: 5,
    item: 'Tailored Wool-Blend Overcoat',
  },
  {
    id: 't-2',
    name: 'Daniyal Ahmed',
    role: 'Creative Director, Karachi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    quote: 'The customer service and prompt delivery are unmatched. Paid through JazzCash with zero hassle. The Oxford shirts fit like bespoke.',
    rating: 5,
    item: 'Relaxed Oxford Cotton Shirt',
  },
  {
    id: 't-3',
    name: 'Fatima Noor',
    role: 'Architect, Islamabad',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    quote: 'Finding kids clothes that are durable, 100% organic, and genuinely chic in Pakistan is difficult. StyleNest is now our go-to family wardrobe.',
    rating: 5,
    item: 'Kids Quilted Puffer Jacket',
  },
];

// Pakistan payment and shipping specific references
export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Mardan',
  'Mirpur (AJK)',
  'Gilgit',
];

export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Islamabad Capital Territory',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
];

export const PAKISTAN_BANKS = [
  {
    id: 'meezan',
    name: 'Meezan Bank Ltd (Islamic)',
    accountTitle: 'StyleNest Apparel PVT LTD',
    accountNumber: '0102030405060701',
    iban: 'PK36MEZN0001020304050607',
    branch: 'Main Boulevard Gulberg Branch, Lahore',
    raastId: '03001234567',
  },
  {
    id: 'hbl',
    name: 'Habib Bank Limited (HBL)',
    accountTitle: 'StyleNest Apparel PVT LTD',
    accountNumber: '2233445566778899',
    iban: 'PK45HABB0022334455667788',
    branch: 'Clifton Corporate Branch, Karachi',
    raastId: '03001234567',
  },
  {
    id: 'alfalah',
    name: 'Bank Alfalah',
    accountTitle: 'StyleNest Apparel PVT LTD',
    accountNumber: '5566778899001122',
    iban: 'PK12ALFH0055667788990011',
    branch: 'Blue Area Branch, Islamabad',
    raastId: '03001234567',
  },
];

export const JAZZCASH_CONFIG = {
  merchantTitle: 'StyleNest Pakistan',
  tillNumber: '882910',
  mobileNumber: '0300-1234567',
  instructions: 'Transfer to StyleNest JazzCash Wallet or use Till ID 882910. Enter your JazzCash mobile number below to initiate automatic MPIN prompt.',
};

export const EASYPAISA_CONFIG = {
  merchantTitle: 'StyleNest Pakistan',
  tillNumber: '774921',
  mobileNumber: '0345-1234567',
  instructions: 'Transfer to StyleNest Easypaisa Account or approve push notification on your Easypaisa Mobile App.',
};
